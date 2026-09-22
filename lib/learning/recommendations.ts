import { createClient } from '@/lib/supabase/client'
import { calculateTopicMastery } from '@/lib/learning/mastery'

export interface Recommendation {
  id: string
  title: string
  reason: string
  actionUrl: string
  priority: number
  type: 'weak_topic' | 'overdue_review' | 'new_lesson' | 'repeated_mistake'
}

/**
 * Get personalized recommendations for the user
 */
export async function getRecommendations(userId: string, supabase = createClient()): Promise<Recommendation[]> {
  if (!supabase) return []

  const recommendations: Recommendation[] = []

  // 1. Find weak topics (mastery < 60%)
  const { data: progress } = await supabase.from('user_progress').select('topic_id, mastery').eq('user_id', userId).not('topic_id', 'is', null)

  if (progress) {
    for (const item of progress.filter((p) => p.mastery < 60)) {
      const { data: topic } = await supabase.from('topics').select('name, slug').eq('id', item.topic_id).single()

      if (topic) {
        recommendations.push({
          id: `weak-${item.topic_id}`,
          title: `Powtórz ${topic.name}`,
          reason: `Mastery ${Math.round(item.mastery)}% — wymaga wzmocnienia`,
          actionUrl: `/learn/${topic.slug}`,
          priority: 100 - item.mastery, // Higher priority for lower mastery
          type: 'weak_topic',
        })
      }
    }
  }

  // 2. Find overdue reviews
  const { data: overdueProgress } = await supabase
    .from('user_progress')
    .select('topic_id, next_review_at')
    .eq('user_id', userId)
    .lt('next_review_at', new Date().toISOString())
    .not('topic_id', 'is', null)
    .limit(3)

  if (overdueProgress) {
    for (const item of overdueProgress) {
      const { data: topic } = await supabase.from('topics').select('name, slug').eq('id', item.topic_id).single()

      if (topic) {
        const daysOverdue = Math.ceil((Date.now() - new Date(item.next_review_at).getTime()) / (1000 * 60 * 60 * 24))
        recommendations.push({
          id: `overdue-${item.topic_id}`,
          title: `Powtórz ${topic.name}`,
          reason: `Powtórka zaległa od ${daysOverdue} dni`,
          actionUrl: `/review`,
          priority: 150, // High priority
          type: 'overdue_review',
        })
      }
    }
  }

  // 3. Find repeated mistakes
  const { data: mistakes } = await supabase
    .from('mistakes')
    .select('question_id, topic_id, attempt_count')
    .eq('user_id', userId)
    .eq('resolved', false)
    .order('last_seen_at', { ascending: false })
    .limit(3)

  if (mistakes) {
    for (const mistake of mistakes) {
      const { data: topic } = await supabase.from('topics').select('name, slug').eq('id', mistake.topic_id).single()

      if (topic) {
        recommendations.push({
          id: `mistake-${mistake.question_id}`,
          title: `Rozwiąż ponownie pytanie z ${topic.name}`,
          reason: `${mistake.attempt_count} nieudanych prób — przeanalizuj błąd`,
          actionUrl: `/mistakes`,
          priority: 120,
          type: 'repeated_mistake',
        })
      }
    }
  }

  // Sort by priority descending
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3)
}

/**
 * Format recommendation for display
 */
export function getRecommendationIcon(type: Recommendation['type']): string {
  const icons = {
    weak_topic: '📚',
    overdue_review: '⏰',
    new_lesson: '✨',
    repeated_mistake: '❌',
  }
  return icons[type]
}
