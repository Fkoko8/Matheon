/**
 * MATHEON — dane pod wykresy w statystykach.
 *
 * Trzy pytania, na które odpowiadają te funkcje:
 * 1. Jak zmieniało się mastery w ostatnich tygodniach? (`trend`)
 * 2. Które działy idą dobrze, a które wymagają pracy? (`topics`)
 * 3. Ile realnie ćwiczę każdego dnia? (`trend[].answers`)
 *
 * Wszystko liczone z realnych odpowiedzi (`learning_events`) i postępu działów
 * (`user_progress`) — żadna liczba nie jest wpisana na sztywno. Część czysta
 * (`buildMasteryTrend`) jest wydzielona, żeby dała się przetestować bez bazy.
 */
import { createClient } from '@/lib/supabase/client'
import { applyAnswer, emptySkillState, type SkillReviewState } from '@/lib/learning/skill-model'
import { defaultClient, loadAnswerHistory, type AnswerHistoryEntry, type AnyClient } from '@/lib/learning/skill-state'

export interface MasteryTrendPoint {
  /** Data w formacie `YYYY-MM-DD` (UTC). */
  date: string
  /** Średnie mastery umiejętności ćwiczących się do tego dnia (0–100). */
  mastery: number
  /** Liczba odpowiedzi udzielonych tego dnia. */
  answers: number
}

export interface TopicAccuracy {
  topicId: string
  name: string
  attempts: number
  correct: number
  /** Skuteczność w procentach (kolumna `accuracy` w `user_progress`). */
  accuracy: number
  mastery: number
}

export interface StatsInsights {
  trend: MasteryTrendPoint[]
  topics: TopicAccuracy[]
  /** Suma odpowiedzi w całym oknie trendu. */
  answersInWindow: number
  /** Najlepszy dzień okna (liczba odpowiedzi). */
  bestDay: MasteryTrendPoint | null
}

const DAY_MS = 24 * 60 * 60 * 1000
export const DEFAULT_TREND_DAYS = 30

function utcDayStart(date: Date): Date {
  const copy = new Date(date.getTime())
  copy.setUTCHours(0, 0, 0, 0)
  return copy
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Czyste przeliczenie trendu: jeden przebieg po historii (rosnąco) plus jeden krok na dzień.
 * Stan umiejętności w danym dniu obejmuje wyłącznie odpowiedzi do końca tego dnia,
 * więc wykres pokazuje faktyczny postęp, a nie stan „na dziś” powtórzony 30 razy.
 */
export function buildMasteryTrend(
  history: AnswerHistoryEntry[],
  days: number = DEFAULT_TREND_DAYS,
  now: Date = new Date(),
): MasteryTrendPoint[] {
  if (days <= 0) return []
  const firstDay = utcDayStart(new Date(now.getTime() - (days - 1) * DAY_MS))
  const states = new Map<string, SkillReviewState>()
  const points: MasteryTrendPoint[] = []
  let cursor = 0

  for (let index = 0; index < days; index += 1) {
    const dayStart = new Date(firstDay.getTime() + index * DAY_MS)
    const dayEnd = new Date(dayStart.getTime() + DAY_MS)
    let answers = 0

    while (cursor < history.length && new Date(history[cursor].at).getTime() < dayEnd.getTime()) {
      const entry = history[cursor]
      const at = new Date(entry.at)
      const before = states.get(entry.skillId) ?? emptySkillState(entry.skillId, at)
      states.set(entry.skillId, applyAnswer(before, entry.evidence, at))
      if (at.getTime() >= dayStart.getTime()) answers += 1
      cursor += 1
    }

    const values = [...states.values()].filter((state) => state.attempts > 0).map((state) => state.mastery)
    points.push({
      date: isoDay(dayStart),
      mastery: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0,
      answers,
    })
  }

  return points
}

export async function loadMasteryTrend(
  userId: string,
  supabase: AnyClient = defaultClient(),
  days: number = DEFAULT_TREND_DAYS,
  now: Date = new Date(),
): Promise<MasteryTrendPoint[]> {
  if (!supabase || !userId) return []
  const history = await loadAnswerHistory(userId, supabase)
  return buildMasteryTrend(history, days, now)
}

/** Skuteczność i mastery per dział — wprost z `user_progress`, posortowane od najsłabszych. */
export async function loadTopicAccuracy(userId: string, supabase: AnyClient = createClient()): Promise<TopicAccuracy[]> {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from('user_progress')
    .select('topic_id,attempts,correct_attempts,accuracy,mastery,topics(name)')
    .eq('user_id', userId)
    .not('topic_id', 'is', null)

  if (error) return []

  return (data ?? [])
    .map((row: Record<string, unknown>) => {
      const topic = (row.topics ?? null) as { name?: unknown } | null
      return {
        topicId: String(row.topic_id ?? ''),
        name: topic?.name ? String(topic.name) : 'Dział',
        attempts: Number(row.attempts ?? 0),
        correct: Number(row.correct_attempts ?? 0),
        accuracy: Math.round(Number(row.accuracy ?? 0)),
        mastery: Math.round(Number(row.mastery ?? 0)),
      }
    })
    .filter((row) => row.attempts > 0)
    .sort((a, b) => a.accuracy - b.accuracy || a.mastery - b.mastery)
}

/** Zbiorczy zestaw danych dla ekranu statystyk. */
export async function loadStatsInsights(
  userId: string,
  supabase: AnyClient = defaultClient(),
  days: number = DEFAULT_TREND_DAYS,
): Promise<StatsInsights> {
  const [trend, topics] = await Promise.all([loadMasteryTrend(userId, supabase, days), loadTopicAccuracy(userId, supabase)])
  const answersInWindow = trend.reduce((sum, point) => sum + point.answers, 0)
  const bestDay = trend.reduce<MasteryTrendPoint | null>((best, point) => (!best || point.answers > best.answers ? point : best), null)
  return { trend, topics, answersInWindow, bestDay: bestDay && bestDay.answers > 0 ? bestDay : null }
}
