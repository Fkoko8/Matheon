import { authoredTopicBySlug, tasksForLesson, tasksForTopic } from '@/content'

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

export interface CurriculumSkill {
  slug: string
  name: string
  description: string
  level: LearningLevel
  mastery: number
}

export interface CurriculumBlock {
  type: BlockType
  title?: string
  body: string
  formula?: string
  /** Rysunek do bloku (wykres/figura/oś) — specyfikacja w `lib/figures/spec.ts`. */
  figure?: unknown
}

export interface CurriculumLesson {
  slug: string
  title: string
  duration: number
  difficulty: 1 | 2 | 3 | 4 | 5
  objectives: string[]
  skills: CurriculumSkill[]
  blocks: CurriculumBlock[]
  /** Kody wymagań CKE realizowanych w lekcji (tylko dla treści autorskich). */
  requirements?: string[]
  /** Liczba zadań w banku przypiętych do tej lekcji (0 dla szablonu). */
  taskCount: number
}

export interface CurriculumTopic {
  slug: string
  title: string
  description: string
  level: LearningLevel
  mastery: number
  lessons: CurriculumLesson[]
  /** Działy z opracowaną treścią mają `authored: true`; pozostałe używają szablonu. */
  authored: boolean
  /** Liczba zadań w banku autorskim dla tego działu. */
  taskCount: number
  /** Łączny czas lekcji działu w minutach. */
  durationMinutes: number
}

/**
 * Szablon lekcji dla działów, których treść nie została jeszcze opracowana.
 * Zapewnia, że nawigacja i struktura kursu działa od pierwszego dnia.
 */
const templateLesson = (
  slug: string,
  title: string,
  skills: string[],
  level: LearningLevel,
  difficulty: 1 | 2 | 3 | 4 | 5 = 2,
): CurriculumLesson => ({
  slug,
  title,
  duration: 18,
  difficulty,
  objectives: [
    `Zrozumiesz pojęcie: ${title}`,
    'Rozwiążesz zadania od podstaw do poziomu maturalnego',
  ],
  taskCount: 0,
  skills: skills.map((name, index) => ({
    slug: `${slug}-${index}`,
    name,
    description: `Opanuj umiejętność: ${name}.`,
    level,
    mastery: 0,
  })),
  blocks: [
    {
      type: 'paragraph',
      title: 'Cel lekcji',
      body: `W tej lekcji krok po kroku poznasz temat „${title}”. Najpierw zbudujemy intuicję, potem przejdziemy do procedury i zadań maturalnych.`,
    },
    {
      type: 'formula',
      title: 'Najważniejsza reguła',
      body: 'Zapisz regułę własnymi słowami, zanim przejdziesz do ćwiczeń.',
      formula: 'f(x)=ax^2+bx+c',
    },
    {
      type: 'example',
      title: 'Przykład standardowy',
      body: 'Przeanalizuj dane, wybierz właściwą definicję, wykonaj obliczenia i sprawdź wynik w kontekście zadania.',
    },
    { type: 'warning', title: 'Uważaj', body: 'Nie pomijaj dziedziny i warunków stosowania wzoru.' },
    {
      type: 'interactive_question',
      title: 'Sprawdź się',
      body: 'Jaki jest pierwszy krok rozwiązania tego typu zadania?',
    },
    {
      type: 'summary',
      title: 'Podsumowanie',
      body: 'Znasz definicję, procedurę i typowe pułapki. Następny krok to trening mieszany.',
    },
  ],
})

const templateTopic = (level: LearningLevel, slug: string, title: string, skills: string[]): CurriculumTopic => ({
  slug,
  title,
  level,
  mastery: 0,
  authored: false,
  taskCount: 0,
  durationMinutes: 54,
  description: `Kompletny moduł ${title}: teoria, przykłady, praktyka, błędy i test opanowania.`,
  lessons: [
    templateLesson(`${slug}-fundamenty`, `${title} — fundamenty`, skills.slice(0, 3), level, 1),
    templateLesson(`${slug}-zadania`, `${title} — zadania standardowe`, skills, level, 3),
    templateLesson(`${slug}-matura`, `${title} — zadania maturalne`, skills, level, 4),
  ],
})

type TopicSeed = [slug: string, title: string, skills: string[]]

const basicTopics = (): CurriculumTopic[] =>
  ([
    ['realne', 'Liczby rzeczywiste', ['działania i kolejność', 'potęgi i pierwiastki', 'przedziały']],
    ['algebra', 'Wyrażenia algebraiczne', ['redukcja wyrazów', 'wzory skróconego mnożenia', 'procenty']],
    ['rownania', 'Równania i nierówności', ['równania liniowe', 'układy równań', 'nierówności']],
    ['funkcje', 'Funkcje', ['dziedzina i zbiór wartości', 'odczyt z wykresu', 'przesunięcia wykresu']],
    ['kwadratowa', 'Funkcja kwadratowa', ['delta i miejsca zerowe', 'wierzchołek', 'optymalizacja']],
    ['wielomiany', 'Wielomiany', ['dzielenie wielomianów', 'pierwiastki', 'twierdzenie Bezout']],
    ['wymierne', 'Funkcje wymierne', ['dziedzina', 'asymptoty', 'równania wymierne']],
    ['ciagi', 'Ciągi', ['arytmetyczny', 'geometryczny', 'suma wyrazów']],
    ['trygonometria', 'Trygonometria', ['sinus i cosinus', 'tożsamości', 'równania trygonometryczne']],
    ['planimetria', 'Planimetria', ['trójkąty', 'okręgi', 'pola figur']],
    ['geometria', 'Geometria analityczna', ['prosta', 'odległość', 'okrąg']],
    ['kombinatoryka', 'Kombinatoryka', ['reguła mnożenia', 'permutacje', 'kombinacje']],
    ['prawdopodobienstwo', 'Prawdopodobieństwo', ['zdarzenia', 'drzewa', 'prawdopodobieństwo warunkowe']],
    ['statystyka', 'Statystyka', ['średnia i mediana', 'odchylenie', 'interpretacja danych']],
    ['stereometria', 'Geometria przestrzenna', ['graniastosłupy', 'ostrosłupy', 'bryły obrotowe']],
    ['zastosowania', 'Zastosowania matematyki', ['modelowanie', 'procent składany', 'zadania tekstowe']],
  ] satisfies TopicSeed[]).map(([slug, title, skills]) => templateTopic('basic', slug, title, skills))

const extendedTopics = (): CurriculumTopic[] =>
  ([
    ['granice', 'Granice i ciągłość', ['granice ciągów', 'granice funkcji', 'ciągłość']],
    ['pochodne', 'Pochodne', ['definicja pochodnej', 'reguły różniczkowania', 'interpretacja geometryczna']],
    ['optymalizacja', 'Optymalizacja', ['monotoniczność', 'ekstrema', 'zadania optymalizacyjne']],
    ['parametry', 'Równania z parametrem', ['liczba rozwiązań', 'parametr w funkcji', 'warunki brzegowe']],
    ['dowody', 'Dowodzenie', ['indukcja', 'nierówności', 'dowody geometryczne']],
  ] satisfies TopicSeed[]).map(([slug, title, skills]) => templateTopic('extended', slug, title, skills))

/**
 * Podmienia treść szablonową na opracowaną, jeśli dział ma autorski materiał.
 * Postęp ucznia (`mastery`) jest doliczany warstwę wyżej, z bazy danych.
 */
function applyAuthoredContent(topic: CurriculumTopic): CurriculumTopic {
  const authored = authoredTopicBySlug.get(topic.slug)
  if (!authored) return topic

  return {
    ...topic,
    title: authored.title,
    description: authored.description,
    level: authored.level,
    authored: true,
    taskCount: tasksForTopic(topic.slug).length,
    durationMinutes: authored.lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    lessons: authored.lessons.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      duration: lesson.durationMinutes,
      difficulty: lesson.difficulty,
      objectives: lesson.objectives,
      requirements: lesson.requirements,
      taskCount: tasksForLesson(lesson.slug).length,
      skills: lesson.skills.map((skill) => ({ ...skill, mastery: 0 })),
      blocks: lesson.blocks.map((block) => ({
        type: block.type,
        title: block.title,
        body: block.body,
        formula: block.formula,
        figure: block.figure,
      })),
    })),
  }
}

export const curriculum: CurriculumTopic[] = [...basicTopics(), ...extendedTopics()].map(applyAuthoredContent)

export const getCurriculum = (level?: LearningLevel) =>
  level ? curriculum.filter((topic) => topic.level === level) : curriculum

export const getTopic = (slug: string) => curriculum.find((topic) => topic.slug === slug)

export const getLesson = (topicSlug: string, lessonSlug: string) =>
  getTopic(topicSlug)?.lessons.find((lesson) => lesson.slug === lessonSlug)

/** Udział działów z opracowaną treścią — używane na dashboardzie i w planie nauki. */
export const authoredCoverage = () => ({
  topics: curriculum.filter((topic) => topic.authored).length,
  total: curriculum.length,
  tasks: curriculum.reduce((sum, topic) => sum + topic.taskCount, 0),
})
