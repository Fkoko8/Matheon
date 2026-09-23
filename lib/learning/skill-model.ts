/**
 * MATHEON — model opanowania umiejętności.
 *
 * Warstwa czysta (bez bazy i bez Reacta): kolejność powtórek wg SM-2 oraz mastery
 * liczone wyłącznie z dowodów — czyli z realnych odpowiedzi, nie z otwarcia lekcji.
 *
 * Reguły:
 * - `gradeAnswer` zamienia wynik odpowiedzi (poprawność, podpowiedzi, rozwiązanie, czas)
 *   na ocenę jakości 0–5 w skali SM-2.
 * - `applyReview` aktualizuje stan umiejętności: łatwość (ease), interwał, liczbę powtórek,
 *   liczbę wpadek i mastery (wykładnicza średnia ważona).
 * - Powtórka po interwale SM-2 wygasa stopniowo, więc `mastery` odzwierciedla też świeżość.
 */

export type MasteryLevel = 'not_learned' | 'beginner' | 'developing' | 'strong' | 'mastered'

export interface SkillReviewState {
  skillId: string
  /** 0–100, liczone tylko z dowodów (odpowiedzi ucznia). */
  mastery: number
  /** Współczynnik łatwości SM-2, 1.3–2.8. */
  ease: number
  /** Długość ostatniego interwału w dniach. */
  intervalDays: number
  /** Liczba udanych powtórek z rzędu (reset przy wpadce). */
  repetitions: number
  /** Liczba wpadek (odpowiedź poniżej progu 3). */
  lapses: number
  attempts: number
  correct: number
  /** Termin następnej powtórki (ISO). */
  dueAt: string
  lastPracticedAt?: string
}

export interface AnswerEvidence {
  isCorrect: boolean
  hintsUsed?: number
  solutionViewed?: boolean
  timeSeconds?: number
}

export const MIN_EASE = 1.3
export const MAX_EASE = 2.8
/** Mastery poniżej tego progu oznacza umiejętność wymagającą pracy. */
export const WEAK_MASTERY = 60

/** Waga nowego dowodu w średniej wykładniczej — im wyżej, tym szybciej model reaguje. */
const MASTERY_ALPHA = 0.35

export function emptySkillState(skillId: string, now: Date = new Date()): SkillReviewState {
  return {
    skillId,
    mastery: 0,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    attempts: 0,
    correct: 0,
    dueAt: now.toISOString(),
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Ocena jakości odpowiedzi w skali SM-2 (0 = brak pomysłu, 5 = bezbłędnie i pewnie). */
export function gradeAnswer(evidence: AnswerEvidence): number {
  const hintsUsed = evidence.hintsUsed ?? 0
  const solutionViewed = Boolean(evidence.solutionViewed)
  const timeSeconds = evidence.timeSeconds ?? 0

  if (!evidence.isCorrect) return solutionViewed ? 0 : 1
  if (solutionViewed) return 2
  if (hintsUsed > 2) return 3
  if (hintsUsed > 0) return 3
  if (timeSeconds > 0 && timeSeconds > 240) return 4
  return 5
}

/**
 * Ile „dowodu” wnosi odpowiedź do mastery.
 * Wartości dodatnie (0–1) budują mastery, wartości ujemne je obniżają — błędna odpowiedź
 * nigdy nie podnosi poziomu opanowania, a rozwiązanie podejrzane o zgadywanie obniża mocniej.
 */
export function evidenceWeight(evidence: AnswerEvidence): number {
  const hintsUsed = evidence.hintsUsed ?? 0
  const solutionViewed = Boolean(evidence.solutionViewed)

  if (!evidence.isCorrect) return solutionViewed ? -0.15 : -0.05
  if (solutionViewed) return 0.5
  if (hintsUsed > 2) return 0.5
  if (hintsUsed > 0) return 0.75
  return 1
}

/**
 * Nowy stan umiejętności po odpowiedzi — pełny SM-2 z aktualizacją łatwości.
 * `grade` można podać wprost (odtworzenie historii z `learning_events`).
 */
export function applyReview(state: SkillReviewState, grade: number, at: Date = new Date()): SkillReviewState {
  const quality = clamp(Math.round(grade), 0, 5)
  const passed = quality >= 3

  let repetitions = state.repetitions
  let intervalDays = state.intervalDays
  let lapses = state.lapses

  if (passed) {
    if (state.repetitions === 0) intervalDays = 1
    else if (state.repetitions === 1) intervalDays = 6
    else intervalDays = Math.round(Math.max(1, state.intervalDays) * state.ease)
    repetitions = state.repetitions + 1
  } else {
    repetitions = 0
    intervalDays = 1
    lapses += 1
  }

  const ease = clamp(state.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)), MIN_EASE, MAX_EASE)

  const dueAt = new Date(at.getTime() + intervalDays * 24 * 60 * 60 * 1000)

  return {
    ...state,
    ease,
    intervalDays,
    repetitions,
    lapses,
    dueAt: dueAt.toISOString(),
    lastPracticedAt: at.toISOString(),
  }
}

/** Aktualizuje mastery na podstawie dowodu (nie zmienia harmonogramu). */
export function applyEvidence(state: SkillReviewState, evidence: AnswerEvidence, at: Date = new Date()): SkillReviewState {
  const attempts = state.attempts + 1
  const correct = state.correct + (evidence.isCorrect ? 1 : 0)
  const target = evidenceWeight(evidence) * 100
  const mastery = clamp(Math.round(state.mastery + (target - state.mastery) * MASTERY_ALPHA), 0, 100)

  return { ...state, attempts, correct, mastery, lastPracticedAt: at.toISOString() }
}

/** Pełny krok: dowód (mastery) + jakość (harmonogram SM-2). */
export function applyAnswer(state: SkillReviewState, evidence: AnswerEvidence, at: Date = new Date()): SkillReviewState {
  return applyReview(applyEvidence(state, evidence, at), gradeAnswer(evidence), at)
}

/** Odtworzenie stanu z zapisanej historii (event sourcing na `learning_events`). */
export function replayState(
  skillId: string,
  history: Array<{ grade: number; evidence?: AnswerEvidence; at: string }>,
): SkillReviewState {
  let state = emptySkillState(skillId, history.length ? new Date(history[0].at) : new Date())
  for (const entry of history) {
    const at = new Date(entry.at)
    state = entry.evidence ? applyAnswer(state, entry.evidence, at) : applyReview(state, entry.grade, at)
  }
  return state
}

/**
 * Świeżość mastery: umiejętność niepowtarzana po terminie traci na wartości.
 * Zwraca mastery skorygowane o zaległość (używane na dashboardzie i w rekomendacjach).
 */
export function decayedMastery(state: SkillReviewState, now: Date = new Date()): number {
  if (state.attempts === 0) return 0
  const due = new Date(state.dueAt).getTime()
  if (due >= now.getTime()) return state.mastery

  const overdueDays = (now.getTime() - due) / (24 * 60 * 60 * 1000)
  const penalty = clamp(overdueDays * 1.5, 0, 30)
  return clamp(Math.round(state.mastery - penalty), 0, 100)
}

export function masteryLevel(value: number): MasteryLevel {
  if (value < 30) return 'not_learned'
  if (value < 50) return 'beginner'
  if (value < 70) return 'developing'
  if (value < 85) return 'strong'
  return 'mastered'
}

export function masteryLabel(level: MasteryLevel | number): string {
  const resolved = typeof level === 'number' ? masteryLevel(level) : level
  const labels: Record<MasteryLevel, string> = {
    not_learned: 'Nie nauczony',
    beginner: 'Początkujący',
    developing: 'W rozwijaniu',
    strong: 'Silny',
    mastered: 'Opanowany',
  }
  return labels[resolved]
}

export function daysUntilDue(state: SkillReviewState, now: Date = new Date()): number {
  return Math.ceil((new Date(state.dueAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
}

export function isDue(state: SkillReviewState, now: Date = new Date()): boolean {
  return state.attempts > 0 && new Date(state.dueAt).getTime() <= now.getTime()
}

/** Postęp sesji jako jedna liczba 0–100 (używane w podsumowaniu treningu). */
export function sessionScore(results: Array<{ isCorrect: boolean; points: number; earned: number }>): number {
  const total = results.reduce((sum, item) => sum + item.points, 0)
  if (!total) return 0
  const earned = results.reduce((sum, item) => sum + item.earned, 0)
  return Math.round((earned / total) * 100)
}
