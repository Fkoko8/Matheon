/**
 * Audyt banku zadań (bez dostępu do bazy).
 *
 * Odpowiada na pytanie „czy wszystkie zadania są poprawne i zgodne z egzaminem CKE”
 * w sposób powtarzalny. Sprawdza:
 *  1. format i kompletność: identyfikatory, treść, podpowiedzi, rozwiązanie, kroki,
 *  2. poprawność zapisu odpowiedzi: odpowiedzi liczbowe parsowalne, odpowiedzi
 *     jednokrotnego wyboru zgodne z listą opcji, matryce punktacji sumujące się do punktów,
 *  3. zgodność z maturą: zakres punktowy i poziom (podstawa / rozszerzenie) zgodne
 *     z wymaganiem CKE przypisanym do lekcji,
 *  4. pokrycie wymagań CKE zadaniami — które kody nie mają ani jednego zadania.
 *
 * Twarde błędy (niepoprawny format odpowiedzi, matryca nie równa się punktom,
 * duplikaty identyfikatorów) kończą się kodem 1.
 *
 * Uruchomienie: `pnpm qa:tasks` (bez .env).
 */
import { authoredTasks, authoredTopics, ckeRequirements } from '@/content'
import { curriculum } from '@/lib/learning/curriculum'

const MIN_POINTS = 1
const MAX_POINTS = 6
const MAX_DIFFICULTY = 5

let hardFailures = 0
const warnings: string[] = []

function fail(message: string) {
  hardFailures += 1
  console.log(`FAIL  ${message}`)
}

function warn(message: string) {
  warnings.push(message)
}

function pad(value: string | number, width: number): string {
  return String(value).padEnd(width)
}

/* ------------------------- Narzędzia sprawdzające ------------------------- */

const UNICODE_MINUS = /[\u2212\u2013\u2014]/g

/** Odpowiednik `normalizeAnswer` z `lib/learning/practice.ts`. */
function normalize(value: string): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(UNICODE_MINUS, '-')
    .replace(/\$/g, '')
    .replace(/\\left|\\right|\\!|\\,|\\;/g, '')
    .replace(/\s+/g, '')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/(^|[^\d])\.(\d)/g, '$1.0$2')
}

/** Liczba albo ułamek `p/q` — tak samo jak w silniku sprawdzania odpowiedzi. */
function asNumber(raw: string): number | null {
  const value = normalize(raw)
  if (!value) return null
  const fraction = value.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/)
  if (fraction) {
    const denominator = Number(fraction[2])
    if (!denominator) return null
    return Number(fraction[1]) / denominator
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Wymagania CKE przypisane do lekcji danego zadania. */
function requirementsOf(topicSlug: string, lessonSlug?: string) {
  const topic = authoredTopics.find((entry) => entry.slug === topicSlug)
  if (!topic) return []
  const lessons = lessonSlug ? topic.lessons.filter((lesson) => lesson.slug === lessonSlug) : topic.lessons
  const codes = new Set(lessons.flatMap((lesson) => lesson.requirements ?? []))
  return ckeRequirements.filter((requirement) => codes.has(requirement.code))
}

/* --------------------------- 1. Format zadań --------------------------- */

console.log('=== Format i kompletność zadań ===')

const seenIds = new Map<string, number>()
for (const task of authoredTasks) {
  seenIds.set(task.id, (seenIds.get(task.id) ?? 0) + 1)

  const label = `${task.id} (${task.topicSlug})`
  if (!task.prompt?.trim()) fail(`${label}: brak treści zadania`)
  if (!task.answer?.trim() && task.type !== 'proof') fail(`${label}: brak poprawnej odpowiedzi`)
  if (!task.solution?.trim()) fail(`${label}: brak rozwiązania`)
  if (!task.steps?.length) fail(`${label}: brak kroków rozwiązania`)
  if (!task.hints?.length) warn(`${label}: brak podpowiedzi`)
  if (!task.tags?.length) warn(`${label}: brak etykiet`)
  if (!task.skills?.length) fail(`${label}: zadanie bez umiejętności`)
  if (!task.lessonSlug) warn(`${label}: zadanie bez przypisanej lekcji`)
  if (task.difficulty < 1 || task.difficulty > MAX_DIFFICULTY) fail(`${label}: trudność poza zakresem 1–${MAX_DIFFICULTY}`)
  if (task.points < MIN_POINTS || task.points > MAX_POINTS) fail(`${label}: punktacja ${task.points} poza skalą maturalną ${MIN_POINTS}–${MAX_POINTS}`)

  if (task.type === 'single_choice') {
    const options = task.options ?? []
    if (options.length < 2) fail(`${label}: zadanie zamknięte bez listy opcji`)
    const normalizedOptions = options.map(normalize)
    if (new Set(normalizedOptions).size !== normalizedOptions.length) fail(`${label}: powtórzone opcje odpowiedzi`)
    if (task.answer && !normalizedOptions.includes(normalize(task.answer))) {
      fail(`${label}: odpowiedź „${task.answer}” nie występuje na liście opcji`)
    }
    // Na maturze zadanie zamknięte jest warte dokładnie 1 punkt.
    if (task.points !== 1) warn(`${label}: zadanie zamknięte warte ${task.points} pkt (na maturze zawsze 1 pkt)`)
    if (rubricOf(task).length) warn(`${label}: zadanie zamknięte ma matrycę punktacji (ocenia je automat)`)
  } else if (task.options?.length) {
    if (task.type === 'numeric') fail(`${label}: zadanie z opcjami powinno mieć typ „single_choice”`)
    else warn(`${label}: zadanie otwarte ma listę opcji`)
  }

  if (task.type === 'numeric' && task.answer) {
    // Lista wartości („2, 3”) to nie jedna liczba — taki zapis wymaga typu „text”/„open”.
    // Przecinek bez spacji to dziesiętny separator („3,5”); separator ze spacją to lista („2, 3”).
    const isList = /[,;]\s/.test(task.answer.trim())
    const parseable = asNumber(task.answer) !== null || task.acceptedAnswers?.some((variant) => asNumber(variant) !== null)
    if (isList) fail(`${label}: odpowiedź „${task.answer}” to lista wartości — użyj typu „text”`)
    else if (!parseable) {
      fail(`${label}: odpowiedź „${task.answer}” nie jest liczbą — dla odpowiedzi symbolicznej użyj typu „text” (wtedy uczeń może ocenić sam siebie)`)
    }
  }

  const rubric = rubricOf(task)
  if (rubric.length) {
    const rubricSum = rubric.reduce((sum, item) => sum + item.points, 0)
    if (Math.abs(rubricSum - task.points) > 0.001) {
      fail(`${label}: matryca punktacji sumuje się do ${rubricSum}, a zadanie jest warte ${task.points}`)
    }
    if (rubric.some((item) => item.points <= 0)) warn(`${label}: kryterium oceniania z zerową punktacją`)
    if (rubric.some((item) => !item.criterion?.trim())) warn(`${label}: kryterium oceniania bez opisu`)
  } else if (task.type === 'open' || task.type === 'proof') {
    warn(`${label}: zadanie otwarte bez matrycy punktacji`)
  }
}

const duplicates = [...seenIds.entries()].filter(([, count]) => count > 1)
if (duplicates.length) fail(`powtórzone identyfikatory zadań: ${duplicates.map(([id]) => id).join(', ')}`)
else console.log(`OK  ${authoredTasks.length} zadań z unikalnymi identyfikatorami`)

/* ------------------- 2. Zgodność z lekcjami i wymaganiami CKE ------------------- */

/** Umiejętności zadeklarowane w lekcji, do której przypisano zadanie. */
function lessonSkillSlugs(topicSlug: string, lessonSlug?: string): Set<string> {
  const topic = authoredTopics.find((entry) => entry.slug === topicSlug)
  const lesson = topic?.lessons.find((entry) => entry.slug === lessonSlug)
  return new Set((lesson?.skills ?? []).map((skill) => skill.slug))
}

/*
 * Zadania z lekcji „praktyka mieszana” (`*-matura`) ćwiczą umiejętności z innych lekcji
 * tego samego działu — to zamierzone. Dlatego rozbieżność raportujemy zbiorczo,
 * a nie jako osobne ostrzeżenie (inaczej lista Warningów utrudnia pracę).
 */
const misplacedTasks: string[] = []
for (const task of authoredTasks) {
  if (!task.lessonSlug) continue
  const declared = lessonSkillSlugs(task.topicSlug, task.lessonSlug)
  if (!declared.size) continue
  const isMixedPractice = task.lessonSlug.endsWith('-matura')
  if (isMixedPractice) continue
  const unknown = task.skills.filter((skill) => !declared.has(skill))
  if (unknown.length) misplacedTasks.push(`${task.id} (${unknown.join(', ')})`)
}
if (misplacedTasks.length) warn(`zadania ćwiczące umiejętność z innej lekcji: ${misplacedTasks.length} — ${misplacedTasks.join('; ')}`)

console.log('\n=== Zgodność z wymaganiami CKE ===')
const tasksByRequirement = new Map<string, number>()
for (const task of authoredTasks) {
  for (const requirement of requirementsOf(task.topicSlug, task.lessonSlug)) {
    tasksByRequirement.set(requirement.code, (tasksByRequirement.get(requirement.code) ?? 0) + 1)
  }
}

function rubricOf(task: { rubric?: { criterion: string; points: number }[] }) {
  return task.rubric ?? []
}

let levelMismatches = 0
for (const task of authoredTasks) {
  // Dział może mieszać zakres podstawowy i rozszerzony (np. wielomiany, prawdopodobieństwo),
  // dlatego poziom zadania porównujemy ze wszystkimi wymaganiami działu — nie tylko lekcji.
  const levels = new Set(ckeRequirements.filter((requirement) => requirement.topicSlug === task.topicSlug).map((requirement) => requirement.level))
  if (!levels.size) continue
  const topicLevel = authoredTopics.find((topic) => topic.slug === task.topicSlug)?.level
  const taskLevel = task.level ?? topicLevel
  if (taskLevel && !levels.has(taskLevel)) {
    levelMismatches += 1
    warn(`${task.id}: poziom „${taskLevel}” nie występuje w wymaganiach działu ${task.topicSlug} (${[...levels].join(', ')})`)
  }
}
console.log(`Zadania poza poziomem działu: ${levelMismatches}`)
console.log(`Zadania z umiejętnością spoza swojej lekcji: ${misplacedTasks.length}`)

const maturaReady = ckeRequirements.filter((requirement) => requirement.status === 'lesson_ready' || requirement.status === 'published')
const withoutTasks = maturaReady.filter((requirement) => !tasksByRequirement.get(requirement.code))
if (withoutTasks.length) {
  console.log(`Wymagania bez zadań (${withoutTasks.length}):`)
  for (const requirement of withoutTasks) console.log(`  ${requirement.code} (${requirement.level}) ${requirement.topicSlug} — ${requirement.title}`)
  warn(`${withoutTasks.length} wymagań z gotową lekcją nie ma ani jednego zadania`)
} else {
  console.log(`OK  każde wymaganie z gotową lekcją ma zadania`)
}

const extendedBasic = authoredTasks.filter((task) => task.level === 'basic' && requirementsOf(task.topicSlug, task.lessonSlug).every((requirement) => requirement.level === 'extended'))
if (extendedBasic.length) warn(`${extendedBasic.length} zadań z poziomem „basic” w lekcjach rozszerzonych: ${extendedBasic.map((task) => task.id).join(', ')}`)
console.log(`Niezgodności poziomu: ${levelMismatches}`)

/* ---------------------------- 3. Statystyki działów ---------------------------- */

console.log('\n=== Rozkład banku zadań ===')
console.log(`${pad('dział', 18)} ${pad('zadania', 8)} ${pad('śr. trudn.', 11)} ${pad('punkty', 7)} ${pad('otwarte', 8)} ${pad('zamkn.', 7)} typy`)

for (const topic of authoredTopics) {
  const tasks = authoredTasks.filter((task) => task.topicSlug === topic.slug)
  if (!tasks.length) continue
  const average = Math.round((tasks.reduce((sum, task) => sum + task.difficulty, 0) / tasks.length) * 10) / 10
  const points = tasks.reduce((sum, task) => sum + task.points, 0)
  const open = tasks.filter((task) => task.type === 'open' || task.type === 'proof' || task.type === 'text').length
  const closed = tasks.filter((task) => task.type === 'single_choice' || task.type === 'numeric').length
  const types = [...new Set(tasks.map((task) => task.type))].join('/')
  console.log(`${pad(topic.slug, 18)} ${pad(tasks.length, 8)} ${pad(average, 11)} ${pad(points, 7)} ${pad(open, 8)} ${pad(closed, 7)} ${types}`)
}

const basicTasks = authoredTasks.filter((task) => task.level === 'basic').length
const extendedTasks = authoredTasks.filter((task) => task.level === 'extended').length
const unlabeled = authoredTasks.length - basicTasks - extendedTasks
console.log(`\nPoziomy: podstawowy ${basicTasks} · rozszerzony ${extendedTasks} · bez etykiety ${unlabeled}`)
const distribution = new Map<number, number>()
for (const task of authoredTasks) distribution.set(task.difficulty, (distribution.get(task.difficulty) ?? 0) + 1)
console.log(`Trudność: ${[...distribution.entries()].sort((a, b) => a[0] - b[0]).map(([level, count]) => `${level}: ${count}`).join(' · ')}`)

if (authoredTasks.length !== authoredTopics.reduce((sum, topic) => sum + authoredTasks.filter((task) => task.topicSlug === topic.slug).length, 0)) {
  fail('część zadań nie należy do żadnego działu autorskiego')
}
if (!curriculum.length) fail('program nauki jest pusty')

/* --------------------------------- Podsumowanie --------------------------------- */

console.log('\n=== Podsumowanie ===')
if (warnings.length) {
  console.log(`Ostrzeżenia (${warnings.length}):`)
  for (const message of warnings) console.log(`  WARN  ${message}`)
}
console.log(`Błędy twarde: ${hardFailures}`)

if (hardFailures > 0) process.exit(1)
console.log('\nAudyt banku zadań zakończony bez błędów twardych.')
