/**
 * MATHEON — kontekst tutora.
 *
 * Tutor dostaje trzy rzeczy naraz:
 * 1. **materiał MATHEON** (RAG: wektory albo tryb słowny) — z informacją, czy źródło
 *    faktycznie znaleziono (`sourceAware`), żeby nie wymyślał treści,
 * 2. **stan ucznia** — profil, najsłabsze działy i ostatnie błędy,
 * 3. **zadanie, nad którym pracuje** — treść, jego odpowiedź, matryca i umiejętności.
 */
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { searchKnowledge, type KnowledgeResult } from '@/lib/ai/retrieval/searchKnowledge'

export interface TutorActivity {
  lesson?: string
  question?: string
  answer?: string
  attempts?: number
  hintsUsed?: number
}

export interface BuildTutorContextInput {
  query: string
  activity?: TutorActivity
  level?: string
  topic?: string
  limit?: number
}

export async function buildTutorContext(input: BuildTutorContextInput) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const knowledge = await searchKnowledge(
    input.query,
    { level: input.level, topic: input.topic, limit: input.limit ?? 6 },
    supabase,
  )

  let profile: Record<string, unknown> | null = null
  let progress: Record<string, unknown>[] = []
  let mistakes: Record<string, unknown>[] = []

  if (user) {
    const [profileResult, progressResult, mistakesResult] = await Promise.all([
      supabase.from('profiles').select('level,xp,streak').eq('id', user.id).maybeSingle(),
      supabase.from('user_progress').select('topic_id,mastery,accuracy').eq('user_id', user.id).order('mastery').limit(8),
      supabase.from('mistakes').select('question_id,topic_id,mistake_type,attempt_count').eq('user_id', user.id).order('last_seen_at', { ascending: false }).limit(6),
    ])
    profile = profileResult.data
    progress = progressResult.data ?? []
    mistakes = mistakesResult.data ?? []
  }

  return {
    knowledge,
    user: { profile, weakTopics: progress, mistakes },
    activity: input.activity ?? {},
    sourceAware: knowledge.length > 0,
    retrieval: knowledge[0]?.matchType ?? null,
  }
}

/** Kontekst w formie tekstowej dla promptu (dane, nie instrukcje). */
export function formatTutorContext(context: Awaited<ReturnType<typeof buildTutorContext>>) {
  return JSON.stringify(
    {
      knowledge: context.knowledge.map((item: KnowledgeResult) => ({
        title: item.title,
        content: item.content,
        similarity: Math.round(item.similarity * 100) / 100,
        source: item.metadata,
      })),
      user: context.user,
      activity: context.activity,
      sourceAware: context.sourceAware,
      retrieval: context.retrieval,
    },
    null,
    2,
  )
}
