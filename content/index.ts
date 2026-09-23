import type { CkeRequirement, ContentTask, ContentTopic, LearningLevel } from '@/content/types'
import { realne } from '@/content/topics/realne'
import { algebra } from '@/content/topics/algebra'
import { rownania } from '@/content/topics/rownania'
import { realneTasks } from '@/content/tasks/realne'
import { algebraTasks } from '@/content/tasks/algebra'
import { rownaniaTasks } from '@/content/tasks/rownania'
import { ckeRequirements } from '@/content/cke-requirements'

/** Wszystkie opracowane działy (autorstwo MATHEON). Pozostałe działy korzystają jeszcze z szablonu. */
export const authoredTopics: ContentTopic[] = [realne, algebra, rownania]

/** Wszystkie opracowane zadania, w kolejności authoringowej. */
export const authoredTasks: ContentTask[] = [...realneTasks, ...algebraTasks, ...rownaniaTasks]

export const authoredTopicBySlug = new Map(authoredTopics.map((topic) => [topic.slug, topic]))
export const authoredTaskById = new Map(authoredTasks.map((task) => [task.id, task]))

export const tasksForTopic = (topicSlug: string) => authoredTasks.filter((task) => task.topicSlug === topicSlug)
export const tasksForLesson = (lessonSlug: string) => authoredTasks.filter((task) => task.lessonSlug === lessonSlug)

export { ckeRequirements }
export type { CkeRequirement, ContentTask, ContentTopic, LearningLevel }

/** Ile działów ma już pełną treść, a ile czeka na opracowanie. */
export function contentCoverage() {
  const requirementsByTopic = new Map<string, number>()
  for (const requirement of ckeRequirements) {
    requirementsByTopic.set(requirement.topicSlug, (requirementsByTopic.get(requirement.topicSlug) ?? 0) + 1)
  }
  return {
    authoredTopics: authoredTopics.length,
    authoredLessons: authoredTopics.reduce((sum, topic) => sum + topic.lessons.length, 0),
    authoredTasks: authoredTasks.length,
    requirements: ckeRequirements.length,
    requirementsWithSkill: ckeRequirements.filter((requirement) => requirement.skillSlug).length,
    lessonReady: ckeRequirements.filter((requirement) => requirement.status === 'lesson_ready' || requirement.status === 'published').length,
  }
}
