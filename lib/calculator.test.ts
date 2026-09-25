import { describe, expect, it } from 'vitest'
import { calculate, formatResult } from './calculator'

describe('calculate — cztery działania', () => {
  it('liczy proste wyrażenia', () => {
    expect(calculate('2+2')).toBe(4)
    expect(calculate('10-3')).toBe(7)
    expect(calculate('6*7')).toBe(42)
    expect(calculate('12/4')).toBe(3)
  })

  it('respektuje pierwszeństwo operatorów', () => {
    expect(calculate('2+3*4')).toBe(14)
    expect(calculate('(2+3)*4')).toBe(20)
    expect(calculate('2+2^3')).toBe(10)
  })

  it('potęga jest prawostronnie łączna', () => {
    expect(calculate('2^3^2')).toBe(512)
  })

  it('minus jednoargumentowy nie porywa potęgi', () => {
    expect(calculate('-3^2')).toBe(-9)
    expect(calculate('2^-3')).toBe(0.125)
    expect(calculate('5+-3')).toBe(2)
  })

  it('ignoruje spacje i przyjmuje przecinek dziesiętny', () => {
    expect(calculate(' 1 + 2 ')).toBe(3)
    expect(calculate('1,5+0,5')).toBe(2)
  })
})

describe('calculate — funkcje i stałe', () => {
  it('pierwiastki, wartość bezwzględna i logarytmy', () => {
    expect(calculate('sqrt(16)')).toBe(4)
    expect(calculate('cbrt(27)')).toBeCloseTo(3, 10)
    expect(calculate('abs(-5)')).toBe(5)
    expect(calculate('log(100)')).toBe(2)
    expect(calculate('ln(e)')).toBeCloseTo(1, 10)
    expect(calculate('exp(0)')).toBe(1)
  })

  it('trygonometria działa w stopniach (domyślnie)', () => {
    expect(calculate('sin(30)')).toBeCloseTo(0.5, 10)
    expect(calculate('cos(60)')).toBeCloseTo(0.5, 10)
    expect(calculate('tan(45)')).toBeCloseTo(1, 10)
    expect(calculate('asin(0.5)')).toBeCloseTo(30, 10)
  })

  it('trygonometria w radianach', () => {
    expect(calculate('sin(pi/2)', 'rad')).toBeCloseTo(1, 10)
    expect(calculate('cos(0)', 'rad')).toBe(1)
  })

  it('procent jest operatorem przyrostkowym', () => {
    expect(calculate('15%')).toBeCloseTo(0.15, 10)
    expect(calculate('200*15%')).toBeCloseTo(30, 10)
    expect(calculate('50%+50%')).toBe(1)
  })
})

describe('calculate — błędy czytane po polsku', () => {
  it('zgłasza dzielenie przez zero', () => {
    expect(() => calculate('1/0')).toThrow('Nie dzielimy przez zero.')
  })

  it('zgłasza pierwiastek z liczby ujemnej', () => {
    expect(() => calculate('sqrt(-1)')).toThrow('Pierwiastek z liczby ujemnej nie jest liczbą rzeczywistą.')
  })

  it('zgłasza logarytm z niedodatniej', () => {
    expect(() => calculate('ln(0)')).toThrow('Logarytm jest określony tylko dla liczb dodatnich.')
    expect(() => calculate('log(-5)')).toThrow('Logarytm jest określony tylko dla liczb dodatnich.')
  })

  it('zgłasza nieznaną funkcję i nieznany znak', () => {
    expect(() => calculate('foo(2)')).toThrow('Nieznana funkcja lub stała: foo')
    expect(() => calculate('2$3')).toThrow('Nieznany znak: $')
  })

  it('zgłasza niedomknięty nawias i niepełne wyrażenie', () => {
    expect(() => calculate('(2+3')).toThrow('Niedomknięty nawias.')
    expect(() => calculate('2+3)')).toThrow('Niedomknięty nawias.')
    expect(() => calculate('2+')).toThrow('Niepełne wyrażenie.')
    expect(() => calculate('*5')).toThrow('Niepełne wyrażenie.')
  })

  it('zgłasza puste wyrażenie', () => {
    expect(() => calculate('   ')).toThrow('Wpisz wyrażenie.')
  })

  it('odrzuca wynik, który nie jest liczbą rzeczywistą', () => {
    expect(() => calculate('asin(5)')).toThrow('Wynik nie jest liczbą rzeczywistą.')
  })
})

describe('formatResult', () => {
  it('używa przecinka i nie dopisuje zbędnych zer', () => {
    expect(formatResult(3)).toBe('3')
    expect(formatResult(0.5)).toBe('0,5')
    expect(formatResult(-0.5)).toBe('-0,5')
    expect(formatResult(1234.5)).toBe('1234,5')
    expect(formatResult(0)).toBe('0')
  })

  it('zaokrągla do 10 miejsc po przecinku', () => {
    expect(formatResult(1 / 3)).toBe('0,3333333333')
  })

  it('skrajne wartości pokazuje w notacji naukowej', () => {
    expect(formatResult(1e16)).toContain('e+16')
    expect(formatResult(1e-10)).toContain('e-10')
  })
})
