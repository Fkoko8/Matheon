import { createClient } from '@/lib/supabase/client'

export interface MistakeRecord {
  id: string
  userId: string
  questionId: string
  topicId: string
  subtopicId?: string
  userAnswer: string
  correctAnswer: string
  attemptCount: number
  lastSeenAt: string
  resolved: boolean
  mistakeType?: string
  explanation?: string
}

/**
 * Create or update a mistake record
 */
export async function recordMistake(
  userId: string,
  questionId: string,
  topicId: string,
  subtopicId: string | undefined,
  userAnswer: string,
  correctAnswer: string,
  mistakeType?: string,
  supabase = createClient(),
): Promise<MistakeRecord | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('mistakes')
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        topic_id: topicId,
        subtopic_id: subtopicId || null,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        mistake_type: mistakeType,
        last_seen_at: new Date().toISOString(),
        resolved: false,
      },
      { onConflict: 'user_id,question_id' },
    )
    .select()
    .single()

  if (error || !data) return null

  return {
    id: String(data.id),
    userId: String(data.user_id),
    questionId: String(data.question_id),
    topicId: String(data.topic_id),
    subtopicId: data.subtopic_id ? String(data.subtopic_id) : undefined,
    userAnswer: String(data.user_answer),
    correctAnswer: String(data.correct_answer),
    attemptCount: Number(data.attempt_count),
    lastSeenAt: String(data.last_seen_at),
    resolved: Boolean(data.resolved),
    mistakeType: data.mistake_type ? String(data.mistake_type) : undefined,
    explanation: data.explanation ? String(data.explanation) : undefined,
  }
}

/**
 * Resolve a mistake after successful re-attempt
 */
export async function resolveMistake(mistakeId: string, supabase = createClient()): Promise<MistakeRecord | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('mistakes')
    .update({ resolved: true, updated_at: new Date().toISOString() })
    .eq('id', mistakeId)
    .select()
    .single()

  if (error || !data) return null

  return {
    id: String(data.id),
    userId: String(data.user_id),
    questionId: String(data.question_id),
    topicId: String(data.topic_id),
    subtopicId: data.subtopic_id ? String(data.subtopic_id) : undefined,
    userAnswer: String(data.user_answer),
    correctAnswer: String(data.correct_answer),
    attemptCount: Number(data.attempt_count),
    lastSeenAt: String(data.last_seen_at),
    resolved: Boolean(data.resolved),
    mistakeType: data.mistake_type ? String(data.mistake_type) : undefined,
  }
}

/**
 * Get unresolved mistakes for user
 */
export async function getUnresolvedMistakes(userId: string, limit: number = 50, supabase = createClient()): Promise<MistakeRecord[]> {
  if (!supabase) return []

  const { data } = await supabase
    .from('mistakes')
    .select('*')
    .eq('user_id', userId)
    .eq('resolved', false)
    .order('last_seen_at', { ascending: false })
    .limit(limit)

  return (
    data?.map((m) => ({
      id: String(m.id),
      userId: String(m.user_id),
      questionId: String(m.question_id),
      topicId: String(m.topic_id),
      subtopicId: m.subtopic_id ? String(m.subtopic_id) : undefined,
      userAnswer: String(m.user_answer),
      correctAnswer: String(m.correct_answer),
      attemptCount: Number(m.attempt_count),
      lastSeenAt: String(m.last_seen_at),
      resolved: Boolean(m.resolved),
      mistakeType: m.mistake_type ? String(m.mistake_type) : undefined,
      explanation: m.explanation ? String(m.explanation) : undefined,
    })) || []
  )
}

/**
 * Classify mistake type based on user answer vs correct answer
 */
export function classifyMistakeType(userAnswer: string, correctAnswer: string): string {
  const userNum = parseFloat(userAnswer.trim())
  const correctNum = parseFloat(correctAnswer.trim())

  if (!isNaN(userNum) && !isNaN(correctNum)) {
    const ratio = userNum / correctNum
    if (Math.abs(ratio - (-1)) < 0.1) {
      return 'sign_error'
    }
    if (Math.abs(ratio - 2) < 0.1 || Math.abs(ratio - 0.5) < 0.1) {
      return 'calculation_error'
    }
  }

  if (userAnswer.toLowerCase().includes('error') || userAnswer.toLowerCase().includes('undefined')) {
    return 'concept_error'
  }

  return 'careless_error'
}
