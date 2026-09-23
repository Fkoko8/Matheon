/**
 * End-to-end smoke test for MATHEON authentication.
 *
 * Creates a temporary confirmed user with the Supabase service role key, signs in
 * with email + password, rebuilds the @supabase/ssr session cookie exactly like
 * the browser client does, and checks that the app's proxy lets the session
 * through to protected routes. The temporary user is deleted afterwards.
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *               (or NEXT_PUBLIC_SUPABASE_ANON_KEY), SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY)
 * Optional env: QA_APP_URL (default http://localhost:3000)
 *
 * Usage: node scripts/qa-auth-check.mjs
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
  const response = await fetch(`${appUrl}${path}`, {
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
  })
  return response
}

async function main() {
  const email = `matheon.qa.${Date.now()}@example.com`
  const password = `Qa!${Math.random().toString(36).slice(2, 10)}A9`

  // Kontrola: bez sesji trasy chronione muszą przekierowywać na /login
  const anonymous = await visit('/')
  report('bez sesji: GET / przekierowuje na /login', anonymous.status === 307 && String(anonymous.headers.get('location')).includes('/login'), `status ${anonymous.status}`)

  userId = await createUser(email, password)
  report('utworzenie tymczasowego użytkownika', Boolean(userId))

  const session = await signIn(email, password)
  report('logowanie e-mail + hasło', Boolean(session.access_token))

  const cookie = sessionCookie(session)

  const home = await visit('/', cookie)
  report('z sesją: GET / bez przekierowania', home.status === 200, `status ${home.status}`)
  if (home.status === 200) {
    const html = await home.text()
    report('z sesją: dashboard renderuje treść', html.includes('MATHEON'))
  }

  for (const path of ['/exams', '/plan', '/stats', '/ai', '/generator', '/tasks', '/review', '/mistakes', '/learn']) {
    const response = await visit(path, cookie)
    report(`z sesją: GET ${path}`, response.status === 200, `status ${response.status}`)
  }

  const tutorWithTask = await visit('/ai?question=Oblicz%202%20do%20potegi%205&answer=32', cookie)
  const tutorWithTaskHtml = tutorWithTask.status === 200 ? await tutorWithTask.text() : ''
  report(
    'tutor otwarty z kontekstem zadania pokazuje to zadanie',
    tutorWithTask.status === 200 && tutorWithTaskHtml.includes('Oblicz 2 do potegi 5'),
    `status ${tutorWithTask.status}`,
  )

  const tutorAnon = await fetch(`${appUrl}/api/ai/tutor`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] }) })
  report('API tutora bez sesji zwraca 401', tutorAnon.status === 401, `status ${tutorAnon.status}`)

  const tutorAuth = await fetch(`${appUrl}/api/ai/tutor`, { method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Ile to jest 2+2?' }] }) })
  report('API tutora z sesją nie zwraca 401', tutorAuth.status !== 401, `status ${tutorAuth.status}`)

  const generatorAnon = await fetch(`${appUrl}/api/generator`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic: 'Logarytmy', level: 'extended', difficulty: 3, questionType: 'open' }) })
  report('API generatora bez sesji zwraca 401', generatorAnon.status === 401, `status ${generatorAnon.status}`)

  const generatorAuth = await fetch(`${appUrl}/api/generator`, { method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify({ topic: 'Logarytmy', level: 'extended', difficulty: 3, questionType: 'open' }) })
  report('API generatora z sesją odpowiada kontrolowanym błędem, nie 500', generatorAuth.status !== 500 && generatorAuth.status !== 401, `status ${generatorAuth.status}`)
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
