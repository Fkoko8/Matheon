/**
 * MATHEON — prosty kalkulator egzaminacyjny.
 *
 * Bez `eval` i bez `new Function`: własny tokenizer + algorytm shunting-yard + stos RPN.
 * Obsługuje to, co realnie przydaje się na maturze: cztery działania, potęgi, pierwiastki,
 * logarytmy, funkcje trygonometryczne (stopnie lub radiany), wartość bezwzględną i procent.
 */

export type AngleMode = 'deg' | 'rad'

type Token =
  | { type: 'number'; value: number }
  | { type: 'name'; value: string }
  | { type: 'op'; value: string }
  | { type: 'postfix'; value: '%' }
  | { type: 'paren'; value: '(' | ')' }

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E }

const FUNCTIONS: Record<string, (value: number, mode: AngleMode) => number> = {
  sqrt: (value) => {
    if (value < 0) throw new Error('Pierwiastek z liczby ujemnej nie jest liczbą rzeczywistą.')
    return Math.sqrt(value)
  },
  cbrt: (value) => Math.cbrt(value),
  abs: (value) => Math.abs(value),
  ln: (value) => {
    if (value <= 0) throw new Error('Logarytm jest określony tylko dla liczb dodatnich.')
    return Math.log(value)
  },
  log: (value) => {
    if (value <= 0) throw new Error('Logarytm jest określony tylko dla liczb dodatnich.')
    return Math.log10(value)
  },
  exp: (value) => Math.exp(value),
  sin: (value, mode) => Math.sin(mode === 'deg' ? (value * Math.PI) / 180 : value),
  cos: (value, mode) => Math.cos(mode === 'deg' ? (value * Math.PI) / 180 : value),
  tan: (value, mode) => Math.tan(mode === 'deg' ? (value * Math.PI) / 180 : value),
  asin: (value, mode) => (mode === 'deg' ? (Math.asin(value) * 180) / Math.PI : Math.asin(value)),
  acos: (value, mode) => (mode === 'deg' ? (Math.acos(value) * 180) / Math.PI : Math.acos(value)),
  atan: (value, mode) => (mode === 'deg' ? (Math.atan(value) * 180) / Math.PI : Math.atan(value)),
}

/**
 * Pierwszeństwo operatorów. Jednoargumentowy minus siedzi **poniżej** potęgi,
 * więc `-3^2 = -(3^2) = -9`, a `2^-3` nadal działa (minus nigdy nie zdejmuje operatorów).
 */
const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3, 'u-': 2.5 }
const RIGHT_ASSOCIATIVE = new Set(['^'])

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  const text = input.replace(/\s+/g, '').replace(/,/g, '.')
  let index = 0

  while (index < text.length) {
    const char = text[index]

    if (/[0-9.]/.test(char)) {
      let value = ''
      while (index < text.length && /[0-9.]/.test(text[index])) value += text[index++]
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) throw new Error(`Nieprawidłowa liczba: ${value}`)
      tokens.push({ type: 'number', value: parsed })
      continue
    }

    if (/[a-zA-Z]/.test(char)) {
      let name = ''
      while (index < text.length && /[a-zA-Z]/.test(text[index])) name += text[index++]
      const lowered = name.toLowerCase()
      if (lowered in CONSTANTS || lowered in FUNCTIONS) tokens.push({ type: 'name', value: lowered })
      else throw new Error(`Nieznana funkcja lub stała: ${name}`)
      continue
    }

    if (char === '%') {
      tokens.push({ type: 'postfix', value: '%' })
      index += 1
      continue
    }

    if ('+-*/^'.includes(char)) {
      // Jednoargumentowy minus/plus na początku wyrażenia lub po operatorze/nawiasie.
      const previous = tokens[tokens.length - 1]
      const unary = (char === '-' || char === '+') && (!previous || previous.type === 'op' || previous.type === 'postfix' || (previous.type === 'paren' && previous.value === '('))
      tokens.push({ type: 'op', value: unary ? (char === '-' ? 'u-' : '+') : char })
      index += 1
      continue
    }

    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char })
      index += 1
      continue
    }

    throw new Error(`Nieznany znak: ${char}`)
  }

  return tokens
}

interface RpnItem {
  kind: 'number' | 'op' | 'func'
  value: number | string
}

type StackItem = { kind: 'op'; value: string } | { kind: 'lparen' } | { kind: 'func'; value: string }

function toRpn(tokens: Token[]): RpnItem[] {
  const output: RpnItem[] = []
  const stack: StackItem[] = []

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push({ kind: 'number', value: token.value })
      continue
    }
    if (token.type === 'name') {
      // Stałe matematyczne wchodzą do wyniku od razu jako liczby.
      if (token.value in CONSTANTS) output.push({ kind: 'number', value: CONSTANTS[token.value] })
      else stack.push({ kind: 'func', value: token.value })
      continue
    }
    if (token.type === 'postfix') {
      output.push({ kind: 'op', value: token.value })
      continue
    }
    if (token.type === 'op') {
      // Jednoargumentowy minus nie zdejmuje niczego ze stosu — inaczej `2^-3` się psuje.
      if (token.value === 'u-') {
        stack.push({ kind: 'op', value: 'u-' })
        continue
      }
      while (stack.length) {
        const top = stack[stack.length - 1]
        if (top.kind !== 'op') break
        const higher = PRECEDENCE[top.value] > PRECEDENCE[token.value]
        const equalLeftAssociative = PRECEDENCE[top.value] === PRECEDENCE[token.value] && !RIGHT_ASSOCIATIVE.has(token.value)
        if (!higher && !equalLeftAssociative) break
        stack.pop()
        output.push({ kind: 'op', value: top.value })
      }
      stack.push({ kind: 'op', value: token.value })
      continue
    }
    if (token.value === '(') {
      stack.push({ kind: 'lparen' })
      continue
    }

    // nawias zamykający — zdejmij operatorzy aż do nawiasu otwierającego
    let foundParen = false
    while (stack.length) {
      const top = stack.pop()
      if (!top) break
      if (top.kind === 'lparen') { foundParen = true; break }
      output.push({ kind: 'op', value: top.value })
    }
    if (!foundParen) throw new Error('Niedomknięty nawias.')

    const pending = stack.pop()
    if (pending && pending.kind === 'func') output.push({ kind: 'func', value: pending.value })
  }

  while (stack.length) {
    const top = stack.pop()
    if (!top) break
    if (top.kind === 'lparen') throw new Error('Niedomknięty nawias.')
    output.push({ kind: 'op', value: top.value })
  }

  return output
}

/** Oblicza wyrażenie i zwraca wynik. Rzuca `Error` z komunikatem po polsku. */
export function calculate(input: string, angleMode: AngleMode = 'deg'): number {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Wpisz wyrażenie.')

  const rpn = toRpn(tokenize(trimmed))
  const stack: number[] = []

  for (const item of rpn) {
    if (item.kind === 'number') {
      stack.push(item.value as number)
      continue
    }
    if (item.kind === 'func') {
      const name = item.value as string
      const fn = FUNCTIONS[name]
      const argument = stack.pop()
      if (argument === undefined) throw new Error(`Brak argumentu funkcji ${name}.`)
      const result = fn(argument, angleMode)
      if (!Number.isFinite(result)) throw new Error('Wynik nie jest liczbą rzeczywistą.')
      stack.push(result)
      continue
    }

    const operator = item.value as string
    if (operator === 'u-') {
      const value = stack.pop()
      if (value === undefined) throw new Error('Niepełne wyrażenie.')
      stack.push(-value)
      continue
    }
    // Procent jest operatorem przyrostkowym: `15%` to 0,15.
    if (operator === '%') {
      const value = stack.pop()
      if (value === undefined) throw new Error('Niepełne wyrażenie.')
      stack.push(value / 100)
      continue
    }
    const right = stack.pop()
    const left = stack.pop()
    if (left === undefined || right === undefined) throw new Error('Niepełne wyrażenie.')

    switch (operator) {
      case '+': stack.push(left + right); break
      case '-': stack.push(left - right); break
      case '*': stack.push(left * right); break
      case '/':
        if (right === 0) throw new Error('Nie dzielimy przez zero.')
        stack.push(left / right)
        break
      case '^': stack.push(left ** right); break
      default: throw new Error(`Nieznany operator: ${operator}`)
    }
  }

  if (stack.length !== 1) throw new Error('Niepełne wyrażenie.')
  const value = stack[0]
  if (!Number.isFinite(value)) throw new Error('Wynik nie jest liczbą rzeczywistą.')
  return value
}

/** Formatowanie wyniku: bez zbędnych zer, z zaokrągleniem do 10 miejsc. */
export function formatResult(value: number): string {
  // Skrajnie małe i wielkie wartości pokazujemy w notacji naukowej, żeby nie zamieniać ich w zero.
  if (Math.abs(value) >= 1e15 || (value !== 0 && Math.abs(value) < 1e-9)) return value.toExponential(6)
  const rounded = Math.round(value * 1e10) / 1e10
  return String(rounded).replace('.', ',')
}
