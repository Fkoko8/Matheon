import { createClient } from '@/lib/supabase/client'
import type { UserProgress } from '@/lib/types'

export interface MasteryMetrics {
  value: number
  level: 'not_learned' | 'beginner' | 'developing' | 'strong' | 'mastered'
  confidence: number
  trend: 'improving' | 'stable' | 'declining'
}

/**
 * Calculate mastery for a single topic based on:
 * - correctness rate
 * - question difficulty
 * - number of attempts
 * - hints used
 * - solution viewed
 * - recency
 */
export async function calculateTopicMastery(
  userId: string,
  topicId: string,
  supabase = createClient(),
): Promise<MasteryMetrics> {
  if (!supabase) {
    return { value: 0, level: 'not_learned', confidence: 0, trend: 'stable' }
  }

  // Get all user answers for this topic
  const { data: answers } = await supabase
    .from('user_answers')
    .select('is_correct, is_partial, time_seconds, hints_used, solution_viewed, created_at')
    .eq('user_id', userId)
    .in(
      'question_id',
      (await supabase.from('questions').select('id').eq('topic_id', topicId)).data?.map((q) => q.id) || [],
    )

  if (!answers || answers.length === 0) {
    return { value: 0, level: 'not_learned', confidence: 0, trend: 'stable' }
  }

  const now = Date.now()
  const metrics = {
    correctCount: 0,
    partialCount: 0,
    totalAttempts: answers.length,
    totalHintsUsed: 0,
    solutionViewedCount: 0,
    recencyScore: 0,
  }

  answers.forEach((answer) => {
    if (answer.is_correct) metrics.correctCount++
    if (answer.is_partial) metrics.partialCount++
    if (answer.hints_used) metrics.totalHintsUsed += answer.hints_used
    if (answer.solution_viewed) metrics.solutionViewedCount++

    const daysAgo = (now - new Date(answer.created_at).getTime()) / (1000 * 60 * 60 * 24)
    const recency = Math.max(0, 1 - daysAgo / 30)
    metrics.recencyScore += recency
  })

  metrics.recencyScore /= answers.length

  // Base correctness: 0-50 points
  const correctnessRate = metrics.correctCount / metrics.totalAttempts
  const partialRate = metrics.partialCount / metrics.totalAttempts
  const correctnessScore = correctnessRate * 50 + partialRate * 15

  // Difficulty adjustment: 0-20 points
  const { data: questions } = await supabase.from('questions').select('difficulty').eq('topic_id', topicId)
  const avgDifficulty = questions ? questions.reduce((sum, q) => sum + q.difficulty, 0) / questions.length : 2.5
  const difficultyBonus = Math.min(20, (avgDifficulty / 5) * 10)

  // Attempts factor: -10 to 10 points
  const attemptsFactor = Math.max(-10, 10 - Math.min(10, metrics.totalAttempts) * 0.5)

  // Hint penalty: -10 to 0 points
  const hintPenalty = Math.max(-10, -(metrics.totalHintsUsed / metrics.totalAttempts) * 5)

  // Solution penalty: -10 to 0 points
  const solutionPenalty = (metrics.solutionViewedCount / metrics.totalAttempts) * -5

  // Recency bonus: 0-10 points
  const recencyBonus = metrics.recencyScore * 10

  const rawMastery = Math.max(0, correctnessScore + difficultyBonus + attemptsFactor + hintPenalty + solutionPenalty + recencyBonus)
  const value = Math.min(100, Math.round(rawMastery))

  // Determine level
  const level =
    value < 30 ? 'not_learned'
    : value < 50 ? 'beginner'
    : value < 70 ? 'developing'
    : value < 85 ? 'strong'
    : 'mastered'

  // Confidence: higher with more attempts
  const confidence = Math.min(100, Math.round((metrics.totalAttempts / 10) * 100))

  // Trend: compare recent vs older attempts
  const recentAnswers = answers.filter((a) => {
    const daysAgo = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo <= 7
  })
  const olderAnswers = answers.filter((a) => {
    const daysAgo = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo > 7
  })

  const recentRate = recentAnswers.length > 0 ? recentAnswers.filter((a) => a.is_correct).length / recentAnswers.length : 0
  const olderRate = olderAnswers.length > 0 ? olderAnswers.filter((a) => a.is_correct).length / olderAnswers.length : 0
  const trend = recentRate > olderRate + 0.1 ? 'improving' : recentRate < olderRate - 0.1 ? 'declining' : 'stable'

  return { value, level, confidence, trend }
}

/**
 * Calculate overall mastery from individual topic masteries
 */
export async function calculateOverallMastery(userId: string, masteries: Map<string, MasteryMetrics>): Promise<number> {
  if (masteries.size === 0) return 0

  const values = Array.from(masteries.values()).map((m) => m.value)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

/**
 * Get mastery level label for UI
 */
export function getMasteryLabel(level: MasteryMetrics['level']): string {
  const labels = {
    not_learned: 'Nie nauczony',
    beginner: 'Początkujący',
    developing: 'W rozwijaniu',
    strong: 'Silny',
    mastered: 'Opanowany',
  }
  return labels[level]
}
