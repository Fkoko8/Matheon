'use client'

/**
 * MATHEON — generator zadań.
 *
 * Wygenerowane zadanie od razu trafia do banku (endpoint zapisuje je w `questions`),
 * a jego rozwiązywanie idzie przez ten sam silnik co trening (`submitPracticeAnswer`):
 * liczby z tolerancją, warianty zapisu, zadania otwarte z samooceną wg matrycy,
 * aktualizacja mastery i harmonogramu powtórek.
 *
 * Tryb „Dopasuj do moich słabości” prosi backend o kontekst: słabe działy,
 * typowe błędy i umiejętności stojące za tymi błędami.
 */
import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check, RefreshCw, Sparkles, Target, WandSparkles } from 'lucide-react'
import { MathText } from '@/components/math-text'
import { submitPracticeAnswer, type PracticeFeedback } from '@/lib/learning/practice'

interface Generated {
  id: string
  title: string
  questionText: string
  topic: string
  difficulty: number
  estimatedMinutes: number
  points: number
  answer: string
  solution: string
  hints: string[]
  level: string
  questionType: string
}

export function QuestionGeneratorPage() {
  const [form, setForm] = useState({ topic: 'Logarytmy', subtopic: 'Równania logarytmiczne', level: 'extended', difficulty: 3, questionType: 'open', count: 1 })
  const [questions, setQuestions] = useState<Generated[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [solving, setSolving] = useState<Generated | null>(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null)
  const [busy, setBusy] = useState(false)

  async function generate(mode: 'standard' | 'personalized' | 'similar', parentQuestionId?: string) {
    setLoading(mode)
    setError('')
    try {
      const response = await fetch('/api/generator', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, mode, parentQuestionId }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 429) throw new Error(data.message ?? 'LIMIT')
        throw new Error(data.error ?? 'GENERATION_UNAVAILABLE')
      }
      setQuestions(data.questions)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : ''
      setError(
        message === 'NO_VALID_QUESTION'
          ? 'Nie udało się zwalidować zadania po trzech próbach — spróbuj innego tematu.'
          : message === 'LIMIT' || message.startsWith('Zwolnij') || message.startsWith('Dzienny')
            ? message
            : 'Generator jest chwilowo niedostępny.',
      )
    } finally {
      setLoading(null)
    }
  }

  async function solve() {
    if (!solving || !answer.trim()) return
    setBusy(true)
    try {
      const result = await submitPracticeAnswer({ questionId: solving.id, answer, timeSeconds: 0, hintsUsed: 0, solutionViewed: false })
      setFeedback(result)
    } finally {
      setBusy(false)
    }
  }

  const generating = loading !== null

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <header>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">AI practice studio</p>
        <h1 className="text-3xl font-semibold text-white">Generator zadań</h1>
        <p className="mt-2 text-sm text-slate-400">Twórz oryginalne zadania dopasowane do poziomu i do Twoich słabości. Każde zapisuje się w banku razem z rozwiązaniem i matrycą punktów.</p>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5">
          <label className="text-xs text-slate-500">
            Temat
            <input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/20 p-3 text-sm text-white" />
          </label>
          <label className="mt-4 block text-xs text-slate-500">
            Podtemat
            <input value={form.subtopic} onChange={(event) => setForm({ ...form, subtopic: event.target.value })} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/20 p-3 text-sm text-white" />
          </label>
          <label className="mt-4 block text-xs text-slate-500">
            Poziom
            <select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/20 p-3 text-sm text-white">
              <option value="basic">Podstawa</option>
              <option value="extended">Rozszerzenie</option>
            </select>
          </label>
          <label className="mt-4 block text-xs text-slate-500">
            Trudność: {form.difficulty}
            <input type="range" min="1" max="5" value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: Number(event.target.value) })} className="mt-3 w-full accent-violet-400" />
          </label>

          <button onClick={() => void generate('standard')} disabled={generating} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">
            <Sparkles size={16} />{loading === 'standard' ? 'Generowanie i walidacja…' : 'Generuj zadanie'}
          </button>
          <button onClick={() => void generate('personalized')} disabled={generating} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 text-sm text-violet-100 disabled:opacity-50">
            <Target size={16} />{loading === 'personalized' ? 'Analizuję Twoje słabości…' : 'Dopasuj do moich słabości'}
          </button>

          {error && (
            <p className="mt-4 flex items-start gap-2 text-xs text-rose-300"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{error}</p>
          )}
        </aside>

        <section className="space-y-4">
          {questions.length === 0 && !generating && (
            <div className="rounded-3xl border border-dashed border-white/[0.1] p-12 text-center text-sm text-slate-500">Skonfiguruj zadanie i uruchom generator.</div>
          )}
          {loading === 'personalized' && <p className="text-xs text-slate-500">Kontekst: słabe działy, typowe błędy i umiejętności z Twojej historii.</p>}
          {questions.map((question) => (
            <article key={question.id} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-violet-300">
                <span>{question.topic}</span><span>·</span>
                <span>Trudność {question.difficulty}/5</span><span>·</span>
                <span>{question.estimatedMinutes} min</span><span>·</span>
                <span>{question.points} pkt</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{question.title}</h2>
              <div className="mt-5 rounded-2xl bg-black/20 p-5 text-sm leading-7 text-slate-200"><MathText>{question.questionText}</MathText></div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => { setSolving(question); setAnswer(''); setFeedback(null) }} className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white">Rozwiąż</button>
                <button onClick={() => void generate('similar', question.id)} disabled={generating} className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-300 disabled:opacity-50">
                  <RefreshCw size={15} />Podobne
                </button>
                <Link href="/tasks" className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-300">
                  <WandSparkles size={15} />Ćwicz w banku
                </Link>
              </div>
            </article>
          ))}
        </section>
      </section>

      {solving && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#11111a] p-6">
            <h2 className="text-xl font-semibold text-white">{solving.title}</h2>
            <p className="mt-5 text-sm leading-7 text-slate-200"><MathText>{solving.questionText}</MathText></p>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(feedback)}
              placeholder="Wpisz odpowiedź lub tok rozumowania…"
              className="mt-5 min-h-28 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-white disabled:opacity-70"
            />

            {feedback && (
              <div className="mt-4 flex flex-col gap-3">
                <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${feedback.isCorrect ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-amber-400/20 bg-amber-400/10 text-amber-100'}`}>
                  {feedback.isCorrect ? <Check size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                  <div>
                    <p>{feedback.feedback}</p>
                    {!feedback.isCorrect && !feedback.needsSelfAssessment && (
                      <p className="mt-2 text-slate-200">Poprawna odpowiedź: <MathText>{feedback.correctAnswer}</MathText></p>
                    )}
                    {!feedback.persisted && !feedback.needsSelfAssessment && <p className="mt-2 text-xs opacity-80">Wynik nie został zapisany w bazie.</p>}
                  </div>
                </div>

                {feedback.needsSelfAssessment && (
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">
                    Zadanie otwarte — porównaj swoje rozwiązanie z wzorcem i oceń je w sesji treningowej, żeby zapisać punkty i postęp.
                  </div>
                )}

                {feedback.solution && (
                  <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-4 text-sm text-slate-300">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rozwiązanie wzorcowe</p>
                    <p className="mt-3 leading-7"><MathText>{feedback.solution}</MathText></p>
                  </div>
                )}

                {feedback.skillUpdates.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Wpływ na umiejętności</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {feedback.skillUpdates.map((update) => (
                        <div key={update.slug} className="flex items-center justify-between gap-3">
                          <span className="text-slate-300">{update.name}</span>
                          <span className="text-xs text-slate-500">{update.before}% → <span className="text-violet-300">{update.after}%</span> · powtórka za {update.dueInDays} dni</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={() => void solve()} disabled={busy || !answer.trim() || Boolean(feedback)} className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm text-white disabled:opacity-40">Sprawdź</button>
              <button onClick={() => setSolving(null)} className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-300">Zamknij</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
