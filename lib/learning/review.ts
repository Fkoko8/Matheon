import { createClient } from '@/lib/supabase/client'
import type { UserProgress } from '@/lib/types'

export interface ReviewSchedule {
  nextReviewAt: string
  intervalDays: number
  difficulty: 'due_overdue' | 'due_today' | 'due_soon' | 'due_later'
}

/**
 * Calculate next review date based on:
 * - correctness
 * - hints used
 * - solution viewed
 * - previous performance
 */
export function calculateNextReview(
  isCorrect: boolean,
  hintsUsed: number = 0,
  solutionViewed: boolean = false,
  previousAttempts: number = 0,
): ReviewSchedule {
  let intervalDays = 1

  if (isCorrect) {
    // Correct answers get longer intervals
    if (solutionViewed) {
      intervalDays = 1 // Solution revealed, review soon
    } else if (hintsUsed > 2) {
      intervalDays = 2 // Used many hints
    } else if (hintsUsed > 0) {
      intervalDays = 3 // Used some hints
    } else {
      // Correct without hints - increase interval with previous success
      if (previousAttempts >= 3) {
        intervalDays = 14 // Strong track record
      } else if (previousAttempts >= 1) {
        intervalDays = 7 // Second correct attempt
      } else {
        intervalDays = 3 // First correct attempt
      }
    }
  } else {
    // Incorrect answer
    intervalDays = 1 // Review within a day
  }

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays)

  // Determine difficulty relative to today
  const now = new Date()
  const diff = nextReviewAt.getTime() - now.getTime()
  const daysUntilDue = Math.ceil(diff / (1000 * 60 * 60 * 24))

  let difficulty: ReviewSchedule['difficulty']
  if (daysUntilDue < 0) {
    difficulty = 'due_overdue'
  } else if (daysUntilDue === 0) {
    difficulty = 'due_today'
  } else if (daysUntilDue <= 3) {
    difficulty = 'due_soon'
  } else {
    difficulty = 'due_later'
  }

  return {
    nextReviewAt: nextReviewAt.toISOString(),
    intervalDays,
    difficulty,
  }
}

/**
 * Get review queue for user - items due today or overdue
 */
export async function getReviewQueueForToday(
  userId: string,
  supabase = createClient(),
): Promise<Array<{ questionId: string; topicId: string; difficulty: string; reason: string; daysOverdue: number }>> {
  if (!supabase) return []

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Get all progress items where next_review_at is today or earlier
  const { data: dueItems } = await supabase
    .from('user_progress')
    .select('topic_id, subtopic_id, next_review_at, accuracy, attempts')
    .eq('user_id', userId)
    .lte('next_review_at', now.toISOString())
    .not('topic_id', 'is', null)

  if (!dueItems || dueItems.length === 0) return []

  const reviewItems: Array<{ questionId: string; topicId: string; difficulty: string; reason: string; daysOverdue: number }> = []

  for (const item of dueItems) {
    const daysOverdue = Math.ceil((now.getTime() - new Date(item.next_review_at).getTime()) / (1000 * 60 * 60 * 24))

    // Get a question from this topic
    const { data: questions } = await supabase
      .from('questions')
      .select('id, difficulty')
      .eq('topic_id', item.topic_id)
      .eq('published', true)
      .limit(1)

    if (questions && questions.length > 0) {
      const reason =
        daysOverdue > 0 ? `Zaległa od ${daysOverdue} dni` : item.accuracy < 60 ? 'Niska pewność' : 'Powtórka zaplanowana'

      reviewItems.push({
        questionId: questions[0].id,
        topicId: item.topic_id,
        difficulty: questions[0].difficulty >= 4 ? 'Trudne' : questions[0].difficulty >= 3 ? 'Średnie' : 'Łatwe',
        reason,
        daysOverdue,
      })
    }
  }

  // Sort by: overdue first, then by days overdue descending
  return reviewItems.sort((a, b) => {
    if (a.daysOverdue > 0 && b.daysOverdue <= 0) return -1
    if (a.daysOverdue <= 0 && b.daysOverdue > 0) return 1
    return b.daysOverdue - a.daysOverdue
  })
}

/**
 * Get review statistics for today
 */
export async function getReviewStats(userId: string, supabase = createClient()): Promise<{ total: number; overdue: number; dueLater: number }> {
  if (!supabase) return { total: 0, overdue: 0, dueLater: 0 }

  const now = new Date()

  const { data: allDue } = await supabase
    .from('user_progress')
    .select('next_review_at')
    .eq('user_id', userId)
    .lte('next_review_at', now.toISOString())
    .not('topic_id', 'is', null)

  const overdue = allDue?.filter((item) => {
    const daysOverdue = (now.getTime() - new Date(item.next_review_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysOverdue > 0
  }).length || 0

  return {
    total: allDue?.length || 0,
    overdue,
    dueLater: (allDue?.length || 0) - overdue,
  }
}
