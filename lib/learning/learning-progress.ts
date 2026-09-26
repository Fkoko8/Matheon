/**
 * MATHEON — realny postęp w sekcji Nauka.
 *
 * Program (`lib/learning/curriculum.ts`) opisuje, co jest do nauczenia; ten moduł
 * dokłada drugą połowę obrazu: co uczeń faktycznie opanował. Skleja katalog
 * umiejętności z bazy (`skills`) ze stanem odtworzonym z dziennika odpowiedzi
 * (`learning_events`) i liczy postęp na trzech poziomach: umiejętność → lekcja → dział.
 *
 * Reguły spójne z resztą aplikacji:
 * - mastery liczymy **tylko z ćwiczących się umiejętności** (otwarcie lekcji nic nie daje),
 * - lekcja jest „w toku”, gdy ma choć jedną odpowiedź, a „ukończona”, gdy wszystkie jej
 *   umiejętności przekroczyły próg `LESSON_COMPLETE_MASTERY`,
 * - „następny krok” to pierwsza **nieukończona** lekcja: najpierw kończymy to, co zaczęte
 *   (albo jeszcze nietknięte), a nie przeskakujemy dalej.
 *
 * Część czysta (`buildLearningProgress`) jest wydzielona, żeby dała się przetestować
 * bez bazy.
 */
import { curriculum, type CurriculumTopic } from '@/lib/learning/curriculum'
import { isDue, WEAK_MASTERY, type SkillReviewState } from '@/lib/learning/skill-model'
import { defaultClient, getCurrentUserId, loadSkillCatalog, loadSkillStates, type AnyClient, type SkillRow } from '@/lib/learning/skill-state'

/** Próg, od którego uznajemy umiejętność (i całą lekcję) za opanowaną. */
export const LESSON_COMPLETE_MASTERY = 70

export interface SkillProgress {
  slug: string
  name: string
  mastery: number
  attempts: number
  /** Termin powtórki (ISO) albo `null`, gdy umiejętność nie była jeszcze ćwiczona. */
  dueAt: string | null
}

export interface LessonProgress {
  lessonSlug: string
  /** Umiejętności lekcji z realnym postępem — od najsłabszej do najmocniejszej. */
  skills: SkillProgress[]
  /** Średnie mastery ćwiczących się umiejętności lekcji (0–100). */
  mastery: number
  practisedSkills: number
  totalSkills: number
  started: boolean
  completed: boolean
  dueSkills: number
  /** Najbliższy termin powtórki w lekcji (ISO) albo `null`. */
  nextDueAt: string | null
}

export interface TopicProgress {
  topicSlug: string
  mastery: number
  practisedSkills: number
  totalSkills: number
  weakSkills: number
  dueSkills: number
  started: boolean
  completed: boolean
  lessons: LessonProgress[]
  /** Wszystkie umiejętności działu: najpierw ćwiczone od najsłabszej, potem nietknięte. */
  skills: SkillProgress[]
  /** Naturalny następny krok w dziale. */
  nextLessonSlug: string | null
  nextDueAt: string | null
  lastPracticedAt: string | null
}

function averageMastery(states: SkillReviewState[]): number {
  if (!states.length) return 0
  return Math.round(states.reduce((sum, state) => sum + state.mastery, 0) / states.length)
}

export function buildTopicProgress(
  topic: CurriculumTopic,
  skillBySlug: Map<string, SkillRow>,
  states: Map<string, SkillReviewState>,
  now: Date = new Date(),
): TopicProgress {
  const topicStates: SkillReviewState[] = []
  let practisedSkills = 0
  let totalSkills = 0

  const lessons: LessonProgress[] = topic.lessons.map((lesson) => {
    const lessonSkills: SkillProgress[] = lesson.skills.map((skill) => {
      const row = skillBySlug.get(skill.slug)
      const state = row ? states.get(row.id) : undefined
      const practised = state && state.attempts > 0 ? state : undefined
      return {
        slug: skill.slug,
        name: skill.name,
        mastery: practised?.mastery ?? 0,
        attempts: practised?.attempts ?? 0,
        dueAt: practised ? practised.dueAt : null,
      }
    })
    lessonSkills.sort((a, b) => Number(b.attempts > 0) - Number(a.attempts > 0) || a.mastery - b.mastery)

    const lessonStates = lesson.skills
      .map((skill) => {
        const row = skillBySlug.get(skill.slug)
        return row ? states.get(row.id) : undefined
      })
      .filter((state): state is SkillReviewState => Boolean(state && state.attempts > 0))

    totalSkills += lesson.skills.length
    practisedSkills += lessonStates.length
    topicStates.push(...lessonStates)

    const mastery = averageMastery(lessonStates)
    const due = lessonStates.filter((state) => isDue(state, now))
    const dueDates = lessonStates.map((state) => new Date(state.dueAt).getTime()).filter((value) => Number.isFinite(value))

    return {
      lessonSlug: lesson.slug,
      skills: lessonSkills,
      mastery,
      practisedSkills: lessonStates.length,
      totalSkills: lesson.skills.length,
      started: lessonStates.length > 0,
      completed: lesson.skills.length > 0 && lessonStates.length === lesson.skills.length && mastery >= LESSON_COMPLETE_MASTERY,
      dueSkills: due.length,
      nextDueAt: dueDates.length ? new Date(Math.min(...dueDates)).toISOString() : null,
    }
  })

  const dueDates = topicStates.map((state) => new Date(state.dueAt).getTime()).filter((value) => Number.isFinite(value))
  const practisedAt = topicStates.map((state) => state.lastPracticedAt).filter((value): value is string => Boolean(value))

  const nextLesson = lessons.find((lesson) => !lesson.completed) ?? null

  const allSkills = lessons.flatMap((lesson) => lesson.skills)
  allSkills.sort((a, b) => Number(b.attempts > 0) - Number(a.attempts > 0) || a.mastery - b.mastery)

  return {
    topicSlug: topic.slug,
    skills: allSkills,
    mastery: averageMastery(topicStates),
    practisedSkills,
    totalSkills,
    weakSkills: topicStates.filter((state) => state.mastery < WEAK_MASTERY).length,
    dueSkills: topicStates.filter((state) => isDue(state, now)).length,
    started: topicStates.length > 0,
    completed: lessons.length > 0 && lessons.every((lesson) => lesson.completed),
    lessons,
    nextLessonSlug: nextLesson?.lessonSlug ?? null,
    nextDueAt: dueDates.length ? new Date(Math.min(...dueDates)).toISOString() : null,
    lastPracticedAt: practisedAt.length ? practisedAt.sort().at(-1) ?? null : null,
  }
}

/** Postęp całego programu w jednym przebiegu. */
export function buildLearningProgress(
  topics: CurriculumTopic[],
  skillBySlug: Map<string, SkillRow>,
  states: Map<string, SkillReviewState>,
  now: Date = new Date(),
): Map<string, TopicProgress> {
  return new Map(topics.map((topic) => [topic.slug, buildTopicProgress(topic, skillBySlug, states, now)]))
}

/** Postęp ucznia z bazy; bez sesji zwraca pustą mapę (UI pokazuje uczciwe zera). */
export async function loadLearningProgress(supabase: AnyClient = defaultClient(), now: Date = new Date()): Promise<Map<string, TopicProgress>> {
  if (!supabase) return new Map()
  const userId = await getCurrentUserId(supabase)
  if (!userId) return new Map()

  const [catalog, states] = await Promise.all([loadSkillCatalog(supabase), loadSkillStates(userId, supabase)])
  const skillBySlug = new Map(catalog.map((skill) => [skill.slug, skill]))
  return buildLearningProgress(curriculum, skillBySlug, states, now)
}

/** Zbiorcze liczby programu — nagłówek sekcji Nauka. */
export function curriculumCoverage() {
  const authored = curriculum.filter((topic) => topic.authored)
  return {
    topics: curriculum.length,
    authoredTopics: authored.length,
    lessons: curriculum.reduce((sum, topic) => sum + topic.lessons.length, 0),
    authoredLessons: authored.reduce((sum, topic) => sum + topic.lessons.length, 0),
    tasks: curriculum.reduce((sum, topic) => sum + topic.taskCount, 0),
    skills: curriculum.reduce((sum, topic) => sum + topic.lessons.reduce((count, lesson) => count + lesson.skills.length, 0), 0),
    minutes: curriculum.reduce((sum, topic) => sum + topic.durationMinutes, 0),
  }
}
