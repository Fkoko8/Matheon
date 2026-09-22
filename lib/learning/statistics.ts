import { createClient } from '@/lib/supabase/client'
import { getOverallAccuracy, getTopicsByMastery } from '@/lib/learning/progress'
import { getTotalStudyTime } from '@/lib/learning/sessions'

export interface LearningStatistics {
  totalQuestions: number
  accuracy: number
  mastery: number
  studyTimeHours: number
  streak: number
  dailyActivity: Array<{ date: string; questions: number; correct: number; minutes: number }>
  topicPerformance: Array<{ topicId: string; topicName: string; mastery: number; accuracy: number; attempts: number }>
}

export async function getLearningStatistics(userId: string, supabase = createClient()): Promise<LearningStatistics> {
  if (!supabase) return { totalQuestions: 0, accuracy: 0, mastery: 0, studyTimeHours: 0, streak: 0, dailyActivity: [], topicPerformance: [] }

  const [{ data: answers }, { data: progress }, { data: profile }] = await Promise.all([
    supabase.from('user_answers').select('is_correct, created_at').eq('user_id', userId),
    supabase.from('user_progress').select('topic_id, mastery, accuracy, attempts').eq('user_id', userId).not('topic_id', 'is', null),
    supabase.from('profiles').select('streak').eq('id', userId).maybeSingle(),
  ])

  const topicPerformance: LearningStatistics['topicPerformance'] = []
  for (const item of progress ?? []) {
    const { data: topic } = await supabase.from('topics').select('name').eq('id', item.topic_id).maybeSingle()
    if (topic) topicPerformance.push({ topicId: String(item.topic_id), topicName: String(topic.name), mastery: Number(item.mastery ?? 0), accuracy: Number(item.accuracy ?? 0), attempts: Number(item.attempts ?? 0) })
  }

  const byDate = new Map<string, { questions: number; correct: number }>()
  for (const answer of answers ?? []) {
    const date = new Date(answer.created_at).toISOString().slice(0, 10)
    const current = byDate.get(date) ?? { questions: 0, correct: 0 }
    current.questions += 1
    if (answer.is_correct) current.correct += 1
    byDate.set(date, current)
  }

  const dailyActivity = Array.from(byDate.entries()).map(([date, value]) => ({ ...value, date, minutes: 0 })).sort((a, b) => a.date.localeCompare(b.date)).slice(-30)
  const mastery = topicPerformance.length ? Math.round(topicPerformance.reduce((sum, item) => sum + item.mastery, 0) / topicPerformance.length) : 0

  return {
    totalQuestions: answers?.length ?? 0,
    accuracy: await getOverallAccuracy(userId, supabase),
    mastery,
    studyTimeHours: await getTotalStudyTime(userId, supabase),
    streak: Number(profile?.streak ?? 0),
    dailyActivity,
    topicPerformance,
  }
}

export { getTopicsByMastery }
