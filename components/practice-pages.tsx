'use client'

/**
 * MATHEON — ekrany ćwiczeń.
 *
 * Wszystkie dane pochodzą z realnego banku zadań i realnego postępu ucznia:
 * bank (`loadPracticeBank`), powtórki SM-2 i umiejętności (`loadPracticeOverview`),
 * błędy (`loadMistakesWithQuestions`). Zero wbudowanych przykładów.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, BarChart3, Check, Clock3, Flame, Loader2, RefreshCw, Sparkles, Target, TrendingUp } from 'lucide-react'
import { MathText } from '@/components/math-text'
import { PracticeSession } from '@/components/practice-session'
import {
  loadMistakesWithQuestions,
  loadPracticeBank,
  loadPracticeOverview,
  mistakeTypeLabel,
  type MistakeWithQuestion,
  type PracticeBank,
  type PracticeMode,
  type PracticeOverview,
} from '@/lib/learning/practice'
import { getCurrentUserId } from '@/lib/learning/skill-state'
import { joinSkillStates, loadSkillCatalog, loadSkillStates, type SkillWithState } from '@/lib/learning/skill-state'
import { WEAK_MASTERY, daysUntilDue, isDue, masteryLabel } from '@/lib/learning/skill-model'
import { createClient } from '@/lib/supabase/client'

function difficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return 'Łatwe'
  if (difficulty === 3) return 'Średnie'
  return 'Trudne'
}

function useSkillOverview() {
  const [overview, setOverview] = useState<PracticeOverview | null>(null)
  const [skills, setSkills] = useState<SkillWithState[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      const supabase = createClient()
      const userId = await getCurrentUserId(supabase)
      if (!supabase || !userId) {
        setLoading(false)
        return
      }
      const [summary, catalog, states] = await Promise.all([
        loadPracticeOverview(userId, supabase),
        loadSkillCatalog(supabase),
        loadSkillStates(userId, supabase),
      ])
      if (!active) return
      setOverview(summary)
      setSkills(joinSkillStates(catalog, states).filter((entry) => entry.state.attempts > 0))
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  return { overview, skills, loading }
}

/* ------------------------------------------------------------------ *
 * Trening
 * ------------------------------------------------------------------ */

export function TrainingPage() {
  const [level, setLevel] = useState<'basic' | 'extended'>('basic')
  const [topicId, setTopicId] = useState('')
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState(0)
  const [bank, setBank] = useState<PracticeBank | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(12)
  const [session, setSession] = useState<{ mode: PracticeMode; ids?: string[]; topicId?: string } | null>(null)
  const { overview } = useSkillOverview()

  useEffect(() => {
    let active = true
    setLoading(true)
    const timer = setTimeout(() => {
      loadPracticeBank({ level, topicId: topicId || undefined, difficulty: difficulty || undefined, search: search || undefined }).then((result) => {
        if (!active) return
        setBank(result)
        setLoading(false)
      })
    }, 200)
    return () => { active = false; clearTimeout(timer) }
  }, [level, topicId, difficulty, search])

  useEffect(() => { setVisible(12) }, [level, topicId, difficulty, search])

  if (session) {
    return (
      <PracticeSession
        mode={session.mode}
        level={level}
        topicId={session.topicId}
        questionIds={session.ids}
        limit={session.ids ? session.ids.length : 10}
        heading={session.ids ? 'Pojedyncze zadanie' : session.mode === 'weak' ? 'Najsłabsze umiejętności' : 'Trening'}
        description={session.ids ? 'Wynik trafi do statystyk i harmonogramu powtórek.' : 'Kolejka zbudowana z realnego banku zadań.'}
        backHref="/tasks"
      />
    )
  }

  const questions = bank?.questions ?? []

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Trening</p>
          <h1 className="text-3xl font-semibold text-white">Bank zadań</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {bank ? `${bank.total} zadań w banku` : 'Wczytywanie banku…'} · każda odpowiedź aktualizuje mastery umiejętności i termin powtórki.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSession({ mode: 'mixed' })} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">
            <Sparkles size={16} /> Sesja mieszana
          </button>
          <button onClick={() => setSession({ mode: 'weak' })} className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05]">
            <Target size={16} /> Najsłabsze umiejętności
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ['Zadania w banku', bank ? String(bank.total) : '—', 'dostępne od razu'],
          ['Bez odpowiedzi', overview ? String(overview.unanswered) : '—', 'do pierwszego podejścia'],
          ['Mastery', overview ? `${overview.mastery}%` : '—', `${overview?.practisedSkills ?? 0} z ${overview?.totalSkills ?? 0} umiejętności`],
          ['Do powtórki', overview ? String(overview.dueToday) : '—', `${overview?.weakSkills ?? 0} słabych`],
        ].map(([label, value, meta]) => (
          <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-[11px] text-slate-600">{meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center">
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {(['basic', 'extended'] as const).map((item) => (
            <button key={item} onClick={() => setLevel(item)} className={`rounded-lg px-4 py-2 text-xs ${level === item ? 'bg-white/[0.1] text-white' : 'text-slate-500'}`}>
              {item === 'basic' ? 'Podstawa' : 'Rozszerzenie'}
            </button>
          ))}
        </div>
        <select
          value={topicId}
          onChange={(event) => setTopicId(event.target.value)}
          aria-label="Filtr działu"
          className="rounded-xl border border-white/[0.08] bg-[#11111a] px-4 py-2.5 text-sm text-white outline-none"
        >
          <option value="">Wszystkie działy</option>
          {(bank?.topics ?? []).map((topic) => (
            <option key={topic.id} value={topic.id}>{topic.name} ({topic.count})</option>
          ))}
        </select>
        <div className="flex gap-2">
          {[0, 2, 3, 4].map((value) => (
            <button
              key={value}
              onClick={() => setDifficulty(value)}
              className={`rounded-xl border px-3 py-2 text-xs transition ${difficulty === value ? 'border-violet-400/40 bg-violet-500/15 text-violet-200' : 'border-white/[0.08] bg-white/[0.03] text-slate-400'}`}
            >
              {value === 0 ? 'Każda trudność' : value <= 2 ? 'Łatwe' : value === 3 ? 'Średnie' : 'Trudne'}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Szukaj po treści, dziale lub tagu…"
          aria-label="Szukaj zadań"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 lg:ml-auto lg:w-72"
        />
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Wczytuję zadania…</div>
      ) : questions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6 text-sm text-amber-100">
          <AlertTriangle className="mb-3" size={18} />
          Brak zadań dla tych filtrów. Zmień dział lub trudność, albo dodaj treść z linii poleceń: <code className="rounded bg-black/30 px-2 py-1 text-xs">pnpm content:import</code>.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {questions.slice(0, visible).map((question) => (
              <article key={question.id} className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-violet-400/30">
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-violet-300">{question.topicName ?? 'Matematyka'}</span>
                  <span className="text-slate-500">{question.points} pkt · {difficultyLabel(question.difficulty)}</span>
                </div>
                <h2 className="mt-4 line-clamp-3 text-sm font-medium leading-6 text-white"><MathText>{question.prompt}</MathText></h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {question.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">{tag}</span>
                  ))}
                  {question.authored && <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">autorskie</span>}
                </div>
                <div className="mt-auto flex items-center justify-between pt-5 text-xs">
                  <span className="text-slate-600">{question.skillSlugs.length} umiejętności</span>
                  <button onClick={() => setSession({ mode: 'mixed', ids: [question.id] })} className="rounded-lg bg-white/[0.06] px-3 py-1.5 font-medium text-violet-200 hover:bg-white/[0.1]">Rozwiąż</button>
                </div>
              </article>
            ))}
          </div>
          {questions.length > visible && (
            <div className="mt-6 flex justify-center">
              <button onClick={() => setVisible((value) => value + 12)} className="rounded-xl border border-white/[0.1] px-5 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05]">
                Pokaż więcej ({questions.length - visible})
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

/* ------------------------------------------------------------------ *
 * Powtórki
 * ------------------------------------------------------------------ */

export function ReviewPage() {
  const { overview, skills, loading } = useSkillOverview()
  const [session, setSession] = useState(false)

  const due = useMemo(() => skills.filter((entry) => isDue(entry.state)), [skills])
  const upcoming = useMemo(
    () => skills.filter((entry) => !isDue(entry.state) && daysUntilDue(entry.state) <= 7).sort((a, b) => daysUntilDue(a.state) - daysUntilDue(b.state)),
    [skills],
  )

  if (session) {
    return (
      <PracticeSession
        mode="review"
        limit={Math.max(4, Math.min(12, due.length || 4))}
        heading="Powtórka SM-2"
        description="Kolejka wg terminów i współczynnika łatwości Twoich umiejętności."
        backHref="/review"
      />
    )
  }

  return (
    <main className="matheon-enter mx-auto max-w-5xl p-5 pb-28 lg:p-10">
      <header>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Spaced repetition · SM-2</p>
        <h1 className="text-3xl font-semibold text-white">Powtórki</h1>
        <p className="mt-2 text-sm text-slate-400">Każde rozwiązane zadanie planuje kolejne powtórzenie — osobno dla każdej umiejętności.</p>
      </header>

      <section className="mt-8 flex flex-col justify-between gap-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 md:flex-row md:items-center md:p-8">
        <div>
          <p className="text-sm font-medium text-emerald-200">Do powtórki teraz</p>
          <p className="mt-2 text-4xl font-semibold text-white">{loading ? '—' : due.length} <span className="text-lg font-normal text-slate-400">umiejętności</span></p>
          <p className="mt-1 text-sm text-slate-400">{overview ? `Mastery ${overview.mastery}% · ${overview.practisedSkills} ćwiczonych umiejętności` : 'Wczytuję stan nauki…'}</p>
        </div>
        <button
          onClick={() => setSession(true)}
          disabled={loading || due.length === 0}
          className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Rozpocznij powtórkę
        </button>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Kolejka powtórek</h2>
        <span className="text-xs text-slate-500">{due.length} zaległych · {upcoming.length} w najbliższym tygodniu</span>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Wczytuję harmonogram…</div>
      ) : due.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 text-sm text-slate-400">
          <Check className="mb-3 text-emerald-400" size={18} />
          Nic nie jest zaległe. {upcoming.length > 0 ? `Najbliższa powtórka: ${upcoming[0].skill.name} (za ${daysUntilDue(upcoming[0].state)} dni).` : 'Rozwiąż kilka zadań, żeby zbudować harmonogram.'}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tasks" className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white">Przejdź do treningu</Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {due.map((entry) => (
            <article key={entry.skill.id} className="flex flex-col gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 md:flex-row md:items-center">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-200"><Clock3 size={18} /></div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white">{entry.skill.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Mastery {entry.state.mastery}% · {masteryLabel(entry.state.mastery)} · zaległa {Math.abs(daysUntilDue(entry.state))} dni
                  {entry.state.lapses > 0 ? ` · wpadek: ${entry.state.lapses}` : ''}
                </p>
              </div>
              <div className="text-xs text-slate-500">interwał {entry.state.intervalDays} dni · łatwość {entry.state.ease.toFixed(2)}</div>
            </article>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">Zaplanowane na najbliższy tydzień</h2>
          <div className="mt-4 divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {upcoming.map((entry) => (
              <div key={entry.skill.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <span className="text-slate-300">{entry.skill.name}</span>
                <span className="text-slate-500">{entry.state.mastery}% · za {daysUntilDue(entry.state)} dni</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

/* ------------------------------------------------------------------ *
 * Moje błędy
 * ------------------------------------------------------------------ */

export function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeWithQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<{ ids?: string[] } | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const supabase = createClient()
      const userId = await getCurrentUserId(supabase)
      if (!supabase || !userId) { setLoading(false); return }
      const rows = await loadMistakesWithQuestions(userId, supabase)
      if (!active) return
      setMistakes(rows)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [session])

  if (session) {
    return (
      <PracticeSession
        mode="mistakes"
        questionIds={session.ids}
        limit={session.ids ? session.ids.length : 10}
        heading="Naprawa błędów"
        description="Poprawna odpowiedź zamyka błąd i planuje powtórkę tej umiejętności."
        backHref="/mistakes"
      />
    )
  }

  return (
    <main className="matheon-enter mx-auto max-w-5xl p-5 pb-28 lg:p-10">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400">Analiza błędów</p>
          <h1 className="text-3xl font-semibold text-white">Moje błędy</h1>
          <p className="mt-2 text-sm text-slate-400">Zadania, w których się pomyliłeś — z Twoją odpowiedzią i typem błędu.</p>
        </div>
        {mistakes.length > 0 && (
          <button onClick={() => setSession({})} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">
            <RefreshCw size={16} /> Popraw wszystkie ({mistakes.length})
          </button>
        )}
      </header>

      {loading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Wczytuję błędy…</div>
      ) : mistakes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-sm text-emerald-100">
          <Check className="mb-3" size={18} />
          Brak nierozwiązanych błędów. Twoja pętla naprawy jest pusta.
          <div className="mt-5"><Link href="/tasks" className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white">Ćwicz dalej</Link></div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {mistakes.map((mistake) => (
            <article key={mistake.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-300"><AlertTriangle size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">{mistake.topicName ?? 'Matematyka'}</h2>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">{mistakeTypeLabel(mistake.mistakeType)}</span>
                    <span className="text-[10px] text-slate-600">{mistake.attemptCount} prób · {new Date(mistake.lastSeenAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  {mistake.question && (
                    <p className="mt-3 text-sm leading-6 text-slate-300"><MathText>{mistake.question.prompt}</MathText></p>
                  )}
                  <p className="mt-3 text-xs text-slate-500">Twoja odpowiedź: <span className="text-rose-300">{mistake.userAnswer || 'brak'}</span> · Poprawna: <span className="text-emerald-300"><MathText>{mistake.correctAnswer}</MathText></span></p>
                </div>
                <button onClick={() => setSession({ ids: [mistake.questionId] })} className="shrink-0 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-medium text-violet-200 hover:bg-white/[0.1]">Popraw</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

/* ------------------------------------------------------------------ *
 * Statystyki
 * ------------------------------------------------------------------ */

export function StatsPage() {
  const { overview, skills, loading } = useSkillOverview()
  const [bank, setBank] = useState<PracticeBank | null>(null)

  useEffect(() => {
    let active = true
    loadPracticeBank({ limit: 600 }).then((result) => { if (active) setBank(result) })
    return () => { active = false }
  }, [])

  const byTopic = useMemo(() => {
    if (!bank) return []
    const groups = new Map<string, { name: string; total: number }>()
    for (const question of bank.questions) {
      const key = question.topicId ?? 'brak'
      const current = groups.get(key) ?? { name: question.topicName ?? 'Inne', total: 0 }
      current.total += 1
      groups.set(key, current)
    }
    return [...groups.values()].sort((a, b) => b.total - a.total)
  }, [bank])

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <header>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Analityka nauki</p>
        <h1 className="text-3xl font-semibold text-white">Twoje statystyki</h1>
        <p className="mt-2 text-sm text-slate-400">Liczby liczone wyłącznie z Twoich odpowiedzi i harmonogramu powtórek.</p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ['Mastery', overview ? `${overview.mastery}%` : '—', 'średnia ćwiczonych umiejętności', BarChart3],
          ['Umiejętności', overview ? `${overview.practisedSkills} / ${overview.totalSkills}` : '—', 'z co najmniej jedną odpowiedzią', TrendingUp],
          ['Do powtórki', overview ? String(overview.dueToday) : '—', 'termin minął', Clock3],
          ['Słabe obszary', overview ? String(overview.weakSkills) : '—', `poniżej ${WEAK_MASTERY}% mastery`, AlertTriangle],
        ].map(([label, value, meta, Icon]) => {
          const IconComponent = Icon as typeof BarChart3
          return (
            <div key={label as string} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{label as string}</p>
                <IconComponent size={15} className="text-violet-300" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{value as string}</p>
              <p className="mt-1 text-[11px] text-slate-600">{meta as string}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
          <h2 className="text-sm font-semibold text-white">Mastery umiejętności</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Wczytuję…</p>
          ) : skills.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Rozwiąż pierwsze zadania, żeby zobaczyć rozbicie na umiejętności.</p>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              {skills.slice(0, 10).map((entry) => (
                <div key={entry.skill.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{entry.skill.name}</span>
                    <span className="text-slate-500">{entry.state.mastery}% · {masteryLabel(entry.state.mastery)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={`h-full rounded-full ${entry.state.mastery < WEAK_MASTERY ? 'bg-rose-400' : entry.state.mastery < 85 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${entry.state.mastery}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-600">
                    {entry.state.attempts} odpowiedzi · {entry.state.correct} poprawnych · powtórka {daysUntilDue(entry.state) <= 0 ? 'teraz' : `za ${daysUntilDue(entry.state)} dni`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
          <h2 className="text-sm font-semibold text-white">Bank zadań wg działów</h2>
          <div className="mt-5 flex flex-col gap-3">
            {byTopic.slice(0, 12).map((topic) => (
              <div key={topic.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{topic.name}</span>
                <span className="text-slate-500">{topic.total} zadań</span>
              </div>
            ))}
            {byTopic.length === 0 && <p className="text-sm text-slate-500">Brak danych.</p>}
          </div>
          <div className="mt-6 border-t border-white/[0.07] pt-5 text-xs text-slate-500">
            <p className="flex items-center gap-2"><Flame size={13} className="text-orange-300" /> Powtórki planuje SM-2 — interwał rośnie tylko po poprawnej odpowiedzi bez podpowiedzi.</p>
            <Link href="/review" className="mt-4 inline-flex items-center gap-1 text-violet-300 hover:text-violet-200">Przejdź do powtórek <ArrowLeft size={12} className="rotate-180" /></Link>
          </div>
        </section>
      </div>
    </main>
  )
}
