/**
 * MATHEON — odczyt stanu umiejętności.
 *
 * Stan mastery i harmonogramu SM-2 wyprowadzamy z dziennika zdarzeń (`learning_events`),
 * które zapisujemy przy każdej odpowiedzi ucznia. Dzięki temu:
 * - nie trzeba migracji na tabelę „cache” — źródłem prawdy jest historia,
 * - mastery nigdy nie rośnie od samego otwarcia lekcji (tylko od dowodu = odpowiedzi),
 * - harmonogram SM-2 można odtworzyć w całości i zafalszować w testach.
 *
 * Gdy wolumen zdarzeń wzrośnie (Faza 6 z planu), ten moduł zastępujemy zmaterializowaną
 * tabelą `user_skills`, zachowując ten sam interfejs.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { applyAnswer, emptySkillState, replayState, type AnswerEvidence, type SkillReviewState } from '@/lib/learning/skill-model'

export interface SkillRow {
  id: string
  slug: string
  name: string
  description?: string
  level: 'basic' | 'extended'
  difficulty: number
}

export interface SkillWithState {
  skill: SkillRow
  state: SkillReviewState
}

const EVENT_PAGE = 1000
const MAX_EVENTS = 8000

export type AnyClient = SupabaseClient | null

export async function getCurrentUserId(supabase: AnyClient): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export function defaultClient(): AnyClient {
  return createClient()
}

/** Katalog umiejętności CKE obecnych w bazie. */
export async function loadSkillCatalog(supabase: AnyClient): Promise<SkillRow[]> {
  if (!supabase) return []
  const { data } = await supabase.from('skills').select('id,slug,name,description,level,difficulty').order('slug')
  return (
    data?.map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name),
      description: row.description ? String(row.description) : undefined,
      level: (row.level as 'basic' | 'extended') ?? 'basic',
      difficulty: Number(row.difficulty ?? 1),
    })) ?? []
  )
}

/** Slugi umiejętności pogrupowane po dziale (na podstawie banku zadań). */
export async function loadTopicSkillSlugs(supabase: AnyClient): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>()
  if (!supabase) return result

  const { data } = await supabase.from('questions').select('topic_id,skills').eq('published', true)
  for (const row of data ?? []) {
    const topicId = String(row.topic_id ?? '')
    if (!topicId) continue
    const slugs = Array.isArray(row.skills) ? (row.skills as unknown[]).map(String).filter(Boolean) : []
    if (!slugs.length) continue
    const current = result.get(topicId) ?? []
    for (const slug of slugs) if (!current.includes(slug)) current.push(slug)
    result.set(topicId, current)
  }
  return result
}

/**
 * Stan każdej umiejętności ucznia — odtworzony z dziennika zdarzeń.
 * Zwraca mapę `skillId → stan` (tylko umiejętności z co najmniej jedną odpowiedzią).
 */
export async function loadSkillStates(userId: string, supabase: AnyClient): Promise<Map<string, SkillReviewState>> {
  const states = new Map<string, SkillReviewState>()
  if (!supabase || !userId) return states

  const history = new Map<string, Array<{ grade: number; evidence: AnswerEvidence; at: string }>>()
  let offset = 0

  while (offset < MAX_EVENTS) {
    const { data, error } = await supabase
      .from('learning_events')
      .select('skill_id,metadata,created_at')
      .eq('user_id', userId)
      .eq('event_type', 'answer')
      .not('skill_id', 'is', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + EVENT_PAGE - 1)

    if (error || !data?.length) break

    for (const row of data) {
      const skillId = String(row.skill_id)
      const metadata = (row.metadata ?? {}) as Record<string, unknown>
      const evidence: AnswerEvidence = {
        isCorrect: Boolean(metadata.isCorrect),
        hintsUsed: Number(metadata.hintsUsed ?? 0),
        solutionViewed: Boolean(metadata.solutionViewed),
        timeSeconds: Number(metadata.timeSeconds ?? 0),
      }
      const entry = { grade: Number(metadata.grade ?? (evidence.isCorrect ? 4 : 1)), evidence, at: String(row.created_at) }
      const list = history.get(skillId) ?? []
      list.push(entry)
      history.set(skillId, list)
    }

    if (data.length < EVENT_PAGE) break
    offset += EVENT_PAGE
  }

  for (const [skillId, entries] of history) states.set(skillId, replayState(skillId, entries))
  return states
}

export function stateFor(states: Map<string, SkillReviewState>, skillId: string): SkillReviewState {
  return states.get(skillId) ?? emptySkillState(skillId)
}

/** Łączy katalog umiejętności ze stanem ucznia (posortowane od najsłabszej). */
export function joinSkillStates(skills: SkillRow[], states: Map<string, SkillReviewState>): SkillWithState[] {
  return skills
    .map((skill) => ({ skill, state: stateFor(states, skill.id) }))
    .sort((a, b) => {
      const aPractised = a.state.attempts > 0 ? 0 : 1
      const bPractised = b.state.attempts > 0 ? 0 : 1
      if (aPractised !== bPractised) return aPractised - bPractised
      return a.state.mastery - b.state.mastery
    })
}

/** Średnia mastery działu liczona wyłącznie z umiejętności, które uczeń realnie ćwiczył. */
export function topicMasteryFromStates(skillSlugs: string[], skillBySlug: Map<string, SkillRow>, states: Map<string, SkillReviewState>): number {
  const values: number[] = []
  for (const slug of skillSlugs) {
    const skill = skillBySlug.get(slug)
    if (!skill) continue
    const state = states.get(skill.id)
    if (!state || state.attempts === 0) continue
    values.push(state.mastery)
  }
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

/** Zapisuje zdarzenia odpowiedzi dla każdej umiejętności pytania (podstawa mastery). */
export async function recordAnswerEvents(
  userId: string,
  input: { questionId: string; skillIds: string[]; evidence: AnswerEvidence; grade: number; topicId?: string; topicSlug?: string },
  supabase: AnyClient,
): Promise<void> {
  if (!supabase || !userId || !input.skillIds.length) return
  const rows = input.skillIds.map((skillId) => ({
    user_id: userId,
    event_type: 'answer',
    skill_id: skillId,
    question_id: input.questionId,
    metadata: {
      isCorrect: input.evidence.isCorrect,
      hintsUsed: input.evidence.hintsUsed ?? 0,
      solutionViewed: Boolean(input.evidence.solutionViewed),
      timeSeconds: input.evidence.timeSeconds ?? 0,
      grade: input.grade,
      topicId: input.topicId,
      topicSlug: input.topicSlug,
    },
  }))
  await supabase.from('learning_events').insert(rows)
}

/** Zdarzenie otwarcia lekcji — informacyjne, nie wpływa na mastery. */
export async function recordLessonOpened(userId: string, lessonId: string, supabase: AnyClient): Promise<void> {
  if (!supabase || !userId) return
  await supabase.from('learning_events').insert({ user_id: userId, event_type: 'lesson_opened', lesson_id: lessonId, metadata: {} })
}

/** Postęp jednej umiejętności po odpowiedzi (do podsumowania sesji). */
export function stateAfter(state: SkillReviewState, evidence: AnswerEvidence, grade: number, at: Date = new Date()): SkillReviewState {
  return applyAnswer(state, evidence, at)
}
