import type { CkeRequirement, ContentTask, ContentTopic, LearningLevel } from '@/content/types'
import { realne } from '@/content/topics/realne'
import { algebra } from '@/content/topics/algebra'
import { rownania } from '@/content/topics/rownania'
import { realneTasks } from '@/content/tasks/realne'
import { algebraTasks } from '@/content/tasks/algebra'
import { rownaniaTasks } from '@/content/tasks/rownania'
import { kwadratowa } from '@/content/topics/kwadratowa'
import { funkcje } from '@/content/topics/funkcje'
import { ciagi } from '@/content/topics/ciagi'
import { trygonometria } from '@/content/topics/trygonometria'
import { planimetria } from '@/content/topics/planimetria'
import { geometria } from '@/content/topics/geometria'
import { stereometria } from '@/content/topics/stereometria'
import { kombinatoryka } from '@/content/topics/kombinatoryka'
import { prawdopodobienstwo } from '@/content/topics/prawdopodobienstwo'
import { statystyka } from '@/content/topics/statystyka'
import { wielomiany } from '@/content/topics/wielomiany'
import { wymierne } from '@/content/topics/wymierne'
import { parametry } from '@/content/topics/parametry'
import { granice } from '@/content/topics/granice'
import { pochodne } from '@/content/topics/pochodne'
import { optymalizacja } from '@/content/topics/optymalizacja'
import { dowody } from '@/content/topics/dowody'
import { zastosowania } from '@/content/topics/zastosowania'
import { kwadratowaTasks } from '@/content/tasks/kwadratowa'
import { funkcjeTasks } from '@/content/tasks/funkcje'
import { ciagiTasks } from '@/content/tasks/ciagi'
import { trygonometriaTasks } from '@/content/tasks/trygonometria'
import { planimetriaTasks } from '@/content/tasks/planimetria'
import { geometriaTasks } from '@/content/tasks/geometria'
import { stereometriaTasks } from '@/content/tasks/stereometria'
import { kombinatorykaTasks } from '@/content/tasks/kombinatoryka'
import { prawdopodobienstwoTasks } from '@/content/tasks/prawdopodobienstwo'
import { statystykaTasks } from '@/content/tasks/statystyka'
import { wielomianyTasks } from '@/content/tasks/wielomiany'
import { wymierneTasks } from '@/content/tasks/wymierne'
import { parametryTasks } from '@/content/tasks/parametry'
import { graniceTasks } from '@/content/tasks/granice'
import { pochodneTasks } from '@/content/tasks/pochodne'
import { optymalizacjaTasks } from '@/content/tasks/optymalizacja'
import { dowodyTasks } from '@/content/tasks/dowody'
import { zastosowaniaTasks } from '@/content/tasks/zastosowania'
import { ckeRequirements } from '@/content/cke-requirements'

/** Wszystkie opracowane działy (autorstwo MATHEON). */
export const authoredTopics: ContentTopic[] = [realne, algebra, rownania, kwadratowa, funkcje, ciagi, trygonometria, planimetria, geometria, stereometria, kombinatoryka, prawdopodobienstwo, statystyka, wielomiany, wymierne, parametry, granice, pochodne, optymalizacja, dowody, zastosowania]

/** Wszystkie opracowane zadania MATHEON. */
export const authoredTasks: ContentTask[] = [...realneTasks, ...algebraTasks, ...rownaniaTasks, ...kwadratowaTasks, ...funkcjeTasks, ...ciagiTasks, ...trygonometriaTasks, ...planimetriaTasks, ...geometriaTasks, ...stereometriaTasks, ...kombinatorykaTasks, ...prawdopodobienstwoTasks, ...statystykaTasks, ...wielomianyTasks, ...wymierneTasks, ...parametryTasks, ...graniceTasks, ...pochodneTasks, ...optymalizacjaTasks, ...dowodyTasks, ...zastosowaniaTasks]

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
