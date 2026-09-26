/**
 * Minimalny kompilator wyrażeń matematycznych w zmiennej `x`.
 *
 * Wspiera: + - * / ^ (nawiasy), mnożenie jawne i domyślne (2x, 3(x+1), x sin(x)),
 * stałe `pi` i `e`, funkcje: sin cos tan cot asin acos atan sqrt abs ln log exp
 * sinh cosh tanh floor ceil round sign.
 *
 * Zwraca funkcję (x) => y; wartości nieokreślone (np. sqrt liczb ujemnych,
 * tan w asymptotach) dają `NaN`, dzięki czemu renderer przerywa krzywą
 * zamiast rysować pionowe linie artefaktów.
 */

const FUNCTIONS: Record<string, (value: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  cot: (v) => 1 / Math.tan(v),
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sqrt: (v) => (v < 0 ? NaN : Math.sqrt(v)),
  abs: Math.abs,
  ln: (v) => (v <= 0 ? NaN : Math.log(v)),
  log: (v) => (v <= 0 ? NaN : Math.log10(v)),
  exp: Math.exp,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
}

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E }

/** Znane słowa kluczowe — tokenizer dzieli ciągi liter po najdłuższym dopasowaniu (xsin(x) → x·sin(x)). */
const KEYWORDS = [...Object.keys(FUNCTIONS), ...Object.keys(CONSTANTS)].sort((a, b) => b.length - a.length)
const LONGEST_KEYWORD = Math.max(...KEYWORDS.map((keyword) => keyword.length))

type Token =
  | { type: 'number'; value: number }
  | { type: 'name'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' }

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let index = 0
  while (index < source.length) {
    const char = source[index]
    if (/\s/.test(char)) {
      index += 1
      continue
    }
    if (/[0-9.]/.test(char)) {
      const match = /^[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/.exec(source.slice(index))
      if (!match) throw new Error(`Nieprawidłowa liczba w wyrażeniu: „${source}”`)
      tokens.push({ type: 'number', value: Number(match[0]) })
      index += match[0].length
      continue
    }
    if (/[a-zA-Z]/.test(char)) {
      // Rozpoznaj najdłuższe znane słowo (funkcja/stała) lub pojedynczą zmienną x/y,
      // dzięki czemu „xsin” czyta się jako x·sin, a nie jako jedna nieznana nazwa.
      const rest = source.slice(index)
      const lowered = rest.toLowerCase()
      let matched = ''
      for (const keyword of KEYWORDS) {
        if (lowered.startsWith(keyword) && keyword.length > matched.length) matched = keyword
      }
      if (!matched) {
        const single = rest[0].toLowerCase()
        if (single === 'x') {
          tokens.push({ type: 'name', value: 'x' })
          index += 1
          continue
        }
        throw new Error(`Nieznana nazwa w wyrażeniu: „${source}”`)
      }
      tokens.push({ type: 'name', value: matched })
      index += matched.length
      continue
    }
    if ('+-*/^'.includes(char)) {
      tokens.push({ type: 'op', value: char as '+' | '-' | '*' | '/' | '^' })
      index += 1
      continue
    }
    if (char === '(') {
      tokens.push({ type: 'lparen' })
      index += 1
      continue
    }
    if (char === ')') {
      tokens.push({ type: 'rparen' })
      index += 1
      continue
    }
    throw new Error(`Nieznany znak „${char}” w wyrażeniu: „${source}”`)
  }
  return tokens
}

export type CompiledExpression = (x: number) => number

class Parser {
  private position = 0

  constructor(
    private readonly tokens: Token[],
    private readonly source: string,
  ) {}

  private peek(): Token | undefined {
    return this.tokens[this.position]
  }

  private next(): Token | undefined {
    return this.tokens[this.position++]
  }

  parse(): CompiledExpression {
    const expression = this.parseAdditive()
    if (this.position !== this.tokens.length) throw new Error(`Nadmiarowe znaki w wyrażeniu: „${this.source}”`)
    return expression
  }

  private parseAdditive(): CompiledExpression {
    let left = this.parseMultiplicative()
    for (;;) {
      const token = this.peek()
      if (token?.type === 'op' && (token.value === '+' || token.value === '-')) {
        this.next()
        const right = this.parseMultiplicative()
        const plus = token.value === '+'
        const previous = left
        left = plus ? (x) => previous(x) + right(x) : (x) => previous(x) - right(x)
        continue
      }
      return left
    }
  }

  private startsPrimary(token: Token | undefined): boolean {
    return token?.type === 'number' || token?.type === 'name' || token?.type === 'lparen'
  }

  private parseMultiplicative(): CompiledExpression {
    let left = this.parseUnary()
    for (;;) {
      const token = this.peek()
      if (token?.type === 'op' && (token.value === '*' || token.value === '/')) {
        this.next()
        const right = this.parseUnary()
        const times = token.value === '*'
        const previous = left
        left = times ? (x) => previous(x) * right(x) : (x) => previous(x) / right(x)
        continue
      }
      // Mnożenie domyślne: 2x, 3(x+1), x sin(x), (x+1)(x-1), 2pi itd.
      if (this.startsPrimary(token)) {
        const right = this.parseUnary()
        const previous = left
        left = (x) => previous(x) * right(x)
        continue
      }
      return left
    }
  }

  private parseUnary(): CompiledExpression {
    const token = this.peek()
    if (token?.type === 'op' && (token.value === '-' || token.value === '+')) {
      this.next()
      const value = this.parseUnary()
      return token.value === '-' ? (x) => -value(x) : value
    }
    return this.parsePower()
  }

  private parsePower(): CompiledExpression {
    const base = this.parsePrimary()
    const token = this.peek()
    if (token?.type === 'op' && token.value === '^') {
      this.next()
      const exponent = this.parseUnary() // prawostronna łączność: x^2^3 = x^8
      return (x) => Math.pow(base(x), exponent(x))
    }
    return base
  }

  private parsePrimary(): CompiledExpression {
    const token = this.next()
    if (!token) throw new Error(`Nieoczekiwany koniec wyrażenia: „${this.source}”`)

    if (token.type === 'number') {
      const value = token.value
      return () => value
    }
    if (token.type === 'lparen') {
      const inner = this.parseAdditive()
      const closing = this.next()
      if (closing?.type !== 'rparen') throw new Error(`Brak nawiasu zamykającego: „${this.source}”`)
      return inner
    }
    if (token.type === 'name') {
      const constant = CONSTANTS[token.value]
      if (constant !== undefined) return () => constant
      if (token.value === 'x') return (x) => x
      const fn = FUNCTIONS[token.value]
      if (fn) {
        const opening = this.next()
        if (opening?.type !== 'lparen') throw new Error(`Funkcja ${token.value} wymaga nawiasu: „${this.source}”`)
        const argument = this.parseAdditive()
        const closing = this.next()
        if (closing?.type !== 'rparen') throw new Error(`Brak nawiasu zamykającego: „${this.source}”`)
        return (x) => fn(argument(x))
      }
      throw new Error(`Nieznana nazwa „${token.value}” w wyrażeniu: „${this.source}”`)
    }
    throw new Error(`Nieprawidłowy fragment wyrażenia: „${this.source}”`)
  }
}

/** Kompiluje wyrażenie; rzuca błąd z polskim komunikatem, gdy składnia jest błędna. */
export function compileExpression(source: string): CompiledExpression {
  const trimmed = source.trim()
  if (!trimmed) throw new Error('Wyrażenie jest puste.')
  return new Parser(tokenize(trimmed), trimmed).parse()
}

/** Bezpieczna wersja — zwraca null zamiast rzucać błąd (dla danych z treści). */
export function tryCompileExpression(source: string): CompiledExpression | null {
  try {
    return compileExpression(source)
  } catch {
    return null
  }
}
