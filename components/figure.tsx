'use client'

import { useMemo } from 'react'
import { MathText } from '@/components/math-text'
import { tryCompileExpression, type CompiledExpression } from '@/lib/figures/evaluate'
import { parseFigureSpecs, type FigureColor, type FigureSpec, type GeometryFigure, type NumberLineFigure, type PlotFigure } from '@/lib/figures/spec'

const COLOR_HEX: Record<FigureColor, string> = {
  violet: '#a78bfa',
  blue: '#60a5fa',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  slate: '#94a3b8',
}

const FILL_HEX: Record<FigureColor, string> = {
  violet: 'rgba(167,139,250,0.18)',
  blue: 'rgba(96,165,250,0.16)',
  emerald: 'rgba(52,211,153,0.16)',
  amber: 'rgba(251,191,36,0.16)',
  rose: 'rgba(251,113,133,0.16)',
  slate: 'rgba(148,163,184,0.16)',
}

const AXIS = '#64748b'
const GRID = 'rgba(148,163,184,0.14)'
const TICK_LABEL = '#94a3b8'

/** Formatuje liczbę na osi: bez zbędnych zer, krótkie ułamki. */
function tickLabel(value: number): string {
  if (Math.abs(value) < 1e-9) return '0'
  if (Number.isInteger(value)) return String(value)
  const rounded = Math.round(value * 100) / 100
  return String(rounded)
}

/* ------------------------------ wykres funkcji ------------------------------ */

interface PlotGeometry {
  width: number
  height: number
  padLeft: number
  padRight: number
  padTop: number
  padBottom: number
  sx: (x: number) => number
  sy: (y: number) => number
}

function niceStep(span: number, targetTicks = 10): number {
  if (span <= 0 || !Number.isFinite(span)) return 1
  const rough = span / targetTicks
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  for (const multiplier of [1, 2, 2.5, 5, 10]) {
    if (multiplier * magnitude >= rough) return multiplier * magnitude
  }
  return 10 * magnitude
}

/**
 * Rysuje krzywą jako listę segmentów: wartości nieokreślone (asymptoty, domena)
 * przerywają ścieżkę, a skoki w Y większe niż wysokość wykresu są odcinane,
 * żeby tan/cot nie rysowały pionowych artefaktów.
 */
function sampleCurve(fn: CompiledExpression, xMin: number, xMax: number, samples: number, yMin: number, yMax: number): Array<Array<[number, number]>> {
  const segments: Array<Array<[number, number]>> = []
  let current: Array<[number, number]> = []
  const step = (xMax - xMin) / samples
  const jumpLimit = (yMax - yMin) * 1.5

  let previous: number | null = null
  for (let index = 0; index <= samples; index += 1) {
    const x = xMin + index * step
    const y = fn(x)
    if (!Number.isFinite(y)) {
      if (current.length > 1) segments.push(current)
      current = []
      previous = null
      continue
    }
    if (previous !== null && Math.abs(y - previous) > jumpLimit) {
      if (current.length > 1) segments.push(current)
      current = []
    }
    current.push([x, y])
    previous = y
  }
  if (current.length > 1) segments.push(current)
  return segments
}

function PlotView({ figure }: { figure: PlotFigure }) {
  const view = useMemo(() => {
    const width = 560
    const height = 360
    const padLeft = 44
    const padRight = 16
    const padTop = 16
    const padBottom = 34

    // Zakres Y: z specyfikacji albo wyliczony z krzywych i punktów (2–98. percentyl, by asymptoty nie rozciągały skali).
    let yMin = figure.yMin
    let yMax = figure.yMax
    if (yMin === undefined || yMax === undefined) {
      const values: number[] = []
      for (const curve of figure.curves) {
        const fn = tryCompileExpression(curve.expr)
        if (!fn) continue
        const from = curve.xMin ?? figure.xMin
        const to = curve.xMax ?? figure.xMax
        for (let index = 0; index <= 400; index += 1) {
          const y = fn(from + ((to - from) * index) / 400)
          if (Number.isFinite(y)) values.push(y)
        }
      }
      for (const point of figure.points ?? []) values.push(point.y)
      values.sort((a, b) => a - b)
      if (values.length) {
        const low = values[Math.floor(values.length * 0.02)]
        const high = values[Math.ceil(values.length * 0.98) - 1]
        const pad = Math.max((high - low) * 0.12, 0.5)
        yMin = yMin ?? Math.min(low - pad, 0)
        yMax = yMax ?? Math.max(high + pad, 0)
      } else {
        yMin = yMin ?? -4
        yMax = yMax ?? 4
      }
    }
    if (yMin === yMax) yMax = yMin + 1

    const sx = (x: number) => padLeft + ((x - figure.xMin) / (figure.xMax - figure.xMin)) * (width - padLeft - padRight)
    const sy = (y: number) => padTop + (1 - (y - yMin) / (yMax - yMin)) * (height - padTop - padBottom)

    const xStep = niceStep(figure.xMax - figure.xMin)
    const yStep = niceStep(yMax - yMin)

    const xTicks: number[] = []
    for (let value = Math.ceil(figure.xMin / xStep) * xStep; value <= figure.xMax + 1e-9; value += xStep) xTicks.push(Math.round(value * 1e6) / 1e6)
    const yTicks: number[] = []
    for (let value = Math.ceil(yMin / yStep) * yStep; value <= yMax + 1e-9; value += yStep) yTicks.push(Math.round(value * 1e6) / 1e6)

    return { width, height, padLeft, padRight, padTop, padBottom, sx, sy, yMin, yMax, xTicks, yTicks, xStep, yStep }
  }, [figure])

  const { sx, sy, yMin, yMax, xTicks, yTicks } = view
  const zeroY = sy(0)
  const zeroX = sx(0)

  return (
    <svg viewBox={`0 0 ${view.width} ${view.height}`} className="h-auto w-full" role="img" aria-label={figure.caption ?? 'Wykres funkcji'}>
      {/* siatka */}
      {xTicks.map((value) => (
        <line key={`gx${value}`} x1={sx(value)} y1={view.padTop} x2={sx(value)} y2={view.height - view.padBottom} stroke={GRID} strokeWidth={1} />
      ))}
      {yTicks.map((value) => (
        <line key={`gy${value}`} x1={view.padLeft} y1={sy(value)} x2={view.width - view.padRight} y2={sy(value)} stroke={GRID} strokeWidth={1} />
      ))}

      {/* osie */}
      <line x1={view.padLeft} y1={zeroY} x2={view.width - view.padRight} y2={zeroY} stroke={AXIS} strokeWidth={1.4} />
      <line x1={zeroX} y1={view.padTop} x2={zeroX} y2={view.height - view.padBottom} stroke={AXIS} strokeWidth={1.4} />

      {/* strzałki osi */}
      <polygon points={`${view.width - view.padRight},${zeroY - 4} ${view.width - view.padRight},${zeroY + 4} ${view.width - view.padRight + 7},${zeroY}`} fill={AXIS} />
      <polygon points={`${zeroX - 4},${view.padTop} ${zeroX + 4},${view.padTop} ${zeroX},${view.padTop - 7}`} fill={AXIS} />

      {/* podpisy osi */}
      {xTicks.filter((value) => Math.abs(value) > 1e-9).map((value) => (
        <text key={`tx${value}`} x={sx(value)} y={zeroY + 15} textAnchor="middle" fontSize={10} fill={TICK_LABEL}>{tickLabel(value)}</text>
      ))}
      {yTicks.filter((value) => Math.abs(value) > 1e-9).map((value) => (
        <text key={`ty${value}`} x={view.padLeft - 6} y={sy(value) + 3} textAnchor="end" fontSize={10} fill={TICK_LABEL}>{tickLabel(value)}</text>
      ))}

      {/* zamalowane obszary między krzywymi */}
      {(figure.regions ?? []).map((region, regionIndex) => {
        const fromFn = tryCompileExpression(region.from)
        const toFn = tryCompileExpression(region.to)
        if (!fromFn || !toFn) return null
        const samples = 120
        const polygon: string[] = []
        for (let index = 0; index <= samples; index += 1) {
          const x = region.xMin + ((region.xMax - region.xMin) * index) / samples
          polygon.push(`${sx(x)},${sy(Math.min(yMax, Math.max(yMin, fromFn(x))))}`)
        }
        for (let index = samples; index >= 0; index -= 1) {
          const x = region.xMin + ((region.xMax - region.xMin) * index) / samples
          polygon.push(`${sx(x)},${sy(Math.min(yMax, Math.max(yMin, toFn(x))))}`)
        }
        return <polygon key={`rg${regionIndex}`} points={polygon.join(' ')} fill={FILL_HEX[region.color]} stroke="none" />
      })}

      {/* linie pomocnicze */}
      {(figure.guides ?? []).map((guide, guideIndex) => {
        const dash = guide.dashed ? '5 4' : undefined
        const stroke = COLOR_HEX.slate
        return guide.orientation === 'vertical'
          ? <line key={`gv${guideIndex}`} x1={sx(guide.value)} y1={view.padTop} x2={sx(guide.value)} y2={view.height - view.padBottom} stroke={stroke} strokeWidth={1.2} strokeDasharray={dash} />
          : <line key={`gh${guideIndex}`} x1={view.padLeft} y1={sy(guide.value)} x2={view.width - view.padRight} y2={sy(guide.value)} stroke={stroke} strokeWidth={1.2} strokeDasharray={dash} />
      })}

      {/* krzywe */}
      {figure.curves.map((curve, curveIndex) => {
        const fn = tryCompileExpression(curve.expr)
        if (!fn) return null
        const from = curve.xMin ?? figure.xMin
        const to = curve.xMax ?? figure.xMax
        const segments = sampleCurve(fn, from, to, 480, yMin, yMax)
        return (
          <g key={`c${curveIndex}`}>
            {segments.map((segment, segmentIndex) => (
              <polyline
                key={segmentIndex}
                points={segment.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}
                fill="none"
                stroke={COLOR_HEX[curve.color]}
                strokeWidth={curve.width}
                strokeDasharray={curve.dashed ? '6 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        )
      })}

      {/* punkty */}
      {(figure.points ?? []).map((point, pointIndex) => {
        const cx = sx(point.x)
        const cy = sy(point.y)
        const fill = COLOR_HEX[point.color]
        if (point.shape === 'cross') {
          return (
            <g key={`p${pointIndex}`}>
              <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke={fill} strokeWidth={2} />
              <line x1={cx - 4} y1={cy + 4} x2={cx + 4} y2={cy - 4} stroke={fill} strokeWidth={2} />
              {point.label && <text x={cx + 8} y={cy - 8} fontSize={11} fill={fill}>{point.label}</text>}
            </g>
          )
        }
        if (point.shape === 'square') {
          return (
            <g key={`p${pointIndex}`}>
              <rect x={cx - 4} y={cy - 4} width={8} height={8} fill={fill} />
              {point.label && <text x={cx + 8} y={cy - 8} fontSize={11} fill={fill}>{point.label}</text>}
            </g>
          )
        }
        return (
          <g key={`p${pointIndex}`}>
            <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#0b0b12" strokeWidth={1.5} />
            {point.label && <text x={cx + 8} y={cy - 8} fontSize={11} fill={fill}>{point.label}</text>}
          </g>
        )
      })}

      {/* etykiety krzywych — przy prawym końcu krzywej */}
      {figure.curves.map((curve, curveIndex) => {
        if (!curve.label) return null
        const fn = tryCompileExpression(curve.expr)
        if (!fn) return null
        const from = curve.xMin ?? figure.xMin
        const to = curve.xMax ?? figure.xMax
        const yAtEnd = fn(to - (to - from) * 0.02)
        if (!Number.isFinite(yAtEnd) || yAtEnd < yMin || yAtEnd > yMax) return null
        return (
          <text key={`cl${curveIndex}`} x={sx(to) - 6} y={sy(yAtEnd) - 8} textAnchor="end" fontSize={11} fill={COLOR_HEX[curve.color]}>
            {curve.label}
          </text>
        )
      })}
    </svg>
  )
}

/* --------------------------- figura geometryczna --------------------------- */

function GeometryView({ figure }: { figure: GeometryFigure }) {
  const view = useMemo(() => {
    const width = 560
    const height = 380
    const pad = 46

    // Zbierz wszystkie punkty, żeby dopasować viewBox do treści rysunku.
    const xs: number[] = []
    const ys: number[] = []
    for (const element of figure.elements) {
      const push = (point: [number, number]) => { xs.push(point[0]); ys.push(point[1]) }
      if (element.type === 'segment') { push(element.a1); push(element.a2) }
      else if (element.type === 'polyline') element.points.forEach(push)
      else if (element.type === 'circle' || element.type === 'arc') { push(element.c); xs.push(element.c[0] + element.r, element.c[0] - element.r); ys.push(element.c[1] + element.r, element.c[1] - element.r) }
      else if (element.type === 'angle') { push(element.vertex); const r = element.r ?? 18; xs.push(element.vertex[0] + r, element.vertex[0] - r); ys.push(element.vertex[1] + r, element.vertex[1] - r) }
      else if (element.type === 'rightAngle') { const s = element.size ?? 12; push(element.vertex); xs.push(element.vertex[0] + s, element.vertex[0] - s); ys.push(element.vertex[1] + s, element.vertex[1] - s) }
      else if (element.type === 'point' || element.type === 'namedPoint') push(element.at)
    }
    if (!xs.length) return null

    // Kąt `angle`/`rightAngle` może mieć własne r — uwzględnij przy rozmiarze.
    const margin = 26
    const minX = Math.min(...xs) - margin
    const maxX = Math.max(...xs) + margin
    const minY = Math.min(...ys) - margin
    const maxY = Math.max(...ys) + margin
    const spanX = Math.max(maxX - minX, 1)
    const spanY = Math.max(maxY - minY, 1)

    // Zachowaj proporcje: skala wspólna dla obu osi (równy kąt i okrąg muszą wyglądać poprawnie).
    const scale = Math.min((width - 2 * pad) / spanX, (height - 2 * pad) / spanY)
    const offsetX = (width - scale * spanX) / 2
    const offsetY = (height - scale * spanY) / 2
    const sx = (x: number) => offsetX + (x - minX) * scale
    const sy = (y: number) => offsetY + (maxY - y) * scale // odwrócone Y (matematycznie)

    return { width, height, sx, sy, scale, minX, minY, maxY, spanX, spanY }
  }, [figure])

  if (!view) return null
  const { sx, sy } = view

  return (
    <svg viewBox={`0 0 ${view.width} ${view.height}`} className="h-auto w-full" role="img" aria-label={figure.caption ?? 'Rysunek'} preserveAspectRatio="xMidYMid meet">
      {figure.elements.map((element, index) => {
        const key = `e${index}`
        if (element.type === 'segment') {
          return <line key={key} x1={sx(element.a1[0])} y1={sy(element.a1[1])} x2={sx(element.a2[0])} y2={sy(element.a2[1])} stroke={COLOR_HEX[element.color]} strokeWidth={element.width} strokeDasharray={element.dashed ? '6 4' : undefined} strokeLinecap="round" />
        }
        if (element.type === 'polyline') {
          const points = element.points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')
          const closing = element.closed ? ` ${sx(element.points[0][0])},${sy(element.points[0][1])}` : ''
          return <polyline key={key} points={`${points}${closing}`} fill="none" stroke={COLOR_HEX[element.color]} strokeWidth={2} strokeDasharray={element.dashed ? '6 4' : undefined} strokeLinejoin="round" />
        }
        if (element.type === 'circle') {
          return <circle key={key} cx={sx(element.c[0])} cy={sy(element.c[1])} r={element.r * view.scale} fill={element.fill ? FILL_HEX[element.fill] : 'none'} stroke={COLOR_HEX[element.color]} strokeWidth={2} strokeDasharray={element.dashed ? '6 4' : undefined} />
        }
        if (element.type === 'arc') {
          const large = Math.abs(element.toDeg - element.fromDeg) > 180 ? 1 : 0
          const sweep = element.toDeg > element.fromDeg ? 0 : 1
          const start: [number, number] = [element.c[0] + element.r * Math.cos((element.fromDeg * Math.PI) / 180), element.c[1] + element.r * Math.sin((element.fromDeg * Math.PI) / 180)]
          const end: [number, number] = [element.c[0] + element.r * Math.cos((element.toDeg * Math.PI) / 180), element.c[1] + element.r * Math.sin((element.toDeg * Math.PI) / 180)]
          return <path key={key} d={`M ${sx(start[0])} ${sy(start[1])} A ${element.r * view.scale} ${element.r * view.scale} 0 ${large} ${sweep === 1 ? 0 : 1} ${sx(end[0])} ${sy(end[1])}`} fill={element.fill ? FILL_HEX[element.fill] : 'none'} stroke={COLOR_HEX[element.color]} strokeWidth={2} />
        }
        if (element.type === 'angle') {
          const r = (element.r ?? 18) * view.scale
          const vertexX = sx(element.vertex[0])
          const vertexY = sy(element.vertex[1])
          // W SVG y rośnie w dół; kąt od fromDeg do toDeg (matematycznie, przeciwnie do wskazówek).
          const startRad = (element.fromDeg * Math.PI) / 180
          const endRad = (element.toDeg * Math.PI) / 180
          const startX = vertexX + r * Math.cos(startRad)
          const startY = vertexY - r * Math.sin(startRad)
          const endX = vertexX + r * Math.cos(endRad)
          const endY = vertexY - r * Math.sin(endRad)
          const sweep = element.toDeg > element.fromDeg ? 0 : 1
          const large = Math.abs(element.toDeg - element.fromDeg) > 180 ? 1 : 0
          return (
            <g key={key}>
              <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${large} ${sweep} ${endX} ${endY}`} fill={FILL_HEX[element.color ?? 'amber']} stroke={COLOR_HEX[element.color ?? 'amber']} strokeWidth={1.5} />
              {element.label && <text x={(sx(element.vertex[0]) + startX + endX) / 3} y={(sy(element.vertex[1]) + startY + endY) / 3} textAnchor="middle" fontSize={12} fill={COLOR_HEX[element.color ?? 'amber']}>{element.label}</text>}
            </g>
          )
        }
        if (element.type === 'rightAngle') {
          const size = (element.size ?? 12) * view.scale
          const rad = (element.dirDeg * Math.PI) / 180
          const dx = Math.cos(rad)
          const dy = -Math.sin(rad)
          const vx = sx(element.vertex[0])
          const vy = sy(element.vertex[1])
          const p1: [number, number] = [vx + dx * size, vy + dy * size]
          const p2: [number, number] = [vx + (dx - dy) * size * 0.7071, vy + (dy + dx) * size * 0.7071]
          const p3: [number, number] = [vx + dy * size, vy - dx * size]
          return <polyline key={key} points={`${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`} fill="none" stroke={COLOR_HEX[element.color ?? 'amber']} strokeWidth={1.5} />
        }
        if (element.type === 'point') {
          return <circle key={key} cx={sx(element.at[0])} cy={sy(element.at[1])} r={3.5} fill={COLOR_HEX[element.color ?? 'rose']} stroke="#0b0b12" strokeWidth={1} />
        }
        // namedPoint
        const label = figure.labels?.[element.id] ?? element.id
        return (
          <g key={key}>
            <circle cx={sx(element.at[0])} cy={sy(element.at[1])} r={4} fill={COLOR_HEX[element.color ?? 'rose']} stroke="#0b0b12" strokeWidth={1.5} />
            <text x={sx(element.at[0]) + 8} y={sy(element.at[1]) - 8} fontSize={12} fontWeight={600} fill="#e2e8f0">{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------ oś liczbowa ------------------------------ */

function NumberLineView({ figure }: { figure: NumberLineFigure }) {
  const view = useMemo(() => {
    const width = 560
    const height = 110
    const padLeft = 34
    const padRight = 34
    const axisY = 62
    const sx = (x: number) => padLeft + ((x - figure.min) / (figure.max - figure.min)) * (width - padLeft - padRight)
    const step = figure.step ?? 1
    const ticks: number[] = []
    for (let value = Math.ceil(figure.min / step) * step; value <= figure.max + 1e-9; value += step) ticks.push(Math.round(value * 1e6) / 1e6)
    return { width, height, axisY, sx, ticks }
  }, [figure])

  return (
    <svg viewBox={`0 0 ${view.width} ${view.height}`} className="h-auto w-full" role="img" aria-label={figure.caption ?? 'Oś liczbowa'}>
      <line x1={view.sx(figure.min) - 14} y1={view.axisY} x2={view.sx(figure.max) + 14} y2={view.axisY} stroke={AXIS} strokeWidth={1.4} />
      <polygon points={`${view.sx(figure.max) + 14},${view.axisY - 4} ${view.sx(figure.max) + 14},${view.axisY + 4} ${view.sx(figure.max) + 20},${view.axisY}`} fill={AXIS} />

      {view.ticks.map((value) => (
        <g key={value}>
          <line x1={view.sx(value)} y1={view.axisY - 5} x2={view.sx(value)} y2={view.axisY + 5} stroke={AXIS} strokeWidth={1.2} />
          <text x={view.sx(value)} y={view.axisY + 20} textAnchor="middle" fontSize={10} fill={TICK_LABEL}>{tickLabel(value)}</text>
        </g>
      ))}

      {(figure.intervals ?? []).map((interval, index) => {
        const y = view.axisY
        const x1 = view.sx(interval.from)
        const x2 = view.sx(interval.to)
        return (
          <g key={`i${index}`}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={COLOR_HEX[interval.color]} strokeWidth={4.5} strokeLinecap="round" opacity={0.85} />
            {interval.fromClosed
              ? <circle cx={x1} cy={y} r={4.5} fill={COLOR_HEX[interval.color]} />
              : <circle cx={x1} cy={y} r={4.5} fill="#0b0b12" stroke={COLOR_HEX[interval.color]} strokeWidth={2} />}
            {interval.toClosed
              ? <circle cx={x2} cy={y} r={4.5} fill={COLOR_HEX[interval.color]} />
              : <circle cx={x2} cy={y} r={4.5} fill="#0b0b12" stroke={COLOR_HEX[interval.color]} strokeWidth={2} />}
            {interval.label && <text x={(x1 + x2) / 2} y={y - 14} textAnchor="middle" fontSize={11} fill={COLOR_HEX[interval.color]}>{interval.label}</text>}
          </g>
        )
      })}

      {(figure.points ?? []).map((point, index) => {
        const x = view.sx(point.value)
        return (
          <g key={`p${index}`}>
            {point.hollow
              ? <circle cx={x} cy={view.axisY} r={5} fill="#0b0b12" stroke={COLOR_HEX[point.color]} strokeWidth={2} />
              : <circle cx={x} cy={view.axisY} r={5} fill={COLOR_HEX[point.color]} stroke="#0b0b12" strokeWidth={1.2} />}
            {point.label && <text x={x} y={view.axisY - 14} textAnchor="middle" fontSize={11} fill={COLOR_HEX[point.color]}>{point.label}</text>}
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------- kontener ------------------------------- */

export function Figure({ spec }: { spec: unknown }) {
  const figures = useMemo(() => parseFigureSpecs(spec), [spec])
  if (!figures.length) return null

  return (
    <div className="my-4 flex flex-col gap-3">
      {figures.map((figure, index) => (
        <figure key={index} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a12] p-3 md:p-4">
          {figure.kind === 'plot' && <PlotView figure={figure} />}
          {figure.kind === 'geometry' && <GeometryView figure={figure} />}
          {figure.kind === 'numberline' && <NumberLineView figure={figure} />}
          {figure.caption && (
            <figcaption className="mt-2 text-center text-xs text-slate-400">
              <MathText>{figure.caption}</MathText>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

/** Wariant liniowy (bez ramki) do osadzenia w treści zadania. */
export function FigureInline({ spec }: { spec: unknown }) {
  const figures = useMemo(() => parseFigureSpecs(spec), [spec])
  if (!figures.length) return null
  return (
    <div className="my-3 flex flex-col gap-2">
      {figures.map((figure, index) => (
        <div key={index} className="rounded-xl bg-[#0a0a12] p-2">
          {figure.kind === 'plot' && <PlotView figure={figure} />}
          {figure.kind === 'geometry' && <GeometryView figure={figure} />}
          {figure.kind === 'numberline' && <NumberLineView figure={figure} />}
          {figure.caption && <p className="mt-1 text-center text-[11px] text-slate-500"><MathText>{figure.caption}</MathText></p>}
        </div>
      ))}
    </div>
  )
}
