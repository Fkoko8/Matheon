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
import { realneTasks } from '@/content/tasks/realne'
import { trygonometriaTasks } from '@/content/tasks/trygonometria'
import { kwadratowaTasks } from '@/content/tasks/kwadratowa'
import { realne as realneTopic } from '@/content/topics/realne'
import { kwadratowa as kwadratowaTopic } from '@/content/topics/kwadratowa'
import { trygonometria as trygonometriaTopic } from '@/content/topics/trygonometria'

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

  /* 3. Figury w treści */
  const topicFigures: Array<[string, unknown[]]> = [
    ['realne', realneTopic.lessons.flatMap((lesson) => lesson.blocks.map((block) => block.figure))],
    ['kwadratowa', kwadratowaTopic.lessons.flatMap((lesson) => lesson.blocks.map((block) => block.figure))],
    ['trygonometria', trygonometriaTopic.lessons.flatMap((lesson) => lesson.blocks.map((block) => block.figure))],
  ]
  const taskFigures = [...realneTasks, ...trygonometriaTasks, ...kwadratowaTasks].map((task) => [task.id, task.figure] as const)

  let topicCount = 0
  for (const [topic, figures] of topicFigures) {
    for (const figure of figures.filter(Boolean)) {
      topicCount += 1
      const parsed = parseFigureSpecs(figure)
      check(`figura w dziale „${topic}” jest poprawna`, parsed.length === 1)
    }
  }
  check('działy mają figury', topicCount >= 3, `znaleziono ${topicCount}`)

  let taskCount = 0
  for (const [id, figure] of taskFigures.filter(([, figure]) => Boolean(figure))) {
    taskCount += 1
    const parsed = parseFigureSpecs(figure)
    const badCurves = parsed.length === 1 && parsed[0].kind === 'plot'
      ? (parsed[0] as PlotFigure).curves.filter((curve) => !tryCompileExpression(curve.expr)).map((curve) => curve.expr)
      : []
    check(`zadanie ${id} ma poprawną figurę`, parsed.length === 1 && badCurves.length === 0, badCurves.join(', '))
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
