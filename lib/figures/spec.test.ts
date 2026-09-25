import { describe, expect, it } from 'vitest'
import { parseFigureSpec, parseFigureSpecs, type GeometryFigure, type NumberLineFigure, type PlotFigure } from './spec'

describe('parseFigureSpecs — wejście śmieciowe', () => {
  it('ignoruje null, undefined i puste obiekty', () => {
    expect(parseFigureSpecs(null)).toEqual([])
    expect(parseFigureSpecs(undefined)).toEqual([])
    expect(parseFigureSpecs({})).toEqual([])
    expect(parseFigureSpecs({ foo: 1 })).toEqual([])
    expect(parseFigureSpec(null)).toBeNull()
  })

  it('nieznany rodzaj figury odrzuca', () => {
    expect(parseFigureSpec({ kind: 'pie-chart', data: [1] })).toBeNull()
  })

  it('przyjmuje też pole `figure` zamiast `kind`', () => {
    const parsed = parseFigureSpec({ figure: 'plot', xMin: 0, xMax: 2, curves: [{ expr: 'x' }] })
    expect(parsed?.kind).toBe('plot')
  })

  it('obsługuje zarówno pojedynczą figurę, jak i tablicę', () => {
    const single = { kind: 'numberline', min: 0, max: 5, points: [{ value: 1 }] }
    expect(parseFigureSpecs(single)).toHaveLength(1)
    expect(parseFigureSpecs([single, { kind: 'plot' }])).toHaveLength(1)
  })
})

describe('parsePlot', () => {
  it('parsuje pełny wykres z krzywymi, punktami i liniami pomocniczymi', () => {
    const plot = parseFigureSpecs({
      kind: 'plot',
      xMin: -2,
      xMax: 4,
      yMin: -6,
      yMax: 6,
      curves: [{ expr: 'x^2-2x-3', color: 'violet', label: 'f(x)' }],
      points: [{ x: -1, y: 0, label: 'x1' }],
      guides: [{ orientation: 'vertical', value: 1 }],
      caption: 'test',
    })[0] as PlotFigure

    expect(plot.kind).toBe('plot')
    expect(plot.curves).toHaveLength(1)
    expect(plot.curves[0].expr).toBe('x^2-2x-3')
    expect(plot.points).toHaveLength(1)
    expect(plot.points?.[0].shape).toBe('dot')
    expect(plot.guides).toHaveLength(1)
    expect(plot.guides?.[0].dashed).toBe(true)
    expect(plot.caption).toBe('test')
  })

  it('odrzuca wykres bez żadnej treści', () => {
    expect(parseFigureSpecs({ kind: 'plot', curves: [] })).toEqual([])
  })

  it('odrzuca odwrócony zakres osi', () => {
    expect(parseFigureSpecs({ kind: 'plot', xMin: 5, xMax: -5, curves: [{ expr: 'x' }] })).toEqual([])
  })

  it('odrzuca krzywą bez wyrażenia i zachowuje poprawną', () => {
    const plot = parseFigureSpecs({ kind: 'plot', xMin: 0, xMax: 1, curves: [{ expr: '' }, { expr: 'x', color: 'blue' }] })[0] as PlotFigure
    expect(plot.curves).toHaveLength(1)
    expect(plot.curves[0].color).toBe('blue')
  })

  it('wymaga pełnego zakresu krzywej (xMin i xMax razem)', () => {
    const plot = parseFigureSpecs({ kind: 'plot', xMin: 0, xMax: 4, curves: [{ expr: 'x', xMin: 1 }, { expr: 'x+1' }] })[0] as PlotFigure
    expect(plot.curves).toHaveLength(1)
    expect(plot.curves[0].expr).toBe('x+1')
  })

  it('domyślnie używa zakresu -6..6', () => {
    const plot = parseFigureSpecs({ kind: 'plot', curves: [{ expr: 'x' }] })[0] as PlotFigure
    expect(plot.xMin).toBe(-6)
    expect(plot.xMax).toBe(6)
  })

  it('odrzuca region o odwróconym przedziale', () => {
    const plot = parseFigureSpecs({
      kind: 'plot',
      curves: [{ expr: 'x' }],
      regions: [
        { from: '0', to: 'x', xMin: 3, xMax: 1 },
        { from: '0', to: 'x', xMin: 1, xMax: 3 },
      ],
    })[0] as PlotFigure
    expect(plot.regions).toHaveLength(1)
  })
})

describe('parseGeometry', () => {
  it('parsuje elementy i etykiety punktów', () => {
    const geometry = parseFigureSpecs({
      kind: 'geometry',
      elements: [
        { type: 'segment', a1: [0, 0], a2: [4, 0], color: 'blue' },
        { type: 'namedPoint', id: 'b1', at: [4, 0] },
        { type: 'angle', vertex: [0, 0], fromDeg: 0, toDeg: 45 },
      ],
      labels: { b1: 'B', a1: 'A' },
    })[0] as GeometryFigure

    expect(geometry.kind).toBe('geometry')
    expect(geometry.elements).toHaveLength(3)
    expect(geometry.labels?.b1).toBe('B')
    expect(geometry.equalAspect).toBe(true)
  })

  it('odrzuca figurę bez elementów', () => {
    expect(parseFigureSpecs({ kind: 'geometry', elements: [] })).toEqual([])
    expect(parseFigureSpecs({ kind: 'geometry', elements: [{ type: 'arc', c: [0, 0] }] })).toEqual([])
  })

  it('odrzuca okrąg bez promienia, a ujemny sprowadza do minimalnego', () => {
    expect(parseFigureSpecs({ kind: 'geometry', elements: [{ type: 'circle', c: [0, 0] }] })).toEqual([])
    const geometry = parseFigureSpecs({ kind: 'geometry', elements: [{ type: 'circle', c: [0, 0], r: -3 }] })[0] as GeometryFigure
    expect(geometry.elements[0]).toMatchObject({ type: 'circle', r: 0.01 })
  })

  it('nadaje identyfikator nazwanemu punktowi bez id', () => {
    const geometry = parseFigureSpecs({ kind: 'geometry', elements: [{ type: 'namedPoint', at: [1, 1] }] })[0] as GeometryFigure
    expect(geometry.elements[0]).toMatchObject({ type: 'namedPoint', id: 'p0' })
  })

  it('ogranicza liczbę elementów do 60', () => {
    const elements = Array.from({ length: 80 }, (_, i) => ({ type: 'point', at: [i, i] }))
    const geometry = parseFigureSpecs({ kind: 'geometry', elements })[0] as GeometryFigure
    expect(geometry.elements).toHaveLength(60)
  })
})

describe('parseNumberLine', () => {
  it('parsuje punkty i przedziały', () => {
    const line = parseFigureSpecs({
      kind: 'numberline',
      min: -3,
      max: 3,
      points: [{ value: 1, label: 'a' }, { value: -2, hollow: true }],
      intervals: [{ from: 0, to: 2, toClosed: false }],
    })[0] as NumberLineFigure

    expect(line.kind).toBe('numberline')
    expect(line.step).toBe(1)
    expect(line.points).toHaveLength(2)
    expect(line.points?.[1].hollow).toBe(true)
    expect(line.intervals).toHaveLength(1)
    expect(line.intervals?.[0].toClosed).toBe(false)
  })

  it('odrzuca odwrócony zakres i pustą oś', () => {
    expect(parseFigureSpecs({ kind: 'numberline', min: 5, max: -5 })).toEqual([])
    expect(parseFigureSpecs({ kind: 'numberline', min: 0, max: 5 })).toEqual([])
  })

  it('odrzuca przedział o odwróconych końcach', () => {
    expect(parseFigureSpecs({ kind: 'numberline', min: 0, max: 5, intervals: [{ from: 4, to: 1 }] })).toEqual([])
  })
})

describe('ochrona przed absurdalnymi danymi', () => {
  it('ogranicza ekstremalne wartości do bezpiecznego zakresu', () => {
    const line = parseFigureSpecs({ kind: 'numberline', min: -1e12, max: 5, points: [{ value: 1e12 }] })[0] as NumberLineFigure
    expect(line.min).toBe(-10_000)
    expect(line.points?.[0].value).toBe(10_000)
  })

  it('zastępuje nieznany kolor domyślnym', () => {
    const plot = parseFigureSpecs({ kind: 'plot', curves: [{ expr: 'x', color: 'rainbow' }] })[0] as PlotFigure
    expect(plot.curves[0].color).toBe('violet')
  })

  it('traktuje NaN jak brak wartości (fallback)', () => {
    const plot = parseFigureSpecs({ kind: 'plot', xMin: Number.NaN, xMax: Number.NaN, curves: [{ expr: 'x' }] })[0] as PlotFigure
    expect(plot.xMin).toBe(-6)
    expect(plot.xMax).toBe(6)
  })

  it('przycina zbyt długi podpis', () => {
    const plot = parseFigureSpecs({ kind: 'plot', curves: [{ expr: 'x' }], caption: 'a'.repeat(500) })[0] as PlotFigure
    expect(plot.caption).toHaveLength(240)
  })

  it('brak podpisu zwraca undefined, nie pusty łańcuch', () => {
    const plot = parseFigureSpecs({ kind: 'plot', curves: [{ expr: 'x' }] })[0] as PlotFigure
    expect(plot.caption).toBeUndefined()
  })
})
