/**
 * End-to-end test egzaminów z punktacją cząstkową (Faza 3, migracja 009).
 *
 * Sprawdza na prawdziwym RLS (użytkownik tymczasowy):
 *   - odpowiedź w innym, poprawnym zapisie dostaje pełne punkty (koniec porównania tekstu),
 *   - zadanie otwarte przyjmuje punkty z samooceny wg matrycy,
 *   - suma próby i procent liczą się z punktów cząstkowych,
 *   - egzamin zasila umiejętności (`learning_events`) i pętlę błędów,
 *   - `regrade_exam_attempt` przelicza próbę po samoocenie,
 *   - powtórne zakończenie próby nadal zwraca `null` (ochrona z migracji 008).
 *
 * Wymagane env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SERVICE_ROLE
 *
 * Uruchomienie: pnpm qa:examreport
 */
const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!base || !anonKey || !serviceKey) {
  console.error('Brak konfiguracji: ustaw NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY oraz SERVICE_ROLE.')
  process.exit(2)
}

const service = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
const userHeaders = (token: string, extra: Record<string, string> = {}) => ({ apikey: anonKey as string, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra })

let userId: string | null = null
let failures = 0

function report(label: string, ok: boolean, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

interface ExamQuestionRow {
  question_id: string
  question_number: number
  points: number
  questions: {
    question_text: string
    question_type: string
    correct_answer: string
    validation_metadata: { acceptedAnswers?: string[]; rubric?: { criterion: string; points: number }[] } | null
    skills?: string[] | null
  } | null
}

async function main() {
  // 0. Czy migracja 009 jest wgrana?
  const probe = await fetch(`${base}/rest/v1/exam_answers?select=points_earned&limit=1`, { headers: service })
  const schemaReady = probe.ok
  report('migracja 009 (punktacja cząstkowa) wgrana', schemaReady, schemaReady ? 'kolumny dostępne' : 'uruchom supabase/migrations/009_exam_partial_credit.sql')
  if (!schemaReady) return

  const email = `matheon.examreport.${Date.now()}@example.com`
  const password = `Qa!${Math.random().toString(36).slice(2, 10)}A9`
  const created = await json<{ id: string }>(`${base}/auth/v1/admin/users`, { method: 'POST', headers: service, body: JSON.stringify({ email, password, email_confirm: true }) })
  userId = created?.id ?? null
  if (!userId) throw new Error('Nie udało się utworzyć użytkownika testowego.')

  const session = await json<{ access_token: string }>(`${base}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: anonKey as string, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  const token = session.access_token

  // 1. Arkusz z zadaniami — preferujemy taki, który ma zadanie liczbowe i otwarte.
  const exams = await json<Array<{ id: string; title: string; total_points: number; duration_minutes: number }>>(`${base}/rest/v1/exams?select=id,title,total_points,duration_minutes&published=is.true`, { headers: service })
  let exam: (typeof exams)[number] | null = null
  let questions: ExamQuestionRow[] = []

  for (const candidate of exams ?? []) {
    const rows = await json<ExamQuestionRow[]>(`${base}/rest/v1/exam_questions?exam_id=eq.${candidate.id}&select=question_id,question_number,points,questions(question_text,question_type,correct_answer,validation_metadata,skills)&order=order_index&limit=20`, { headers: service })
    if (!Array.isArray(rows) || rows.length < 3) continue
    const hasOpen = rows.some((row) => row.questions?.question_type === 'open' || row.questions?.question_type === 'proof')
    if (!hasOpen) continue
    exam = candidate
    questions = rows
    break
  }

  report('znaleziono arkusz z zadaniami otwartymi', Boolean(exam), exam ? `${exam.title} (${questions.length} zadań)` : 'brak arkusza z zadaniem otwartym')
  if (!exam) return

  // 2. Start próby.
  const started = await json<Array<{ id: string; total_points: number }>>(`${base}/rest/v1/exam_attempts`, {
    method: 'POST',
    headers: userHeaders(token, { Prefer: 'return=representation' }),
    body: JSON.stringify({ user_id: userId, exam_id: exam.id, time_remaining_seconds: exam.duration_minutes * 60, total_points: exam.total_points, status: 'in_progress' }),
  })
  const attempt = started?.[0]
  report('rozpoczęcie próby', Boolean(attempt?.id))
  if (!attempt) return

  const openQuestion = questions.find((row) => row.questions?.question_type === 'open' || row.questions?.question_type === 'proof')
  const numericQuestions = questions.filter((row) => /^[+-]?\d+([.,]\d+)?$/.test(String(row.questions?.correct_answer ?? '')))
  const correctQuestion = numericQuestions[0] ?? questions[0]
  const wrongQuestion = questions.find((row) => row.question_id !== correctQuestion.question_id && row.question_id !== openQuestion?.question_id) as ExamQuestionRow
  const unansweredQuestion = questions.find((row) => row.question_id !== correctQuestion.question_id && row.question_id !== wrongQuestion.question_id && row.question_id !== openQuestion?.question_id)

  // 3. Zapis odpowiedzi: poprawna w wariancie zapisu, błędna, otwarta i brak odpowiedzi.
  const variant = `${String(correctQuestion.questions?.correct_answer)}`.includes('.')
    ? `${String(correctQuestion.questions?.correct_answer).replace('.', ',')} `
    : ` ${String(correctQuestion.questions?.correct_answer)} `
  const rows = [
    { attempt_id: attempt.id, question_id: correctQuestion.question_id, answer: variant, flagged: false },
    { attempt_id: attempt.id, question_id: wrongQuestion.question_id, answer: '999999', flagged: false },
    ...(openQuestion ? [{ attempt_id: attempt.id, question_id: openQuestion.question_id, answer: 'Przekształcam nierówność i sprowadzam ją do kwadratu różnicy.', flagged: false }] : []),
  ]
  await fetch(`${base}/rest/v1/exam_answers`, { method: 'POST', headers: userHeaders(token, { Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(rows) })
  report('zapisano odpowiedzi (w tym wariant zapisu wyniku)', true, `wariant: „${variant}”`)

  if (openQuestion) {
    const rubricPoints = openQuestion.questions?.validation_metadata?.rubric?.[0]?.points ?? Math.max(1, Math.round(openQuestion.points / 2))
    const points = Math.min(openQuestion.points, rubricPoints)
    const graded = await fetch(`${base}/rest/v1/exam_answers?attempt_id=eq.${attempt.id}&question_id=eq.${openQuestion.question_id}`, {
      method: 'PATCH',
      headers: userHeaders(token, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ points_earned: points, graded_by: 'self', is_correct: points >= openQuestion.points }),
    })
    report('samoocena zadania otwartego zapisana', graded.ok, `${points}/${openQuestion.points} pkt`)
  }

  // 4. Zakończenie próby.
  const finished = await json<{ earned_points: number; total_points: number; percentage: number; status: string }>(`${base}/rest/v1/rpc/finish_exam_attempt`, { method: 'POST', headers: userHeaders(token), body: JSON.stringify({ p_attempt_id: attempt.id }) })
  const expectedTotal = questions.reduce((sum, row) => sum + row.points, 0)
  const expectedEarned = correctQuestion.points + (openQuestion ? Math.min(openQuestion.points, openQuestion.questions?.validation_metadata?.rubric?.[0]?.points ?? Math.max(1, Math.round(openQuestion.points / 2))) : 0)

  report('próba zakończona', finished?.status === 'completed', `status ${finished?.status}`)
  report('suma punktów arkusza z punktów zadań', finished?.total_points === expectedTotal, `${finished?.total_points} vs ${expectedTotal}`)
  report('pełne punkty za poprawny wariant zapisu (bez porównania tekstu)', finished ? finished.earned_points >= correctQuestion.points : false, `${finished?.earned_points} pkt (zadanie warte ${correctQuestion.points})`)
  if (openQuestion) {
    report('punkty cząstkowe z samooceny wliczone do wyniku', (finished?.earned_points ?? 0) >= expectedEarned - 0.01, `${finished?.earned_points} pkt (oczekiwano min. ${expectedEarned})`)
  }
  report('procent liczony z sumy punktów', Boolean(finished) && Math.abs((finished as { percentage: number }).percentage - Math.round((((finished as { earned_points: number }).earned_points) / expectedTotal) * 10000) / 100) < 0.01, `${finished?.percentage}%`)

  // 5. Punktacja per zadanie i typ oceny.
  const saved = await json<Array<{ question_id: string; points_earned: number; graded_by: string; is_correct: boolean }>>(`${base}/rest/v1/exam_answers?attempt_id=eq.${attempt.id}&select=question_id,points_earned,graded_by,is_correct`, { headers: userHeaders(token) })
  const savedCorrect = saved?.find((row) => row.question_id === correctQuestion.question_id)
  const savedWrong = saved?.find((row) => row.question_id === wrongQuestion.question_id)
  report('poprawna odpowiedź oznaczona jako poprawna', Boolean(savedCorrect?.is_correct), `${savedCorrect?.points_earned} pkt`)
  report('błędna odpowiedź bez punktów', Boolean(savedWrong) && !savedWrong?.is_correct && Number(savedWrong?.points_earned) === 0)
  if (openQuestion) {
    report('zadanie otwarte zachowuje ocenę „self”', saved?.find((row) => row.question_id === openQuestion.question_id)?.graded_by === 'self')
  }

  // 6. Egzamin zasila umiejętności i błędy.
  const expectedSlugs = new Set(questions.flatMap((row) => row.questions?.skills ?? []).map(String))
  const catalog = await json<Array<{ id: string; slug: string }>>(`${base}/rest/v1/skills?select=id,slug`, { headers: service })
  const slugById = new Map((catalog ?? []).map((skill) => [skill.id, skill.slug]))
  const events = await json<Array<{ id: string; skill_id: string | null; metadata: { source?: string } }>>(`${base}/rest/v1/learning_events?select=id,skill_id,metadata&user_id=eq.${userId}&event_type=eq.answer`, { headers: userHeaders(token) })
  report('egzamin zapisał zdarzenia umiejętności', Array.isArray(events) && events.length > 0, `${events?.length ?? 0} zdarzeń`)
  report('zdarzenia są oznaczone źródłem „exam”', Boolean(events?.length) && events.every((event) => event.metadata?.source === 'exam'))
  report(
    'zdarzenia dotyczą umiejętności z arkusza',
    expectedSlugs.size === 0 || (events ?? []).every((event) => !event.skill_id || expectedSlugs.has(slugById.get(String(event.skill_id)) ?? '')),
    `umiejętności w arkuszu: ${[...expectedSlugs].join(', ') || 'brak'}`, 
  )

  const mistakes = await json<Array<{ question_id: string }>>(`${base}/rest/v1/mistakes?select=question_id&user_id=eq.${userId}`, { headers: userHeaders(token) })
  report('błędne zadanie trafiło do pętli błędów', Boolean(mistakes?.some((row) => row.question_id === wrongQuestion.question_id)))
  if (unansweredQuestion) {
    report('zadanie bez odpowiedzi też jest błędem do naprawy', Boolean(mistakes?.some((row) => row.question_id === unansweredQuestion.question_id)))
  }

  // 7. Przeliczenie po zmianie punktacji (samoocena z raportu).
  if (openQuestion) {
    await fetch(`${base}/rest/v1/exam_answers?attempt_id=eq.${attempt.id}&question_id=eq.${openQuestion.question_id}`, {
      method: 'PATCH',
      headers: userHeaders(token, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ points_earned: openQuestion.points, graded_by: 'self', is_correct: true }),
    })
    const regraded = await json<{ earned_points: number; percentage: number }>(`${base}/rest/v1/rpc/regrade_exam_attempt`, { method: 'POST', headers: userHeaders(token), body: JSON.stringify({ p_attempt_id: attempt.id }) })
    report('regrade_exam_attempt przelicza wynik po samoocenie', (regraded?.earned_points ?? 0) === correctQuestion.points + openQuestion.points, `${regraded?.earned_points}/${expectedTotal} pkt · ${regraded?.percentage}%`)
  }

  // 8. Ochrona przed powtórnym zakończeniem (migracja 008).
  const again = await fetch(`${base}/rest/v1/rpc/finish_exam_attempt`, { method: 'POST', headers: userHeaders(token), body: JSON.stringify({ p_attempt_id: attempt.id }) })
  const againBody = await again.text()
  report('powtórne zakończenie zwraca null', again.ok && (againBody === 'null' || againBody === ''), `${again.status} ${againBody.slice(0, 40)}`)
}

main()
  .catch((cause) => {
    failures += 1
    console.error('Błąd wykonania testu:', cause instanceof Error ? cause.message : cause)
  })
  .finally(async () => {
    if (userId) await fetch(`${base}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: service }).catch(() => null)
    console.log(failures === 0 ? '\nWszystkie sprawdzenia przeszły.' : `\nNiepowodzenia: ${failures}`)
    process.exit(failures === 0 ? 0 : 1)
  })
