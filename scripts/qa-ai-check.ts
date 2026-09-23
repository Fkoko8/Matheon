/**
 * End-to-end test warstwy AI (Faza 4).
 *
 * Sprawdza to, co da się sprawdzić bez wywoływania modelu:
 * 1. RAG — wyszukiwanie wiedzy zwraca realne fragmenty MATHEON (wektorowo, a bez klucza
 *    bramki AI w trybie słownym) i nie wywala się bez klienta,
 * 2. limity — zużycie AI zapisywane w bazie i egzekwowane dziennie oraz minutowo
 *    (wymaga migracji `010_ai_usage_rls.sql`; jej brak raportujemy wprost),
 * 3. kontekst zadania — adres z sesji treningowej/raportu wraca do tutora bez strat,
 *    a prompt nie zdradza rozwiązania w trybie `hint`,
 * 4. brak wpisanych na sztywno danych demo w ekranie tutora.
 *
 * Wymagane env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
 *               SERVICE_ROLE (utworzenie i sprzątanie użytkownika testowego)
 * Opcjonalnie: AI_GATEWAY_API_KEY (wtedy sprawdzane są też wektory)
 *
 * Uruchomienie: pnpm qa:ai
 */
import { readFileSync } from 'node:fs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { EMBEDDING_DIMENSIONS, embeddingsConfigured } from '@/lib/ai/embeddings'
import { keywordSearchKnowledge, searchKnowledge } from '@/lib/ai/retrieval/searchKnowledge'
import { buildGeneratorContext } from '@/lib/ai/context/buildGeneratorContext'
import { AI_LIMITS, checkAiQuota, logAiRequest, quotaMessage } from '@/lib/ai/usage'
import { buildTutorTaskHref, readTutorTaskParams, taskContextToPrompt, defaultTaskPrompt } from '@/lib/ai/task-context'
import { tutorModeFromInput, tutorSystemPrompt } from '@/lib/ai/tutor-prompt'

const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!base || !anonKey || !serviceKey) {
  console.error('Brak konfiguracji: ustaw NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY oraz SERVICE_ROLE.')
  process.exit(2)
}

const serviceHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
const serviceClient = createSupabaseClient(base, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }) as SupabaseClient
let userId: string | null = null
let failures = 0

function report(label: string, ok: boolean, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

function info(label: string, detail = '') {
  console.log(`INFO  ${label}${detail ? ` — ${detail}` : ''}`)
}

async function createUser(email: string, password: string): Promise<string> {
  const response = await fetch(`${base}/auth/v1/admin/users`, { method: 'POST', headers: serviceHeaders, body: JSON.stringify({ email, password, email_confirm: true }) })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.id) throw new Error(`create user failed (${response.status})`)
  return body.id as string
}

async function signIn(email: string, password: string): Promise<string> {
  const response = await fetch(`${base}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: anonKey as string, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) throw new Error(`sign in failed (${response.status})`)
  return body.access_token as string
}

async function countRows(filter: string): Promise<number> {
  const response = await fetch(`${base}/rest/v1/knowledge_chunks?select=id&limit=1&${filter}`, {
    headers: { ...serviceHeaders, prefer: 'count=exact' },
  })
  const range = response.headers.get('content-range') ?? ''
  const total = range.split('/')[1]
  return total ? Number(total) : 0
}

async function main() {
  const hasEmbeddingKey = embeddingsConfigured()
  info('tryb RAG', hasEmbeddingKey ? 'wektorowy (jest klucz bramki AI)' : 'słowny (brak AI_GATEWAY_API_KEY)')

  /* 1. RAG na realnej treści */
  const totalChunks = await countRows('')
  const missing = await countRows('embedding=is.null')
  report('baza wiedzy ma fragmenty treści', totalChunks > 0, `${totalChunks} fragmentów, ${missing} bez wektora`)

  const hits = await searchKnowledge('potęga o wykładniku całkowitym i pierwiastek', { level: 'basic', limit: 5 }, serviceClient)
  report('wyszukiwanie wiedzy zwraca materiał MATHEON', hits.length > 0, `${hits.length} fragmentów, tryb: ${hits[0]?.matchType ?? '—'}`)
  report('fragmenty mają treść i metadane lekcji', hits.every((hit) => hit.content.length > 40) && hits.some((hit) => Boolean(hit.metadata?.lesson)), hits[0]?.title ?? '')
  report('ranking odróżnia trafienia od reszty', (hits[0]?.similarity ?? 0) > 0, `podobieństwo ${(hits[0]?.similarity ?? 0).toFixed(2)}`)
  report('brak klienta nie wywala wyszukiwania', (await searchKnowledge('cokolwiek', {}, null)).length === 0)

  const keywordOnly = await keywordSearchKnowledge('pierwiastek kwadratowy', { limit: 3 }, serviceClient)
  report('tryb słowny działa niezależnie od wektorów', keywordOnly.length > 0 && keywordOnly.every((hit) => hit.matchType === 'keyword'), `${keywordOnly.length} fragmentów`)

  if (hasEmbeddingKey) {
    report('treść ma policzone wektory', missing === 0, missing ? `${missing} fragmentów bez wektora — uruchom pnpm content:embed` : 'wszystkie fragmenty z wektorem')
    const sample = await fetch(`${base}/rest/v1/knowledge_chunks?select=embedding&embedding=not.is.null&limit=1`, { headers: serviceHeaders }).then((response) => response.json()).catch(() => null)
    const vector = Array.isArray(sample) && sample[0]?.embedding ? JSON.parse(String(sample[0].embedding)) : null
    report('wektory mają wymiar zgodny ze schematem', Array.isArray(vector) ? vector.length === EMBEDDING_DIMENSIONS : false, Array.isArray(vector) ? `${vector.length} wymiarów` : 'brak danych')
  } else {
    info('wektory', `brak klucza bramki AI — ${missing} fragmentów czeka na embedding (pnpm content:embed)`)
  }

  /* 2. Kontekst zadania dla tutora */
  const task = {
    prompt: 'Przeanalizuj moje rozwiązanie',
    question: 'Oblicz $\\sqrt{16}+2^3$ i podaj wynik.',
    answer: '10',
    rubric: 'Poprawny wynik (1 pkt); zapis obliczeń (1 pkt)',
    source: 'Liczby rzeczywiste',
    skills: 'pierwiastki, potęgi',
  }
  const href = buildTutorTaskHref(task)
  const parsed = readTutorTaskParams(Object.fromEntries(new URL(href, 'https://matheon.local').searchParams))
  report('kontekst zadania przechodzi przez adres bez strat', parsed.question === task.question && parsed.rubric === task.rubric && parsed.answer === task.answer, href.slice(0, 120))
  report('długie treści są przycinane, nie wywalają adresu', buildTutorTaskHref({ question: 'x'.repeat(5000) }).length < 1200)
  report('pusty kontekst daje czysty adres', buildTutorTaskHref({}) === '/ai')
  report('domyślny prompt pasuje do zadania', defaultTaskPrompt(task).includes('błąd') && defaultTaskPrompt({}).includes('zagadnienie'))

  /* 3. Prompt tutora */
  const hintPrompt = tutorSystemPrompt('hint', taskContextToPrompt(task))
  report('prompt zawiera treść zadania i odpowiedź ucznia', hintPrompt.includes('Oblicz') && hintPrompt.includes('10'))
  report('prompt zawiera matrycę punktów i umiejętności', hintPrompt.includes('Poprawny wynik') && hintPrompt.includes('pierwiastki'))
  report('tryb hint nie zdradza rozwiązania', /nie podawaj gotowego wyniku/i.test(hintPrompt))
  report('brak kontekstu jest oznaczony wprost', tutorSystemPrompt('explain').includes('brak dodatkowego kontekstu'))
  report('rozpoznawanie trybu z wypowiedzi ucznia', tutorModeFromInput('daj mi wskazówkę') === 'hint' && tutorModeFromInput('przeanalizuj mój tok rozumowania') === 'reasoning')

  /* 4. Limity i dziennik zużycia */
  const email = `matheon.ai.${Date.now()}@example.com`
  const password = `Test-${Math.random().toString(36).slice(2)}-Aa1!`
  const testUserId = await createUser(email, password)
  userId = testUserId
  const token = await signIn(email, password)
  const userClient = createSupabaseClient(base, anonKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  }) as SupabaseClient
  await userClient.auth.setSession({ access_token: token, refresh_token: '' })

  const fresh = await checkAiQuota(userClient, testUserId, 'generator')
  report('świeży użytkownik mieści się w limicie', fresh.allowed && fresh.usedToday === 0, `źródło: ${fresh.source}, limit ${fresh.limit}/dzień`)

  // Polityka INSERT musi pozwolić użytkownikowi zapisać własne zużycie — inaczej
  // dziennik (i tym samym limity) działa tylko z klucza service role.
  const policyProbe = await logAiRequest(userClient, { userId: testUserId, kind: 'generator', mode: 'standard', responseMs: 120, success: true })
  report('zalogowany użytkownik zapisuje własne zużycie AI (polityka z migracji 010)', policyProbe, policyProbe ? '' : 'uruchom supabase/migrations/010_ai_usage_rls.sql')

  // Same liczniki testujemy service rolem: logika limitów nie zależy od polityki RLS.
  await logAiRequest(serviceClient, { userId: testUserId, kind: 'generator', mode: 'standard', responseMs: 120, success: true })
  const afterOne = await checkAiQuota(userClient, testUserId, 'generator')
  report('licznik zużycia widzi zapisane żądanie', afterOne.usedToday >= 1, `${afterOne.usedToday} żądań w 24 h`)

  const earlier = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  await serviceClient.from('ai_request_logs').insert(
    Array.from({ length: AI_LIMITS.generator.perDay }, () => ({
      user_id: testUserId,
      mode: 'generator:standard',
      tools: [],
      retrieval_count: 0,
      provider: 'qa',
      success: true,
      created_at: earlier,
    })),
  )

  const exhausted = await checkAiQuota(userClient, testUserId, 'generator')
  report('limit dzienny blokuje kolejne żądania', !exhausted.allowed && exhausted.reason === 'per_day', `wykorzystane ${exhausted.usedToday}/${exhausted.limit}`)
  report('komunikat o limicie jest po polsku i konkretny', quotaMessage(exhausted, 'generator').includes('Dzienny limit'))

  await serviceClient.from('ai_request_logs').insert(
    Array.from({ length: AI_LIMITS.tutor.perMinute }, () => ({
      user_id: testUserId,
      mode: 'tutor:explain',
      tools: [],
      retrieval_count: 0,
      provider: 'qa',
      success: true,
    })),
  )
  const throttled = await checkAiQuota(userClient, testUserId, 'tutor')
  report('limit minutowy chroni przed serią żądań', !throttled.allowed && throttled.reason === 'per_minute', `limit ${throttled.limit}/min`)

  await serviceClient.from('ai_request_logs').insert({ user_id: testUserId, mode: 'tutor:explain', tools: [], provider: 'qa', success: true, created_at: earlier })
  const tutorDay = await checkAiQuota(userClient, testUserId, 'tutor')
  report('rodzaje żądań liczone osobno', tutorDay.usedToday < AI_LIMITS.generator.perDay && tutorDay.usedToday >= 1, `tutor: ${tutorDay.usedToday}/${AI_LIMITS.tutor.perDay}`)

  /* 5. Kontekst generatora z realnej historii */
  const generatorContext = await buildGeneratorContext(userClient, testUserId, 'basic')
  report('kontekst generatora powstaje z historii ucznia', generatorContext.text.includes('Poziom ucznia'), generatorContext.text.split('\n')[0])

  /* 6. Brak danych demo w warstwie AI */
  const tutorPage = readFileSync('components/ai-tutor-page.tsx', 'utf8')
  report('ekran tutora nie ma wpisanej tożsamości ani poziomu z palca', !/FKoko/.test(tutorPage) && !/mastery: 54/.test(tutorPage))
  const openaiRoute = readFileSync('app/api/ai/tutor/route.ts', 'utf8')
  report('route tutora egzekwuje limit i loguje użycie', /checkAiQuota/.test(openaiRoute) && /logAiRequest/.test(openaiRoute))
}

main()
  .catch((error) => {
    failures += 1
    console.error('Błąd wykonania testu:', error instanceof Error ? error.message : error)
  })
  .finally(async () => {
    if (userId) {
      await fetch(`${base}/rest/v1/ai_request_logs?user_id=eq.${userId}`, { method: 'DELETE', headers: serviceHeaders }).catch(() => null)
      await fetch(`${base}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: serviceHeaders }).catch(() => null)
    }
    console.log(failures === 0 ? '\nWszystkie sprawdzenia przeszły.' : `\nNiepowodzenia: ${failures}`)
    process.exit(failures === 0 ? 0 : 1)
  })
