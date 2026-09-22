import { createClient } from '@/lib/supabase/client'

export interface ProgressUpdate {
  userId: string
  topicId?: string
  subtopicId?: string
  lessonId?: string
  attempts: number
  correctAttempts: number
  incorrectAttempts: number
  accuracy: number
  mastery: number
  hintsUsed: number
  solutionsViewed: number
  averageTimeSeconds: number
  updatedAt: string
}

/**
 * Update user progress after answering a question
 */
export async function updateProgress(
  userId: string,
  topicId: string,
  isCorrect: boolean,
  timeSeconds: number = 0,
  hintsUsed: number = 0,
  solutionViewed: boolean = false,
  supabase = createClient(),
): Promise<ProgressUpdate | null> {
  if (!supabase) return null

  // Get current progress
  const { data: current } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle()

  const attempts = (current?.attempts ?? 0) + 1
  const correctAttempts = (current?.correct_attempts ?? 0) + (isCorrect ? 1 : 0)
  const incorrectAttempts = (current?.incorrect_attempts ?? 0) + (isCorrect ? 0 : 1)

  // Calculate accuracy
  const accuracy = Math.round((correctAttempts / attempts) * 100)

  // Calculate mastery using spaced repetition principles
  let mastery = current?.mastery ?? 0

  if (isCorrect) {
    // Award mastery points based on performance quality
    if (solutionViewed) {
      mastery += 1 // Minimal gain
    } else if (hintsUsed >= 3) {
      mastery += 2 // Some gain
    } else if (hintsUsed > 0) {
      mastery += 3 // Better gain
    } else {
      mastery += 5 // Full gain
    }
  } else {
    // Slight mastery decrease for incorrect answers
    mastery = Math.max(0, mastery - 1)
  }

  mastery = Math.min(100, mastery)

  // Calculate average time
  const currentTotalTime = (current?.average_time_seconds ?? 0) * (attempts - 1)
  const averageTimeSeconds = Math.round((currentTotalTime + timeSeconds) / attempts)

  const hintsUsedCumulative = (current?.hints_used ?? 0) + hintsUsed
  const solutionsViewedCumulative = (current?.solutions_viewed ?? 0) + (solutionViewed ? 1 : 0)

  // Upsert progress record
  const { data, error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        attempts,
        correct_attempts: correctAttempts,
        incorrect_attempts: incorrectAttempts,
        accuracy,
        mastery,
        hints_used: hintsUsedCumulative,
        solutions_viewed: solutionsViewedCumulative,
        average_time_seconds: averageTimeSeconds,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id' },
    )
    .select()
    .single()

  if (error || !data) return null

  return {
    userId: String(data.user_id),
    topicId: String(data.topic_id),
    attempts,
    correctAttempts,
    incorrectAttempts,
    accuracy,
    mastery,
    hintsUsed: hintsUsedCumulative,
    solutionsViewed: solutionsViewedCumulative,
    averageTimeSeconds,
    updatedAt: String(data.updated_at),
  }
}

/**
 * Calculate overall accuracy across all topics
 */
export async function getOverallAccuracy(userId: string, supabase = createClient()): Promise<number> {
  if (!supabase) return 0

  const { data } = await supabase
    .from('user_progress')
    .select('correct_attempts, attempts')
    .eq('user_id', userId)
    .not('topic_id', 'is', null)

  if (!data || data.length === 0) return 0

  const totalCorrect = data.reduce((sum, p) => sum + (p.correct_attempts ?? 0), 0)
  const totalAttempts = data.reduce((sum, p) => sum + (p.attempts ?? 0), 0)

  return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
}

/**
 * Get topics ranked by mastery (highest first)
 */
export async function getTopicsByMastery(userId: string, supabase = createClient()): Promise<Array<{ topicId: string; topicName: string; mastery: number }>> {
  if (!supabase) return []

  const { data: progress } = await supabase
    .from('user_progress')
    .select('topic_id, mastery')
    .eq('user_id', userId)
    .not('topic_id', 'is', null)
    .order('mastery', { ascending: false })

  if (!progress) return []

  const withNames: Array<{ topicId: string; topicName: string; mastery: number }> = []

  for (const p of progress) {
    const { data: topic } = await supabase.from('topics').select('name').eq('id', p.topic_id).single()

    if (topic) {
      withNames.push({
        topicId: String(p.topic_id),
        topicName: String(topic.name),
        mastery: Number(p.mastery),
      })
    }
  }

  return withNames
}
