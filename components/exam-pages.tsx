'use client'

/**
 * Egzaminy: biblioteka arkuszy, karta arkusza i tryb egzaminu.
 *
 * Tryb egzaminu podaje dokładnie to, co daje matura: czas, nawigator zadań, oznaczanie
 * do sprawdzenia oraz tablice wzorów i kalkulator. Wynik liczy się z punktów cząstkowych
 * (`lib/exams.ts`), a raport (`components/exam-report-page.tsx`) pokazuje, gdzie uciekły punkty.
 */
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, Flag, Loader2, Save, Search } from 'lucide-react'
import {
  finishExam,
  getAttempt,
  getExam,
  getExamAnswers,
  getExamQuestions,
  listExams,
  saveExamAnswer,
  saveExamTime,
  startExam,
  type Exam,
  type ExamAnswer,
  type ExamAttempt,
  type ExamQuestion,
} from '@/lib/exams'
import { ExamTools } from '@/components/exam-toolbar'
import { ExamReportPage } from '@/components/exam-report-page'
import { MathText } from '@/components/math-text'

const levelLabel = (level: string) => (level === 'extended' ? 'Rozszerzenie' : 'Podstawa')

function Loading({ label = 'Ładowanie…' }: { label?: string }) {
  return <div className="grid min-h-[40vh] place-items-center text-sm text-slate-500"><Loader2 className="mr-2 inline animate-spin" size={16} />{label}</div>
}

export function ExamLibraryPage({ openExam }: { openExam: (id: string) => void }) {
  const [exams, setExams] = useState<Exam[]>([])
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [status, setStatus] = useState('all')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setError('')
      setExams(await listExams({ query, level, status }))
    } catch {
      setError('Nie udało się pobrać egzaminów.')
    }
  }, [query, level, status])

  useEffect(() => { void load() }, [load])

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <header>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Biblioteka egzaminów</p>
        <h1 className="text-3xl font-semibold text-white">Arkusze maturalne</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Pełne próby w warunkach egzaminu: czas, tablice wzorów, punktacja cząstkowa i raport z prognozą wyniku.</p>
      </header>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <Search size={16} className="text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj po nazwie, źródle lub roku" aria-label="Szukaj arkuszy" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
        </div>
        <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Poziom" className="rounded-xl border border-white/[0.08] bg-[#15151e] px-4 py-3 text-sm text-slate-300">
          <option value="all">Wszystkie poziomy</option>
          <option value="basic">Podstawa</option>
          <option value="extended">Rozszerzenie</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status" className="rounded-xl border border-white/[0.08] bg-[#15151e] px-4 py-3 text-sm text-slate-300">
          <option value="all">Każdy status</option>
          <option value="in_progress">W trakcie</option>
          <option value="completed">Ukończone</option>
          <option value="not_started">Nie rozpoczęte</option>
        </select>
      </div>

      {error && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button onClick={() => void load()} className="underline">Spróbuj ponownie</button>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {exams.map((exam) => (
          <button key={exam.id} onClick={() => openExam(exam.id)} className="text-left rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-violet-400/30">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] text-violet-300">{levelLabel(exam.level)}</span>
              {exam.inProgress ? <span className="text-xs text-amber-300">W trakcie</span> : exam.attempts.length ? <span className="text-xs text-emerald-300">{exam.attempts[0].percentage}%</span> : <span className="text-xs text-slate-500">Nie rozpoczęty</span>}
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">{exam.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{exam.description}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
              <span>{exam.questionCount} zadań</span>
              <span>{exam.durationMinutes} min</span>
              <span>{exam.totalPoints} pkt</span>
              <span>{exam.attempts.length} prób</span>
            </div>
          </button>
        ))}
      </div>

      {!exams.length && !error && <Loading label="Brak egzaminów. Zastosuj migrację 002_exam_system.sql." />}
    </main>
  )
}

export function ExamDetailsPage({ examId, openAttempt, close }: { examId: string; openAttempt: (attemptId: string) => void; close: () => void }) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getExam(examId), getExamQuestions(examId)])
      .then(([loadedExam, loadedQuestions]) => { setExam(loadedExam); setQuestions(loadedQuestions) })
      .catch(() => setError('Nie udało się pobrać szczegółów.'))
      .finally(() => setLoading(false))
  }, [examId])

  if (loading) return <Loading />
  if (error || !exam) return <main className="p-10 text-rose-200">{error || 'Egzamin nie istnieje.'}</main>

  const best = exam.attempts.reduce<ExamAttempt | null>((accumulator, attempt) => (!accumulator || attempt.percentage > accumulator.percentage ? attempt : accumulator), null)
  const begin = async () => {
    try {
      const attempt = exam.inProgress ?? (await startExam(exam.id))
      openAttempt(attempt.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się rozpocząć.')
    }
  }

  return (
    <main className="matheon-enter mx-auto max-w-5xl p-5 pb-28 lg:p-10">
      <button onClick={close} className="mb-8 text-sm text-slate-500 hover:text-white">← Wróć do biblioteki</button>
      <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-[#11111a] p-6 md:p-8">
        <span className="text-xs text-violet-200">{levelLabel(exam.level)} · {exam.year}</span>
        <h1 className="mt-3 text-3xl font-semibold text-white">{exam.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{exam.description}</p>
        <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-5">
          {[['Czas', `${exam.durationMinutes} min`], ['Zadania', String(exam.questionCount)], ['Punkty', String(exam.totalPoints)], ['Próby', String(exam.attempts.length)], ['Najlepszy', best ? `${best.earnedPoints}/${best.totalPoints}` : '—']].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <button onClick={begin} className="mt-8 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900">{exam.inProgress ? 'Kontynuuj' : 'Rozpocznij'}</button>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </div>

      <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <h2 className="font-semibold text-white">Struktura egzaminu</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {questions.map((question) => (
            <div key={question.id} className="rounded-xl border border-white/[0.07] p-3 text-center">
              <p className="text-sm text-white">{question.number}</p>
              <p className="mt-1 text-[10px] text-slate-500">{question.points} pkt</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <h2 className="font-semibold text-white">Historia</h2>
        {exam.attempts.length ? (
          <div className="mt-4 flex flex-col gap-2">
            {exam.attempts.map((attempt) => (
              <button key={attempt.id} onClick={() => attempt.status === 'completed' && openAttempt(attempt.id)} className="flex items-center justify-between rounded-xl border border-white/[0.07] p-4 text-left hover:border-violet-400/30">
                <span className="text-sm text-slate-300">{new Date(attempt.finishedAt ?? attempt.startedAt).toLocaleDateString('pl-PL')}</span>
                <span className="text-sm text-white">{attempt.earnedPoints}/{attempt.totalPoints} · {attempt.percentage}%</span>
              </button>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-slate-500">Brak poprzednich prób.</p>}
      </section>
    </main>
  )
}

export function ExamModePage({ attemptId, exit }: { attemptId: string; exit: () => void }) {
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({})
  const [current, setCurrent] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [result, setResult] = useState<ExamAttempt | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const loaded = await getAttempt(attemptId)
        if (!loaded) throw new Error()
        const [loadedQuestions, saved] = await Promise.all([getExamQuestions(loaded.examId), getExamAnswers(attemptId)])
        setAttempt(loaded)
        setSeconds(loaded.timeRemainingSeconds)
        setQuestions(loadedQuestions)
        setAnswers(Object.fromEntries(saved.map((answer) => [answer.questionId, answer])))
      } catch {
        setError('Nie udało się przywrócić egzaminu.')
      }
    })()
  }, [attemptId])

  const persist = useCallback(async (questionId: string, answer: string, flagged: boolean) => {
    setSaving(true)
    try {
      await saveExamAnswer(attemptId, questionId, answer, flagged)
    } catch {
      setError('Nie udało się zapisać odpowiedzi. Spróbuj ponownie.')
    } finally {
      setSaving(false)
    }
  }, [attemptId])

  useEffect(() => {
    if (!attempt || result) return
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) { window.clearInterval(timer); setSubmitOpen(true); return 0 }
      return value - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [attempt, result])

  useEffect(() => {
    if (!attempt || result) return
    const interval = window.setInterval(() => { void saveExamTime(attemptId, seconds) }, 10000)
    return () => window.clearInterval(interval)
  }, [attempt, attemptId, result, seconds])

  const question = questions[current]

  const setAnswer = (value: string) => {
    if (!question) return
    const next: ExamAnswer = { questionId: question.questionId, answer: value, flagged: answers[question.questionId]?.flagged ?? false, savedAt: new Date().toISOString(), pointsEarned: answers[question.questionId]?.pointsEarned ?? 0, gradedBy: answers[question.questionId]?.gradedBy ?? 'auto', isCorrect: answers[question.questionId]?.isCorrect ?? false }
    setAnswers((previous) => ({ ...previous, [question.questionId]: next }))
    void persist(question.questionId, value, next.flagged)
  }

  const toggleFlag = () => {
    if (!question) return
    const flagged = !answers[question.questionId]?.flagged
    const answer = answers[question.questionId]?.answer ?? ''
    setAnswers((previous) => ({ ...previous, [question.questionId]: { questionId: question.questionId, answer, flagged, savedAt: new Date().toISOString(), pointsEarned: 0, gradedBy: 'auto', isCorrect: false } }))
    void persist(question.questionId, answer, flagged)
  }

  const submit = async () => {
    setFinishing(true)
    try {
      const finished = await finishExam(attemptId)
      setResult(finished)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się wysłać egzaminu.')
      setSubmitOpen(false)
    } finally {
      setFinishing(false)
    }
  }

  const answered = Object.values(answers).filter((answer) => answer.answer.trim()).length
  const flagged = Object.values(answers).filter((answer) => answer.flagged).length

  if (error && !attempt) return <main className="grid min-h-screen place-items-center bg-[#08080d] p-6 text-rose-200">{error}</main>
  if (result) return <ExamReportPage attemptId={result.id} exit={exit} />
  if (!attempt || !question) return <Loading label="Przywracam egzamin…" />

  return (
    <main className="min-h-screen bg-[#08080d] text-slate-200">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0b0b12]/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-white">MATHEON</p>
          <p className="text-[10px] text-slate-500">Tryb egzaminu · {current + 1}/{questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 text-sm font-semibold ${seconds < 300 ? 'text-rose-300' : seconds < 600 ? 'text-amber-300' : 'text-white'}`}>
          <Clock3 size={16} />{Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
        </div>
        <div className="flex items-center gap-2">
          <ExamTools />
          <button onClick={() => setSubmitOpen(true)} className="rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">Zakończ</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[220px_1fr] lg:p-8">
        <aside className="order-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 lg:order-1">
          <p className="mb-3 text-xs font-semibold text-white">Nawigator</p>
          <div className="grid grid-cols-6 gap-2 lg:grid-cols-4">
            {questions.map((item, index) => (
              <button key={item.questionId} onClick={() => setCurrent(index)} className={`relative grid aspect-square place-items-center rounded-lg border text-xs ${index === current ? 'border-violet-300 bg-violet-500/20 text-white' : answers[item.questionId]?.answer ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-white/[0.08] text-slate-500'}`}>
                {index + 1}
                {answers[item.questionId]?.flagged && <Flag size={9} className="absolute right-1 top-1 text-amber-300" />}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-slate-500">{answered} odpowiedzianych · {flagged} oznaczonych</p>
        </aside>

        <section className="order-1 lg:order-2">
          <div className="mb-5 flex items-center justify-between text-xs text-slate-500">
            <span>Zadanie {question.number} · {question.points} pkt · {question.topicName ?? 'Matematyka'}</span>
            <span className="flex items-center gap-2">{saving ? <><Loader2 size={13} className="animate-spin" />Zapisywanie…</> : <><Save size={13} />Zapisano</>}</span>
          </div>

          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-10">
            <p className="text-lg leading-8 text-slate-100"><MathText>{question.questionText}</MathText></p>
            <textarea
              value={answers[question.questionId]?.answer ?? ''}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={question.questionType === 'open' || question.questionType === 'proof' ? 'Zapisz pełne rozwiązanie lub tok rozumowania…' : 'Wpisz odpowiedź…'}
              aria-label="Twoja odpowiedź"
              className="mt-8 min-h-36 w-full rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-white outline-none focus:border-violet-400/50"
            />
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button onClick={toggleFlag} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${answers[question.questionId]?.flagged ? 'border-amber-300/40 bg-amber-400/10 text-amber-200' : 'border-white/[0.1] text-slate-400'}`}>
                <Flag size={15} />Do sprawdzenia
              </button>
              <div className="flex gap-2">
                <button disabled={!current} onClick={() => setCurrent((value) => value - 1)} aria-label="Poprzednie zadanie" className="rounded-xl border border-white/[0.1] p-3 text-slate-400 disabled:opacity-30"><ChevronLeft size={18} /></button>
                <button disabled={current === questions.length - 1} onClick={() => setCurrent((value) => value + 1)} aria-label="Następne zadanie" className="rounded-xl bg-violet-500 p-3 text-white disabled:opacity-30"><ChevronRight size={18} /></button>
              </div>
            </div>
          </article>
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </section>
      </div>

      {submitOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#15151e] p-6">
            <h2 className="text-lg font-semibold text-white">Zakończyć egzamin?</h2>
            <p className="mt-3 text-sm text-slate-400">Masz {questions.length - answered} nieuzupełnionych zadań i {flagged} oznaczonych do sprawdzenia.</p>
            <p className="mt-3 text-xs text-slate-500">Zadania otwarte ocenisz w raporcie według matrycy punktów.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSubmitOpen(false)} className="rounded-xl border border-white/[0.1] px-4 py-2 text-sm text-slate-300">Wróć</button>
              <button onClick={() => void submit()} disabled={finishing} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                {finishing && <Loader2 size={14} className="animate-spin" />}Wyślij egzamin
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
