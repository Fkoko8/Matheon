/**
 * End-to-end smoke test for MATHEON learning content (Faza 1).
 *
 * Sprawdza, że dział „Liczby rzeczywiste” jest opublikowany w bazie (lekcje, bloki,
 * umiejętności, bank zadań z podpowiedziami i rozwiązaniami) oraz że renderuje się
 * w aplikacji z prawdziwymi wzorami KaTeX.
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *               (or NEXT_PUBLIC_SUPABASE_ANON_KEY), SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY)
 * Optional env: QA_APP_URL (default http://localhost:3000)
 *
 * Usage: node scripts/qa-content-check.mjs
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { createChunks } = require('@supabase/ssr/dist/main/utils/chunker.js')
const { stringToBase64URL } = require('@supabase/ssr/dist/main/utils/base64url.js')

const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
const appUrl = (process.env.QA_APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

if (!base || !anonKey || !serviceKey) {
  console.error('Brak konfiguracji: ustaw NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY oraz SERVICE_ROLE.')
  process.exit(2)
}

const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
const anonHeaders = { apikey: anonKey, 'Content-Type': 'application/json' }

let userId = null
let failures = 0

function report(label, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

async function rest(path) {
  const response = await fetch(`${base}/rest/v1/${path}`, { headers: serviceHeaders })
  if (!response.ok) throw new Error(`REST ${path} → ${response.status}`)
  return response.json()
}

async function count(table, query = 'select=id') {
  const response = await fetch(`${base}/rest/v1/${table}?${query}`, {
    headers: { ...serviceHeaders, Prefer: 'count=exact', Range: '0-0' },
  })
  const range = response.headers.get('content-range') ?? ''
  const total = Number(range.split('/')[1] ?? 0)
  return Number.isFinite(total) ? total : 0
}

async function createUser(email, password) {
  const response = await fetch(`${base}/auth/v1/admin/users`, {
    method: 'POST',
    headers: serviceHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.id) throw new Error(`create user failed (${response.status})`)
  return body.id
}

async function signIn(email, password) {
  const response = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: anonHeaders,
    body: JSON.stringify({ email, password }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) throw new Error(`sign in failed (${response.status})`)
  return body
}

async function deleteUser(id) {
  await fetch(`${base}/auth/v1/admin/users/${id}`, { method: 'DELETE', headers: serviceHeaders })
}

function sessionCookie(session) {
  const storageKey = `sb-${new URL(base).hostname.split('.')[0]}-auth-token`
  return createChunks(storageKey, `base64-${stringToBase64URL(JSON.stringify(session))}`)
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')
}

async function visit(path, cookie) {
  return fetch(`${appUrl}${path}`, { redirect: 'manual', headers: cookie ? { cookie } : {} })
}

async function main() {
  // --- Baza: struktura działu -------------------------------------------------
  const [topic] = await rest('topics?slug=eq.realne&select=id,name,description')
  report('dział „realne” istnieje w bazie', Boolean(topic?.id), topic?.name ?? 'brak')

  const lessons = await rest('lessons?slug=like.realne-*&select=id,slug,title,published,difficulty,estimated_minutes,objectives')
  report('opublikowane lekcje w dziale', lessons.length >= 3 && lessons.every((lesson) => lesson.published === true), `${lessons.length} lekcji`)
  report('lekcje niosą cele nauczania', lessons.every((lesson) => Array.isArray(lesson.objectives) && lesson.objectives.length >= 2))

  const blockCount = await count('lesson_blocks', 'select=id')
  report('bloki lekcji zapisane', blockCount >= 30, `${blockCount} bloków`)

  const sections = await rest('lesson_sections?select=id,title&title=eq.Treść lekcji')
  report('sekcje lekcji zapisane', sections.length >= lessons.length, `${sections.length} sekcji`)

  const skills = await rest('skills?select=slug,name')
  const requiredSkills = ['realne-zbiory-liczbowe', 'realne-potegi', 'realne-procenty', 'realne-wartosc-bezwzgledna']
  const skillSlugs = new Set(skills.map((skill) => skill.slug))
  report('umiejętności działu zarejestrowane', requiredSkills.every((slug) => skillSlugs.has(slug)), `${skills.length} umiejętności`)

  const linkedSkills = await count('lesson_skills', 'select=lesson_id')
  report('umiejętności przypięte do lekcji', linkedSkills >= 9, `${linkedSkills} powiązań`)

  // --- Baza: bank zadań -------------------------------------------------------
  const tasks = await rest('questions?select=id,title,question_type,difficulty,points,correct_answer,validation_metadata&validation_metadata->>topic=eq.realne')
  report('bank zadań działu opublikowany', tasks.length >= 18, `${tasks.length} zadań`)
  const codes = new Set(tasks.map((task) => task.validation_metadata?.code))
  report('stabilne kody zadań (rr-01…rr-18)', ['rr-01', 'rr-08', 'rr-14', 'rr-15', 'rr-18'].every((code) => codes.has(code)))
  report('zadania mają odpowiedzi i kroki rozwiązania', tasks.every((task) => typeof task.correct_answer === 'string' && task.correct_answer.length > 0 && Array.isArray(task.validation_metadata?.steps) && task.validation_metadata.steps.length > 0))
  const openTasks = tasks.filter((task) => task.question_type === 'open' || task.question_type === 'proof')
  report('bank zawiera zadania otwarte z pełną punktacją', openTasks.length >= 3 && openTasks.every((task) => task.points >= 3), `${openTasks.length} zadań otwartych`)
  report('bank zawiera zadania zamknięte i liczbowe', tasks.some((task) => task.question_type === 'numeric') && tasks.some((task) => task.question_type === 'single_choice'))

  const hints = await rest('questions?select=id,hints(hint_level,content)&validation_metadata->>topic=eq.realne')
  report('każde zadanie ma podpowiedzi', hints.every((task) => (task.hints ?? []).length >= 1))

  const solutions = await rest('questions?select=id,solutions(content)&validation_metadata->>topic=eq.realne')
  report('każde zadanie ma pełne rozwiązanie', solutions.every((task) => Boolean(task.solutions?.content)))

  const questionSkills = await count('question_skills', 'select=question_id')
  report('zadania powiązane z umiejętnościami', questionSkills >= 15, `${questionSkills} powiązań`)

  const chunks = await rest('knowledge_chunks?source_type=eq.lesson&select=title,content,metadata')
  report('indeks wiedzy dla tutora (lekcje)', chunks.length >= 20, `${chunks.length} fragmentów`)
  report('fragmenty niosą poziom i lekcję', chunks.some((chunk) => chunk.metadata?.lesson === 'realne-fundamenty' && chunk.metadata?.level === 'basic'))

  // --- Baza: drugi dział z pełną treścią -------------------------------------
  const [algebraTopic] = await rest('topics?slug=eq.algebra&select=id,name')
  report('dział „algebra” istnieje w bazie', Boolean(algebraTopic?.id), algebraTopic?.name ?? 'brak')

  const algebraLessons = await rest('lessons?slug=like.algebra-*&select=id,slug,published')
  const algebraLessonSlugs = new Set(algebraLessons.filter((lesson) => lesson.published === true).map((lesson) => lesson.slug))
  report('dział algebra ma opublikowane lekcje', ['algebra-wzory', 'algebra-przeksztalcenia', 'algebra-matura'].every((slug) => algebraLessonSlugs.has(slug)), `${algebraLessons.length} lekcji pasujących do wzorca`)

  const algebraTasks = await rest('questions?select=id,question_type,points,validation_metadata&validation_metadata->>topic=eq.algebra')
  report('bank zadań działu algebra opublikowany', algebraTasks.length >= 20, `${algebraTasks.length} zadań`)
  const algebraCodes = new Set(algebraTasks.map((task) => task.validation_metadata?.code))
  report('stabilne kody zadań (al-01…al-20)', ['al-01', 'al-07', 'al-15', 'al-20'].every((code) => algebraCodes.has(code)))
  report('dział algebra ma zadania otwarte z matrycą', algebraTasks.some((task) => (task.question_type === 'proof' || task.question_type === 'open') && Array.isArray(task.validation_metadata?.rubric) && task.validation_metadata.rubric.length > 0))

  const requirements = await rest('cke_requirements?code=like.I.*&select=code,coverage_status,mapped_skill_id')
  const ready = requirements.filter((item) => item.coverage_status === 'lesson_ready')
  report('wymagania CKE dla działu oznaczone jako gotowe', ready.length >= 6, `${ready.length} z ${requirements.length}`)

  // --- Aplikacja: render treści ----------------------------------------------
  const anonymous = await visit('/learn/lesson/realne/realne-fundamenty')
  report('bez sesji: lekcja przekierowuje na /login', anonymous.status === 307, `status ${anonymous.status}`)

  const email = `matheon.qa.content.${Date.now()}@example.com`
  const password = `Qa!${Math.random().toString(36).slice(2, 10)}A9`
  userId = await createUser(email, password)
  const cookie = sessionCookie(await signIn(email, password))

  const lessonResponse = await visit('/learn/lesson/realne/realne-zadania', cookie)
  report('z sesją: lekcja zwraca 200', lessonResponse.status === 200, `status ${lessonResponse.status}`)
  const lessonHtml = await lessonResponse.text()
  report('lekcja renderuje tytuł i sekcje', lessonHtml.includes('zadania standardowe'))
  report('wzory renderowane przez KaTeX', lessonHtml.includes('class="katex"'))
  report('brak surowych delimiterów LaTeX', !lessonHtml.includes('\\mathbb') && !lessonHtml.includes('$a^{m}'))

  const topicResponse = await visit('/learn/topic/realne', cookie)
  const topicHtml = await topicResponse.text()
  report('z sesją: dział zwraca 200 i listę lekcji', topicResponse.status === 200 && topicHtml.includes('Liczby rzeczywiste') && topicHtml.includes('realne-matura'))

  const libraryResponse = await visit('/learn', cookie)
  const libraryHtml = await libraryResponse.text()
  report('biblioteka nauki zawiera dział', libraryResponse.status === 200 && libraryHtml.includes('Liczby rzeczywiste'))

  // --- Aplikacja: ekrany Fazy 2 (trening, powtórki, błędy, mapa) --------------
  const gated = await visit('/tasks')
  report('bez sesji: trening przekierowuje na /login', gated.status === 307 && (gated.headers.get('location') ?? '').includes('/login'), `status ${gated.status}`)

  const screens = [
    ['/tasks', 'Bank zadań'],
    ['/review', 'Powtórki'],
    ['/mistakes', 'Moje błędy'],
    ['/stats', 'Twoje statystyki'],
    ['/map', 'Mapa wiedzy'],
    ['/', 'Dzień dobry'],
  ]

  for (const [path, marker] of screens) {
    const response = await visit(path, cookie)
    const html = await response.text()
    report(`z sesją: ${path} renderuje się`, response.status === 200 && html.includes(marker), `status ${response.status}${html.includes(marker) ? '' : `, brak „${marker}”`}`)
  }

  const reviewHtml = await (await visit('/review', cookie)).text()
  report('ekran powtórek opisuje harmonogram SM-2', reviewHtml.includes('SM-2'))
  const tasksHtml = await (await visit('/tasks', cookie)).text()
  report('ekran treningu nie zawiera już wbudowanych przykładów', !tasksHtml.includes('question-logarithm') && !tasksHtml.includes('Równanie logarytmiczne'))
}

main()
  .catch((error) => {
    failures += 1
    console.error(`FAIL  nieoczekiwany błąd — ${error instanceof Error ? error.message : String(error)}`)
  })
  .finally(async () => {
    if (userId) {
      await deleteUser(userId)
      console.log('OK    sprzątanie: usunięto tymczasowego użytkownika')
    }
    console.log(failures === 0 ? '\nWYNIK: wszystkie sprawdzenia przeszły' : `\nWYNIK: ${failures} sprawdzeń nie przeszło`)
    process.exit(failures === 0 ? 0 : 1)
  })
