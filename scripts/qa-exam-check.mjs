/**
 * End-to-end smoke test for the MATHEON exam flow (migrations 002 + 008).
 *
 * Uses a temporary Supabase user to exercise the real RLS-scoped path:
 *   start attempt -> save answers -> finish (RPC) -> verify scoring -> finish again (guard)
 * The temporary user and its data are removed afterwards.
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *               (or NEXT_PUBLIC_SUPABASE_ANON_KEY), SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY)
 *
 * Usage: node scripts/qa-exam-check.mjs
 */
const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!base || !anonKey || !serviceKey) {
  console.error('Brak konfiguracji: ustaw NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY oraz SERVICE_ROLE.')
  process.exit(2)
}

const service = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
let userId = null
let failures = 0

function report(label, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

const userHeaders = (token, extra = {}) => ({ apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra })

async function createUser(email, password) {
  const response = await fetch(`${base}/auth/v1/admin/users`, { method: 'POST', headers: service, body: JSON.stringify({ email, password, email_confirm: true }) })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.id) throw new Error(`create user failed (${response.status})`)
  return body.id
}

async function signIn(email, password) {
  const response = await fetch(`${base}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) throw new Error(`sign in failed (${response.status})`)
  return body.access_token
}

async function main() {
  // Wybierz opublikowany arkusz, który ma zadania
  const exams = await (await fetch(`${base}/rest/v1/exams?select=id,title,level&published=is.true`, { headers: service })).json()
  let exam = null
  let questions = []
  for (const candidate of exams ?? []) {
    const rows = await (await fetch(`${base}/rest/v1/exam_questions?select=question_id,points,questions(correct_answer,question_text)&exam_id=eq.${candidate.id}&order=order_index&limit=3`, { headers: service })).json()
    if (Array.isArray(rows) && rows.length) { exam = candidate; questions = rows; break }
  }
  report('znaleziono arkusz z zadaniami', Boolean(exam), exam ? `${exam.title} (${questions.length} zadań w próbce)` : 'brak arkuszy z exam_questions')

  if (!exam) return

  const email = `matheon.exam.${Date.now()}@example.com`
  const password = `Qa!${Math.random().toString(36).slice(2, 10)}A9`
  userId = await createUser(email, password)
  const token = await signIn(email, password)
  report('utworzenie i logowanie użytkownika testowego', Boolean(token))

  // Start próby
  const created = await fetch(`${base}/rest/v1/exam_attempts`, {
    method: 'POST',
    headers: userHeaders(token, { Prefer: 'return=representation' }),
    body: JSON.stringify({ user_id: userId, exam_id: exam.id, time_remaining_seconds: 180 * 60, total_points: 0, status: 'in_progress' }),
  })
  const attemptRows = await created.json().catch(() => [])
  const attempt = Array.isArray(attemptRows) ? attemptRows[0] : null
  report('start próby egzaminu', created.status === 201 && Boolean(attempt?.id), `status ${created.status}`)
  if (!attempt) return

  // Odpowiedzi: jedna poprawna, jedna błędna
  const totalPoints = questions.reduce((sum, q) => sum + Number(q.points), 0)
  const answerRows = questions.map((q, index) => ({
    attempt_id: attempt.id,
    question_id: q.question_id,
    answer: index === 0 ? String(q.questions.correct_answer) : '__niepoprawna__',
    flagged: index === 1,
  }))
  const saved = await fetch(`${base}/rest/v1/exam_answers`, { method: 'POST', headers: userHeaders(token, { Prefer: 'return=representation' }), body: JSON.stringify(answerRows) })
  report('zapis odpowiedzi w próbie', saved.status === 201, `status ${saved.status}`)

  // Zakończenie przez RPC
  const finished = await fetch(`${base}/rest/v1/rpc/finish_exam_attempt`, { method: 'POST', headers: userHeaders(token), body: JSON.stringify({ p_attempt_id: attempt.id }) })
  const result = await finished.json().catch(() => null)
  report('RPC finish_exam_attempt zwraca wynik', finished.status === 200 && result?.status === 'completed', `status ${finished.status}, status próby: ${result?.status}`)

  const expected = Number(questions[0].points)
  report('punkty naliczone za poprawną odpowiedź', Number(result?.earned_points ?? 0) >= expected, `earned ${result?.earned_points}, oczekiwano ≥ ${expected}`)
  report('procent wyniku policzony', Number(result?.percentage ?? 0) > 0, `percentage ${result?.percentage}`)

  // Powtórne zakończenie musi zwrócić null (ochrona z migracji 008)
  const again = await fetch(`${base}/rest/v1/rpc/finish_exam_attempt`, { method: 'POST', headers: userHeaders(token), body: JSON.stringify({ p_attempt_id: attempt.id }) })
  const againBody = await again.text().catch(() => '')
  report('powtórne zakończenie nie wywala błędu (guard 008)', again.status === 200, `status ${again.status}, body: ${againBody.slice(0, 40)}`)

  // Efekty uboczne: sesja nauki, odpowiedzi użytkownika
  const sessions = await (await fetch(`${base}/rest/v1/study_sessions?select=id,questions_count,xp_earned&user_id=eq.${userId}`, { headers: userHeaders(token) })).json()
  report('zapisano sesję nauki typu exam', Array.isArray(sessions) && sessions.length > 0, `${Array.isArray(sessions) ? sessions.length : 0} sesji`)

  const answers = await (await fetch(`${base}/rest/v1/user_answers?select=id&user_id=eq.${userId}`, { headers: userHeaders(token) })).json()
  report('odpowiedzi użytkownika zapisane', Array.isArray(answers) && answers.length === answerRows.length, `${Array.isArray(answers) ? answers.length : 0} z ${answerRows.length}`)

  console.log(`\n(arkusz testowy: ${exam.title}, suma punktów zadań: ${totalPoints})`)
}

main()
  .catch((error) => { failures += 1; console.error(`FAIL  nieoczekiwany błąd — ${error instanceof Error ? error.message : String(error)}`) })
  .finally(async () => {
    if (userId) {
      await fetch(`${base}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: service })
      console.log('OK    sprzątanie: usunięto tymczasowego użytkownika i jego dane')
    }
    console.log(failures === 0 ? '\nWYNIK: wszystkie sprawdzenia przeszły' : `\nWYNIK: ${failures} sprawdzeń nie przeszło`)
    process.exit(failures === 0 ? 0 : 1)
  })
