'use client'

/** Wspólne klocki sekcji Nauka — jedna paleta i jeden sposób pokazywania postępu. */
import { Check, CircleDashed, Flame, Loader2, RefreshCw, Sparkles } from 'lucide-react'

const BAR_TONE = {
  violet: 'bg-violet-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  slate: 'bg-slate-500',
} as const

export type Tone = keyof typeof BAR_TONE

/** Kolor progu: czerwony poniżej 40%, bursztynowy poniżej 70%, zielony powyżej. */
export function masteryTone(value: number): Tone {
  if (value < 40) return 'rose'
  if (value < 70) return 'amber'
  return 'emerald'
}

export function ProgressBar({ value, tone, size = 'md' }: { value: number; tone?: Tone; size?: 'sm' | 'md' }) {
  const height = size === 'sm' ? 'h-1' : 'h-1.5'
  const resolved = tone ?? masteryTone(value)
  return (
    <div className={`${height} overflow-hidden rounded-full bg-white/[0.07]`}>
      <div className={`h-full rounded-full transition-all ${BAR_TONE[resolved]}`} style={{ width: `${Math.min(100, Math.max(value > 0 ? 2 : 0, value))}%` }} />
    </div>
  )
}

export function Pill({ children, tone = 'slate', icon }: { children: React.ReactNode; tone?: Tone | 'violet'; icon?: React.ReactNode }) {
  const tones: Record<string, string> = {
    violet: 'border-violet-400/25 bg-violet-500/10 text-violet-200',
    emerald: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    rose: 'border-rose-400/25 bg-rose-400/10 text-rose-200',
    slate: 'border-white/[0.09] bg-white/[0.04] text-slate-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${tones[tone] ?? tones.slate}`}>
      {icon}{children}
    </span>
  )
}

/** Status zadania w ścieżce nauki: ukończone / w toku / do zrobienia. */
export function StatusPill({ state }: { state: 'done' | 'active' | 'todo' }) {
  if (state === 'done') return <Pill tone="emerald" icon={<Check size={11} />}>Ukończona</Pill>
  if (state === 'active') return <Pill tone="amber" icon={<Flame size={11} />}>W toku</Pill>
  return <Pill tone="slate" icon={<CircleDashed size={11} />}>Do zrobienia</Pill>
}

export function DifficultyDots({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Poziom trudności ${value}/5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span key={step} className={`size-1.5 rounded-full ${step <= value ? 'bg-violet-400' : 'bg-white/[0.13]'}`} />
      ))}
    </span>
  )
}

export function DuePill({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium text-amber-200">
      <RefreshCw size={11} /> {count} do powtórki
    </span>
  )
}

export function MasteryPill({ value, loading = false }: { value: number; loading?: boolean }) {
  if (loading) return <Pill tone="slate" icon={<Loader2 size={11} className="animate-spin" />}>liczę postęp</Pill>
  const tone = masteryTone(value)
  return (
    <Pill tone={tone === 'emerald' ? 'emerald' : tone === 'amber' ? 'amber' : 'rose'} icon={<Sparkles size={11} />}>
      mastery {value}%
    </Pill>
  )
}

/** „2 g 30 min” / „45 min” — czas czytania bez zbędnych zer. */
export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return minutes ? `${hours} g ${minutes} min` : `${hours} g`
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Termin powtórki po polsku. Wywołuj tylko po stronie klienta (po wczytaniu postępu). */
export function formatDue(iso: string | null, now: Date = new Date()): string {
  if (!iso) return 'brak terminu'
  const days = Math.round((new Date(iso).getTime() - now.getTime()) / DAY_MS)
  if (days <= 0) return 'teraz'
  if (days === 1) return 'jutro'
  if (days < 7) return `za ${days} dni`
  const weeks = Math.round(days / 7)
  return weeks === 1 ? 'za tydzień' : `za ${weeks} tyg.`
}
