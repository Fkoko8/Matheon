import { getHints, getSolution } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import type { AnswerResult, Mistake, SubmitAnswerInput, TaskEngine, UserAnswer, UserProgress } from '@/lib/types'
import { DEMO_USER_ID, nowIso } from '@/lib/types'
import { updateProgress as updateProgressService } from '@/lib/learning/progress'
import { recordMistake as recordMistakeService, classifyMistakeType } from '@/lib/learning/mistakes'
import { calculateNextReview } from '@/lib/learning/review'

async function currentUserId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

async function getQuestionData(questionId: string, supabase: ReturnType<typeof createClient>) {
  if (!supabase) return questionId === 'question-triangle' ? { correct_answer: '20', topic_id: 'topic-5', subtopic_id: null } : null
  const { data } = await supabase.from('questions').select('correct_answer,topic_id,subtopic_id,attempt_count').eq('id', questionId).maybeSingle()
  return data
}

async function countUserAttempts(userId: string, questionId: string, supabase: ReturnType<typeof createClient>): Promise<number> {
  if (!supabase) return 0
  const { data, error } = await supabase
    .from('user_answers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('question_id', questionId)
  return error ? 0 : data?.length || 0
}

export const taskEngine: TaskEngine = {
  async submitAnswer(input: SubmitAnswerInput): Promise<AnswerResult> {
    const supabase = createClient()
    const userId = await currentUserId(supabase)

    if (!supabase || !userId) {
      return { isCorrect: false, answerId: `offline-${Date.now()}`, feedback: 'Brak połączenia z serwerem.' }
    }

    const question = await getQuestionData(input.questionId, supabase)
    if (!question) {
      return { isCorrect: false, answerId: `error-${Date.now()}`, feedback: 'Pytanie nie znalezione.' }
    }

    const correctAnswer = String(question.correct_answer).trim().toLowerCase()
    const userAnswer = input.answer.trim().toLowerCase()
    const isCorrect = userAnswer === correctAnswer

    // Record the attempt
    const attempt = await this.recordAttempt({ ...input, isCorrect } as SubmitAnswerInput & { isCorrect: boolean })

    // Get current attempt count for this question
    const previousAttempts = await countUserAttempts(userId, input.questionId, supabase)

    // Update progress with real mastery calculation
    if (question.topic_id) {
      await updateProgressService(userId, String(question.topic_id), isCorrect, 0, 0, false, supabase)
    }

    // Record mistake if incorrect
    if (!isCorrect) {
      const mistakeType = classifyMistakeType(input.answer, String(question.correct_answer))
      await recordMistakeService(
        userId,
        input.questionId,
        String(question.topic_id),
        question.subtopic_id ? String(question.subtopic_id) : undefined,
        input.answer,
        String(question.correct_answer),
        mistakeType,
        supabase,
      )
    }

    // Calculate and update next review date
    if (question.topic_id) {
      const reviewSchedule = calculateNextReview(isCorrect, 0, false, previousAttempts)
      await supabase
        .from('user_progress')
        .update({ next_review_at: reviewSchedule.nextReviewAt })
        .eq('user_id', userId)
        .eq('topic_id', question.topic_id)
    }

    return {
      isCorrect,
      answerId: attempt.id,
      feedback: isCorrect ? 'Poprawna odpowiedź.' : 'Odpowiedź została zapisana do analizy.',
    }
  },

  async requestHint(questionId) {
    const supabase = createClient()
    const userId = await currentUserId(supabase)
    const hints = await getHints(questionId)

    if (supabase && userId) {
      const question = await getQuestionData(questionId, supabase)
      if (question?.topic_id) {
        const { data: current } = await supabase
          .from('user_progress')
          .select('hints_used')
          .eq('user_id', userId)
          .eq('topic_id', question.topic_id)
          .maybeSingle()

        const hintsUsed = (current?.hints_used ?? 0) + 1

        await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            topic_id: question.topic_id,
            hints_used: hintsUsed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,topic_id' },
        )
      }
    }

    return hints[0] ?? null
  },

  async revealSolution(questionId) {
    const supabase = createClient()
    const userId = await currentUserId(supabase)
    const solution = await getSolution(questionId)

    if (supabase && userId) {
      const question = await getQuestionData(questionId, supabase)
      if (question?.topic_id) {
        const { data: current } = await supabase
          .from('user_progress')
          .select('solutions_viewed')
          .eq('user_id', userId)
          .eq('topic_id', question.topic_id)
          .maybeSingle()

        const solutionsViewed = (current?.solutions_viewed ?? 0) + 1

        await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            topic_id: question.topic_id,
            solutions_viewed: solutionsViewed,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,topic_id' },
        )
      }
    }

    return solution
  },

  async recordAttempt(input: SubmitAnswerInput & { isCorrect?: boolean }): Promise<UserAnswer> {
    const supabase = createClient()
    const userId = await currentUserId(supabase)
    const createdAt = nowIso()

    if (supabase && userId) {
      const { data, error } = await supabase
        .from('user_answers')
        .insert({
          user_id: userId,
          question_id: input.questionId,
          answer: input.answer,
          is_correct: Boolean(input.isCorrect),
          is_partial: false,
          time_seconds: input.timeSeconds ?? 0,
          hints_used: input.hintsUsed ?? 0,
          solution_viewed: input.solutionViewed ?? false,
          attempt_number: 1,
          created_at: createdAt,
        })
        .select('id,user_id,question_id,answer,is_correct,created_at')
        .single()

      if (!error && data) {
        return {
          id: String(data.id),
          userId: String(data.user_id),
          questionId: String(data.question_id),
          answer: String(data.answer),
          isCorrect: Boolean(data.is_correct),
          createdAt: String(data.created_at),
        }
      }
    }

    return {
      id: `answer-${Date.now()}`,
      userId: userId ?? DEMO_USER_ID,
      questionId: input.questionId,
      answer: input.answer,
      isCorrect: Boolean(input.isCorrect),
      createdAt,
    }
  },

  async recordMistake(questionId, userAnswer = ''): Promise<Mistake> {
    const supabase = createClient()
    const userId = await currentUserId(supabase)

    if (!supabase || !userId) {
      return { id: `mistake-${Date.now()}`, userId: DEMO_USER_ID, questionId, topicId: 'unknown', count: 1, lastSeenAt: nowIso() }
    }

    const question = await getQuestionData(questionId, supabase)
    if (!question) {
      return { id: `mistake-${Date.now()}`, userId, questionId, topicId: 'unknown', count: 1, lastSeenAt: nowIso() }
    }

    const topicId = String(question.topic_id)
    const correctAnswer = String(question.correct_answer)
    const mistakeType = classifyMistakeType(userAnswer, correctAnswer)

    const mistake = await recordMistakeService(
      userId,
      questionId,
      topicId,
      question.subtopic_id ? String(question.subtopic_id) : undefined,
      userAnswer,
      correctAnswer,
      mistakeType,
      supabase,
    )

    return mistake ? { id: mistake.id, userId: mistake.userId, questionId: mistake.questionId, topicId: mistake.topicId, count: mistake.attemptCount, lastSeenAt: mistake.lastSeenAt } : { id: `mistake-${Date.now()}`, userId, questionId, topicId, count: 1, lastSeenAt: nowIso() }
  },

  async updateProgress(topicId, isCorrect): Promise<UserProgress> {
    const supabase = createClient()
    const userId = await currentUserId(supabase)

    if (!supabase || !userId) {
      return { userId: DEMO_USER_ID, topicId, mastery: isCorrect ? 2 : 0, accuracy: isCorrect ? 100 : 0, attempts: 1, updatedAt: nowIso() }
    }

    const result = await updateProgressService(userId, topicId, isCorrect, 0, 0, false, supabase)

    if (result) {
      return {
        userId: result.userId,
        topicId: result.topicId || topicId,
        mastery: result.mastery,
        accuracy: result.accuracy,
        attempts: result.attempts,
        updatedAt: result.updatedAt,
      }
    }

    return { userId, topicId, mastery: isCorrect ? 2 : 0, accuracy: isCorrect ? 100 : 0, attempts: 1, updatedAt: nowIso() }
  },
}
