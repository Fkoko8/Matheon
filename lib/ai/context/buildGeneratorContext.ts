/**
 * MATHEON — kontekst generatora zadań (Faza 4).
 *
 * Generator ma tworzyć zadania pod konkretnego ucznia, a nie „na temat”. Ten moduł
 * zbiera z bazy trzy fakty: najsłabsze działy (mastery), typowe błędy i umiejętności,
 * które stoją za tymi błędami. Wynik trafia do promptu jako krótki, konkretny tekst.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export interface GeneratorContext {
  text: string
  weakTopics: string[]
  weakSkills: string[]
  mistakeTypes: string[]
}

export async function buildGeneratorContext(
  supabase: SupabaseClient,
  userId: string,
  level: 'basic' | 'extended',
): Promise<GeneratorContext> {
  const [progressResult, mistakesResult] = await Promise.all([
    supabase
      .from('user_progress')
      .select('mastery,accuracy,attempts,topics(name)')
      .eq('user_id', userId)
      .order('mastery', { ascending: true })
      .limit(6),
    supabase
      .from('mistakes')
      .select('mistake_type,attempt_count,questions(skills,question_text)')
      .eq('user_id', userId)
      .eq('resolved', false)
      .order('last_seen_at', { ascending: false })
      .limit(12),
  ])

  const weakTopics = (progressResult.data ?? [])
    .filter((row) => Number(row.attempts ?? 0) > 0 && Number(row.mastery ?? 0) < 60)
    .map((row) => String((row.topics as { name?: unknown } | null)?.name ?? ''))
    .filter(Boolean)

  const mistakeTypes = [...new Set((mistakesResult.data ?? []).map((row) => String(row.mistake_type ?? '')).filter(Boolean))]

  const weakSkills = [
    ...new Set(
      (mistakesResult.data ?? [])
        .flatMap((row) => {
          const question = row.questions as { skills?: unknown } | null
          return Array.isArray(question?.skills) ? (question.skills as unknown[]).map(String) : []
        })
        .filter(Boolean),
    ),
  ].slice(0, 8)

  const lines = [
    `Poziom ucznia: ${level === 'extended' ? 'rozszerzony' : 'podstawowy'}.`,
    weakTopics.length ? `Najsłabsze działy (mastery < 60%): ${weakTopics.join(', ')}.` : 'Brak danych o słabych działach — uczeń zaczyna naukę.',
    weakSkills.length ? `Umiejętności, na których się potykał: ${weakSkills.join(', ')}.` : '',
    mistakeTypes.length ? `Dominujące typy błędów: ${mistakeTypes.join(', ')}.` : '',
    'Zadanie ma ćwiczyć wskazane umiejętności i uderzać w typowy błąd ucznia.',
  ].filter(Boolean)

  return { text: lines.join('\n'), weakTopics, weakSkills, mistakeTypes }
}
