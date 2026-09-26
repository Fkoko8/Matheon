/**
 * MATHEON — limity i dziennik użycia AI (Faza 4).
 *
 * Limity siedzą w bazie (`ai_request_logs` z migracji 006), a nie w pamięci procesu,
 * więc obowiązują wszystkich użytkowników tak samo, niezależnie od instancji serwera
 * i od restartu. Rodzaj żądania zapisujemy w kolumnie `mode` z prefiksem
 * (`tutor:hint`, `generator:personalized`), więc liczenie nie wymaga zmiany schematu.
 *
 * Gdy zapytanie o licznik zawiedzie (np. brak tabeli), nie blokujemy ucznia:
 * schodzimy na awaryjny licznik w pamięci procesu — tylko na limit minutowy.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type AiKind = 'tutor' | 'generator'

export interface AiLimits {
  perMinute: number
  perDay: number
}

export const AI_LIMITS: Record<AiKind, AiLimits> = {
  tutor: { perMinute: 6, perDay: 80 },
  generator: { perMinute: 3, perDay: 40 },
}

export interface AiQuotaVerdict {
  allowed: boolean
  reason?: 'per_minute' | 'per_day'
  usedToday: number
  limit: number
  /** `db` = licznik z bazy, `local` = awaryjny licznik w pamięci procesu. */
  source: 'db' | 'local'
}

const localWindows = new Map<string, { count: number; resetAt: number }>()

function localVerdict(key: string, limits: AiLimits, now: number): AiQuotaVerdict {
  const current = localWindows.get(key)
  if (!current || current.resetAt <= now) {
    localWindows.set(key, { count: 1, resetAt: now + 60_000 })
    return { allowed: true, usedToday: 0, limit: limits.perDay, source: 'local' }
  }
  current.count += 1
  if (current.count > limits.perMinute) {
    return { allowed: false, reason: 'per_minute', usedToday: 0, limit: limits.perMinute, source: 'local' }
  }
  return { allowed: true, usedToday: 0, limit: limits.perDay, source: 'local' }
}

function modePrefix(kind: AiKind): string {
  return `${kind}:`
}

/**
 * Czy użytkownik może wykonać kolejne żądanie danego rodzaju.
 * Liczymy żądania z ostatnich 24 godzin (limit dzienny) i z ostatniej minuty (limit minutowy).
 */
export async function checkAiQuota(
  supabase: SupabaseClient | null,
  userId: string,
  kind: AiKind,
  now: Date = new Date(),
): Promise<AiQuotaVerdict> {
  const limits = AI_LIMITS[kind]
  if (!supabase) return localVerdict(`${userId}:${kind}`, limits, now.getTime())

  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const minuteAgo = new Date(now.getTime() - 60 * 1000)

  const [dayCount, minuteCount] = await Promise.all([
    supabase
      .from('ai_request_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .like('mode', `${modePrefix(kind)}%`)
      .gte('created_at', dayAgo.toISOString()),
    supabase
      .from('ai_request_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .like('mode', `${modePrefix(kind)}%`)
      .gte('created_at', minuteAgo.toISOString()),
  ])

  if (dayCount.error || minuteCount.error) {
    return localVerdict(`${userId}:${kind}`, limits, now.getTime())
  }

  const usedToday = Number(dayCount.count ?? 0)
  const usedMinute = Number(minuteCount.count ?? 0)
  if (usedMinute >= limits.perMinute) {
    return { allowed: false, reason: 'per_minute', usedToday, limit: limits.perMinute, source: 'db' }
  }
  if (usedToday >= limits.perDay) {
    return { allowed: false, reason: 'per_day', usedToday, limit: limits.perDay, source: 'db' }
  }
  return { allowed: true, usedToday, limit: limits.perDay, source: 'db' }
}

export interface AiRequestLog {
  userId: string
  kind: AiKind
  /** Tryb szczegółowy (np. `hint`, `personalized`) — zapisywany po prefiksie rodzaju. */
  mode?: string
  tools?: string[]
  retrievalCount?: number
  responseMs?: number
  provider?: string
  success: boolean
}

/**
 * Zapis żądania do dziennika. To jednocześnie licznik limitów, źródło statystyk
 * kosztów i sygnał, że AI faktycznie odpowiedziało (albo że padło).
 */
export async function logAiRequest(supabase: SupabaseClient | null, input: AiRequestLog): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('ai_request_logs').insert({
    user_id: input.userId,
    mode: `${modePrefix(input.kind)}${input.mode ?? 'default'}`,
    tools: input.tools ?? [],
    retrieval_count: input.retrievalCount ?? 0,
    response_ms: input.responseMs ?? null,
    provider: input.provider ?? 'vercel-ai-gateway',
    success: input.success,
  })
  return !error
}

/** Komunikat dla ucznia, gdy limit został wykorzystany. */
export function quotaMessage(verdict: AiQuotaVerdict, kind: AiKind): string {
  const who = kind === 'tutor' ? 'Tutora' : 'Generatora'
  if (verdict.reason === 'per_minute') return `Zwolnij tempo — limit ${who} to ${verdict.limit} żądań na minutę.`
  return `Dzienny limit ${who} (${verdict.limit} żądań) został wykorzystany. Wróć jutro albo poćwicz z banku zadań.`
}
