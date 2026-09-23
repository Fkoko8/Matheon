'use client'

/**
 * Raport po egzaminie (Faza 3).
 *
 * Pokazuje punkt po punkcie, gdzie uciekły punkty, jak próba wpłynęła na umiejętności
 * i jaka jest prognoza wyniku. Zadania otwarte ocenia uczeń — zgodnie z realiami matury,
 * gdzie dowód ocenia egzaminator na podstawie kryteriów, nie porównanie tekstu.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowRight, Check, ChevronDown, Loader2, RefreshCw, Target, TrendingUp } from 'lucide-react'
import { MathText } from '@/components/math-text'
import { buildTutorTaskHref } from '@/lib/ai/task-context'
import { examGradingSchemaReady, gradeOpenAnswer, getExamHistory, loadExamReport, retryExam, type ExamAttempt, type ExamReport, type ExamReportRow } from '@/lib/exams'

function Loading({ label = 'Wczytywanie raportu…' }: { label?: string }) {
  return <div className="grid min-h-[40vh] place-items-center text-sm text-slate-500"><Loader2 className="mr-2 inline animate-spin" size={16} />{label}</div>
}

function scoreTone(row: ExamReportRow): string {
  if (row.pointsEarned >= row.question.points) return 'text-emerald-300'
  if (row.pointsEarned > 0) return 'text-amber-300'
  return row.answer.trim() ? 'text-rose-300' : 'text-slate-500'
}

export function ExamReportPage({ attemptId, exit }: { attemptId: string; exit: () => void }) {
  const router = useRouter()
  const [report, setReport] = useState<ExamReport | null>(null)
  const [history, setHistory] = useState<ExamAttempt[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gradingReady, setGradingReady] = useState(true)

  const load = useCallback(async () => {
    try {
      setGradingReady(await examGradingSchemaReady())
      const loaded = await loadExamReport(attemptId)
      if (!loaded) { setError('Nie znaleziono próby.'); return }
      setReport(loaded)
      setHistory(await getExamHistory(loaded.attempt.examId))
    } catch {
      setError('Nie udało się wczytać raportu.')
    }
  }, [attemptId])

  useEffect(() => { void load() }, [load])

  const selfAssess = async (row: ExamReportRow, points: number) => {
    setBusy(row.question.questionId)
    try {
      await gradeOpenAnswer(attemptId, row.question, points, points >= row.question.points)
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (error) return <main className="mx-auto max-w-5xl p-10 text-sm text-rose-300">{error}</main>
  if (!report) return <Loading />

  const { attempt, forecast } = report
  const pending = report.rows.filter((row) => row.awaitingSelfAssessment)
  const weakest = report.skills.filter((skill) => skill.possible > 0 && skill.earned / skill.possible < 0.7).slice(0, 4)

  return (
    <main className="matheon-enter mx-auto max-w-5xl p-5 pb-28 lg:p-10">
      <button onClick={exit} className="mb-6 text-sm text-slate-500 hover:text-white">← Wróć do egzaminów</button>

      {!gradingReady && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-5 text-sm text-rose-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Punktacja cząstkowa jest wyłączona</p>
            <p className="mt-1 text-xs text-rose-100/80">Baza nie ma migracji punktacji cząstkowej. Uruchom <code className="rounded bg-black/30 px-1.5 py-0.5">supabase/migrations/009_exam_partial_credit.sql</code>, żeby zadania otwarte i warianty zapisu były punktowane poprawnie.</p>
          </div>
        </div>
      )}

      <header className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 md:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Wynik egzaminu</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{report.examTitle}</h1>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <p className="text-6xl font-semibold text-white">{attempt.earnedPoints}<span className="text-2xl text-slate-400"> / {attempt.totalPoints}</span></p>
          <p className="text-3xl font-semibold text-emerald-200">{attempt.percentage}%</p>
          <p className="ml-auto text-xs text-slate-400">{attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString('pl-PL') : ''}</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[['Pełne punkty', report.correct, 'text-emerald-300'], ['Punkty cząstkowe', report.partial, 'text-amber-300'], ['Błędne', report.incorrect, 'text-rose-300'], ['Bez odpowiedzi', report.unanswered, 'text-slate-400']].map(([label, value, tone]) => (
            <div key={label as string} className="rounded-2xl bg-black/20 p-4">
              <p className="text-xs text-slate-400">{label as string}</p>
              <p className={`mt-1 text-2xl font-semibold ${tone as string}`}>{value as number}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-200"><TrendingUp size={14} /> Prognoza wyniku</p>
          <p className="mt-4 text-4xl font-semibold text-white">{forecast.percentage}%</p>
          <p className="mt-2 text-sm text-violet-100">Przedział: {forecast.range[0]}–{forecast.range[1]}%</p>
          <p className="mt-4 text-xs leading-6 text-slate-300">
            Wynik próby: <span className="text-white">{forecast.fromAttempt}%</span>
            {forecast.fromMastery !== null ? <> · mastery umiejętności z arkusza: <span className="text-white">{forecast.fromMastery}%</span> (waga 40%)</> : <> · brak historii treningu dla tych umiejętności</>}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Co dalej</p>
          {weakest.length ? (
            <div className="mt-4 flex flex-col gap-2 text-sm">
              {weakest.map((skill) => (
                <div key={skill.slug} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-slate-300">{skill.name}</span>
                  <span className="shrink-0 text-xs text-rose-300">{skill.earned}/{skill.possible} pkt</span>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-sm text-slate-400">Wszystkie umiejętności z arkusza wypadły dobrze.</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/tasks" className="rounded-xl bg-violet-500 px-3 py-2 text-xs font-medium text-white">Trening słabych obszarów</Link>
            <Link href="/review" className="rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-slate-300">Powtórki</Link>
            <Link href="/mistakes" className="rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-slate-300">Moje błędy</Link>
          </div>
        </div>
      </section>

      {pending.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5 text-sm text-amber-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{pending.length} {pending.length === 1 ? 'zadanie czeka' : 'zadania czekają'} na Twoją ocenę</p>
            <p className="mt-1 text-xs text-amber-100/80">Zadania otwarte ocenia się według kryteriów — oceń swoją pracę, żeby punkty weszły do wyniku.</p>
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">Punktacja zadań</h2>
        <div className="mt-4 flex flex-col gap-3">
          {report.rows.map((row) => {
            const open = row.question.questionType === 'open' || row.question.questionType === 'proof'
            const isExpanded = expanded === row.question.questionId
            return (
              <article key={row.question.questionId} className={`rounded-2xl border p-5 ${row.awaitingSelfAssessment ? 'border-amber-400/25 bg-amber-400/[0.05]' : 'border-white/[0.07] bg-white/[0.025]'}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-sm font-semibold text-slate-300">{row.question.number}</span>
                  <span className="text-xs text-slate-500">{row.question.topicName ?? 'Matematyka'} · {row.question.questionType === 'open' || row.question.questionType === 'proof' ? 'otwarte' : 'zamknięte'}</span>
                  <span className={`ml-auto text-sm font-semibold ${scoreTone(row)}`}>{row.pointsEarned} / {row.question.points} pkt</span>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">{row.gradedBy === 'self' ? 'samoocena' : row.gradedBy === 'manual' ? 'ocena ręczna' : 'auto'}</span>
                  <button onClick={() => setExpanded(isExpanded ? null : row.question.questionId)} aria-label="Pokaż szczegóły zadania" className="rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-white">
                    <ChevronDown size={16} className={isExpanded ? 'rotate-180 transition' : 'transition'} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 flex flex-col gap-4 border-t border-white/[0.07] pt-4">
                    <p className="text-sm leading-7 text-slate-200"><MathText>{row.question.questionText}</MathText></p>
                    <p className="text-xs text-slate-500">Twoja odpowiedź: <span className="text-slate-300">{row.answer.trim() || 'brak'}</span></p>
                    <p className="text-xs text-slate-500">Odpowiedź wzorcowa: <span className="text-emerald-300"><MathText>{row.question.correctAnswer}</MathText></span></p>
                    {row.question.steps.length > 0 && (
                      <ol className="flex flex-col gap-1.5 text-xs text-slate-400">
                        {row.question.steps.map((step, index) => <li key={index}><span className="text-slate-600">{index + 1}.</span> <MathText>{step}</MathText></li>)}
                      </ol>
                    )}
                    <Link
                      href={buildTutorTaskHref({
                        prompt: 'Wyjaśnij to zadanie i oceń, czego zabrakło w moim rozwiązaniu.',
                        question: row.question.questionText,
                        answer: row.answer,
                        rubric: row.question.rubric.map((item) => `${item.criterion} (${item.points} pkt)`).join('; '),
                        source: `${report.examTitle} · zadanie ${row.question.number}`,
                        skills: row.question.skillSlugs.join(', '),
                      })}
                      className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-100 hover:bg-violet-500/20"
                    >
                      Zapytaj tutora o to zadanie
                    </Link>
                  </div>
                )}

                {gradingReady && (row.awaitingSelfAssessment || (open && row.gradedBy === 'self')) && (
                  <div className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
                    {row.question.rubric.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200">Matryca punktów</p>
                        {row.question.rubric.map((item) => (
                          <div key={item.criterion} className="flex items-start justify-between gap-4 text-xs text-violet-100">
                            <span>{item.criterion}</span>
                            <span className="shrink-0">{item.points} pkt</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-4 text-xs text-violet-100">Ile punktów przyznajesz swojej pracy?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.from({ length: row.question.points + 1 }, (_, points) => points).map((points) => (
                        <button
                          key={points}
                          disabled={busy === row.question.questionId}
                          onClick={() => void selfAssess(row, points)}
                          className={`rounded-xl px-3 py-2 text-xs font-medium disabled:opacity-40 ${points === row.pointsEarned && row.gradedBy === 'self' ? 'bg-violet-500 text-white' : 'border border-white/[0.12] text-slate-200 hover:bg-white/[0.08]'}`}
                        >
                          {points} / {row.question.points}
                        </button>
                      ))}
                      {busy === row.question.questionId && <Loader2 size={14} className="animate-spin self-center text-violet-200" />}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {report.topics.length > 0 && (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <h2 className="text-sm font-semibold text-white">Działy</h2>
            <div className="mt-4 flex flex-col gap-4">
              {report.topics.map((topic) => (
                <div key={topic.name}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="text-slate-300">{topic.name}</span><span className="text-slate-500">{topic.earned}/{topic.possible} pkt · {topic.percentage}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${topic.percentage < 50 ? 'bg-rose-400' : topic.percentage < 75 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${topic.percentage}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <h2 className="text-sm font-semibold text-white">Umiejętności</h2>
            {report.skills.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Ten arkusz nie ma jeszcze przypisanych umiejętności.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {report.skills.slice(0, 10).map((skill) => (
                  <div key={skill.slug} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-slate-300">{skill.name}</span>
                    <span className="shrink-0 text-xs text-slate-500">{skill.earned}/{skill.possible} pkt · mastery {skill.mastery}%</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-[11px] text-slate-500">
              <Target size={13} /> Egzamin zasila mastery umiejętności i harmonogram powtórek, tak samo jak trening.
            </p>
          </div>
        </section>
      )}

      {history.length > 1 && (
        <section className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
          <h2 className="text-sm font-semibold text-white">Historia prób</h2>
          <div className="mt-4 flex flex-col gap-2">
            {history.map((item) => (
              <button key={item.id} onClick={() => router.push(`/exams/attempt/${item.id}`)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${item.id === attempt.id ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/[0.07] hover:border-violet-400/30'}`}>
                <span className="text-slate-400">{item.finishedAt ? new Date(item.finishedAt).toLocaleDateString('pl-PL') : '—'}</span>
                <span className="text-white">{item.earnedPoints}/{item.totalPoints} · {item.percentage}%</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={exit} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white"><Check size={16} /> Wróć do egzaminów</button>
        <button
          onClick={async () => {
            try {
              const next = await retryExam(attempt.examId)
              router.push(`/exams/attempt/${next.id}`)
            } catch { router.push(`/exams/${attempt.examId}`) }
          }}
          className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-300"
        >
          <RefreshCw size={15} /> Spróbuj ponownie
        </button>
        <Link href="/stats" className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-300">Statystyki <ArrowRight size={15} /></Link>
      </div>
    </main>
  )
}
