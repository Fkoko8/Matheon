/**
 * MATHEON — kontekst zadania dla tutora (Faza 4).
 *
 * Tutor ma pomagać przy konkretnym zadaniu, a nie odpowiadać w próżni. Dlatego sesja
 * treningowa i raport z egzaminu przekazują mu treść, odpowiedź ucznia, matrycę punktów
 * i umiejętności — przez parametry adresu, żeby działało też po odświeżeniu strony.
 *
 * Zasada: tutor dostaje kontekst zadania, ale w trybie `hint`/`guided` nadal nie podaje
 * gotowego rozwiązania (pilnuje tego prompt systemowy).
 */
import type { TutorContext } from '@/lib/ai/tutor-prompt'

const LIMITS = {
  prompt: 200,
  question: 700,
  answer: 400,
  rubric: 400,
  source: 120,
  skills: 160,
} as const

export interface TutorTaskContext {
  /** Pytanie, z którym uczeń przychodzi do tutora. */
  prompt?: string
  /** Treść zadania. */
  question?: string
  /** Odpowiedź ucznia (żeby tutor mógł wskazać błąd w toku rozumowania). */
  answer?: string
  /** Matryca punktów / kryteria oceny. */
  rubric?: string
  /** Skąd zadanie pochodzi: lekcja, dział, arkusz. */
  source?: string
  /** Umiejętności, których zadanie dotyczy. */
  skills?: string
}

function clip(value: string | undefined, limit: number): string | undefined {
  const trimmed = value?.replace(/\s+/g, ' ').trim()
  if (!trimmed) return undefined
  return trimmed.length > limit ? `${trimmed.slice(0, limit - 1)}…` : trimmed
}

/** Adres tutora z kontekstem zadania — używany w sesji treningowej i raporcie egzaminu. */
export function buildTutorTaskHref(context: TutorTaskContext): string {
  const params = new URLSearchParams()
  const entries: Array<[keyof TutorTaskContext, number]> = [
    ['prompt', LIMITS.prompt],
    ['question', LIMITS.question],
    ['answer', LIMITS.answer],
    ['rubric', LIMITS.rubric],
    ['source', LIMITS.source],
    ['skills', LIMITS.skills],
  ]
  for (const [key, limit] of entries) {
    const value = clip(context[key], limit)
    if (value) params.set(key, value)
  }
  const query = params.toString()
  return query ? `/ai?${query}` : '/ai'
}

type SearchParams = Record<string, string | string[] | undefined>

/** Odczyt kontekstu zadania z parametrów adresu (strona `/ai`). */
export function readTutorTaskParams(params: SearchParams | undefined): TutorTaskContext {
  const read = (key: keyof TutorTaskContext, limit: number): string | undefined => {
    const raw = params?.[key]
    const value = Array.isArray(raw) ? raw[0] : raw
    return clip(value, limit)
  }
  return {
    prompt: read('prompt', LIMITS.prompt),
    question: read('question', LIMITS.question),
    answer: read('answer', LIMITS.answer),
    rubric: read('rubric', LIMITS.rubric),
    source: read('source', LIMITS.source),
    skills: read('skills', LIMITS.skills),
  }
}

/** Czy kontekst zawiera cokolwiek, co warto wysłać do tutora. */
export function hasTaskContext(context: TutorTaskContext): boolean {
  return Boolean(context.question || context.answer || context.rubric)
}

/** Kontekst zadania w formie zrozumiałej dla promptu systemowego. */
export function taskContextToPrompt(context: TutorTaskContext): TutorContext {
  return {
    question: context.question,
    userAnswer: context.answer,
    rubric: context.rubric,
    skills: context.skills,
    topic: context.source,
  }
}

/** Pierwsza wiadomość do tutora, gdy uczeń wchodzi z konkretnym zadaniem. */
export function defaultTaskPrompt(context: TutorTaskContext): string {
  if (context.question) return 'Przeanalizuj moje rozwiązanie tego zadania i wskaż, gdzie popełniłem błąd.'
  return 'Pomóż mi zrozumieć to zagadnienie krok po kroku.'
}
