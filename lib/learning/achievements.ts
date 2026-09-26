/**
 * MATHEON — osiągnięcia ucznia.
 *
 * Katalog osiągnięć żyje w tabeli `achievements` (seed: „Pierwszy krok”, „Regularność”,
 * „Mistrz działu”, „Setka zadań”), a zdobycze w `user_achievements` (RLS: uczeń widzi
 * tylko swoje). Reguły zdobycia są deklaratywne (`condition_type` + `condition_value`),
 * więc silnik jest wspólny dla wszystkich:
 *
 *  - `answers`        — liczba udzielonych odpowiedzi (zdarzenia `answer`),
 *  - `correct_streak` — najdłuższa seria poprawnych odpowiedzi z rzędu,
 *  - `streak`         — aktualna seria dni nauki (z profilu),
 *  - `mastery`        — najwyższa mastery pojedynczej umiejętności (w %),
 *  - `lessons`        — liczba otwartych lekcji (zdarzenia `lesson_opened`).
 *
 * Zdobycie osiągnięcia to zwykły INSERT z pominięciem konfliktu — jeśli rekord już
 * istnieje, nic się nie zmienia (idempotentnie). Reguła może też przyznać XP po stronie
 * profilu — robimy to wyłącznie przez `xp_reward` katalogu, bez ruszania poziomów.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadAnswerHistory, loadSkillStates, type AnyClient } from '@/lib/learning/skill-state'

export interface AchievementRow {
  id: string
  name: string
  description: string
  icon: string | null
  xpReward: number
  conditionType: string
  conditionValue: number
}

export interface EarnedAchievement {
  achievementId: string
  earnedAt: string
}

/** Statystyki ucznia potrzebne do sprawdzenia reguł — wszystkie z realnej historii. */
export interface AchievementStats {
  answers: number
  correct: number
  correctStreak: number
  bestSkillMastery: number
  lessonsOpened: number
  streak: number
}

export function emptyAchievementStats(): AchievementStats {
  return { answers: 0, correct: 0, correctStreak: 0, bestSkillMastery: 0, lessonsOpened: 0, streak: 0 }
}

/** Statystyki wyprowadzone wyłącznie z dziennika zdarzeń i stanu umiejętności. */
export async function loadAchievementStats(userId: string, supabase: AnyClient, profileStreak = 0): Promise<AchievementStats> {
  if (!supabase || !userId) return emptyAchievementStats()

  const [history, skillStates] = await Promise.all([loadAnswerHistory(userId, supabase), loadSkillStates(userId, supabase)])

  const { data: lessons } = await supabase
    .from('learning_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'lesson_opened')

  let correctStreak = 0
  let bestStreak = 0
  for (const entry of history) {
    if (entry.evidence.isCorrect) {
      correctStreak += 1
      bestStreak = Math.max(bestStreak, correctStreak)
    } else {
      correctStreak = 0
    }
  }

  let bestSkillMastery = 0
  for (const state of skillStates.values()) bestSkillMastery = Math.max(bestSkillMastery, state.mastery)

  return {
    answers: history.length,
    correct: history.filter((entry) => entry.evidence.isCorrect).length,
    correctStreak: bestStreak,
    bestSkillMastery,
    lessonsOpened: lessons?.length ?? 0,
    streak: profileStreak,
  }
}

/** Czy reguła osiągnięcia jest spełniona dla podanych statystyk. */
export function isSatisfied(conditionType: string, conditionValue: number, stats: AchievementStats): boolean {
  switch (conditionType) {
    case 'answers':
      return stats.answers >= conditionValue
    case 'correct_streak':
      return stats.correctStreak >= conditionValue
    case 'mastery':
      return stats.bestSkillMastery >= conditionValue
    case 'lessons':
      return stats.lessonsOpened >= conditionValue
    case 'streak':
      return stats.streak >= conditionValue
    default:
      return false
  }
}

/** Katalog osiągnięć z bazy. */
export async function loadAchievementCatalog(supabase: AnyClient): Promise<AchievementRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('achievements')
    .select('id,name,description,icon,xp_reward,condition_type,condition_value')
    .order('condition_value')
  return (
    data?.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      description: String(row.description),
      icon: row.icon ? String(row.icon) : null,
      xpReward: Number(row.xp_reward ?? 0),
      conditionType: String(row.condition_type ?? ''),
      conditionValue: Number(row.condition_value ?? 0),
    })) ?? []
  )
}

/** Zdobycze ucznia z bazy. */
export async function loadEarnedAchievements(userId: string, supabase: AnyClient): Promise<Map<string, EarnedAchievement>> {
  const earned = new Map<string, EarnedAchievement>()
  if (!supabase || !userId) return earned
  const { data } = await supabase.from('user_achievements').select('achievement_id,earned_at').eq('user_id', userId)
  for (const row of data ?? []) {
    earned.set(String(row.achievement_id), { achievementId: String(row.achievement_id), earnedAt: String(row.earned_at) })
  }
  return earned
}

export interface SyncResult {
  /** Osiągnięcia przyznane przy tym przebiegu (nowe). */
  newlyEarned: AchievementRow[]
  /** Suma XP za nowo zdobyte osiągnięcia (do dodania w profilu). */
  xpGained: number
}

/**
 * Sprawdza wszystkie reguły i przyznaje brakujące osiągnięcia (INSERT ... ON CONFLICT DO NOTHING).
 * Zwraca nowo zdobyte — UI pokazuje toast, a profil dostaje XP.
 */
export async function syncAchievements(
  userId: string,
  supabase: AnyClient,
  stats: AchievementStats,
): Promise<SyncResult> {
  const result: SyncResult = { newlyEarned: [], xpGained: 0 }
  if (!supabase || !userId) return result

  const [catalog, earned] = await Promise.all([loadAchievementCatalog(supabase), loadEarnedAchievements(userId, supabase)])

  for (const achievement of catalog) {
    if (earned.has(achievement.id)) continue
    if (!isSatisfied(achievement.conditionType, achievement.conditionValue, stats)) continue

    const { error } = await supabase
      .from('user_achievements')
      .upsert({ user_id: userId, achievement_id: achievement.id }, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true })

    if (!error) {
      result.newlyEarned.push(achievement)
      result.xpGained += achievement.xpReward
    }
  }

  return result
}
