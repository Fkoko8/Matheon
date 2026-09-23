/**
 * MATHEON — endpoint generatora zadań.
 *
 * Poza samym generowaniem ten endpoint:
 * - pilnuje limitu dziennego i minutowego w bazie (nie w pamięci procesu),
 * - w trybie `personalized` sam dokłada kontekst: słabe działy, typowe błędy
 *   i umiejętności, które za nimi stoją,
 * - zapisuje wygenerowane zadanie razem z umiejętnościami, krokami i matrycą punktów,
 *   żeby trafiło do tego samego silnika treningu co bank autorski.
 */
import { generatePracticeSet, generatePersonalizedQuestion, generateSimilarQuestion } from '@/lib/generator/questionGeneratorService'
import { generationRequestSchema } from '@/lib/generator/schema'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { buildGeneratorContext } from '@/lib/ai/context/buildGeneratorContext'
import { checkAiQuota, logAiRequest, quotaMessage } from '@/lib/ai/usage'

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const quota = await checkAiQuota(supabase, user.id, 'generator')
  if (!quota.allowed) {
    return Response.json({ error: 'RATE_LIMITED', message: quotaMessage(quota, 'generator') }, { status: 429 })
  }

  const startedAt = Date.now()
  let mode = 'standard'

  try {
    const body = generationRequestSchema.parse(await request.json())
    mode = body.mode

    let context = body.context ?? ''
    if (body.mode === 'personalized' && !context.trim()) {
      const derived = await buildGeneratorContext(supabase, user.id, body.level)
      context = derived.text
    }

    const generationRequest = { ...body, context: context || undefined }
    const questions = body.mode === 'similar' && body.parentQuestionId
      ? [await generateSimilarQuestion(generationRequest, context)]
      : body.mode === 'personalized'
        ? [await generatePersonalizedQuestion(generationRequest, context)]
        : await generatePracticeSet(generationRequest)

    const results = []
    for (const question of questions) {
      const { data: topic } = await supabase.from('topics').select('id').eq('name', question.topic).maybeSingle()
      if (!topic) continue

      const { data: stored, error } = await supabase
        .from('questions')
        .insert({
          topic_id: topic.id,
          question_text: question.questionText,
          title: question.title,
          question_type: question.questionType,
          level: question.level,
          difficulty: question.difficulty,
          points: question.points,
          estimated_minutes: question.estimatedMinutes,
          correct_answer: question.answer,
          solution_text: question.solution,
          source_type: 'generated',
          generated_by: user.id,
          parent_question_id: body.parentQuestionId ?? null,
          validation_status: 'published',
          validation_metadata: { validator: 'deterministic-v1' },
          generation_model: 'openai/gpt-4.1-mini',
          generation_timestamp: new Date().toISOString(),
          skills: question.skills,
          tags: question.tags,
          published: true,
        })
        .select('id')
        .single()
      if (error || !stored) continue

      await supabase.from('solutions').insert({ question_id: stored.id, content: question.solution })
      await supabase.from('hints').insert(
        question.hints.map((content, index) => ({ question_id: stored.id, hint_level: index + 1, content, order_index: index + 1 })),
      )
      await supabase.from('question_skills').delete().eq('question_id', stored.id)
      results.push({ ...question, id: stored.id, validationStatus: 'published' })
    }

    await logAiRequest(supabase, {
      userId: user.id,
      kind: 'generator',
      mode,
      retrievalCount: results.length,
      responseMs: Date.now() - startedAt,
      success: results.length > 0,
    })

    if (!results.length) return Response.json({ error: 'STORAGE_FAILED' }, { status: 502 })
    return Response.json({ questions: results })
  } catch (error) {
    await logAiRequest(supabase, {
      userId: user.id,
      kind: 'generator',
      mode,
      responseMs: Date.now() - startedAt,
      success: false,
    })
    const message = error instanceof Error && error.message.startsWith('NO_VALID_QUESTION') ? 'NO_VALID_QUESTION' : 'GENERATION_UNAVAILABLE'
    return Response.json({ error: message }, { status: message === 'NO_VALID_QUESTION' ? 422 : 503 })
  }
}
