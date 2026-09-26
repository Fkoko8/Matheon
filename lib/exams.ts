'use client'

/**
 * MATHEON — warstwa egzaminów (Faza 3).
 *
 * Zasady:
 * - odpowiedź sprawdzamy **naszym** modulem oceniania (`checkAnswer`), nie porównaniem tekstu:
 *   liczby z tolerancją, warianty zapisu z authoringu, a zadania otwarte czekają na samoocenę,
 * - każda odpowiedź ma własną punktację (`points_earned`, `graded_by`, `is_correct`) — dopiero
 *   suma tych punktów tworzy wynik próby (RPC `finish_exam_attempt` / `regrade_exam_attempt`),
 * - raport pokazuje punkt po punkcie, wpływ na umiejętności i prognozę wyniku.
 */
import { createClient } from '@/lib/supabase/client'
import { checkAnswer, type PracticeQuestionType } from '@/lib/learning/practice'
import { loadSkillCatalog, loadSkillStates } from '@/lib/learning/skill-state'

export type Exam = {
  id: string
  title: string
  year: number
  level: 'basic' | 'extended'
  durationMinutes: number
  totalPoints: number
  description: string | null
  source: string | null
  questionCount: number
  attempts: ExamAttempt[]
  inProgress?: ExamAttempt
}

export interface ExamRubricItem {
  criterion: string
  points: number
}

export type ExamQuestion = {
  id: string
  questionId: string
  number: number
  points: number
  questionText: string
  /** Rysunek do zadania (specyfikacja z `validation_metadata.figure`). */
  figure?: unknown
  questionType: string
  topicId: string
  topicName?: string
  correctAnswer: string
  acceptedAnswers: string[]
  rubric: ExamRubricItem[]
  steps: string[]
  skillSlugs: string[]
}

export type ExamAttempt = {
  id: string
  examId: string
  startedAt: string
  finishedAt: string | null
  timeRemainingSeconds: number
  status: string
  totalPoints: number
  earnedPoints: number
  percentage: number
}

export type ExamAnswer = {
  questionId: string
  answer: string
  flagged: boolean
  savedAt: string
  pointsEarned: number
  gradedBy: 'auto' | 'self' | 'manual'
  isCorrect: boolean
}

export interface ExamReportRow {
  question: ExamQuestion
  answer: string
  pointsEarned: number
  gradedBy: ExamAnswer['gradedBy']
  isCorrect: boolean
  /** Zadanie otwarte, jeszcze nieocenione przez ucznia. */
  awaitingSelfAssessment: boolean
}

export interface ExamSkillImpact {
  slug: string
  name: string
  earned: number
  possible: number
  mastery: number
}

export interface ExamReport {
  attempt: ExamAttempt
  examTitle: string
  rows: ExamReportRow[]
  topics: Array<{ name: string; earned: number; possible: number; percentage: number }>
  skills: ExamSkillImpact[]
  correct: number
  partial: number
  incorrect: number
  unanswered: number
  /** Prognoza procentowa: blend wyniku próby i mastery umiejętności z arkusza. */
  forecast: { percentage: number; fromAttempt: number; fromMastery: number | null; range: [number, number] }
  pendingSelfAssessment: number
}

const QUESTION_FIELDS = 'id,question_text,question_type,topic_id,correct_answer,validation_metadata,skills,topics(name)'

async function currentUserId(): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

function mapAttempt(row: Record<string, unknown>): ExamAttempt {
  return {
    id: String(row.id),
    examId: String(row.exam_id),
    startedAt: String(row.started_at),
    finishedAt: row.finished_at ? String(row.finished_at) : null,
    timeRemainingSeconds: Number(row.time_remaining_seconds),
    status: String(row.status),
    totalPoints: Number(row.total_points),
    earnedPoints: Number(row.earned_points),
    percentage: Number(row.percentage),
  }
}

function mapQuestion(row: Record<string, unknown>): ExamQuestion {
  const metadata = (row.validation_metadata ?? {}) as Record<string, unknown>
  const topic = (row.topics ?? null) as { name?: unknown } | null
  return {
    id: String(row.id),
    questionId: String(row.question_id),
    number: Number(row.question_number),
    points: Number(row.points),
    questionText: String((row.questions as Record<string, unknown> | undefined)?.question_text ?? ''),
    figure: metadata.figure ?? undefined,
    questionType: String((row.questions as Record<string, unknown> | undefined)?.question_type ?? 'open'),
    topicId: String((row.questions as Record<string, unknown> | undefined)?.topic_id ?? ''),
    topicName: topic?.name ? String(topic.name) : undefined,
    correctAnswer: String((row.questions as Record<string, unknown> | undefined)?.correct_answer ?? ''),
    acceptedAnswers: Array.isArray(metadata.acceptedAnswers) ? (metadata.acceptedAnswers as unknown[]).map(String) : [],
    rubric: Array.isArray(metadata.rubric)
      ? (metadata.rubric as Array<Record<string, unknown>>).map((item) => ({ criterion: String(item.criterion ?? ''), points: Number(item.points ?? 0) }))
      : [],
    steps: Array.isArray(metadata.steps) ? (metadata.steps as unknown[]).map(String) : [],
    skillSlugs: Array.isArray((row.questions as Record<string, unknown> | undefined)?.skills)
      ? (((row.questions as Record<string, unknown>).skills as unknown[]).map(String))
      : [],
  }
}

/** Czy baza ma już migrację 009 (punktacja cząstkowa). */
export async function examGradingSchemaReady(): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false
  const { error } = await supabase.from('exam_answers').select('points_earned').limit(1)
  return !error
}

export async function listExams(filters?: { query?: string; level?: string; year?: string; status?: string }): Promise<Exam[]> {
  const supabase = createClient()
  const uid = await currentUserId()
  if (!supabase) return []

  let query = supabase
    .from('exams')
    .select('id,title,year,level,duration_minutes,total_points,description,source,exam_questions(id)')
    .eq('published', true)
    .order('year', { ascending: false })
  if (filters?.level && filters.level !== 'all') query = query.eq('level', filters.level)
  if (filters?.year && filters.year !== 'all') query = query.eq('year', Number(filters.year))

  const { data, error } = await query
  if (error) throw error

  const ids = (data ?? []).map((row) => String(row.id))
  const attempts = ids.length && uid
    ? (await supabase.from('exam_attempts').select('*').eq('user_id', uid).in('exam_id', ids).order('created_at', { ascending: false })).data ?? []
    : []

  return (data ?? [])
    .map((row) => {
      const rows = attempts.filter((attempt) => String(attempt.exam_id) === String(row.id))
      const inProgress = rows.find((attempt) => attempt.status === 'in_progress')
      return {
        id: String(row.id),
        title: String(row.title),
        year: Number(row.year),
        level: row.level as Exam['level'],
        durationMinutes: Number(row.duration_minutes),
        totalPoints: Number(row.total_points),
        description: row.description ? String(row.description) : null,
        source: row.source ? String(row.source) : null,
        questionCount: Array.isArray(row.exam_questions) ? row.exam_questions.length : 0,
        attempts: rows.map(mapAttempt),
        inProgress: inProgress ? mapAttempt(inProgress) : undefined,
      }
    })
    .filter((exam) => !filters?.query || `${exam.title} ${exam.year} ${exam.source ?? ''}`.toLowerCase().includes(filters.query.toLowerCase()))
    .filter((exam) => !filters?.status || filters.status === 'all'
      || (filters.status === 'in_progress' ? Boolean(exam.inProgress) : filters.status === 'completed' ? exam.attempts.some((attempt) => attempt.status === 'completed') : !exam.attempts.length))
}

export async function getExam(examId: string): Promise<Exam | null> {
  const all = await listExams()
  return all.find((exam) => exam.id === examId) ?? null
}

export async function getExamQuestions(examId: string): Promise<ExamQuestion[]> {
  const supabase = createClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('exam_questions')
    .select(`id,question_id,question_number,points,questions(${QUESTION_FIELDS})`)
    .eq('exam_id', examId)
    .order('order_index')
  if (error) throw error
  return (data ?? []).map((row) => mapQuestion(row as unknown as Record<string, unknown>))
}

export async function startExam(examId: string): Promise<ExamAttempt> {
  const supabase = createClient()
  const uid = await currentUserId()
  if (!supabase || !uid) throw new Error('Zaloguj się, aby rozpocząć egzamin.')
  const exam = await getExam(examId)
  if (!exam) throw new Error('Nie znaleziono egzaminu.')
  const { data, error } = await supabase
    .from('exam_attempts')
    .insert({ user_id: uid, exam_id: examId, time_remaining_seconds: exam.durationMinutes * 60, total_points: exam.totalPoints, status: 'in_progress' })
    .select('*')
    .single()
  if (error) throw error
  return mapAttempt(data)
}

export async function getAttempt(attemptId: string): Promise<ExamAttempt | null> {
  const supabase = createClient()
  if (!supabase) return null
  const { data, error } = await supabase.from('exam_attempts').select('*').eq('id', attemptId).single()
  if (error) throw error
  return mapAttempt(data)
}

export async function getExamAnswers(attemptId: string): Promise<ExamAnswer[]> {
  const supabase = createClient()
  if (!supabase) return []

  const map = (row: Record<string, unknown>): ExamAnswer => ({
    questionId: String(row.question_id),
    answer: String(row.answer ?? ''),
    flagged: Boolean(row.flagged),
    savedAt: String(row.saved_at),
    pointsEarned: Number(row.points_earned ?? 0),
    gradedBy: (row.graded_by ?? 'auto') as ExamAnswer['gradedBy'],
    isCorrect: Boolean(row.is_correct),
  })

  const { data, error } = await supabase
    .from('exam_answers')
    .select('question_id,answer,flagged,saved_at,points_earned,graded_by,is_correct')
    .eq('attempt_id', attemptId)
  if (!error) return (data ?? []).map(map)

  // Bez migracji 009 próba działa dalej: punkty pochodzą z RPC oceniającego odpowiedzi,
  // a samoocena zadań otwartych jest niedostępna (raport to sygnalizuje).
  const legacy = await supabase.from('exam_answers').select('question_id,answer,flagged,saved_at').eq('attempt_id', attemptId)
  if (legacy.error) throw legacy.error
  return (legacy.data ?? []).map(map)
}

export async function saveExamAnswer(attemptId: string, questionId: string, answer: string, flagged: boolean): Promise<void> {
  const supabase = createClient()
  if (!supabase) throw new Error('Brak połączenia.')
  const { error } = await supabase
    .from('exam_answers')
    .upsert({ attempt_id: attemptId, question_id: questionId, answer, flagged, saved_at: new Date().toISOString() }, { onConflict: 'attempt_id,question_id' })
  if (error) throw error
}

export async function saveExamTime(attemptId: string, seconds: number): Promise<void> {
  const supabase = createClient()
  if (!supabase) return
  const { error } = await supabase
    .from('exam_attempts')
    .update({ time_remaining_seconds: Math.max(0, seconds), updated_at: new Date().toISOString() })
    .eq('id', attemptId)
    .eq('status', 'in_progress')
  if (error) throw error
}

/**
 * Punktacja jednej odpowiedzi zapisana w bazie.
 * RPC i tak przelicza punktację po swojemu, ale warianty zapisu z authoringu
 * (`acceptedAnswers`) są znane tylko aplikacji — dlatego zapisujemy je jawnie.
 */
async function persistPoints(attemptId: string, questionId: string, points: number, gradedBy: ExamAnswer['gradedBy'], isCorrect: boolean): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false
  const { error } = await supabase
    .from('exam_answers')
    .update({ points_earned: points, graded_by: gradedBy, is_correct: isCorrect })
    .eq('attempt_id', attemptId)
    .eq('question_id', questionId)
  return !error
}

/** Automatyczna punktacja zamkniętych odpowiedzi przed wysłaniem arkusza. */
export async function autoGradeAttempt(attemptId: string, questions: ExamQuestion[]): Promise<number> {
  const supabase = createClient()
  if (!supabase) return 0
  const answers = await getExamAnswers(attemptId)
  let graded = 0

  for (const question of questions) {
    const saved = answers.find((answer) => answer.questionId === question.questionId)
    if (!saved || !saved.answer.trim()) continue

    const openEnded = question.questionType === 'open' || question.questionType === 'proof' || question.questionType === 'text'
    const result = checkAnswer({ type: question.questionType as PracticeQuestionType, correctAnswer: question.correctAnswer, acceptedAnswers: question.acceptedAnswers }, saved.answer)
    if (!result.isCorrect && openEnded) continue

    const points = result.isCorrect ? question.points : 0
    if (await persistPoints(attemptId, question.questionId, points, 'auto', result.isCorrect)) graded += 1
  }
  return graded
}

/** Samoocena zadania otwartego wg matrycy (po egzaminie). */
export async function gradeOpenAnswer(attemptId: string, question: ExamQuestion, points: number, isCorrect: boolean): Promise<ExamAttempt | null> {
  const clamped = Math.max(0, Math.min(question.points, points))
  const stored = await persistPoints(attemptId, question.questionId, clamped, 'self', isCorrect)
  if (!stored) return null
  return recomputeAttempt(attemptId)
}

/** Przeliczenie sumy próby (RPC `regrade_exam_attempt`, z awaryjnym przeliczeniem po stronie klienta). */
export async function recomputeAttempt(attemptId: string): Promise<ExamAttempt | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('regrade_exam_attempt', { p_attempt_id: attemptId })
  if (!error && data) return mapAttempt(data as Record<string, unknown>)

  // Fallback: brak funkcji (migracja 009 nieuruchomiona) — liczymy sumę tutaj.
  const attempt = await getAttempt(attemptId)
  if (!attempt) return null
  const [questions, answers] = await Promise.all([getExamQuestions(attempt.examId), getExamAnswers(attemptId)])
  const total = questions.reduce((sum, question) => sum + question.points, 0)
  const earned = questions.reduce((sum, question) => {
    const answer = answers.find((item) => item.questionId === question.questionId)
    return sum + Math.min(question.points, Math.max(0, answer?.pointsEarned ?? 0))
  }, 0)
  const { data: updated } = await supabase
    .from('exam_attempts')
    .update({ total_points: total, earned_points: Math.round(earned), percentage: total ? Math.round((earned / total) * 10000) / 100 : 0, updated_at: new Date().toISOString() })
    .eq('id', attemptId)
    .select('*')
    .single()
  return updated ? mapAttempt(updated) : attempt
}

export async function finishExam(attemptId: string): Promise<ExamAttempt> {
  const supabase = createClient()
  if (!supabase) throw new Error('Brak połączenia.')

  const attempt = await getAttempt(attemptId)
  const questions = attempt ? await getExamQuestions(attempt.examId) : []
  if (questions.length) await autoGradeAttempt(attemptId, questions)

  const { data, error } = await supabase.rpc('finish_exam_attempt', { p_attempt_id: attemptId })
  if (error) throw error
  if (!data) throw new Error('Ta próba została już zakończona.')

  // Suma pochodzi z RPC: pełne punkty za zgodność (także liczbową i po normalizacji),
  // a dla wariantów zapisu i zadań otwartych — z punktacji zapisanej przez aplikację.
  // Zadania otwarte domyka dopiero samoocena w raporcie (`gradeOpenAnswer`).
  return mapAttempt(data as Record<string, unknown>)
}

export async function abandonExam(attemptId: string): Promise<void> {
  const supabase = createClient()
  if (!supabase) return
  const { error } = await supabase.from('exam_attempts').update({ status: 'abandoned', updated_at: new Date().toISOString() }).eq('id', attemptId).eq('status', 'in_progress')
  if (error) throw error
}

export async function retryExam(examId: string): Promise<ExamAttempt> {
  return startExam(examId)
}

export async function getExamHistory(examId: string): Promise<ExamAttempt[]> {
  const supabase = createClient()
  const uid = await currentUserId()
  if (!supabase || !uid) return []
  const { data, error } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('exam_id', examId)
    .eq('user_id', uid)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapAttempt)
}

/**
 * Pełny raport z próby: punkt po punkcie, wpływ na umiejętności,
 * prognoza wyniku i lista zadań czekających na samoocenę.
 */
export async function loadExamReport(attemptId: string): Promise<ExamReport | null> {
  const supabase = createClient()
  if (!supabase) return null

  const attempt = await getAttempt(attemptId)
  if (!attempt) return null

  const [exam, questions, answers] = await Promise.all([
    getExam(attempt.examId),
    getExamQuestions(attempt.examId),
    getExamAnswers(attemptId),
  ])

  const byQuestion = new Map(answers.map((answer) => [answer.questionId, answer]))
  const rows: ExamReportRow[] = questions.map((question) => {
    const saved = byQuestion.get(question.questionId)
    const openEnded = question.questionType === 'open' || question.questionType === 'proof'
    return {
      question,
      answer: saved?.answer ?? '',
      pointsEarned: Math.min(question.points, Math.max(0, saved?.pointsEarned ?? 0)),
      gradedBy: saved?.gradedBy ?? 'auto',
      isCorrect: Boolean(saved?.isCorrect),
      awaitingSelfAssessment: openEnded && Boolean(saved?.answer.trim()) && (saved?.pointsEarned ?? 0) === 0 && saved?.gradedBy !== 'self',
    }
  })

  const possible = rows.reduce((sum, row) => sum + row.question.points, 0)
  const earned = rows.reduce((sum, row) => sum + row.pointsEarned, 0)

  const topicMap = new Map<string, { earned: number; possible: number }>()
  for (const row of rows) {
    const name = row.question.topicName ?? 'Inne'
    const current = topicMap.get(name) ?? { earned: 0, possible: 0 }
    current.earned += row.pointsEarned
    current.possible += row.question.points
    topicMap.set(name, current)
  }

  const skillCatalog = await loadSkillCatalog(supabase)
  const uid = await currentUserId()
  const skillStates = uid ? await loadSkillStates(uid, supabase) : new Map()
  const skillMap = new Map<string, ExamSkillImpact>()
  for (const row of rows) {
    for (const slug of row.question.skillSlugs) {
      const skill = skillCatalog.find((item) => item.slug === slug)
      const current = skillMap.get(slug) ?? {
        slug,
        name: skill?.name ?? slug,
        earned: 0,
        possible: 0,
        mastery: skill ? skillStates.get(skill.id)?.mastery ?? 0 : 0,
      }
      current.earned += row.pointsEarned
      current.possible += row.question.points
      skillMap.set(slug, current)
    }
  }

  const fromAttempt = possible ? Math.round((earned / possible) * 100) : 0
  const practised = [...skillMap.values()].filter((skill) => skill.mastery > 0)
  const fromMastery = practised.length ? Math.round(practised.reduce((sum, skill) => sum + skill.mastery, 0) / practised.length) : null
  const forecastPercentage = fromMastery === null ? fromAttempt : Math.round(0.6 * fromAttempt + 0.4 * fromMastery)

  return {
    attempt: possible
      ? { ...attempt, totalPoints: possible, earnedPoints: Math.round(earned), percentage: Math.round((earned / possible) * 10000) / 100 }
      : attempt,
    examTitle: exam?.title ?? 'Arkusz',
    rows,
    topics: [...topicMap.entries()].map(([name, value]) => ({ name, ...value, percentage: value.possible ? Math.round((value.earned / value.possible) * 100) : 0 })).sort((a, b) => a.percentage - b.percentage),
    skills: [...skillMap.values()].sort((a, b) => (a.possible ? a.earned / a.possible : 0) - (b.possible ? b.earned / b.possible : 0)),
    correct: rows.filter((row) => row.pointsEarned >= row.question.points).length,
    partial: rows.filter((row) => row.pointsEarned > 0 && row.pointsEarned < row.question.points).length,
    incorrect: rows.filter((row) => row.pointsEarned === 0 && row.answer.trim()).length,
    unanswered: rows.filter((row) => !row.answer.trim()).length,
    forecast: {
      percentage: forecastPercentage,
      fromAttempt,
      fromMastery,
      range: [Math.max(0, forecastPercentage - 8), Math.min(100, forecastPercentage + 8)],
    },
    pendingSelfAssessment: rows.filter((row) => row.awaitingSelfAssessment).length,
  }
}

/** Statystyki próby w formie używanej na skróconych ekranach. */
export async function getExamResultStats(attemptId: string): Promise<{ correct: number; incorrect: number; unanswered: number; topics: { name: string; percentage: number }[] }> {
  const report = await loadExamReport(attemptId)
  if (!report) return { correct: 0, incorrect: 0, unanswered: 0, topics: [] }
  return {
    correct: report.correct,
    incorrect: report.incorrect,
    unanswered: report.unanswered,
    topics: report.topics.map((topic) => ({ name: topic.name, percentage: topic.percentage })),
  }
}
