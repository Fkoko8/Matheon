/**
 * Test silnika figur (wykresy, geometria, osie liczbowe).
 *
 * Sprawdza:
 *  1. parser wyrażeń — poprawne obliczenia i błędy składni,
 *  2. parsowanie specyfikacji — walidacja, odrzucanie śmieciowych danych,
 *  3. figury osadzone w treści — wszystkie działy z `content/topics` i `content/tasks`
 *     mają składnie poprawne specyfikacje, które kompilator wyrażeń przyjmuje.
 *
 * Uruchomienie: tsx scripts/qa-figures-check.ts (bez dostępu do bazy)
 */
import { compileExpression, tryCompileExpression } from '@/lib/figures/evaluate'
import { parseFigureSpecs, type PlotFigure } from '@/lib/figures/spec'
import { authoredTasks, authoredTopics } from '@/content'

let failures = 0
function check(label: string, ok: boolean, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

function main() {
  /* 1. Parser wyrażeń */
  const cases: Array<[string, number, number]> = [
    ['x^2-6x+5', 3, -4],
    ['(x-2)^2-9', 2, -9],
    ['2x+1', 5, 11],
    ['sin(x)', Math.PI / 2, 1],
    ['sqrt(x)', 9, 3],
    ['1/x', 4, 0.25],
    ['-x^2+3', 2, -1],
    ['3(x+1)', 2, 9],
    ['xsin(x)', Math.PI / 2, Math.PI / 2],
    ['2^x', 3, 8],
    ['abs(-5x)', 2, 10],
    ['ln(e)', 0, 1],
  ]
  for (const [expr, x, expected] of cases) {
    const fn = tryCompileExpression(expr)
    const value = fn ? fn(x) : NaN
    check(`wyrażenie „${expr}” w x=${x}`, fn !== null && Math.abs(value - expected) < 1e-9, `wynik: ${value}`)
  }

  const sqrtNeg = tryCompileExpression('sqrt(x)')!
  check('sqrt(x<0) daje NaN (przerywa krzywą)', Number.isNaN(sqrtNeg(-4)))

  check('odrzuca błędną składnię', tryCompileExpression('x++*3') === null)
  check('odrzuca nieznaną funkcję', tryCompileExpression('foo(x)') === null)
  check('odrzuca puste wyrażenie', tryCompileExpression('  ') === null)

  /* 2. Parsowanie specyfikacji */
  const plot = parseFigureSpecs({
    kind: 'plot', xMin: -2, xMax: 4, yMin: -6, yMax: 6,
    curves: [{ expr: 'x^2-2x-3', color: 'violet' }],
    points: [{ x: -1, y: 0, label: 'x1' }],
    guides: [{ orientation: 'vertical', value: 1 }],
    caption: 'test',
  })
  check('parsuje pełny wykres', plot.length === 1 && (plot[0] as PlotFigure).curves.length === 1)

  check('odrzuca śmieci', parseFigureSpecs({ foo: 1 }).length === 0)
  check('odrzuca null/undefined', parseFigureSpecs(null).length === 0 && parseFigureSpecs(undefined).length === 0)
  check('odrzuca odwrócony zakres', parseFigureSpecs({ kind: 'plot', xMin: 5, xMax: -5, curves: [{ expr: 'x', color: 'blue' }] }).length === 0)
  check('ogranicza absurdalne liczby', parseFigureSpecs({ kind: 'numberline', min: -1e12, max: 5, points: [{ value: 0 }] }).length === 1)

  /* 3. Figury w treści — wszystkie działy i zadania autorskie, nie tylko wybrane */
  const badExpressions = (figure: unknown): string[] => {
    const parsed = parseFigureSpecs(figure)
    if (parsed.length !== 1) return []
    if (parsed[0].kind === 'plot') return (parsed[0] as PlotFigure).curves.filter((curve) => !tryCompileExpression(curve.expr)).map((curve) => curve.expr)
    if (parsed[0].kind === 'geometry') return parsed[0].elements.filter((element) => element.type === 'circle' && !(element.r > 0)).map((element) => `r=${(element as { r: number }).r}`)
    return []
  }

  const withFigures = authoredTopics.flatMap((topic) =>
    topic.lessons.flatMap((lesson) =>
      lesson.blocks.filter((block) => Boolean(block.figure)).map((block) => ({ label: `${topic.slug}/${lesson.slug}`, figure: block.figure })),
    ),
  )

  let topicCount = 0
  for (const entry of withFigures) {
    topicCount += 1
    const parsed = parseFigureSpecs(entry.figure)
    const badCurves = badExpressions(entry.figure)
    check(`figura w lekcji „${entry.label}” jest poprawna`, parsed.length === 1 && badCurves.length === 0, badCurves.join(', '))
  }
  check('działy mają figury', topicCount >= 15, `znaleziono ${topicCount}`)

  let taskCount = 0
  for (const task of authoredTasks) {
    if (!task.figure) continue
    taskCount += 1
    const parsed = parseFigureSpecs(task.figure)
    const badCurves = badExpressions(task.figure)
    check(`zadanie ${task.id} ma poprawną figurę`, parsed.length === 1 && badCurves.length === 0, badCurves.join(', '))
  }
  check('zadania mają figury', taskCount >= 2, `znaleziono ${taskCount}`)

  /* 4. Przykład end-to-end: wartości z parsera zgadzają się z treścią zadania kw-01 */
  const wierzcholek = compileExpression('(x-2)^2-9')(2)
  check('wierzchołek z kw-01: f(2) = -9', wierzcholek === -9)
}

main()

if (failures > 0) {
  console.log(`\nNiepowodzenia: ${failures}`)
  process.exit(1)
}
console.log('\nWszystkie sprawdzenia przeszły.')
