'use client'

/**
 * MATHEON — wykresy statystyk.
 *
 * Rysowane własnym SVG w tej samej palecie i tej samej geometrii co figury lekcji
 * (`components/figure.tsx`): brak dodatkowej biblioteki, spójny wygląd, pełna kontrola
 * nad tym, jak wygląda brak danych. Każdy słupek i punkt ma natywny tooltip (`<title>`).
 */
import { useMemo } from 'react'
import type { MasteryTrendPoint, TopicAccuracy } from '@/lib/learning/insights'

const VIOLET = '#a78bfa'
const BLUE = '#60a5fa'
const EMERALD = '#34d399'
const AMBER = '#fbbf24'
const ROSE = '#fb7185'
const GRID = 'rgba(148,163,184,0.14)'
const AXIS = '#64748b'
const TICK_LABEL = '#94a3b8'

function shortDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${Number(day)}.${Number(month)}.${year.slice(2)}`
}

function weekdayShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('pl-PL', { weekday: 'short', timeZone: 'UTC' })
}

/* ------------------------------ trend mastery ------------------------------ */

export function MasteryTrendChart({ points }: { points: MasteryTrendPoint[] }) {
  const geometry = useMemo(() => {
    const width = 640
    const height = 200
    const padLeft = 36
    const padRight = 14
    const padTop = 16
    const padBottom = 26
    const innerWidth = width - padLeft - padRight
    const innerHeight = height - padTop - padBottom
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0
    const sx = (index: number) => padLeft + index * step
    const sy = (value: number) => padTop + (1 - value / 100) * innerHeight
    const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${sx(index).toFixed(1)},${sy(point.mastery).toFixed(1)}`).join(' ')
    const area = points.length
      ? `${line} L${sx(points.length - 1).toFixed(1)},${(height - padBottom).toFixed(1)} L${padLeft},${(height - padBottom).toFixed(1)} Z`
      : ''
    return { width, height, padLeft, padRight, padTop, padBottom, innerHeight, sx, sy, line, area }
  }, [points])

  if (!points.length) {
    return <p className="mt-4 text-sm text-slate-500">Brak historii odpowiedzi — trend pojawi się po pierwszej sesji.</p>
  }

  return (
    <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} className="mt-4 h-52 w-full" role="img" aria-label="Trend mastery w czasie">
      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line x1={geometry.padLeft} x2={geometry.width - geometry.padRight} y1={geometry.sy(value)} y2={geometry.sy(value)} stroke={GRID} strokeWidth={1} />
          <text x={geometry.padLeft - 8} y={geometry.sy(value) + 3.5} textAnchor="end" fontSize={9} fill={TICK_LABEL}>{value}%</text>
        </g>
      ))}

      <path d={geometry.area} fill="rgba(167,139,250,0.16)" />
      <path d={geometry.line} fill="none" stroke={VIOLET} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {points.map((point, index) => (
        <circle key={point.date} cx={geometry.sx(index)} cy={geometry.sy(point.mastery)} r={index === points.length - 1 ? 3.4 : 2.2} fill={index === points.length - 1 ? VIOLET : '#0b0b12'} stroke={VIOLET} strokeWidth={1.4}>
          <title>{`${shortDate(point.date)} · mastery ${point.mastery}% · ${point.answers} odpowiedzi`}</title>
        </circle>
      ))}

      <line x1={geometry.padLeft} x2={geometry.width - geometry.padRight} y1={geometry.height - geometry.padBottom} y2={geometry.height - geometry.padBottom} stroke={AXIS} strokeWidth={1} />
      <text x={geometry.padLeft} y={geometry.height - 8} fontSize={9} fill={TICK_LABEL}>{shortDate(points[0].date)}</text>
      <text x={geometry.width - geometry.padRight} y={geometry.height - 8} textAnchor="end" fontSize={9} fill={TICK_LABEL}>{shortDate(points[points.length - 1].date)}</text>
    </svg>
  )
}

/* ---------------------------- aktywność dzienna ---------------------------- */

export function DailyActivityChart({ points }: { points: MasteryTrendPoint[] }) {
  const geometry = useMemo(() => {
    const width = 640
    const height = 90
    const padBottom = 18
    const innerHeight = height - padBottom - 6
    const max = Math.max(1, ...points.map((point) => point.answers))
    const slot = points.length ? width / points.length : width
    const barWidth = Math.max(2, slot * 0.62)
    return { width, height, innerHeight, max, slot, barWidth, padBottom }
  }, [points])

  if (!points.length) return <p className="mt-4 text-sm text-slate-500">Brak danych o aktywności.</p>

  return (
    <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} className="mt-4 h-24 w-full" role="img" aria-label="Liczba odpowiedzi dziennie">
      {points.map((point, index) => {
        const barHeight = point.answers ? Math.max(3, (point.answers / geometry.max) * geometry.innerHeight) : 1.5
        const x = index * geometry.slot + (geometry.slot - geometry.barWidth) / 2
        const y = geometry.height - geometry.padBottom - barHeight
        const fill = point.answers ? (point.date === points[points.length - 1].date ? VIOLET : BLUE) : 'rgba(148,163,184,0.22)'
        return (
          <rect key={point.date} x={x.toFixed(1)} y={y.toFixed(1)} width={geometry.barWidth.toFixed(1)} height={barHeight.toFixed(1)} rx={2} fill={fill}>
            <title>{`${shortDate(point.date)} (${weekdayShort(point.date)}) · ${point.answers} odpowiedzi`}</title>
          </rect>
        )
      })}
      <line x1={0} x2={geometry.width} y1={geometry.height - geometry.padBottom} y2={geometry.height - geometry.padBottom} stroke={GRID} strokeWidth={1} />
      <text x={0} y={geometry.height - 6} fontSize={9} fill={TICK_LABEL}>max {geometry.max} / dzień</text>
      <text x={geometry.width} y={geometry.height - 6} textAnchor="end" fontSize={9} fill={TICK_LABEL}>dziś</text>
    </svg>
  )
}

/* -------------------------- skuteczność per dział -------------------------- */

function accuracyColor(accuracy: number): string {
  if (accuracy < 50) return ROSE
  if (accuracy < 75) return AMBER
  return EMERALD
}

export function TopicAccuracyList({ topics, limit = 8 }: { topics: TopicAccuracy[]; limit?: number }) {
  if (!topics.length) {
    return <p className="mt-4 text-sm text-slate-500">Rozwiąż zadania z co najmniej jednego działu, żeby zobaczyć skuteczność.</p>
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      {topics.slice(0, limit).map((topic) => (
        <div key={topic.topicId}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-300">{topic.name}</span>
            <span className="shrink-0 text-slate-500">{topic.accuracy}% · {topic.correct}/{topic.attempts}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(2, topic.accuracy))}%`, backgroundColor: accuracyColor(topic.accuracy) }} />
          </div>
          <p className="mt-1 text-[10px] text-slate-600">mastery działu {topic.mastery}%</p>
        </div>
      ))}
    </div>
  )
}
