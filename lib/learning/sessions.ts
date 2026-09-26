import { createClient } from '@/lib/supabase/client'
type SessionKind = 'lesson' | 'training' | 'review' | 'exam' | 'ai'

export interface StudySessionRecord {
  id: string
  userId: string
  sessionType: SessionKind
  startedAt: string
  finishedAt?: string
  durationSeconds: number
  questionsCount: number
  correctCount: number
  xpEarned: number
}

/**
 * Start a new study session
 */
export async function startStudySession(userId: string, sessionType: SessionKind, supabase = createClient()): Promise<string | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      session_type: sessionType,
      started_at: new Date().toISOString(),
      duration_seconds: 0,
      questions_count: 0,
      correct_count: 0,
      xp_earned: 0,
    })
    .select('id')
    .single()

  return error || !data ? null : String(data.id)
}

/**
 * End and record a study session
 */
export async function endStudySession(
  sessionId: string,
  questionsCount: number,
  correctCount: number,
  supabase = createClient(),
): Promise<StudySessionRecord | null> {
  if (!supabase) return null

  // Get session start time
  const { data: session } = await supabase.from('study_sessions').select('started_at, user_id').eq('id', sessionId).single()

  if (!session) return null

  const startedAt = new Date(session.started_at)
  const finishedAt = new Date()
  const durationSeconds = Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)

  // Calculate XP: base XP + bonus for accuracy
  const accuracy = questionsCount > 0 ? correctCount / questionsCount : 0
  const baseXp = questionsCount * 5 // 5 XP per question
  const accuracyBonus = Math.round(accuracy * 10) // Up to 10 XP bonus
  const xpEarned = Math.max(0, baseXp + accuracyBonus - 10) // Minimum 0

  const { data, error } = await supabase
    .from('study_sessions')
    .update({
      finished_at: finishedAt.toISOString(),
      duration_seconds: durationSeconds,
      questions_count: questionsCount,
      correct_count: correctCount,
      xp_earned: xpEarned,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error || !data) return null

  // Update user profile XP and streak
  await updateUserXpAndStreak(String(session.user_id), xpEarned, supabase)

  return {
    id: String(data.id),
    userId: String(data.user_id),
    sessionType: data.session_type,
    startedAt: String(data.started_at),
    finishedAt: String(data.finished_at),
    durationSeconds,
    questionsCount,
    correctCount,
    xpEarned,
  }
}

/**
 * Update user XP and maintain streak
 */
async function updateUserXpAndStreak(userId: string, xpEarned: number, supabase: ReturnType<typeof createClient>): Promise<void> {
  if (!supabase) return
  const { data: profile } = await supabase.from('profiles').select('xp, streak, updated_at').eq('id', userId).single()

  if (!profile) return

  const newXp = (profile.xp ?? 0) + xpEarned

  // Check if streak should continue
  const lastUpdate = new Date(profile.updated_at)
  const now = new Date()
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

  let newStreak = profile.streak ?? 0
  if (daysSinceUpdate <= 0) {
    // Same day - streak already counted, do not increment again
    newStreak = Math.max(1, profile.streak ?? 0)
  } else if (daysSinceUpdate === 1) {
    // Consecutive day - extend streak
    newStreak = (profile.streak ?? 0) + 1
  } else {
    // Gap in days - streak resets
    newStreak = 1
  }

  // Calculate new level (every 1000 XP)
  const newLevel = Math.floor(newXp / 1000) + 1

  await supabase
    .from('profiles')
    .update({
      xp: newXp,
      streak: newStreak,
      level: newLevel,
      updated_at: now.toISOString(),
    })
    .eq('id', userId)
}

/**
 * Get user's recent study sessions
 */
export async function getRecentSessions(userId: string, limit: number = 10, supabase = createClient()): Promise<StudySessionRecord[]> {
  if (!supabase) return []

  const { data } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  return (
    data?.map((s) => ({
      id: String(s.id),
      userId: String(s.user_id),
      sessionType: s.session_type,
      startedAt: String(s.started_at),
      finishedAt: s.finished_at ? String(s.finished_at) : undefined,
      durationSeconds: Number(s.duration_seconds),
      questionsCount: Number(s.questions_count),
      correctCount: Number(s.correct_count),
      xpEarned: Number(s.xp_earned),
    })) || []
  )
}

/**
 * Get total study time for user
 */
export async function getTotalStudyTime(userId: string, supabase = createClient()): Promise<number> {
  if (!supabase) return 0

  const { data } = await supabase
    .from('study_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .not('finished_at', 'is', null)

  if (!data) return 0

  const totalSeconds = data.reduce((sum, s) => sum + (Number(s.duration_seconds) || 0), 0)
  return Math.round(totalSeconds / 3600) // Convert to hours
}
