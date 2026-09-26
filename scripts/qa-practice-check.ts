/**
 * End-to-end test silnika treningu i powtórek (Faza 2).
 *
 * Test przechodzi przez TE SAME moduły, których używa aplikacja
 * (`lib/learning/practice`), z klientem Supabase działającym w kontekście
 * zalogowanego użytkownika — czyli z prawdziwym RLS, a nie z kluczem service role.
 *
 * Sprawdza: budowę kolejki, sprawdzanie odpowiedzi, zapis mastery per umiejętność,
 * harmonogram SM-2, pętlę naprawy błędów i przegląd postępu.
 *
 * Wymagane env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
 *               SERVICE_ROLE (tylko do utworzenia i usunięcia użytkownika testowego)
 *
 * Uruchomienie: pnpm qa:practice
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildPracticeQueue,
  loadMistakesWithQuestions,
  loadPracticeBank,
  loadPracticeOverview,
  loadQuestionMaterials,
  submitPracticeAnswer,
} from '@/lib/learning/practice'
import { loadSkillCatalog, loadSkillStates } from '@/lib/learning/skill-state'

const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!base || !anonKey || !serviceKey) {
  console.error('Brak konfiguracji: ustaw NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY oraz SERVICE_ROLE.')
  process.exit(2)
}

const service = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
let userId: string | null = null
let failures = 0

function report(label: string, ok: boolean, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

async function createUser(email: string, password: string): Promise<string> {
  const response = await fetch(`${base}/auth/v1/admin/users`, { method: 'POST', headers: service, body: JSON.stringify({ email, password, email_confirm: true }) })
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

async function main() {
  const email = `matheon.practice.${Date.now()}@example.com`
  const password = `Test-${Math.random().toString(36).slice(2)}-Aa1!`
  userId = await createUser(email, password)
  const token = await signIn(email, password)

  const supabase = createSupabaseClient(base, anonKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  await supabase.auth.setSession({ access_token: token, refresh_token: '' })
  const client = supabase as unknown as SupabaseClient

  /* 1. Katalog umiejętności */
  const skills = await loadSkillCatalog(client)
  report('katalog umiejętności z bazy', skills.length >= 10, `${skills.length} umiejętności`)

  /* 2. Bank zadań widoczny w aplikacji */
  const bank = await loadPracticeBank({ level: 'basic', limit: 600 }, client)
  report('bank zadań z realnymi rekordami', bank.total > 0 && bank.topics.length > 0, `${bank.total} zadań w ${bank.topics.length} działach`)
  report('bank zawiera autorskie zadania MATHEON', bank.questions.some((question) => question.authored), bank.questions.filter((question) => question.authored).length + ' autorskich')

  const numeric = bank.questions.find((question) => question.type === 'numeric' && question.authored && question.skillSlugs.length > 0)
  const second = bank.questions.find((question) => question.type === 'numeric' && question.authored && question.id !== numeric?.id && question.skillSlugs.length > 0)
  if (!numeric || !second) {
    report('znaleziono dwa zadania liczbowe do testu', false)
    return
  }

  /* 3. Kolejka treningu */
  const mixed = await buildPracticeQueue({ mode: 'mixed', level: 'basic', limit: 6, questionIds: [numeric.id, second.id] }, client)
  report('kolejka z konkretnych zadań zachowuje kolejność', mixed.questions.length === 2 && mixed.questions[0].id === numeric.id, mixed.questions.map((q) => q.code ?? q.id).join(', '))

  const weakQueue = await buildPracticeQueue({ mode: 'weak', limit: 5 }, client)
  report('kolejka słabych umiejętności bez historii jest pusta', weakQueue.questions.length === 0, 'brak danych = brak zadań do powtórki')

  /* 4. Poprawna odpowiedź */
  const materials = await loadQuestionMaterials(numeric.id, client)
  report('materiały do zadania (rozwiązanie + kroki)', materials.correctAnswer.length > 0 && materials.hints.length > 0, `${materials.hints.length} podpowiedzi, ${materials.steps.length} kroków`)

  const correct = await submitPracticeAnswer({ questionId: numeric.id, answer: materials.correctAnswer, timeSeconds: 45, hintsUsed: 0, solutionViewed: false }, client)
  report('poprawna odpowiedź rozpoznana', correct.isCorrect, `oczekiwano „${materials.correctAnswer}”`)
  report('wynik zapisany w bazie', correct.persisted)
  report('mastery umiejętności wzrosło', correct.skillUpdates.length > 0 && correct.skillUpdates.every((update) => update.after > update.before), correct.skillUpdates.map((u) => `${u.slug}: ${u.before}→${u.after}%`).join(', '))
  report('harmonogram SM-2 ustawiony', correct.skillUpdates.every((update) => update.dueInDays >= 1), correct.skillUpdates.map((u) => `za ${u.dueInDays} dni`).join(', '))

  /* 5. Błędna odpowiedź i pętla naprawy */
  const wrong = await submitPracticeAnswer({ questionId: second.id, answer: '__bledna_odpowiedz__', timeSeconds: 30, hintsUsed: 1, solutionViewed: false }, client)
  report('błędna odpowiedź zapisana', wrong.persisted && !wrong.isCorrect)
  report('mastery po błędzie nie rośnie', wrong.skillUpdates.every((update) => update.after <= update.before), wrong.skillUpdates.map((u) => `${u.slug}: ${u.before}→${u.after}%`).join(', '))

  const mistakes = await loadMistakesWithQuestions(userId, client)
  report('błąd trafił do pętli naprawy', mistakes.some((item) => item.questionId === second.id), `${mistakes.length} nierozwiązanych błędów`)
  report('błąd ma podpięte zadanie z banku', Boolean(mistakes.find((item) => item.questionId === second.id)?.question))

  const secondMaterials = await loadQuestionMaterials(second.id, client)
  const fixed = await submitPracticeAnswer({ questionId: second.id, answer: secondMaterials.correctAnswer, timeSeconds: 30, hintsUsed: 0, solutionViewed: false }, client)
  report('poprawna odpowiedź zamyka błąd', fixed.mistakeResolved)
  const afterFix = await loadMistakesWithQuestions(userId, client)
  report('zamknięty błąd znika z listy', !afterFix.some((item) => item.questionId === second.id))

  /* 5b. Zadania otwarte: sprawdzenie bez zapisu + samoocena wg matrycy */
  const openTask = bank.questions.find((question) => (question.type === 'proof' || question.type === 'open') && question.skillSlugs.length > 0)
  if (openTask) {
    const rehearsal = await submitPracticeAnswer({ questionId: openTask.id, answer: 'Moje rozumowanie krok po kroku, ale nie wynik.', timeSeconds: 300, dryRun: true }, client)
    report('zadanie otwarte prosi o samoocenę zamiast porównania tekstu', rehearsal.needsSelfAssessment && !rehearsal.persisted, openTask.code ?? openTask.id)
    report('zadanie otwarte pokazuje matrycę punktów', rehearsal.rubric.length > 0, `${rehearsal.rubric.length} kryteriów`)

    const selfGraded = await submitPracticeAnswer({ questionId: openTask.id, answer: 'Moje rozumowanie krok po kroku, ale nie wynik.', timeSeconds: 300, selfAssessment: 'incorrect' }, client)
    report('samoocena zapisuje wynik dokładnie raz', selfGraded.persisted && !selfGraded.isCorrect && !selfGraded.needsSelfAssessment)
    report('samoocena nie zawyża mastery', selfGraded.skillUpdates.every((update) => update.delta <= 0), selfGraded.skillUpdates.map((u) => `${u.slug}: ${u.delta}`).join(', '))
  } else {
    report('znaleziono zadanie otwarte w banku', false)
  }

  /* 6. Stan umiejętności (event sourcing) */
  const states = await loadSkillStates(userId, client)
  const practised = [...states.values()].filter((state) => state.attempts > 0)
  report('stan umiejętności odtworzony z dziennika zdarzeń', practised.length >= 2, `${practised.length} umiejętności`)
  report('nieudana próba zwiększyła liczbę wpadek', practised.some((state) => state.lapses > 0), practised.map((state) => state.lapses).join(', '))
  report('interwał SM-2 utrzymany w widełkach', practised.every((state) => state.ease >= 1.3 && state.ease <= 2.8 && state.intervalDays >= 1))

  /* 7. Przegląd i harmonogram */
  const overview = await loadPracticeOverview(userId, client)
  report('przegląd postępu liczy tylko ćwiczony materiał', overview.practisedSkills >= 2 && overview.mastery > 0, `mastery ${overview.mastery}%, ${overview.practisedSkills}/${overview.totalSkills} umiejętności`)
  report('powtórka nie jest jeszcze zaległa (SM-2 zaplanował przyszłość)', overview.dueToday === 0)

  const reviewQueue = await buildPracticeQueue({ mode: 'review', limit: 5 }, client)
  report('kolejka powtórek respektuje terminy', reviewQueue.questions.length === 0, 'brak zaległych umiejętności = pusta kolejka')

  const events = await fetch(`${base}/rest/v1/learning_events?select=id,skill_id,metadata&user_id=eq.${userId}`, { headers: { apikey: anonKey as string, Authorization: `Bearer ${token}` } }).then((response) => response.json())
  report('dziennik zdarzeń zawiera oceny SM-2', Array.isArray(events) && events.length >= 2 && events.every((event: { metadata?: { grade?: number } }) => typeof event.metadata?.grade === 'number'), `${events.length} zdarzeń`)
}

main()
  .catch((error) => {
    failures += 1
    console.error('Błąd wykonania testu:', error instanceof Error ? error.message : error)
  })
  .finally(async () => {
    if (userId) await fetch(`${base}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: service }).catch(() => null)
    console.log(failures === 0 ? '\nWszystkie sprawdzenia przeszły.' : `\nNiepowodzenia: ${failures}`)
    process.exit(failures === 0 ? 0 : 1)
  })
