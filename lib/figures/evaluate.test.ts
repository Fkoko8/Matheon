import { describe, expect, it } from 'vitest'
import { compileExpression, tryCompileExpression } from './evaluate'

describe('compileExpression — arytmetyka i pierwszeństwo', () => {
  const cases: Array<[string, number, number]> = [
    ['x^2-6x+5', 3, -4],
    ['(x-2)^2-9', 2, -9],
    ['2x+1', 5, 11],
    ['sqrt(x)', 9, 3],
    ['1/x', 4, 0.25],
    ['-x^2+3', 2, -1],
    ['3(x+1)', 2, 9],
    ['2^x', 3, 8],
    ['abs(-5x)', 2, 10],
    ['ln(e)', 0, 1],
    ['pi', 0, Math.PI],
    ['2*3+4', 0, 10],
    ['2+3*4', 0, 14],
    ['(2+3)*4', 0, 20],
  ]

  for (const [expr, x, expected] of cases) {
    it(`„${expr}” w x=${x} = ${expected}`, () => {
      const fn = compileExpression(expr)
      expect(fn(x)).toBeCloseTo(expected, 10)
    })
  }
})

describe('compileExpression — mnożenie domyślne', () => {
  it('skleja liczbę i zmienną: 2x', () => {
    expect(compileExpression('2x')(3)).toBe(6)
  })

  it('skleja nawiasy: (x+1)(x-1)', () => {
    expect(compileExpression('(x+1)(x-1)')(3)).toBe(8)
  })

  it('skleja zmienną z funkcją: x sin(x)', () => {
    expect(compileExpression('x sin(x)')(Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10)
  })

  it('dzieli ciągi liter po najdłuższym dopasowaniu: xsin(x)', () => {
    expect(compileExpression('xsin(x)')(Math.PI / 2)).toBeCloseTo(Math.PI / 2, 10)
  })
})

describe('compileExpression — potęga i znak', () => {
  it('potęga jest prawostronnie łączna', () => {
    expect(compileExpression('2^3^2')(0)).toBe(512)
  })

  it('minus jednoargumentowy działa przed potęgą', () => {
    expect(compileExpression('-2^2')(0)).toBe(-4)
  })

  it('potęga z ujemnym wykładnikiem', () => {
    expect(compileExpression('2^-2')(0)).toBe(0.25)
  })
})

describe('compileExpression — stałe i funkcje', () => {
  it('rozpoznaje stałe e i pi', () => {
    expect(compileExpression('e')(0)).toBeCloseTo(Math.E, 10)
    expect(compileExpression('e^2')(0)).toBeCloseTo(Math.E ** 2, 10)
  })

  it('rozpoznaje funkcje trygonometryczne i logarytmy', () => {
    expect(compileExpression('sin(x)')(Math.PI / 2)).toBeCloseTo(1, 10)
    expect(compileExpression('cos(x)')(Math.PI)).toBeCloseTo(-1, 10)
    expect(compileExpression('cot(x)')(Math.PI / 4)).toBeCloseTo(1, 10)
    expect(compileExpression('log(x)')(100)).toBeCloseTo(2, 10)
    expect(compileExpression('exp(x)')(0)).toBeCloseTo(1, 10)
  })

  it('ośmiela wielkość liter w funkcjach i zmiennej', () => {
    expect(compileExpression('SIN(x)')(Math.PI / 2)).toBeCloseTo(1, 10)
    expect(compileExpression('X^2')(3)).toBe(9)
  })
})

describe('evaluate — wartości nieokreślone dają NaN (renderer przerywa krzywą)', () => {
  it('sqrt z liczby ujemnej', () => {
    expect(Number.isNaN(compileExpression('sqrt(x)')(-4))).toBe(true)
  })

  it('ln z niedodatniej', () => {
    expect(Number.isNaN(compileExpression('ln(x)')(0))).toBe(true)
    expect(Number.isNaN(compileExpression('log(x)')(-1))).toBe(true)
  })

  it('dzielenie przez zero nie rzuca, tylko daje nieskończoność/NaN', () => {
    expect(Number.isFinite(compileExpression('1/x')(0))).toBe(false)
  })
})

describe('tryCompileExpression — odrzucanie błędnych danych', () => {
  it('odrzuca błędną składnię', () => {
    expect(tryCompileExpression('x++*3')).toBeNull()
    expect(tryCompileExpression('x+')).toBeNull()
    expect(tryCompileExpression('(x+1')).toBeNull()
    expect(tryCompileExpression('x)')).toBeNull()
  })

  it('odrzuca nieznane nazwy i znaki', () => {
    expect(tryCompileExpression('foo(x)')).toBeNull()
    expect(tryCompileExpression('x@2')).toBeNull()
  })

  it('odrzuca puste wyrażenie', () => {
    expect(tryCompileExpression('')).toBeNull()
    expect(tryCompileExpression('   ')).toBeNull()
  })

  it('wymaga nawiasu przy funkcji', () => {
    expect(tryCompileExpression('sin x')).toBeNull()
    expect(tryCompileExpression('sqrt 4')).toBeNull()
  })

  it('rzuca polski komunikat przy złej składni', () => {
    expect(() => compileExpression('x@2')).toThrow(/Nieznany znak/)
    expect(() => compileExpression('')).toThrow(/puste/)
  })
})
