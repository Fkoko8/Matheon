/**
 * Test kalkulatora egzaminacyjnego (`lib/calculator.ts`).
 *
 * Kalkulator w trybie egzaminu musi być przewidywalny: kolejność działań jak w matematyce,
 * potęgi prawostronnie łączne, jednoargumentowy minus, obsługa stopni i czytelne błędy.
 * Ten test nie potrzebuje bazy ani sesji — sprawdza czystą logikę.
 *
 * Uruchomienie: pnpm qa:calc
 */
import { calculate, formatResult } from '@/lib/calculator'

let failures = 0

function report(label: string, ok: boolean, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

function equals(label: string, expression: string, expected: number, tolerance = 1e-9) {
  try {
    const value = calculate(expression)
    report(label, Math.abs(value - expected) <= tolerance, `${expression} = ${value} (oczekiwano ${expected})`)
  } catch (cause) {
    report(label, false, cause instanceof Error ? cause.message : 'błąd')
  }
}

function throws(label: string, expression: string, fragment: string) {
  try {
    const value = calculate(expression)
    report(label, false, `nie zgłoszono błędu, wynik ${value}`)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : ''
    report(label, message.toLowerCase().includes(fragment.toLowerCase()), message)
  }
}

equals('kolejność działań', '2+2*2', 6)
equals('nawiasy', '(2+2)*2', 8)
equals('potęga', '2^10', 1024)
equals('potęga łączna prawostronnie', '2^3^2', 512)
equals('minus jednoargumentowy przy potędze', '-3^2', -9)
equals('minus jednoargumentowy w nawiasie', '(-3)^2', 9)
equals('odejmowanie liczby ujemnej', '5--3', 8)
equals('pierwiastek', 'sqrt(50)', Math.sqrt(50))
equals('pierwiastek w działaniu', '2*sqrt(3)+sqrt(3)', 3 * Math.sqrt(3), 1e-9)
equals('logarytm dziesiętny', 'log(1000)', 3)
equals('logarytm naturalny', 'ln(e)', 1)
equals('wartość bezwzględna', 'abs(-7)', 7)
equals('procent liczby', '15%*240', 36)
equals('procent jako liczba', '50%', 0.5)
equals('procent w sumie', '100+10%', 100.1)
equals('stale', 'pi', Math.PI)
equals('pierwiastek trzeciego stopnia', 'cbrt(27)', 3)

equals('trygonometria w stopniach', 'sin(30)', 0.5)
report('trygonometria w radianach', Math.abs(calculate('sin(pi/2)', 'rad') - 1) < 1e-12, String(calculate('sin(pi/2)', 'rad')))
report('cosinus 60 stopni', Math.abs(calculate('cos(60)') - 0.5) < 1e-12, String(calculate('cos(60)')))

throws('dzielenie przez zero', '1/0', 'Nie dzielimy przez zero')
throws('pierwiastek z liczby ujemnej', 'sqrt(-1)', 'Pierwiastek')
throws('logarytm z liczby niedodatniej', 'ln(0)', 'Logarytm')
throws('niedomknięty nawias', '(2+3', 'niedomknięty')
throws('nieznana funkcja', 'foo(2)', 'Nieznana funkcja')
throws('niepełne wyrażenie', '2+', 'Niepełne')
throws('puste wyrażenie', '   ', 'Wpisz wyrażenie')

report('formatowanie wyniku bez zbędnych zer', formatResult(0.1 + 0.2) === '0,3', formatResult(0.1 + 0.2))
report('formatowanie liczb całkowitych', formatResult(1024) === '1024', formatResult(1024))
report('notacja naukowa dla skrajnie małych liczb', formatResult(1e-12).includes('e'), formatResult(1e-12))

console.log(failures === 0 ? '\nWszystkie sprawdzenia przeszły.' : `\nNiepowodzenia: ${failures}`)
process.exit(failures === 0 ? 0 : 1)
