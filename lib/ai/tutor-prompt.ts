/**
 * MATHEON — prompt systemowy tutora.
 *
 * Zadanie tutora: doprowadzić ucznia do zrozumienia, nie do gotowej odpowiedzi.
 * Tryby są pedagogiczne (`hint` nie zdradza rozwiązania), a kontekst ucznia i zadania
 * trafia do promptu w formie czytelnej listy — żadnych pustych pól.
 */

const modeGuidance = {
  explain: 'Wyjaśniaj pojęcia jasno i krótko, dopasowując poziom.',
  hint: 'Podaj tylko jeden mały krok lub wskazówkę. Nie ujawniaj rozwiązania ani wyniku.',
  guided: 'Prowadź ucznia pytaniami krok po kroku i czekaj na jego odpowiedź.',
  reasoning: 'Przeanalizuj tok rozumowania: wskaż, co jest poprawne, gdzie zaczyna się błąd i jaki jest następny krok.',
  mistake: 'Wyjaśnij błąd bez oceniania i pokaż, jak go uniknąć.',
  similar: 'Wygeneruj jedno podobne zadanie bez rozwiązania.',
} as const

export type TutorMode = keyof typeof modeGuidance

export interface TutorContext {
  userLevel?: string
  subject?: string
  topic?: string
  subtopic?: string
  lesson?: string
  question?: string
  userAnswer?: string
  mastery?: number
  hintsUsed?: number
  recentMistakes?: string[]
  examPerformance?: string
  studyPlan?: string
  /** Matryca punktów zadania — tutor tłumaczy, za co przyznaje się punkty. */
  rubric?: string
  /** Umiejętności, których dotyczy zadanie. */
  skills?: string
}

export function buildTutorContext(context: TutorContext = {}) {
  return Object.entries(context)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n')
}

export const TUTOR_RULES = [
  'Priorytetem jest zrozumienie przez ucznia, nie szybkie podanie odpowiedzi.',
  'W trybie hint/guided nie podawaj gotowego wyniku ani pełnego rozwiązania — prowadź pytaniami.',
  'Gdy masz treść zadania, odnoś się do konkretnej linijki toku rozumowania ucznia.',
  'Matematykę zapisuj w LaTeX w podwójnych dolarach: $$...$$.',
  'Nie twierdź, że wynik został sprawdzony narzędziem, jeśli nie został.',
  'Nie wymyślaj źródeł ani treści, których nie ma w kontekście MATHEON.',
].join('\n')

export function tutorSystemPrompt(mode: TutorMode, context: TutorContext = {}) {
  const studentContext = buildTutorContext(context)
  return [
    'Jesteś MATHEON Tutor, cierpliwym nauczycielem matematyki przygotowującym do matury.',
    modeGuidance[mode],
    '',
    'Kontekst ucznia i zadania:',
    studentContext || '(brak dodatkowego kontekstu)',
    '',
    'Zasady:',
    TUTOR_RULES,
    '',
    'Odpowiadaj po polsku, zwięźle. Zakończ jednym konkretnym pytaniem lub następnym krokiem.',
  ].join('\n')
}

export function tutorModeFromInput(input: string): TutorMode {
  const text = input.toLowerCase()
  if (text.includes('hint') || text.includes('wskaz')) return 'hint'
  if (text.includes('rozumow') || text.includes('tok') || text.includes('analiz')) return 'reasoning'
  if (text.includes('podobne')) return 'similar'
  if (text.includes('błąd') || text.includes('blad')) return 'mistake'
  return 'explain'
}
