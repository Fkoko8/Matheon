'use client'

/**
 * MATHEON — sesja treningowa.
 *
 * Jeden komponent obsługuje wszystkie powierzchnie ćwiczeń: trening z banku,
 * powtórki SM-2 i naprawę błędów. Zasady, które trzyma:
 * - zadania pochodzą wyłącznie z realnego banku (żadnych wbudowanych przykładów),
 * - podpowiedź i rozwiązanie są dowodami: obniżają przyrost mastery,
 * - zadania otwarte ocenia uczeń według matrycy CKE (wzorzec + kryteria + punkty),
 * - wynik jest zapisywany razem z aktualizacją umiejętności i terminu powtórki.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, CircleHelp, Lightbulb, Loader2, Sparkles, Target, TriangleAlert } from 'lucide-react'
import { MathText } from '@/components/math-text'
import { FigureInline } from '@/components/figure'
import { buildTutorTaskHref } from '@/lib/ai/task-context'
import {
  buildPracticeQueue,
  loadQuestionMaterials,
  submitPracticeAnswer,
  type PracticeFeedback,
  type PracticeMode,
  type PracticeQuestion,
  type QuestionMaterials,
} from '@/lib/learning/practice'

export interface PracticeSessionProps {
  mode: PracticeMode
  level?: 'basic' | 'extended'
  topicId?: string
  topicSlug?: string
  skillSlug?: string
  /** Konkretne zadania (np. poprawa jednego błędu) — kolejność zachowana. */
  questionIds?: string[]
  limit?: number
  heading: string
  description: string
  backHref?: string
  onFinished?: (summary: SessionSummary) => void
}

export interface SessionSummary {
  answered: number
  correct: number
  score: number
  skillGains: Array<{ slug: string; name: string; after: number }>
  mistakesFixed: number
}

function difficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return 'Łatwe'
  if (difficulty === 3) return 'Średnie'
  return 'Trudne'
}

const OPEN_TYPES: PracticeQuestion['type'][] = ['open', 'proof', 'text']

export function PracticeSession(props: PracticeSessionProps) {
  const { mode, level, topicId, topicSlug, skillSlug, limit = 8, heading, description, backHref } = props
  const questionIdsKey = (props.questionIds ?? []).join(',')
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<PracticeQuestion[]>([])
  const [focus, setFocus] = useState<Array<{ name: string; mastery: number; dueInDays: number }>>([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [hints, setHints] = useState<string[]>([])
  const [materials, setMaterials] = useState<QuestionMaterials | null>(null)
  const [hintCount, setHintCount] = useState(0)
  const [solutionViewed, setSolutionViewed] = useState(false)
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null)
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<Array<{ isCorrect: boolean; points: number; earned: number }>>([])
  const [gains, setGains] = useState<Map<string, { name: string; after: number }>>(new Map())
  const [mistakesFixed, setMistakesFixed] = useState(0)
  const startedAt = useRef<number>(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      const questionIds = questionIdsKey ? questionIdsKey.split(',') : undefined
      const built = await buildPracticeQueue({ mode, level, topicId, topicSlug, skillSlug, questionIds, limit })
      if (!active) return
      setQueue(built.questions)
      setFocus(built.focusSkills.map((skill) => ({ name: skill.name, mastery: skill.mastery, dueInDays: skill.dueInDays })))
      setIndex(0)
      setResults([])
      setGains(new Map())
      setMistakesFixed(0)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [mode, level, topicId, topicSlug, skillSlug, limit, questionIdsKey])

  const current = queue[index]

  useEffect(() => {
    if (!current) return
    let active = true
    setAnswer('')
    setHints([])
    setHintCount(0)
    setSolutionViewed(false)
    setFeedback(null)
    setMaterials(null)
    startedAt.current = Date.now()
    loadQuestionMaterials(current.id).then((loaded) => {
      if (!active) return
      setMaterials(loaded)
      setHints(loaded.hints)
    })
    return () => { active = false }
  }, [current])

  const score = useMemo(() => (results.length ? Math.round((results.reduce((sum, item) => sum + item.earned, 0) / results.reduce((sum, item) => sum + item.points, 0)) * 100) : 0), [results])

  const timeSeconds = () => Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))

  const runSubmit = useCallback(
    async (options: { selfAssessment?: 'correct' | 'incorrect'; dryRun?: boolean }) => {
      if (!current) return
      setBusy(true)
      const response = await submitPracticeAnswer({
        questionId: current.id,
        answer,
        timeSeconds: timeSeconds(),
        hintsUsed: hintCount,
        solutionViewed,
        selfAssessment: options.selfAssessment,
        dryRun: options.dryRun,
      })
      setBusy(false)
      setFeedback(response)

      if (options.dryRun) return

      setResults((previous) => [...previous, { isCorrect: response.isCorrect, points: current.points, earned: response.isCorrect ? current.points : 0 }])
      setGains((previous) => {
        const next = new Map(previous)
        for (const update of response.skillUpdates) next.set(update.slug, { name: update.name, after: update.after })
        return next
      })
      if (response.mistakeResolved) setMistakesFixed((value) => value + 1)
    },
    [answer, current, hintCount, solutionViewed],
  )

  const handleCheck = useCallback(async () => {
    if (!current) return
    const openEnded = OPEN_TYPES.includes(current.type)
    await runSubmit({ dryRun: openEnded })
    if (!openEnded) setSolutionViewed(true)
  }, [current, runSubmit])

  const next = () => {
    if (index + 1 < queue.length) setIndex(index + 1)
    else setIndex(queue.length)
  }

  const progress = queue.length ? Math.round(((index + (feedback ? 1 : 0)) / queue.length) * 100) : 0
  const finished = !loading && queue.length > 0 && index >= queue.length

  useEffect(() => {
    if (!finished) return
    props.onFinished?.({
      answered: results.length,
      correct: results.filter((item) => item.isCorrect).length,
      score,
      skillGains: [...gains.entries()].map(([slug, value]) => ({ slug, name: value.name, after: value.after })),
      mistakesFixed,
    })
    // onFinished jest wywoływane raz na zakończoną sesję
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (loading) {
    return (
      <main className="matheon-enter mx-auto flex max-w-3xl flex-col items-center justify-center p-10 text-slate-400">
        <Loader2 className="animate-spin" />
        <p className="mt-4 text-sm">Buduję kolejkę zadań…</p>
      </main>
    )
  }

  if (!queue.length) {
    return (
      <main className="matheon-enter mx-auto max-w-3xl p-5 pb-28 lg:p-10">
        {backHref && (
          <Link href={backHref} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white"><ArrowLeft size={14} /> Wróć</Link>
        )}
        <div className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8">
          <h1 className="text-2xl font-semibold text-white">{heading}</h1>
          <p className="mt-3 text-sm text-slate-400">{description}</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" />
            <p>
              Nie ma tu jeszcze czego ćwiczyć. {mode === 'review' ? 'Powtórki pojawią się po pierwszych rozwiązanych zadaniach.' : mode === 'mistakes' ? 'Brak nierozwiązanych błędów — to dobra wiadomość.' : 'Rozpocznij trening z banku zadań.'}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tasks" className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">Bank zadań</Link>
            {mode !== 'review' && <Link href="/review" className="rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05]">Powtórki</Link>}
          </div>
        </div>
      </main>
    )
  }

  if (finished) {
    const correct = results.filter((item) => item.isCorrect).length
    return (
      <main className="matheon-enter mx-auto max-w-3xl p-5 pb-28 lg:p-10">
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Sesja zakończona</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{score}% poprawności</h1>
          <p className="mt-2 text-sm text-emerald-100">
            {correct} z {results.length} zadań poprawnie{mistakesFixed ? ` · naprawione błędy: ${mistakesFixed}` : ''}.
          </p>
        </div>
        {gains.size > 0 && (
          <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <h2 className="text-sm font-semibold text-white">Zaktualizowane umiejętności</h2>
            <div className="mt-4 flex flex-col gap-3">
              {[...gains.entries()].map(([slug, value]) => (
                <div key={slug} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{value.name}</span>
                  <span className="text-violet-300">{value.after}% mastery</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Harmonogram powtórek (SM-2) został przeliczony dla każdej z tych umiejętności.</p>
          </section>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/review" className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">Powtórki na dziś</Link>
          <Link href="/stats" className="rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05]">Zobacz postęp</Link>
          <Link href="/tasks" className="rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05]">Nowa sesja</Link>
        </div>
      </main>
    )
  }

  const openEnded = OPEN_TYPES.includes(current.type)
  const canCheck = answer.trim().length > 0 && !feedback

  return (
    <main className="matheon-enter mx-auto max-w-3xl p-5 pb-28 lg:p-10">
      <div className="flex items-center justify-between gap-4">
        {backHref ? (
          <Link href={backHref} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white"><ArrowLeft size={14} /> Wróć</Link>
        ) : <span />}
        <span className="text-xs text-slate-500">Zadanie {index + 1} / {queue.length} · {score}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full rounded-full bg-violet-400 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {focus.length > 0 && index === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {focus.map((skill) => (
            <span key={skill.name} className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-200">
              {skill.name} · {skill.mastery}%{mode === 'review' ? ` · zaległe ${Math.abs(skill.dueInDays)} dni` : ''}
            </span>
          ))}
        </div>
      )}

      <header className="mt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">{heading}</p>
        <h1 className="mt-2 text-lg font-semibold text-white">{current.topicName ?? 'Trening'}</h1>
      </header>

      <section className="mt-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-violet-300">{difficultyLabel(current.difficulty)}</span>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-slate-400">{current.points} pkt</span>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-slate-400">{current.level === 'basic' ? 'Podstawa' : 'Rozszerzenie'}</span>
          {current.sourceYear && <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-slate-400">CKE {current.sourceYear}</span>}
          {current.skillSlugs.length > 0 && <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-slate-500">Umiejętności: {current.skillSlugs.length}</span>}
        </div>

        <h2 className="mt-5 text-base font-medium leading-7 text-white"><MathText>{current.prompt}</MathText></h2>
        {current.figure != null && <FigureInline spec={current.figure} />}

        {current.options.length > 0 ? (
          <div className="mt-6 flex flex-col gap-2">
            {current.options.map((option) => (
              <button
                key={option}
                onClick={() => !feedback && setAnswer(option)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm transition ${answer === option ? 'border-violet-300 bg-violet-500/15 text-white' : 'border-white/[0.08] text-slate-300 hover:border-violet-400/30 hover:text-white'}`}
              >
                <MathText>{option}</MathText>
                {answer === option && <Check size={16} className="text-violet-300" />}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={Boolean(feedback)}
            aria-label="Twoja odpowiedź"
            placeholder={openEnded ? 'Zapisz pełne rozwiązanie lub tok rozumowania…' : 'Twoja odpowiedź…'}
            className="mt-6 min-h-32 w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white outline-none focus:border-violet-400/50 disabled:opacity-70"
          />
        )}

        {hints.slice(0, hintCount).map((hint, hintIndex) => (
          <div key={hintIndex} className="mt-4 flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-300" />
            <MathText>{hint}</MathText>
          </div>
        ))}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => void handleCheck()}
            disabled={!canCheck || busy}
            className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
            Sprawdź
          </button>
          <button
            onClick={() => setHintCount((value) => Math.min(hints.length, value + 1))}
            disabled={hintCount >= hints.length || Boolean(feedback)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] disabled:opacity-40"
          >
            <Lightbulb size={16} />
            {hintCount >= hints.length && hints.length > 0 ? 'Wszystkie podpowiedzi' : `Podpowiedź${hintCount > 0 ? ` (${hintCount}/${hints.length})` : ''}`}
          </button>
          {!feedback && (
            <button
              onClick={() => setSolutionViewed(true)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05]"
            >
              <CircleHelp size={16} />
              Pokaż rozwiązanie
            </button>
          )}
        </div>

        {solutionViewed && !feedback && materials && (
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#090910] p-5 text-sm text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rozwiązanie wzorcowe</p>
            <p className="mt-3 leading-7"><MathText>{materials.solution || 'Rozwiązanie zostanie dodane wkrótce.'}</MathText></p>
          </div>
        )}

        {feedback && (
          <div className="mt-5 flex flex-col gap-4">
            <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${feedback.isCorrect ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : feedback.needsSelfAssessment ? 'border-violet-400/20 bg-violet-500/10 text-violet-100' : 'border-rose-400/20 bg-rose-400/10 text-rose-100'}`}>
              {feedback.isCorrect ? <Check size={18} className="mt-0.5 shrink-0" /> : <TriangleAlert size={18} className="mt-0.5 shrink-0" />}
              <div>
                <p>{feedback.feedback}</p>
                {!feedback.isCorrect && !feedback.needsSelfAssessment && (
                  <p className="mt-2 text-slate-200">Poprawna odpowiedź: <MathText>{feedback.correctAnswer}</MathText></p>
                )}
                {feedback.acceptedAnswers.length > 0 && (
                  <p className="mt-1 text-xs opacity-80">Akceptowane warianty: {feedback.acceptedAnswers.join(', ')}</p>
                )}
                {!feedback.persisted && !feedback.needsSelfAssessment && !openEnded && (
                  <p className="mt-2 text-xs opacity-80">Uwaga: wynik nie został zapisany w bazie.</p>
                )}
              </div>
            </div>

            {(feedback.needsSelfAssessment || (openEnded && !feedback.persisted)) && (
              <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
                <p className="text-sm text-violet-100">Oceń swoją pracę zgodnie z matrycą — to zapisze wynik i harmonogram powtórki.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => void runSubmit({ selfAssessment: 'correct' })} disabled={busy} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-40">Mam poprawnie</button>
                  <button onClick={() => void runSubmit({ selfAssessment: 'incorrect' })} disabled={busy} className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-200 disabled:opacity-40">Muszę poprawić</button>
                </div>
              </div>
            )}

            {feedback.rubric.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Matryca punktów</p>
                <div className="mt-3 flex flex-col gap-2">
                  {feedback.rubric.map((step) => (
                    <div key={step.criterion} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-slate-300">{step.criterion}</span>
                      <span className="shrink-0 text-violet-300">{step.points} pkt</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feedback.steps.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kroki rozwiązania</p>
                <ol className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
                  {feedback.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-3">
                      <span className="text-slate-600">{stepIndex + 1}.</span>
                      <MathText>{step}</MathText>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {feedback.solution && (
              <div className="rounded-2xl border border-white/[0.08] bg-[#090910] p-5 text-sm text-slate-300">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rozwiązanie wzorcowe</p>
                <p className="mt-3 leading-7"><MathText>{feedback.solution}</MathText></p>
              </div>
            )}

            {feedback.skillUpdates.length > 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Wpływ na umiejętności</p>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  {feedback.skillUpdates.map((update) => (
                    <div key={update.slug} className="flex items-center justify-between gap-3">
                      <span className="text-slate-300">{update.name}</span>
                      <span className="flex items-center gap-2 text-slate-500">
                        {update.before}% <ArrowRight size={12} /> <span className="text-violet-300">{update.after}%</span>
                        <span className="text-xs text-slate-600">· powtórka za {update.dueInDays} dni</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feedback.mistakeResolved && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Błąd oznaczony jako rozwiązany — zniknął z listy „Moje błędy”.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                href={buildTutorTaskHref({
                  prompt: 'Przeanalizuj moje rozwiązanie i wskaż, gdzie zaczyna się błąd.',
                  question: current.prompt,
                  answer,
                  rubric: feedback.rubric.map((item) => `${item.criterion} (${item.points} pkt)`).join('; '),
                  source: current.topicName ?? undefined,
                  skills: current.skillSlugs.join(', '),
                })}
                className="flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-100 hover:bg-violet-500/20"
              >
                <Sparkles size={16} /> Zapytaj tutora o to zadanie
              </Link>
              <button onClick={next} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">
                {index + 1 < queue.length ? 'Następne zadanie' : 'Zakończ sesję'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-600">
        <Sparkles size={13} /> {description}
      </p>
    </main>
  )
}
