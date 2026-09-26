/**
 * MATHEON — pierwszy start ucznia po rejestracji.
 *
 * Kreator zbiera to, czego nie da się zgadnąć: poziom matury, datę egzaminu,
 * cel punktowy, dni i czas nauki. Wybory trafiają do `profiles` (poziom, dzienny cel)
 * oraz do pierwszego planu nauki (`createAdaptivePlan`).
 *
 * Świadomie **nie** dodajemy kolumny `onboarding_completed`: brakiem aktywnego planu
 * sygnalizujemy, że uczeń nie przeszedł kreatora. Dzięki temu funkcja działa na
 * obecnym schemacie i nie wymaga migracji.
 */
import { createClient } from '@/lib/supabase/client'
import { createAdaptivePlan } from '@/lib/learning/planner'
import { getCurrentUserId, type AnyClient } from '@/lib/learning/skill-state'

export interface OnboardingChoices {
  /** Poziom matury docelowej (mapowany 1:1 na `profiles.preferred_level`). */
  goal: 'basic' | 'extended'
  /** Data matury w formacie `YYYY-MM-DD` (albo brak, gdy uczeń jeszcze jej nie zna). */
  examDate: string | null
  /** Cel punktowy w procentach (1–100). */
  targetScore: number
  /** Dni tygodnia nauki: 1 = poniedziałek … 7 = niedziela. */
  studyDays: number[]
  /** Dzienny budżet czasu nauki w minutach. */
  dailyMinutes: number
}

export const DAILY_MINUTES_OPTIONS = [15, 30, 45, 60, 90] as const
export const TARGET_SCORE_OPTIONS = [50, 60, 70, 80, 90, 100] as const

export const DEFAULT_ONBOARDING: OnboardingChoices = {
  goal: 'basic',
  examDate: null,
  targetScore: 80,
  studyDays: [1, 2, 3, 4, 5],
  dailyMinutes: 30,
}

/** Etykiety dni tygodnia w numeracji planera (1 = poniedziałek … 7 = niedziela). */
export const WEEKDAY_LABELS: Array<{ value: number; short: string; long: string }> = [
  { value: 1, short: 'Pon', long: 'Poniedziałek' },
  { value: 2, short: 'Wt', long: 'Wtorek' },
  { value: 3, short: 'Śr', long: 'Środa' },
  { value: 4, short: 'Czw', long: 'Czwartek' },
  { value: 5, short: 'Pt', long: 'Piątek' },
  { value: 6, short: 'Sob', long: 'Sobota' },
  { value: 7, short: 'Ndz', long: 'Niedziela' },
]

/**
 * Długość jednej sesji wyprowadzona z dziennego budżetu: plan układa sesje
 * tak, żeby mieściły się w limicie dnia, ale nie były ani mikroskopijne, ani nużące.
 */
export function sessionMinutesFor(dailyMinutes: number): number {
  return Math.min(45, Math.max(15, Math.round(dailyMinutes / 2)))
}

export const MIN_DAILY_MINUTES = 10
export const MAX_DAILY_MINUTES = 240

/** Normalizuje wybory do postaci akceptowanej przez bazę (CHECK-i i enumy). */
export function normalizeChoices(input: OnboardingChoices): OnboardingChoices {
  const dailyMinutes = Math.min(MAX_DAILY_MINUTES, Math.max(MIN_DAILY_MINUTES, Math.round(input.dailyMinutes)))
  const targetScore = Math.min(100, Math.max(1, Math.round(input.targetScore)))
  const studyDays = Array.from(new Set(input.studyDays.filter((day) => day >= 1 && day <= 7))).sort((a, b) => a - b)
  const examDate = input.examDate && /^\d{4}-\d{2}-\d{2}$/.test(input.examDate) ? input.examDate : null
  return { ...input, dailyMinutes, targetScore, studyDays: studyDays.length ? studyDays : DEFAULT_ONBOARDING.studyDays, examDate }
}

export async function hasActivePlan(userId: string, supabase: AnyClient = createClient()): Promise<boolean> {
  if (!supabase || !userId) return false
  const { data } = await supabase
    .from('study_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  return Boolean(data)
}

/**
 * Zapisuje wybory kreatora i uruchamia pierwszy plan nauki.
 * Kolejność jest istotna: najpierw profil, potem plan — plan czyta `topics` i postęp,
 * więc nie zależy od profilu, ale użytkownik powinien widzieć spójny stan.
 */
export async function completeOnboarding(input: OnboardingChoices): Promise<{ ok: boolean; error?: string }> {
  const choices = normalizeChoices(input)
  const supabase = createClient()
  if (!supabase) return { ok: false, error: 'Supabase nie jest skonfigurowany, więc nie mogę zapisać ustawień.' }

  const userId = await getCurrentUserId(supabase)
  if (!userId) return { ok: false, error: 'Sesja wygasła — zaloguj się ponownie.' }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        preferred_level: choices.goal,
        daily_goal_minutes: choices.dailyMinutes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

  if (profileError) return { ok: false, error: 'Nie udało się zapisać profilu. Spróbuj ponownie.' }

  const created = await createAdaptivePlan({
    goal: choices.goal,
    targetScore: choices.targetScore,
    examDate: choices.examDate,
    dailyMinutes: choices.dailyMinutes,
    studyDays: choices.studyDays,
    sessionMinutes: sessionMinutesFor(choices.dailyMinutes),
  })

  if (!created) return { ok: false, error: 'Profil zapisany, ale nie udało się utworzyć planu nauki.' }
  return { ok: true }
}
