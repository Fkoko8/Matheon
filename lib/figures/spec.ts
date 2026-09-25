/**
 * Deklaratywne specyfikacje figur w treści lekcji i zadań MATHEON.
 *
 * Treść autorska opisuje figurę jako dane (JSON), a `components/figure.tsx`
 * renderuje ją jako SVG. Dzięki temu treść pozostaje przenośna (baza, RAG,
 * importer), a rysunek jest spójny wizualnie w całej aplikacji.
 *
 * Trzy rodzaje figur:
 *  - `plot`       — układ współrzędnych z wykresami funkcji (parser `evaluate.ts`),
 *  - `geometry`   — figury płaskie: odcinki, okręgi, łuki, kąty, wielokąty, trójkąty,
 *  - `numberline` — oś liczbowa z kropkami i przedziałami.
 *
 * Wszystkie wartości liczbowe są walidowane i ograniczane (`clamp`), więc
 * uszkodzone dane z bazy nie mogą zepsuć renderowania ani layoutu.
 */

export type FigureSpec = PlotFigure | GeometryFigure | NumberLineFigure

interface FigureBase {
  /** Podpis pod rysunkiem (może zawierać LaTeX w $...$). */
  caption?: string
}

/* ------------------------------- wykresy ------------------------------- */

export interface PlotFigure extends FigureBase {
  kind: 'plot'
  /** Zakres osi X (i Y, o ile nie wyliczymy z danych). */
  xMin: number
  xMax: number
  yMin?: number
  yMax?: number
  /** Opisy osi, domyślnie x i y. */
  xLabel?: string
  yLabel?: string
  /** Krzywe do narysowania. */
  curves: PlotCurve[]
  /** Punkty zaznaczone na wykresie (np. wierzchołek, przecięcia z osiami). */
  points?: PlotPoint[]
  /** Przerywane linie pomocnicze (np. asymptoty, linia wierzchołka). */
  guides?: PlotGuide[]
  /** Zamalowane obszary (np. pole pod wykresem, dziedzina). */
  regions?: PlotRegion[]
}

export interface PlotCurve {
  /** Wyrażenie w zmiennej x, np. "x^2-2x-3" albo "sin(x)". */
  expr: string
  /** Etykieta krzywej, np. "f(x)=x^2-3" — może zawierać LaTeX. */
  label?: string
  color: FigureColor
  /** Styl linii: ciągła (domyślnie), przerywana (np. asymptota). */
  dashed?: boolean
  /** Grubość linii w px (domyślnie 2). */
  width?: number
  /** Zakres rysowania tej krzywej (domyślnie cały wykres). */
  xMin?: number
  xMax?: number
}

export interface PlotPoint {
  x: number
  y: number
  label?: string
  color: FigureColor
  /** Kształt punktu: kółko (domyślnie), kwadrat, krzyżyk. */
  shape?: 'dot' | 'square' | 'cross'
}

export interface PlotGuide {
  /** Linia pionowa x = value albo pozioma y = value. */
  orientation: 'vertical' | 'horizontal'
  value: number
  label?: string
  dashed?: boolean
}

export interface PlotRegion {
  /** Zamalowanie między krzywymi y = from(x) i y = to(x) na przedziale [xMin, xMax]. */
  from: string
  to: string
  xMin: number
  xMax: number
  color: FigureColor
}

export type FigureColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate'

/* ------------------------------- geometria ------------------------------- */

export interface GeometryFigure extends FigureBase {
  kind: 'geometry'
  /** Elementy w kolejności rysowania; współrzędne w dowolnej skali — viewBox dopasuje się. */
  elements: GeometryElement[]
  /** Etykiety punktów: id z elementów (a1/a2/b1/b2…) → wyświetlana nazwa (A, B, α…). */
  labels?: Record<string, string>
  /** Wymuszenie proporcji 1:1 (ważne dla kątów i okręgów). */
  equalAspect?: boolean
}

export type GeometryElement =
  | { type: 'segment'; a1: [number, number]; a2: [number, number]; color: FigureColor; dashed?: boolean; width?: number }
  | { type: 'polyline'; points: [number, number][]; color: FigureColor; dashed?: boolean; closed?: boolean }
  | { type: 'circle'; c: [number, number]; r: number; color: FigureColor; dashed?: boolean; fill?: FigureColor }
  | { type: 'arc'; c: [number, number]; r: number; fromDeg: number; toDeg: number; color: FigureColor; fill?: FigureColor }
  | { type: 'angle'; vertex: [number, number]; fromDeg: number; toDeg: number; r?: number; color?: FigureColor; label?: string }
  | { type: 'rightAngle'; vertex: [number, number]; dirDeg: number; size?: number; color?: FigureColor }
  | { type: 'point'; at: [number, number]; color?: FigureColor }
  /** Punkt nazwany — zawsze z etykietą (wygodniejszy niż goły `point`). */
  | { type: 'namedPoint'; id: string; at: [number, number]; color?: FigureColor }

/* ----------------------------- oś liczbowa ----------------------------- */

export interface NumberLineFigure extends FigureBase {
  kind: 'numberline'
  min: number
  max: number
  /** Krok między podziałkami (domyślnie 1). */
  step?: number
  points?: Array<{ value: number; label?: string; color: FigureColor; hollow?: boolean }>
  intervals?: Array<{ from: number; to: number; fromClosed?: boolean; toClosed?: boolean; color: FigureColor; label?: string }>
}

/* ----------------------------- parsowanie ----------------------------- */

const COLORS: FigureColor[] = ['violet', 'blue', 'emerald', 'amber', 'rose', 'slate']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Liczba skończona i ograniczona do rozsądnego zakresu (ochrona przed śmieciowymi danymi). */
function num(value: unknown, fallback: number, min = -10_000, max = 10_000): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return clamp(parsed, min, max)
}

function optNum(value: unknown, min?: number, max?: number): number | undefined {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN
  if (!Number.isFinite(parsed)) return undefined
  if (min !== undefined || max !== undefined) return clamp(parsed, min ?? -10_000, max ?? 10_000)
  return parsed
}

function color(value: unknown, fallback: FigureColor = 'violet'): FigureColor {
  return typeof value === 'string' && (COLORS as string[]).includes(value) ? (value as FigureColor) : fallback
}

function str(value: unknown, max = 400): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  return value.slice(0, max)
}

function bool(value: unknown): boolean {
  return value === true
}

/** Zamienia dowolne dane (z JSONB bazy lub z treści TS) na bezpieczną specyfikację. */
export function parseFigureSpec(input: unknown): FigureSpec | null {
  if (!isRecord(input)) return null
  const kind = input.kind ?? input.figure
  const caption = str(input.caption, 240)

  if (kind === 'plot') return parsePlot(input, caption)
  if (kind === 'geometry') return parseGeometry(input, caption)
  if (kind === 'numberline') return parseNumberLine(input, caption)
  return null
}

/** Parsuje listę figur; ignoruje uszkodzone wpisy. */
export function parseFigureSpecs(input: unknown): FigureSpec[] {
  if (!input) return []
  const list = Array.isArray(input) ? input : [input]
  return list.map(parseFigureSpec).filter((figure): figure is FigureSpec => figure !== null)
}

function parsePlot(input: Record<string, unknown>, caption?: string): PlotFigure | null {
  const rawCurves = Array.isArray(input.curves) ? input.curves : []
  const curves = rawCurves
    .filter(isRecord)
    .map((raw) => ({
      expr: typeof raw.expr === 'string' ? raw.expr.slice(0, 200) : '',
      label: str(raw.label, 120),
      color: color(raw.color, 'violet'),
      dashed: bool(raw.dashed),
      width: clamp(optNum(raw.width, 0.5, 8) ?? 2, 0.5, 8),
      xMin: optNum(raw.xMin, -10_000, 10_000),
      xMax: optNum(raw.xMax, -10_000, 10_000),
    }))
    .filter((curve) => {
      if (!curve.expr) return false
      if (curve.xMin === undefined || curve.xMax === undefined) return curve.xMin === undefined && curve.xMax === undefined
      return curve.xMin < curve.xMax
    })

  const points = (Array.isArray(input.points) ? input.points : []).filter(isRecord).map((raw) => ({
    x: num(raw.x, 0),
    y: num(raw.y, 0),
    label: str(raw.label, 60),
    color: color(raw.color, 'amber'),
    shape: raw.shape === 'square' ? 'square' as const : raw.shape === 'cross' ? 'cross' as const : 'dot' as const,
  }))

  const guides = (Array.isArray(input.guides) ? input.guides : []).filter(isRecord).map((raw) => ({
    orientation: raw.orientation === 'horizontal' ? ('horizontal' as const) : ('vertical' as const),
    value: num(raw.value, 0),
    label: str(raw.label, 60),
    dashed: raw.dashed !== false,
  }))

  const regions = (Array.isArray(input.regions) ? input.regions : [])
    .filter(isRecord)
    .map((raw) => ({
      from: typeof raw.from === 'string' ? raw.from.slice(0, 200) : '',
      to: typeof raw.to === 'string' ? raw.to.slice(0, 200) : '',
      xMin: num(raw.xMin, -10, -100, 100),
      xMax: num(raw.xMax, 10, -100, 100),
      color: color(raw.color, 'blue'),
    }))
    .filter((region) => region.from && region.to && region.xMin < region.xMax)

  if (!curves.length && !points.length && !guides.length && !regions.length) return null

  const xMin = optNum(input.xMin, -1000, 1000) ?? -6
  const xMax = optNum(input.xMax, -1000, 1000) ?? 6
  if (xMin >= xMax) return null

  return {
    kind: 'plot',
    caption,
    xMin,
    xMax,
    yMin: optNum(input.yMin, -1000, 1000),
    yMax: optNum(input.yMax, -1000, 1000),
    xLabel: str(input.xLabel, 40),
    yLabel: str(input.yLabel, 40),
    curves,
    points: points.slice(0, 24),
    guides: guides.slice(0, 8),
    regions: regions.slice(0, 4),
  }
}

function parseGeometry(input: Record<string, unknown>, caption?: string): GeometryFigure | null {
  const rawElements = Array.isArray(input.elements) ? input.elements : []
  const elements: GeometryElement[] = []

  for (const raw of rawElements.filter(isRecord).slice(0, 60)) {
    const type = raw.type
    const pair = (value: unknown, fallback: [number, number] = [0, 0]): [number, number] => {
      if (!Array.isArray(value)) return fallback
      return [num(value[0], fallback[0]), num(value[1], fallback[1])]
    }
    const dashColor = { color: color(raw.color), dashed: bool(raw.dashed) }
    if (type === 'segment') {
      elements.push({ type: 'segment', a1: pair(raw.a1), a2: pair(raw.a2), ...dashColor, width: clamp(optNum(raw.width, 0.5, 8) ?? 2, 0.5, 8) })
    } else if (type === 'polyline') {
      const points = (Array.isArray(raw.points) ? raw.points : []).filter(Array.isArray).map((p) => pair(p)).slice(0, 30)
      if (points.length >= 2) elements.push({ type: 'polyline', points, ...dashColor, closed: bool(raw.closed) })
    } else if (type === 'circle') {
      const r = optNum(raw.r, 0.01, 10_000)
      if (r !== undefined) elements.push({ type: 'circle', c: pair(raw.c), r, ...dashColor, fill: raw.fill === undefined ? undefined : color(raw.fill) })
    } else if (type === 'arc') {
      const r = optNum(raw.r, 0.01, 10_000)
      const from = optNum(raw.fromDeg, -3600, 3600)
      const to = optNum(raw.toDeg, -3600, 3600)
      if (r !== undefined && from !== undefined && to !== undefined) elements.push({ type: 'arc', c: pair(raw.c), r, fromDeg: from, toDeg: to, color: color(raw.color), fill: raw.fill === undefined ? undefined : color(raw.fill) })
    } else if (type === 'angle') {
      const from = optNum(raw.fromDeg, -3600, 3600)
      const to = optNum(raw.toDeg, -3600, 3600)
      if (from !== undefined && to !== undefined) elements.push({ type: 'angle', vertex: pair(raw.vertex), fromDeg: from, toDeg: to, r: optNum(raw.r, 0.05, 1000), color: color(raw.color, 'amber'), label: str(raw.label, 20) })
    } else if (type === 'rightAngle') {
      elements.push({ type: 'rightAngle', vertex: pair(raw.vertex), dirDeg: num(raw.dirDeg, 0, -3600, 3600), size: optNum(raw.size, 0.05, 1000), color: color(raw.color, 'amber') })
    } else if (type === 'point') {
      elements.push({ type: 'point', at: pair(raw.at), color: color(raw.color, 'rose') })
    } else if (type === 'namedPoint') {
      elements.push({ type: 'namedPoint', id: str(raw.id, 30) ?? `p${elements.length}`, at: pair(raw.at), color: color(raw.color, 'rose') })
    }
  }

  if (!elements.length) return null

  const labels: Record<string, string> = {}
  const rawLabels = input.labels
  if (isRecord(rawLabels)) {
    for (const [key, value] of Object.entries(rawLabels).slice(0, 40)) {
      const label = str(value, 20)
      if (label) labels[key.slice(0, 30)] = label
    }
  }

  return {
    kind: 'geometry',
    caption,
    elements,
    labels,
    equalAspect: input.equalAspect !== false,
  }
}

function parseNumberLine(input: Record<string, unknown>, caption?: string): NumberLineFigure | null {
  const min = optNum(input.min, -10_000, 10_000) ?? -5
  const max = optNum(input.max, -10_000, 10_000) ?? 5
  if (min >= max) return null

  const points = (Array.isArray(input.points) ? input.points : []).filter(isRecord).map((raw) => ({
    value: num(raw.value, min),
    label: str(raw.label, 40),
    color: color(raw.color, 'rose'),
    hollow: bool(raw.hollow),
  }))

  const intervals = (Array.isArray(input.intervals) ? input.intervals : [])
    .filter(isRecord)
    .map((raw) => ({
      from: num(raw.from, min),
      to: num(raw.to, max),
      fromClosed: raw.fromClosed !== false,
      toClosed: raw.toClosed !== false,
      color: color(raw.color, 'blue'),
      label: str(raw.label, 40),
    }))
    .filter((interval) => interval.from < interval.to)

  if (!points.length && !intervals.length) return null

  return {
    kind: 'numberline',
    caption,
    min,
    max,
    step: optNum(input.step, 0.01, 1000) ?? 1,
    points: points.slice(0, 20),
    intervals: intervals.slice(0, 6),
  }
}
