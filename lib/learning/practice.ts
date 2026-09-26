/**
 * MATHEON — silnik treningu i powtórek.
 *
 * Jedno miejsce, przez które przechodzi każda odpowiedź ucznia (trening, powtórka,
 * naprawa błędu, egzamin w przyszłości). Odpowiedzialności:
 *
 * 1. zbudować kolejkę zadań z realnego banku (tryb mieszany / dział / umiejętność /
 *    powtórka SM-2 / błędy / słabe umiejętności),
 * 2. sprawdzić odpowiedź (liczby z tolerancją, akceptowane warianty, zadania otwarte
 *    z samoceną wg matrycy punktów),
 * 3. zapisać wynik: `user_answers`, zdarzenia umiejętności (`learning_events`),
 *    postęp działu (`user_progress`) i pętlę błędów (`mistakes`).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { applyAnswer, gradeAnswer, isDue, masteryLevel, sessionScore, WEAK_MASTERY, type AnswerEvidence, type SkillReviewState } from '@/lib/learning/skill-model'
import {
  defaultClient,
  getCurrentUserId,
  joinSkillStates,
  loadSkillCatalog,
  loadSkillStates,
  loadTopicSkillSlugs,
  recordAnswerEvents,
  stateFor,
  type AnyClient,
  type SkillRow,
} from '@/lib/learning/skill-state'

export type PracticeMode = 'mixed' | 'topic' | 'skill' | 'review' | 'mistakes' | 'weak'
export type PracticeQuestionType = 'numeric' | 'single_choice' | 'text' | 'open' | 'proof'

export interface PracticeQuestion {
  id: string
  title: string
  prompt: string
  /** Rysunek do treści zadania (wykres/figura/oś) — specyfikacja z `validation_metadata.figure`. */
  figure?: unknown
  type: PracticeQuestionType
  points: number
  difficulty: number
  level: 'basic' | 'extended'
  options: string[]
  tags: string[]
  skillSlugs: string[]
  topicId?: string
  topicName?: string
  topicSlug?: string
  sourceType?: string
  sourceYear?: number
  /** Autorskie zadanie MATHEON (import z `content/`). */
  authored: boolean
  code?: string
}

export interface PracticeQueue {
  mode: PracticeMode
  questions: PracticeQuestion[]
  /** Umiejętności, których dotyczy kolejka (dla powtórek: te, których termin minął). */
  focusSkills: Array<{ slug: string; name: string; mastery: number; dueInDays: number }>
}

export interface PracticeStep {
  criterion: string
  points: number
}

export interface PracticeSubmitInput {
  questionId: string
  answer: string
  timeSeconds?: number
  hintsUsed?: number
  solutionViewed?: boolean
  /** Ocena własna dla zadań otwartych (matura: dowód / uzasadnienie). */
  selfAssessment?: 'correct' | 'incorrect'
  /**
   * Sprawdzenie bez zapisu. Używane dla zadań otwartych: najpierw pokazujemy uczniowi
   * wzorzec i matrycę, a zapisujemy dopiero jego samoocenę (jedna odpowiedź = jeden wiersz).
   */
  dryRun?: boolean
}

export interface SkillUpdate {
  slug: string
  name: string
  before: number
  after: number
  delta: number
  level: string
  dueInDays: number
}

export interface PracticeFeedback {
  questionId: string
  isCorrect: boolean
  /** Zadanie otwarte — uczeń ocenia swoją pracę sam, na podstawie matrycy. */
  needsSelfAssessment: boolean
  correctAnswer: string
  acceptedAnswers: string[]
  solution: string
  steps: string[]
  rubric: PracticeStep[]
  skillUpdates: SkillUpdate[]
  mistakeResolved: boolean
  /** false, gdy brak sesji/Supabase — wynik policzony, ale nie zapisany. */
  persisted: boolean
  feedback: string
}

export interface PracticeOverview {
  totalSkills: number
  practisedSkills: number
  mastery: number
  dueToday: number
  weakSkills: number
  unlockedQuestions: number
  unanswered: number
}

const QUESTION_SELECT =
  'id,title,question_text,question_type,points,difficulty,level,tags,skills,correct_answer,solution_text,source_type,source_year,validation_metadata,topic_id,topics(name,slug)'

/* ------------------------------------------------------------------ *
 * Sprawdzanie odpowiedzi
 * ------------------------------------------------------------------ */

const UNICODE_MINUS = /[\u2212\u2013\u2014]/g

/** Normalizacja zapisu ucznia: spacje, przecinek dziesiętny, znaki minusa, LaTeX. */
export function normalizeAnswer(value: string): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(UNICODE_MINUS, '-')
    .replace(/\$/g, '')
    .replace(/\\left|\\right|\\!|\\,|\\;/g, '')
    .replace(/\s+/g, '')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/(^|[^\d])\.(\d)/g, '$1.0$2')
    .replace(/^\+/, '')
    .replace(/\.$/, '')
    .toLowerCase()
}

function asNumber(value: string): number | null {
  if (!/^-?\d+(\.\d+)?(\/\d+(\.\d+)?)?$/.test(value)) return null
  if (value.includes('/')) {
    const [a, b] = value.split('/').map(Number)
    if (!b) return null
    return a / b
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Lista akceptowanych odpowiedzi zadania (kanoniczna + warianty z authoringu). */
export function acceptedAnswersOf(question: { acceptedAnswers?: string[] }): string[] {
  return (question.acceptedAnswers ?? []).filter(Boolean)
}

/**
 * Sprawdzenie odpowiedzi.
 * - liczby porównujemy z tolerancją, więc `4`, `4.0`, `4/1` i `4,0` są tym samym,
 * - zadania otwarte (open/proof/text) po braku dopasowania proszą o samocenę,
 *   bo matura ocenia tok rozumowania, a nie sam wynik.
 */
export function checkAnswer(
  question: Pick<PracticeQuestion, 'type'> & { correctAnswer: string; acceptedAnswers: string[] },
  answer: string,
): { isCorrect: boolean; needsSelfAssessment: boolean } {
  const normalizedUser = normalizeAnswer(answer)
  if (!normalizedUser) return { isCorrect: false, needsSelfAssessment: false }

  const variants = [question.correctAnswer, ...question.acceptedAnswers].filter(Boolean).map(normalizeAnswer)
  if (variants.includes(normalizedUser)) return { isCorrect: true, needsSelfAssessment: false }

  const userNumber = asNumber(normalizedUser)
  if (userNumber !== null) {
    for (const variant of variants) {
      const value = asNumber(variant)
      if (value === null) continue
      const tolerance = Math.max(1e-9, Math.abs(value) * 1e-6)
      if (Math.abs(value - userNumber) <= tolerance) return { isCorrect: true, needsSelfAssessment: false }
    }
  }

  const openEnded = question.type === 'open' || question.type === 'proof' || question.type === 'text'
  return { isCorrect: false, needsSelfAssessment: openEnded }
}

/* ------------------------------------------------------------------ *
 * Kolejka zadań
 * ------------------------------------------------------------------ */

function hashSeed(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Deterministyczny generator — sesja jest stabilna w obrębie dnia, ale nie taka sama codziennie. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = (() => {
    let state = hashSeed(seed) || 1
    return () => {
      state |= 0
      state = (state + 0x6d2b79f5) | 0
      let t = Math.imul(state ^ (state >>> 15), 1 | state)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })()

  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

export function todaySeed(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

function metadataOf(row: Record<string, unknown>): Record<string, unknown> {
  const raw = row.validation_metadata
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
}

function mapQuestion(row: Record<string, unknown>): PracticeQuestion {
  const metadata = metadataOf(row)
  const topic = (row.topics ?? null) as { name?: unknown; slug?: unknown } | null
  const prompt = String(row.question_text ?? '')
  const skillSlugs = Array.isArray(row.skills) ? (row.skills as unknown[]).map(String).filter(Boolean) : []
  const options = Array.isArray(metadata.options) ? (metadata.options as unknown[]).map(String) : []
  const code = metadata.code ? String(metadata.code) : undefined

  return {
    id: String(row.id),
    title: row.title ? String(row.title) : prompt.slice(0, 70),
    prompt,
    figure: metadata.figure ?? undefined,
    type: (String(row.question_type ?? 'text') as PracticeQuestionType) ?? 'text',
    points: Number(row.points ?? 1),
    difficulty: Number(row.difficulty ?? 1),
    level: (row.level as 'basic' | 'extended') ?? 'basic',
    options,
    tags: Array.isArray(row.tags) ? (row.tags as unknown[]).map(String) : [],
    skillSlugs,
    topicId: row.topic_id ? String(row.topic_id) : undefined,
    topicName: topic?.name ? String(topic.name) : undefined,
    topicSlug: topic?.slug ? String(topic.slug) : undefined,
    sourceType: row.source_type ? String(row.source_type) : undefined,
    sourceYear: row.source_year ? Number(row.source_year) : undefined,
    authored: Boolean(code),
    code,
  }
}

export interface PracticeQueueInput {
  mode: PracticeMode
  level?: 'basic' | 'extended'
  topicId?: string
  topicSlug?: string
  skillSlug?: string
  /** Konkretne zadania (np. ponowna próba jednego błędu) — kolejność jest zachowana. */
  questionIds?: string[]
  limit?: number
  excludeIds?: string[]
  seed?: string
}

/** Buduje kolejkę zadań z realnego banku, świadomie dobierając źródło zadań do trybu. */
export async function buildPracticeQueue(input: PracticeQueueInput, supabase: AnyClient = defaultClient()): Promise<PracticeQueue> {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 40)
  const seed = input.seed ?? todaySeed()
  const queue: PracticeQueue = { mode: input.mode, questions: [], focusSkills: [] }
  if (!supabase) return queue

  const userId = await getCurrentUserId(supabase)
  const skills = await loadSkillCatalog(supabase)
  const skillById = new Map(skills.map((skill) => [skill.id, skill]))
  const states = userId ? await loadSkillStates(userId, supabase) : new Map<string, SkillReviewState>()
  const skillBySlug = new Map(skills.map((skill) => [skill.slug, skill]))

  const exclude = new Set(input.excludeIds ?? [])
  const collect = async (query: PromiseLike<{ data: unknown }>): Promise<PracticeQuestion[]> => {
    const { data } = await query
    return ((data ?? []) as Array<Record<string, unknown>>)
      .map(mapQuestion)
      .filter((question) => !exclude.has(question.id))
  }

  if (input.questionIds?.length) {
    const rows = await collect(supabase.from('questions').select(QUESTION_SELECT).in('id', input.questionIds))
    const byId = new Map(rows.map((question) => [question.id, question]))
    queue.questions = input.questionIds
      .map((id) => byId.get(id))
      .filter((question): question is PracticeQuestion => Boolean(question))
      .slice(0, limit)
    queue.focusSkills = awaitingFocus(queue.questions, skillBySlug, states)
    return queue
  }

  if (input.mode === 'review' || input.mode === 'weak') {
    const now = new Date()
    const candidates = joinSkillStates(skills, states).filter(({ state }) => {
      if (state.attempts === 0) return false
      if (input.mode === 'review') return isDue(state, now)
      return state.mastery < WEAK_MASTERY
    })

    const focus = candidates.slice(0, 6)
    queue.focusSkills = focus.map(({ skill, state }) => ({
      slug: skill.slug,
      name: skill.name,
      mastery: state.mastery,
      dueInDays: Math.ceil((new Date(state.dueAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    }))

    const perSkill = await Promise.all(
      focus.map(({ skill }) =>
        collect(
          supabase
            .from('questions')
            .select(QUESTION_SELECT)
            .eq('published', true)
            .contains('skills', [skill.slug])
            .limit(3),
        ),
      ),
    )
    const merged = seededShuffle(perSkill.flat(), `${seed}-${input.mode}`)
    queue.questions = merged.slice(0, limit)
    return queue
  }

  if (input.mode === 'mistakes') {
    if (!userId) return queue
    const { data: mistakes } = await supabase
      .from('mistakes')
      .select('question_id')
      .eq('user_id', userId)
      .eq('resolved', false)
      .order('last_seen_at', { ascending: false })
      .limit(limit)

    const ids = (mistakes ?? []).map((row) => String(row.question_id))
    if (!ids.length) return queue
    const questions = await collect(supabase.from('questions').select(QUESTION_SELECT).eq('published', true).in('id', ids))
    queue.questions = ids.map((id) => questions.find((question) => question.id === id)).filter((question): question is PracticeQuestion => Boolean(question))
    return queue
  }

  let request = supabase.from('questions').select(QUESTION_SELECT).eq('published', true)
  if (input.level) request = request.eq('level', input.level)
  if (input.topicId) request = request.eq('topic_id', input.topicId)
  if (input.skillSlug) request = request.contains('skills', [input.skillSlug])
  if (input.mode === 'mixed') request = request.limit(500)
  else request = request.limit(Math.max(limit * 4, 40))

  const questions = await collect(request)

  if (input.topicSlug) {
    const filtered = questions.filter((question) => question.topicSlug === input.topicSlug)
    queue.questions = seededShuffle(filtered, `${seed}-${input.mode}`).slice(0, limit)
    return queue
  }

  queue.questions = seededShuffle(questions, `${seed}-${input.mode}`).slice(0, limit)

  queue.focusSkills = awaitingFocus(queue.questions, skillBySlug, states)

  void skillById
  return queue
}

/** Umiejętności, których dotyczy kolejka — z aktualnym mastery i terminem powtórki. */
function awaitingFocus(
  questions: PracticeQuestion[],
  skillBySlug: Map<string, SkillRow>,
  states: Map<string, SkillReviewState>,
): PracticeQueue['focusSkills'] {
  const slugs = Array.from(new Set(questions.flatMap((question) => question.skillSlugs)))
  return slugs.slice(0, 8).map((slug) => {
    const skill = skillBySlug.get(slug)
    const state = skill ? stateFor(states, skill.id) : null
    return {
      slug,
      name: skill?.name ?? slug,
      mastery: state?.mastery ?? 0,
      dueInDays: state ? Math.ceil((new Date(state.dueAt).getTime() - Date.now()) / 86400000) : 0,
    }
  })
}

/* ------------------------------------------------------------------ *
 * Materiały do zadania (podpowiedzi, rozwiązanie, kroki, matryca)
 * ------------------------------------------------------------------ */

export interface QuestionMaterials {
  hints: string[]
  solution: string
  steps: string[]
  rubric: PracticeStep[]
  correctAnswer: string
  acceptedAnswers: string[]
}

export async function loadQuestionMaterials(questionId: string, supabase: AnyClient = defaultClient()): Promise<QuestionMaterials> {
  const empty: QuestionMaterials = { hints: [], solution: '', steps: [], rubric: [], correctAnswer: '', acceptedAnswers: [] }
  if (!supabase) return empty

  const [{ data: question }, { data: hints }] = await Promise.all([
    supabase.from('questions').select('correct_answer,solution_text,validation_metadata').eq('id', questionId).maybeSingle(),
    supabase.from('hints').select('content,order_index').eq('question_id', questionId).order('order_index'),
  ])

  if (!question) return empty
  const metadata = (question.validation_metadata ?? {}) as Record<string, unknown>
  const steps = Array.isArray(metadata.steps) ? (metadata.steps as unknown[]).map(String) : []
  const rubric = Array.isArray(metadata.rubric)
    ? (metadata.rubric as Array<Record<string, unknown>>).map((item) => ({ criterion: String(item.criterion ?? ''), points: Number(item.points ?? 0) }))
    : []
  const accepted = Array.isArray(metadata.acceptedAnswers) ? (metadata.acceptedAnswers as unknown[]).map(String) : []

  return {
    hints: (hints ?? []).map((row) => String(row.content)),
    solution: question.solution_text ? String(question.solution_text) : '',
    steps,
    rubric,
    correctAnswer: String(question.correct_answer ?? ''),
    acceptedAnswers: accepted,
  }
}

/* ------------------------------------------------------------------ *
 * Zapis odpowiedzi
 * ------------------------------------------------------------------ */

interface PersistContext {
  userId: string | null
  questionRow: Record<string, unknown>
  evidence: AnswerEvidence
  isCorrect: boolean
  skillIds: string[]
  skillsBySlug: Map<string, SkillRow>
}

async function persistAnswer(input: PracticeSubmitInput, context: PersistContext, supabase: AnyClient): Promise<{ skillUpdates: SkillUpdate[]; mistakeResolved: boolean; persisted: boolean }> {
  const { userId, questionRow, evidence, isCorrect } = context
  if (!supabase || !userId) return { skillUpdates: [], mistakeResolved: false, persisted: false }

  const questionId = input.questionId
  const topicId = questionRow.topic_id ? String(questionRow.topic_id) : undefined

  await supabase.from('user_answers').insert({
    user_id: userId,
    question_id: questionId,
    answer: input.answer,
    is_correct: isCorrect,
    is_partial: Boolean(evidence.solutionViewed),
    time_seconds: input.timeSeconds ?? 0,
    hints_used: input.hintsUsed ?? 0,
    solution_viewed: Boolean(input.selfAssessment || evidence.solutionViewed),
    attempt_number: 1,
  })

  const statesBefore = await loadSkillStates(userId, supabase)
  const skillUpdates: SkillUpdate[] = []
  const statesAfter = new Map(statesBefore)

  const grade = gradeAnswer(evidence)
  for (const skillId of context.skillIds) {
    const skill = [...context.skillsBySlug.values()].find((item) => item.id === skillId)
    const before = stateFor(statesBefore, skillId)
    const next = applyAnswer(before, evidence)
    statesAfter.set(skillId, next)
    skillUpdates.push({
      slug: skill?.slug ?? skillId,
      name: skill?.name ?? skillId,
      before: before.mastery,
      after: next.mastery,
      delta: next.mastery - before.mastery,
      level: masteryLevel(next.mastery),
      dueInDays: Math.max(1, Math.round(next.intervalDays)),
    })
  }

  await recordAnswerEvents(
    userId,
    { questionId, skillIds: context.skillIds, evidence, grade, topicId, topicSlug: questionRow.topics ? String((questionRow.topics as { slug?: unknown }).slug ?? '') : undefined },
    supabase,
  )

  if (topicId) {
    const topicSlugs = await loadTopicSkillSlugs(supabase)
    const slugs = topicSlugs.get(topicId) ?? []
    const masteryValues = slugs
      .map((slug) => context.skillsBySlug.get(slug))
      .filter((skill): skill is SkillRow => Boolean(skill))
      .map((skill) => statesAfter.get(skill.id))
      .filter((state): state is SkillReviewState => Boolean(state && state.attempts > 0))
      .map((state) => state.mastery)
    const topicMastery = masteryValues.length ? Math.round(masteryValues.reduce((sum, value) => sum + value, 0) / masteryValues.length) : 0
    const dueCandidates = slugs
      .map((slug) => context.skillsBySlug.get(slug))
      .filter((skill): skill is SkillRow => Boolean(skill))
      .map((skill) => statesAfter.get(skill.id))
      .filter((state): state is SkillReviewState => Boolean(state && state.attempts > 0))
      .map((state) => new Date(state.dueAt).getTime())
    const nextReviewAt = dueCandidates.length ? new Date(Math.min(...dueCandidates)).toISOString() : undefined

    const { data: current } = await supabase
      .from('user_progress')
      .select('attempts,correct_attempts,incorrect_attempts,hints_used,solutions_viewed,average_time_seconds')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .maybeSingle()

    const attempts = Number(current?.attempts ?? 0) + 1
    const correctAttempts = Number(current?.correct_attempts ?? 0) + (isCorrect ? 1 : 0)
    const incorrectAttempts = Number(current?.incorrect_attempts ?? 0) + (isCorrect ? 0 : 1)
    const averageTime = Math.round((Number(current?.average_time_seconds ?? 0) * (attempts - 1) + (input.timeSeconds ?? 0)) / attempts)

    await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        topic_id: topicId,
        attempts,
        correct_attempts: correctAttempts,
        incorrect_attempts: incorrectAttempts,
        accuracy: Math.round((correctAttempts / attempts) * 100),
        mastery: topicMastery,
        hints_used: Number(current?.hints_used ?? 0) + (input.hintsUsed ?? 0),
        solutions_viewed: Number(current?.solutions_viewed ?? 0) + (input.solutionViewed ? 1 : 0),
        average_time_seconds: averageTime,
        last_attempt_at: new Date().toISOString(),
        next_review_at: nextReviewAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id' },
    )
  }

  let mistakeResolved = false
  if (topicId) {
    const { data: existing } = await supabase
      .from('mistakes')
      .select('id,attempt_count,resolved')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .maybeSingle()

    if (!isCorrect) {
      if (existing) {
        await supabase
          .from('mistakes')
          .update({
            attempt_count: Number(existing.attempt_count ?? 1) + 1,
            user_answer: input.answer,
            correct_answer: String(questionRow.correct_answer ?? ''),
            last_seen_at: new Date().toISOString(),
            resolved: false,
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('mistakes').insert({
          user_id: userId,
          question_id: questionId,
          topic_id: topicId,
          subtopic_id: questionRow.subtopic_id ? String(questionRow.subtopic_id) : null,
          user_answer: input.answer,
          correct_answer: String(questionRow.correct_answer ?? ''),
          mistake_type: classifyAnswerMistake(input.answer, String(questionRow.correct_answer ?? '')),
          resolved: false,
        })
      }
    } else if (existing && !existing.resolved) {
      await supabase
        .from('mistakes')
        .update({ resolved: true, explanation: 'Błąd rozwiązany — poprawne rozwiązanie po powtórce.', last_seen_at: new Date().toISOString() })
        .eq('id', existing.id)
      mistakeResolved = true
    }
  }

  return { skillUpdates, mistakeResolved, persisted: true }
}

/** Klasyfikacja błędu: znak, obliczenia, pojęcie, nieuwaga. */
export function classifyAnswerMistake(userAnswer: string, correctAnswer: string): string {
  const user = normalizeAnswer(userAnswer)
  const correct = normalizeAnswer(correctAnswer)
  if (!user) return 'no_answer'

  const userNumber = asNumber(user)
  const correctNumber = asNumber(correct)
  if (userNumber !== null && correctNumber !== null) {
    if (Math.abs(userNumber + correctNumber) < 1e-9) return 'sign_error'
    if (correctNumber !== 0 && Math.abs(userNumber / correctNumber - 2) < 0.1) return 'calculation_error'
    if (correctNumber !== 0 && Math.abs(userNumber / correctNumber - 0.5) < 0.1) return 'calculation_error'
  }
  if (user.length > 8 && correct.length > 8 && user.slice(0, 4) === correct.slice(0, 4)) return 'incomplete_reasoning'
  if (/undefined|error|nie wiem|nieumiem/.test(user)) return 'concept_error'
  return 'careless_error'
}

export function mistakeTypeLabel(type?: string): string {
  const labels: Record<string, string> = {
    sign_error: 'Błąd znaku',
    calculation_error: 'Błąd rachunkowy',
    concept_error: 'Błąd pojęciowy',
    incomplete_reasoning: 'Niepełne uzasadnienie',
    careless_error: 'Nieuwaga',
    no_answer: 'Brak odpowiedzi',
  }
  return type ? labels[type] ?? 'Do przeanalizowania' : 'Do przeanalizowania'
}

/**
 * Główna ścieżka: sprawdzenie + zapis + pętla błędów.
 * Działa także bez skonfigurowanego Supabase (zwraca `persisted: false`), żeby demo
 * nie udawało, że coś zapisało.
 */
export async function submitPracticeAnswer(input: PracticeSubmitInput, supabase: AnyClient = defaultClient()): Promise<PracticeFeedback> {
  const materials = await loadQuestionMaterials(input.questionId, supabase)
  const fallback: PracticeFeedback = {
    questionId: input.questionId,
    isCorrect: false,
    needsSelfAssessment: false,
    correctAnswer: materials.correctAnswer,
    acceptedAnswers: materials.acceptedAnswers,
    solution: materials.solution,
    steps: materials.steps,
    rubric: materials.rubric,
    skillUpdates: [],
    mistakeResolved: false,
    persisted: false,
    feedback: 'Brak połączenia z bazą — odpowiedź nie została zapisana.',
  }
  if (!supabase) return { ...fallback, feedback: 'Supabase nie jest skonfigurowany — wynik nie został zapisany.' }

  const { data: questionRow } = await supabase
    .from('questions')
    .select('id,question_text,question_type,points,difficulty,level,correct_answer,solution_text,validation_metadata,skills,topic_id,subtopic_id,topics(name,slug)')
    .eq('id', input.questionId)
    .maybeSingle()

  if (!questionRow) return { ...fallback, feedback: 'Nie znaleziono zadania w banku.' }

  const question = mapQuestion(questionRow as Record<string, unknown>)
  const accepted = materials.acceptedAnswers
  const check = checkAnswer({ type: question.type, correctAnswer: materials.correctAnswer, acceptedAnswers: accepted }, input.answer)
  const isCorrect = input.selfAssessment ? input.selfAssessment === 'correct' : check.isCorrect

  const evidence: AnswerEvidence = {
    isCorrect,
    hintsUsed: input.hintsUsed ?? 0,
    solutionViewed: Boolean(input.solutionViewed || input.selfAssessment),
    timeSeconds: input.timeSeconds ?? 0,
  }

  const userId = await getCurrentUserId(supabase)
  const skills = await loadSkillCatalog(supabase)
  const skillsBySlug = new Map(skills.map((skill) => [skill.slug, skill]))
  const skillIds = question.skillSlugs
    .map((slug) => skillsBySlug.get(slug)?.id)
    .filter((value): value is string => Boolean(value))

  const persisted = input.dryRun
    ? { skillUpdates: [], mistakeResolved: false, persisted: false }
    : await persistAnswer(
        input,
        { userId, questionRow: questionRow as Record<string, unknown>, evidence, isCorrect, skillIds, skillsBySlug },
        supabase,
      )

  const feedbackText = input.dryRun
    ? isCorrect
      ? 'Wynik się zgadza — oceń swoją pracę, żeby zapisać postęp.'
      : 'Porównaj swoje rozwiązanie z wzorcem i matrycą, a potem oceń własną pracę.'
    : input.selfAssessment
      ? input.selfAssessment === 'correct'
        ? 'Zapisane jako poprawne (samoocena wg matrycy).'
        : 'Zapisane jako do poprawy — wróć do tego zadania w powtórkach.'
      : isCorrect
        ? 'Poprawnie. Postęp umiejętności i termin powtórki zostały zaktualizowane.'
        : check.needsSelfAssessment
          ? 'Porównaj swoje rozwiązanie z matrycą i oceń pracę.'
          : 'Odpowiedź zapisana do analizy błędów.'

  return {
    questionId: question.id,
    isCorrect,
    needsSelfAssessment: !input.selfAssessment && check.needsSelfAssessment,
    correctAnswer: materials.correctAnswer,
    acceptedAnswers: accepted,
    solution: materials.solution,
    steps: materials.steps,
    rubric: materials.rubric,
    skillUpdates: persisted.skillUpdates,
    mistakeResolved: persisted.mistakeResolved,
    persisted: persisted.persisted,
    feedback: feedbackText,
  }
}

/* ------------------------------------------------------------------ *
 * Przeglądy: bank zadań, błędy, statystyki
 * ------------------------------------------------------------------ */

export interface BankFilters {
  level?: 'basic' | 'extended'
  topicId?: string
  skillSlug?: string
  difficulty?: number
  search?: string
  limit?: number
}

export interface PracticeBank {
  questions: PracticeQuestion[]
  topics: Array<{ id: string; name: string; slug: string; count: number }>
  total: number
}

/** Bank zadań widoczny w aplikacji — wyłącznie realne rekordy z bazy. */
export async function loadPracticeBank(filters: BankFilters = {}, supabase: AnyClient = defaultClient()): Promise<PracticeBank> {
  const empty: PracticeBank = { questions: [], topics: [], total: 0 }
  if (!supabase) return empty

  let request = supabase.from('questions').select(QUESTION_SELECT).eq('published', true).order('created_at', { ascending: false }).limit(filters.limit ?? 600)
  if (filters.level) request = request.eq('level', filters.level)
  if (filters.topicId) request = request.eq('topic_id', filters.topicId)
  if (filters.skillSlug) request = request.contains('skills', [filters.skillSlug])
  if (filters.difficulty) request = request.eq('difficulty', filters.difficulty)

  const { data } = await request
  let questions = ((data ?? []) as Array<Record<string, unknown>>).map(mapQuestion)

  const search = filters.search?.trim().toLowerCase()
  if (search) {
    questions = questions.filter((question) => `${question.title} ${question.prompt} ${question.topicName ?? ''} ${question.tags.join(' ')}`.toLowerCase().includes(search))
  }

  const topicCounter = new Map<string, { id: string; name: string; slug: string; count: number }>()
  for (const question of questions) {
    if (!question.topicId) continue
    const current = topicCounter.get(question.topicId) ?? { id: question.topicId, name: question.topicName ?? 'Dział', slug: question.topicSlug ?? '', count: 0 }
    current.count += 1
    topicCounter.set(question.topicId, current)
  }

  return {
    questions,
    topics: [...topicCounter.values()].sort((a, b) => b.count - a.count),
    total: questions.length,
  }
}

export interface MistakeWithQuestion {
  id: string
  questionId: string
  question: PracticeQuestion | null
  userAnswer: string
  correctAnswer: string
  attemptCount: number
  mistakeType?: string
  lastSeenAt: string
  topicName?: string
}

export async function loadMistakesWithQuestions(userId: string, supabase: AnyClient = defaultClient()): Promise<MistakeWithQuestion[]> {
  if (!supabase || !userId) return []

  const { data } = await supabase
    .from('mistakes')
    .select('id,question_id,user_answer,correct_answer,attempt_count,mistake_type,last_seen_at,topic_id,topics(name)')
    .eq('user_id', userId)
    .eq('resolved', false)
    .order('last_seen_at', { ascending: false })
    .limit(60)

  const rows = (data ?? []) as Array<Record<string, unknown>>
  if (!rows.length) return []

  const ids = rows.map((row) => String(row.question_id))
  const { data: questionRows } = await supabase.from('questions').select(QUESTION_SELECT).in('id', ids)
  const questions = new Map(((questionRows ?? []) as Array<Record<string, unknown>>).map((row) => [String(row.id), mapQuestion(row)]))

  return rows.map((row) => {
    const topic = (row.topics ?? null) as { name?: unknown } | null
    return {
      id: String(row.id),
      questionId: String(row.question_id),
      question: questions.get(String(row.question_id)) ?? null,
      userAnswer: String(row.user_answer ?? ''),
      correctAnswer: String(row.correct_answer ?? ''),
      attemptCount: Number(row.attempt_count ?? 1),
      mistakeType: row.mistake_type ? String(row.mistake_type) : undefined,
      lastSeenAt: String(row.last_seen_at),
      topicName: topic?.name ? String(topic.name) : undefined,
    }
  })
}

/** Zbiorczy obraz postępu — zasila dashboard, statystyki i nagłówek powtórek. */
export async function loadPracticeOverview(userId: string, supabase: AnyClient = defaultClient()): Promise<PracticeOverview> {
  const empty: PracticeOverview = { totalSkills: 0, practisedSkills: 0, mastery: 0, dueToday: 0, weakSkills: 0, unlockedQuestions: 0, unanswered: 0 }
  if (!supabase || !userId) return empty

  const [skills, states, questionsCount, answersCount, unreadMistakes] = await Promise.all([
    loadSkillCatalog(supabase),
    loadSkillStates(userId, supabase),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('user_answers').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mistakes').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('resolved', false),
  ])

  const now = new Date()
  const practised = [...states.values()].filter((state) => state.attempts > 0)
  const mastery = practised.length ? Math.round(practised.reduce((sum, state) => sum + state.mastery, 0) / practised.length) : 0

  return {
    totalSkills: skills.length,
    practisedSkills: practised.length,
    mastery,
    dueToday: practised.filter((state) => isDue(state, now)).length,
    weakSkills: practised.filter((state) => state.mastery < WEAK_MASTERY).length,
    unlockedQuestions: Number(questionsCount.count ?? 0),
    unanswered: Math.max(0, Number(questionsCount.count ?? 0) - Number(answersCount.count ?? 0)),
  }
}

export { sessionScore }
export type { SkillReviewState, SupabaseClient }
