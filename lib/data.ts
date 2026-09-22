import { activities, chapters, lessons, topics } from '@/lib/mock-data'
import type { DashboardData, Exam, Hint, Mistake, Question, StudyPlan, Subject, Topic, UserAnswer, UserProfile, UserProgress, Solution, Subtopic, Lesson, StudySession } from '@/lib/types'
import { DEMO_USER_ID, nowIso } from '@/lib/types'

const topicRecords: Topic[] = topics.map(([name, value], index) => ({ id: `topic-${index + 1}`, subjectId: 'math', name, slug: name.toLowerCase().replaceAll(' ', '-'), mastery: Number.parseInt(value, 10) }))
const lessonRecords: Lesson[] = lessons.map((title, index) => ({ id: `lesson-${index + 1}`, subtopicId: 'subtopic-logarithms', title, slug: title.toLowerCase().replaceAll(' ', '-'), durationMinutes: 15, order: index + 1 }))
const profile: UserProfile = { id: DEMO_USER_ID, displayName: 'FKoko', level: 18, xp: 12430, streak: 12 }

export function getProfile(): UserProfile { return profile }
export function getSubjects(): Subject[] { return [{ id: 'math', name: 'Matematyka', slug: 'matematyka', level: 'basic' }, { id: 'math-extended', name: 'Matematyka rozszerzona', slug: 'matematyka-rozszerzona', level: 'extended' }] }
export function getTopics(): Topic[] { return topicRecords }
export function getSubtopics(topicId?: string): Subtopic[] { return topicRecords.filter((topic) => !topicId || topic.id === topicId).map((topic) => ({ id: `${topic.id}-subtopic`, topicId: topic.id, name: topic.name, slug: topic.slug, mastery: topic.mastery })) }
export function getLessons(subtopicId?: string): Lesson[] { return lessonRecords.filter((lesson) => !subtopicId || lesson.subtopicId === subtopicId) }
export function getQuestions(topicId?: string): Question[] { return ([{ id: 'question-logarithm', topicId: 'topic-1', title: 'Równanie logarytmiczne', prompt: 'Rozwiąż równanie log₂(x − 1) = 3.', difficulty: 'medium', points: 3 }, { id: 'question-sequence', topicId: 'topic-5', title: 'Ciąg arytmetyczny', prompt: 'Wyznacz wyraz a₁₀ ciągu, w którym a₃ = 7 oraz a₇ = 19.', difficulty: 'hard', points: 4 }, { id: 'question-triangle', topicId: 'topic-5', title: 'Pole trójkąta', prompt: 'Oblicz pole trójkąta o podstawie 8 i wysokości 5.', difficulty: 'easy', points: 2 }] satisfies Question[]).filter((question) => !topicId || question.topicId === topicId) }
export function getQuestion(id: string): Question | null { return getQuestions().find((question) => question.id === id) ?? null }
export function getUserProgress(userId = DEMO_USER_ID): UserProgress[] { return getTopics().map((topic) => ({ userId, topicId: topic.id, mastery: topic.mastery, accuracy: topic.mastery + 5 > 100 ? 100 : topic.mastery + 5, attempts: 10, updatedAt: nowIso() })) }
export function getMistakes(userId = DEMO_USER_ID): Mistake[] { return [{ id: 'mistake-1', userId, questionId: 'question-logarithm', topicId: 'topic-1', count: 2, lastSeenAt: nowIso() }] }
export function getReviewQueue(userId = DEMO_USER_ID): Question[] { return getQuestions().slice(0, 3) }
export function getStudyPlan(userId = DEMO_USER_ID): StudyPlan { return { id: 'plan-demo', userId, title: 'Plan nauki', startDate: '2026-09-22', endDate: '2026-09-28' } }
export function getExams(): Exam[] { return [2026, 2025, 2024, 2023].map((year, index) => ({ id: `exam-${year}`, year, level: index % 2 ? 'basic' : 'extended', durationMinutes: 180, points: 50, status: index === 2 ? 'completed' : index === 1 ? 'in_progress' : 'not_started' })) }
export function getDashboardData(userId = DEMO_USER_ID): DashboardData { const progress = getUserProgress(userId); return { profile: getProfile(), mastery: 69, accuracy: 82, tasks: 3, reviewQueue: getReviewQueue(userId).length, weakTopics: progress.filter((item) => item.mastery < 60).map((item) => getTopics().find((topic) => topic.id === item.topicId)!).filter(Boolean), recentActivity: [] } }
export function getHints(questionId: string): Hint[] { return [{ id: `hint-${questionId}`, questionId, content: 'Zamień równanie na postać potęgową i pamiętaj o dziedzinie.', order: 1 }] }
export function getSolution(questionId: string): Solution | null { return { id: `solution-${questionId}`, questionId, content: 'Rozwiązanie będzie dostępne po zapisaniu własnej próby.' } }
export function getDashboardActivities() { return activities }
export function getChapters() { return chapters }
export function getMockAnswers(): UserAnswer[] { return [] }
export function getMockSessions(): StudySession[] { return [] }
