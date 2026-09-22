import { activities, chapters, lessons as mockLessons, topics as mockTopics } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/client'
import type { DashboardData, Exam, Hint, Lesson, Mistake, Question, Solution, StudyPlan, Subject, Subtopic, Topic, UserAnswer, UserProfile, UserProgress, StudySession } from '@/lib/types'
import { DEMO_USER_ID, nowIso } from '@/lib/types'

const fallbackTopics: Topic[] = mockTopics.map(([name, value], index) => ({ id: `topic-${index + 1}`, subjectId: 'math', name, slug: name.toLowerCase().replaceAll(' ', '-'), mastery: Number.parseInt(value, 10) }))
const fallbackLessons: Lesson[] = mockLessons.map((title, index) => ({ id: `lesson-${index + 1}`, subtopicId: 'subtopic-logarithms', title, slug: title.toLowerCase().replaceAll(' ', '-'), durationMinutes: 15, order: index + 1 }))
const fallbackProfile: UserProfile = { id: DEMO_USER_ID, displayName: 'FKoko', level: 18, xp: 12430, streak: 12 }

async function getUserId() {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function getProfile(): Promise<UserProfile> {
  const supabase = createClient(); const userId = await getUserId()
  if (!supabase || !userId) return fallbackProfile
  const { data } = await supabase.from('profiles').select('id,display_name,avatar_url,level,xp,streak').eq('id', userId).maybeSingle()
  return data ? { id: String(data.id), displayName: String(data.display_name ?? 'Użytkownik'), avatarUrl: data.avatar_url ? String(data.avatar_url) : undefined, level: Number(data.level ?? 1), xp: Number(data.xp ?? 0), streak: Number(data.streak ?? 0) } : fallbackProfile
}

export async function getSubjects(): Promise<Subject[]> {
  const supabase = createClient(); if (!supabase) return [{ id: 'math', name: 'Matematyka', slug: 'matematyka', level: 'basic' }, { id: 'math-extended', name: 'Matematyka rozszerzona', slug: 'matematyka-rozszerzona', level: 'extended' }]
  const { data } = await supabase.from('subjects').select('id,name,slug,level').order('order_index')
  return data?.map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug), level: row.level as Subject['level'] })) ?? []
}

export async function getTopics(): Promise<Topic[]> {
  const supabase = createClient(); if (!supabase) return fallbackTopics
  const { data } = await supabase.from('topics').select('id,subject_id,name,slug').order('order_index')
  return data?.map((row) => ({ id: String(row.id), subjectId: String(row.subject_id), name: String(row.name), slug: String(row.slug), mastery: 0 })) ?? fallbackTopics
}

export async function getSubtopics(topicId?: string): Promise<Subtopic[]> {
  const supabase = createClient(); if (!supabase) return fallbackTopics.filter((topic) => !topicId || topic.id === topicId).map((topic) => ({ id: `${topic.id}-subtopic`, topicId: topic.id, name: topic.name, slug: topic.slug, mastery: topic.mastery }))
  let query = supabase.from('subtopics').select('id,topic_id,name,slug').order('order_index'); if (topicId) query = query.eq('topic_id', topicId)
  const { data } = await query; return data?.map((row) => ({ id: String(row.id), topicId: String(row.topic_id), name: String(row.name), slug: String(row.slug), mastery: 0 })) ?? []
}

export async function getLessons(subtopicId?: string): Promise<Lesson[]> {
  const supabase = createClient(); if (!supabase) return fallbackLessons.filter((lesson) => !subtopicId || lesson.subtopicId === subtopicId)
  let query = supabase.from('lessons').select('id,subtopic_id,title,slug,estimated_minutes,order_index').eq('published', true).order('order_index'); if (subtopicId) query = query.eq('subtopic_id', subtopicId)
  const { data } = await query; return data?.map((row) => ({ id: String(row.id), subtopicId: String(row.subtopic_id ?? ''), title: String(row.title), slug: String(row.slug), durationMinutes: Number(row.estimated_minutes), order: Number(row.order_index) })) ?? []
}

function mapQuestion(row: Record<string, unknown>): Question { return { id: String(row.id), topicId: String(row.topic_id), title: String(row.question_text).slice(0, 60), prompt: String(row.question_text), difficulty: Number(row.difficulty) >= 4 ? 'hard' : Number(row.difficulty) >= 3 ? 'medium' : 'easy', points: Number(row.points) } }
export async function getQuestions(topicId?: string): Promise<Question[]> { const supabase = createClient(); if (!supabase) { const fallbackQuestions: Question[] = [{ id: 'question-logarithm', topicId: 'topic-1', title: 'Równanie logarytmiczne', prompt: 'Rozwiąż równanie log₂(x − 1) = 3.', difficulty: 'medium', points: 3 }, { id: 'question-sequence', topicId: 'topic-5', title: 'Ciąg arytmetyczny', prompt: 'Wyznacz wyraz a₁₀ ciągu, w którym a₃ = 7 oraz a₇ = 19.', difficulty: 'hard', points: 4 }, { id: 'question-triangle', topicId: 'topic-5', title: 'Pole trójkąta', prompt: 'Oblicz pole trójkąta o podstawie 8 i wysokości 5.', difficulty: 'easy', points: 2 }]; return fallbackQuestions.filter((q) => !topicId || q.topicId === topicId); } let query = supabase.from('questions').select('id,topic_id,question_text,difficulty,points').eq('published', true); if (topicId) query = query.eq('topic_id', topicId); const { data } = await query; return data?.map((row) => mapQuestion(row)) ?? [] }
export async function getQuestion(id: string): Promise<Question | null> { const supabase = createClient(); if (!supabase) return (await getQuestions()).find((question) => question.id === id) ?? null; const { data } = await supabase.from('questions').select('id,topic_id,question_text,difficulty,points').eq('id', id).eq('published', true).maybeSingle(); return data ? mapQuestion(data) : null }
export async function getUserProgress(userId?: string): Promise<UserProgress[]> { const supabase = createClient(); const uid = userId ?? await getUserId(); if (!supabase || !uid) return fallbackTopics.map((topic) => ({ userId: uid ?? DEMO_USER_ID, topicId: topic.id, mastery: topic.mastery, accuracy: Math.min(100, topic.mastery + 5), attempts: 10, updatedAt: nowIso() })); const { data } = await supabase.from('user_progress').select('user_id,topic_id,mastery,accuracy,attempts,updated_at').eq('user_id', uid).not('topic_id', 'is', null); return data?.map((row) => ({ userId: String(row.user_id), topicId: String(row.topic_id), mastery: Number(row.mastery), accuracy: Number(row.accuracy), attempts: Number(row.attempts), updatedAt: String(row.updated_at) })) ?? [] }
export async function getMistakes(userId?: string): Promise<Mistake[]> { const supabase = createClient(); const uid = userId ?? await getUserId(); if (!supabase || !uid) return [{ id: 'mistake-1', userId: uid ?? DEMO_USER_ID, questionId: 'question-logarithm', topicId: 'topic-1', count: 2, lastSeenAt: nowIso() }]; const { data } = await supabase.from('mistakes').select('id,user_id,question_id,topic_id,attempt_count,last_seen_at').eq('user_id', uid).eq('resolved', false).order('last_seen_at', { ascending: false }); return data?.map((row) => ({ id: String(row.id), userId: String(row.user_id), questionId: String(row.question_id), topicId: String(row.topic_id), count: Number(row.attempt_count), lastSeenAt: String(row.last_seen_at) })) ?? [] }
export async function getReviewQueue(userId?: string): Promise<Question[]> { const mistakes = await getMistakes(userId); const questions = await getQuestions(); return questions.filter((question) => mistakes.some((mistake) => mistake.questionId === question.id)).concat(questions).slice(0, 3) }
export async function getStudyPlan(userId?: string): Promise<StudyPlan> { const supabase = createClient(); const uid = userId ?? await getUserId(); if (!supabase || !uid) return { id: 'plan-demo', userId: uid ?? DEMO_USER_ID, title: 'Plan nauki', startDate: '2026-09-22', endDate: '2026-09-28' }; const { data } = await supabase.from('study_plans').select('id,user_id,title,start_date,end_date').eq('user_id', uid).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(); return data ? { id: String(data.id), userId: String(data.user_id), title: String(data.title), startDate: String(data.start_date), endDate: String(data.end_date) } : { id: 'plan-empty', userId: uid, title: 'Plan nauki', startDate: '2026-09-22', endDate: '2026-09-28' } }
export async function getExams(): Promise<Exam[]> { const supabase = createClient(); if (!supabase) return [2026, 2025, 2024, 2023].map((year, index) => ({ id: `exam-${year}`, year, level: index % 2 ? 'basic' : 'extended', durationMinutes: 180, points: 50, status: index === 2 ? 'completed' : index === 1 ? 'in_progress' : 'not_started' })); const { data } = await supabase.from('exams').select('id,year,level,duration_minutes,total_points').eq('published', true).order('year', { ascending: false }); return data?.map((row) => ({ id: String(row.id), year: Number(row.year), level: row.level as Exam['level'], durationMinutes: Number(row.duration_minutes), points: Number(row.total_points), status: 'not_started' })) ?? [] }
export async function getDashboardData(userId?: string): Promise<DashboardData> { const [profile, progress, review] = await Promise.all([getProfile(), getUserProgress(userId), getReviewQueue(userId)]); return { profile, mastery: progress.length ? Math.round(progress.reduce((sum, item) => sum + item.mastery, 0) / progress.length) : 0, accuracy: progress.length ? Math.round(progress.reduce((sum, item) => sum + item.accuracy, 0) / progress.length) : 0, tasks: 3, reviewQueue: review.length, weakTopics: (await getTopics()).filter((topic) => (progress.find((item) => item.topicId === topic.id)?.mastery ?? 0) < 60), recentActivity: [] } }
export async function getHints(questionId: string): Promise<Hint[]> { const supabase = createClient(); if (!supabase) return [{ id: `hint-${questionId}`, questionId, content: 'Zamień równanie na postać potęgową i pamiętaj o dziedzinie.', order: 1 }]; const { data } = await supabase.from('hints').select('id,question_id,content,order_index').eq('question_id', questionId).order('order_index'); return data?.map((row) => ({ id: String(row.id), questionId: String(row.question_id), content: String(row.content), order: Number(row.order_index) })) ?? [] }
export async function getSolution(questionId: string): Promise<Solution | null> { const supabase = createClient(); if (!supabase) return { id: `solution-${questionId}`, questionId, content: 'Rozwiązanie będzie dostępne po zapisaniu własnej próby.' }; const { data } = await supabase.from('solutions').select('id,question_id,content').eq('question_id', questionId).maybeSingle(); return data ? { id: String(data.id), questionId: String(data.question_id), content: String(data.content) } : null }
export function getDashboardActivities() { return activities }
export function getChapters() { return chapters }
export function getMockAnswers(): UserAnswer[] { return [] }
export function getMockSessions(): StudySession[] { return [] }
