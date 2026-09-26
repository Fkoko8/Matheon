export type LearningLevel = 'basic' | 'extended'

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'formula'
  | 'example'
  | 'warning'
  | 'tip'
  | 'table'
  | 'diagram'
  | 'interactive_question'
  | 'quiz'
  | 'summary'

export interface ContentBlock {
  type: BlockType
  title?: string
  /** Treść bloku. Obsługuje LaTeX w `$...$` i `$$...$$` (renderowany przez KaTeX). */
  body: string
  /** Główne wzory lekcji — renderowane przez KaTeX w trybie display. */
  formula?: string
  /**
   * Opcjonalna figura: wykres funkcji, rysunek geometryczny albo oś liczbowa.
   * Specyfikacja w `lib/figures/spec.ts` (rodzaje `plot` / `geometry` / `numberline`);
   * importer przepisuje ją do `lesson_blocks.content.figure` bez zmian schematu.
   */
  figure?: unknown
}

export interface ContentSkill {
  slug: string
  name: string
  description: string
  level: LearningLevel
}

export interface ContentLesson {
  slug: string
  title: string
  durationMinutes: number
  difficulty: 1 | 2 | 3 | 4 | 5
  objectives: string[]
  skills: ContentSkill[]
  blocks: ContentBlock[]
  /** Kody wymagań CKE realizowanych w tej lekcji (np. ['I.1', 'I.2']). */
  requirements?: string[]
}

export interface ContentTopic {
  slug: string
  title: string
  description: string
  level: LearningLevel
  lessons: ContentLesson[]
}

export type TaskKind = 'numeric' | 'single_choice' | 'text' | 'open' | 'proof'

/**
 * Zadanie w formacie authoringowym. Importer (`scripts/import-content.ts`) mapuje je
 * na tabele `questions`, `hints`, `solutions` i `question_skills`.
 */
export interface ContentTask {
  /** Stabilny identyfikator używany do idempotentnego importu (np. 'rr-01'). */
  id: string
  /** Slug działu, do którego należy zadanie. */
  topicSlug: string
  /** Slug lekcji, z którą zadanie jest powiązane (opcjonalnie). */
  lessonSlug?: string
  type: TaskKind
  difficulty: 1 | 2 | 3 | 4 | 5
  /** Liczba punktów w skali maturalnej. */
  points: number
  level?: LearningLevel
  /** Treść zadania (LaTeX dozwolony). */
  prompt: string
  /** Opcje dla zadań zamkniętych. */
  options?: string[]
  /** Kanoniczna poprawna odpowiedź — używana przez silnik sprawdzający. */
  answer: string
  /** Warianty zapisu, które sprawdzanie tekstowe również uznaje za poprawne. */
  acceptedAnswers?: string[]
  /** Krótkie etykiety tematyczne (zapis: `potegi`, `zamkniete`). */
  tags: string[]
  /** Slugi umiejętności z lekcji tego działu. */
  skills: string[]
  /** Podpowiedzi w kolejności rosnącego ujawniania. */
  hints: string[]
  /** Pełne rozwiązanie krok po kroku. */
  solution: string
  /** Kolejne kroki rozwiązania, każdy w osobnej linii. */
  steps: string[]
  /** Kryteria oceniania zadań otwartych (matryca punktacji). */
  rubric?: { criterion: string; points: number }[]
  /**
   * Rysunek do treści zadania (wykres, figura geometryczna, oś liczbowa).
   * Specyfikacja w `lib/figures/spec.ts`; importer zapisuje w `validation_metadata.figure`.
   */
  figure?: unknown
  /** Źródło: 'authored' dla zadań autorskich, 'cke' dla zadań z arkuszy CKE. */
  sourceType?: 'authored' | 'cke'
  sourceName?: string
  sourceYear?: number
}

export interface CkeRequirement {
  /** Wewnętrzny kod MATHEON; dział opisany liczbą rzymską, np. 'I.3'. */
  code: string
  level: LearningLevel
  title: string
  description: string
  /** Slug działu w programie MATHEON. */
  topicSlug: string
  /** Slug umiejętności, jeśli wymaganie jest już pokryte treścią. */
  skillSlug?: string
  status: 'planned' | 'mapped' | 'lesson_ready' | 'assessed' | 'published'
}
