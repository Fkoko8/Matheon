'use client'

/**
 * MATHEON — biblioteka nauki (sekcja „Nauka”).
 *
 * Zamiast katalogu działów to pulpit sterujący nauką: pokazuje, gdzie jesteś, co jest
 * zaległe i co konkretnie otworzyć w następnej kolejności. Filtry i wyszukiwarka działają
 * na nazwach działów, lekcji i umiejętności (bez diakrytyki).
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Check, Clock3, Flame, RefreshCw, Search, Sparkles, TriangleAlert, Trophy } from 'lucide-react'
import { curriculum } from '@/lib/learning/curriculum'
import type { LearningLevel } from '@/lib/learning/curriculum'
import { curriculumCoverage } from '@/lib/learning/learning-progress'
import { useLearningProgress } from '@/hooks/use-learning-progress'
import { fold } from '@/lib/search'
import { DifficultyDots, DuePill, MasteryPill, Pill, ProgressBar, StatusPill, formatMinutes } from '@/components/learn-ui'

type FilterKey = 'all' | 'active' | 'due' | 'todo'
type SortKey = 'program' | 'weakest' | 'progress'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'active', label: 'W toku' },
  { key: 'due', label: 'Do powtórki' },
  { key: 'todo', label: 'Nierozpoczęte' },
]

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'program', label: 'Kolejność programu' },
  { key: 'weakest', label: 'Najsłabsze najpierw' },
  { key: 'progress', label: 'Najwyższy postęp' },
]

export function CurriculumPage() {
  const [level, setLevel] = useState<LearningLevel>('basic')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('program')
  const { progress, loading } = useLearningProgress()

  const coverage = useMemo(() => curriculumCoverage(), [])
  const topics = useMemo(() => curriculum.filter((topic) => topic.level === level), [level])

  // Tekst do wyszukania: dział + lekcje + umiejętności.
  const haystacks = useMemo(() => {
    const map = new Map<string, string>()
    for (const topic of topics) {
      map.set(
        topic.slug,
        fold([
          topic.title,
          topic.description,
          ...topic.lessons.map((lesson) => lesson.title),
          ...topic.lessons.flatMap((lesson) => lesson.skills.map((skill) => skill.name)),
        ].join(' ')),
      )
    }
    return map
  }, [topics])

  const stats = useMemo(() => {
    const entries = topics.map((topic) => ({ topic, state: progress?.get(topic.slug) }))
    const practised = entries.filter((entry) => entry.state?.started)
    const mastery = practised.length ? Math.round(practised.reduce((sum, entry) => sum + (entry.state?.mastery ?? 0), 0) / practised.length) : 0
    return {
      entries,
      mastery,
      started: practised.length,
      due: entries.reduce((sum, entry) => sum + (entry.state?.dueSkills ?? 0), 0),
    }
  }, [topics, progress])

  const continueTarget = useMemo(() => {
    const entries = stats.entries
    const due = entries.find((entry) => (entry.state?.dueSkills ?? 0) > 0)
    if (due) return due
    const active = entries
      .filter((entry) => entry.state?.started && !entry.state.completed)
      .sort((a, b) => (a.state?.mastery ?? 0) - (b.state?.mastery ?? 0))[0]
    if (active) return active
    return entries.find((entry) => !entry.state?.started) ?? entries[0]
  }, [stats.entries])

  const visible = useMemo(() => {
    const terms = fold(query).trim().split(/\s+/).filter(Boolean)
    let list = stats.entries.filter(({ topic }) => {
      const haystack = haystacks.get(topic.slug) ?? ''
      if (terms.length && !terms.every((term) => haystack.includes(term))) return false
      const state = progress?.get(topic.slug)
      if (filter === 'active') return Boolean(state?.started && !state.completed)
      if (filter === 'due') return (state?.dueSkills ?? 0) > 0
      if (filter === 'todo') return !state?.started
      return true
    })

    if (sort === 'weakest') {
      list = [...list].sort((a, b) => {
        const aState = progress?.get(a.topic.slug)
        const bState = progress?.get(b.topic.slug)
        return Number(bState?.started ?? false) - Number(aState?.started ?? false) || (aState?.mastery ?? 0) - (bState?.mastery ?? 0)
      })
    } else if (sort === 'progress') {
      list = [...list].sort((a, b) => (progress?.get(b.topic.slug)?.mastery ?? 0) - (progress?.get(a.topic.slug)?.mastery ?? 0))
    }
    return list
  }, [stats.entries, haystacks, query, filter, sort, progress])

  const continueState = continueTarget ? progress?.get(continueTarget.topic.slug) : undefined
  const continueLessonSlug = continueState?.nextLessonSlug ?? continueTarget?.topic.lessons[0]?.slug
  const continueLesson = continueTarget?.topic.lessons.find((lesson) => lesson.slug === continueLessonSlug)

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Rdzeń MATHEON</p>
          <h1 className="text-3xl font-semibold text-white">Nauka</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Cała droga od definicji do zadań maturalnych. Mastery rośnie tylko od odpowiedzi — otwarcie lekcji nie zmienia poziomu.
          </p>
        </div>
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {(['basic', 'extended'] as LearningLevel[]).map((item) => (
            <button
              key={item}
              onClick={() => setLevel(item)}
              className={`rounded-lg px-4 py-2 text-xs transition ${level === item ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {item === 'basic' ? 'Podstawa' : 'Rozszerzenie'}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
          <p className="text-xs text-violet-200">Twój mastery</p>
          <p className="mt-2 text-3xl font-semibold text-white">{stats.mastery}%</p>
          <p className="mt-1 text-[11px] text-slate-400">{stats.started} z {topics.length} działów rozpoczętych</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <p className="text-xs text-slate-500">Do powtórki</p>
          <p className="mt-2 text-3xl font-semibold text-white">{stats.due}</p>
          <Link href="/review" className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200">Otwórz powtórki <ArrowRight size={11} /></Link>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <p className="text-xs text-slate-500">Treść tego poziomu</p>
          <p className="mt-2 text-3xl font-semibold text-white">{topics.length} działów</p>
          <p className="mt-1 text-[11px] text-slate-500">{topics.reduce((sum, topic) => sum + topic.lessons.length, 0)} lekcji · {topics.reduce((sum, topic) => sum + topic.taskCount, 0)} zadań</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
          <p className="text-xs text-slate-500">Cały program</p>
          <p className="mt-2 text-3xl font-semibold text-white">{coverage.authoredLessons}/{coverage.lessons}</p>
          <p className="mt-1 text-[11px] text-slate-500">lekcji z pełną treścią autorską</p>
        </div>
      </div>

      {continueTarget && continueLesson && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.16] to-blue-500/[0.06] p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                <Flame size={12} /> Kontynuuj naukę
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{continueTarget.topic.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Następny krok: <span className="text-white">{continueLesson.title}</span> · {formatMinutes(continueLesson.duration)} ·
                {' '}{continueLesson.taskCount} zadań do tej lekcji.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/learn/lesson/${continueTarget.topic.slug}/${continueLesson.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400"
                >
                  {continueState?.started ? 'Wróć do lekcji' : 'Rozpocznij lekcję'} <ArrowRight size={15} />
                </Link>
                <Link href={`/learn/topic/${continueTarget.topic.slug}`} className="text-xs text-slate-300 hover:text-white">Plan działu</Link>
              </div>
            </div>
            <div className="w-full max-w-[220px]">
              <MasteryPill value={continueState?.mastery ?? 0} loading={loading} />
              <div className="mt-3"><ProgressBar value={continueState?.mastery ?? 0} /></div>
              <p className="mt-2 text-[11px] text-slate-400">
                {continueState ? `${continueState.practisedSkills}/${continueState.totalSkills} umiejętności działu z dowodami` : 'Brak odpowiedzi w tym dziale'}
              </p>
              <DuePill count={continueState?.dueSkills ?? 0} />
            </div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj działu, lekcji lub umiejętności…"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${filter === item.key ? 'border-violet-400/40 bg-violet-500/15 text-white' : 'border-white/[0.08] text-slate-400 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-xs text-slate-300 outline-none"
            >
              {SORTS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {loading ? 'Wczytuję postęp…' : `${visible.length} z ${topics.length} działów`}
          {query && !loading ? ` dla „${query}”` : ''}
        </p>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
            <p className="text-sm text-slate-300">Nic nie pasuje do tych kryteriów.</p>
            <button onClick={() => { setQuery(''); setFilter('all') }} className="mt-4 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs text-slate-200 hover:bg-white/[0.05]">Wyczyść filtry</button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map(({ topic }, index) => {
              const state = progress?.get(topic.slug)
              const lesson = topic.lessons.find((item) => item.slug === state?.nextLessonSlug) ?? topic.lessons[0]
              const status: 'done' | 'active' | 'todo' = state?.completed ? 'done' : state?.started ? 'active' : 'todo'
              return (
                <Link
                  key={topic.slug}
                  href={`/learn/topic/${topic.slug}`}
                  className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-violet-400/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-300"><BookOpen size={17} /></span>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-slate-600">{String(index + 1).padStart(2, '0')}</span>
                      <StatusPill state={status} />
                    </div>
                  </div>

                  <h3 className="mt-5 font-semibold text-white">{topic.title}</h3>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{topic.description}</p>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">mastery</span>
                      <span className="text-slate-400">{state?.mastery ?? 0}%</span>
                    </div>
                    <ProgressBar value={state?.mastery ?? 0} />
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Flame size={11} className="text-violet-300" />
                    {state?.started ? 'Dalej:' : 'Start:'} <span className="truncate text-slate-300">{lesson?.title}</span>
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {topic.authored
                      ? <Pill tone="emerald" icon={<Check size={11} />}>{topic.taskCount} zadań</Pill>
                      : <Pill tone="amber" icon={<TriangleAlert size={11} />}>szkic treści</Pill>}
                    <Pill icon={<Clock3 size={11} />}>{formatMinutes(topic.durationMinutes)}</Pill>
                    <DuePill count={state?.dueSkills ?? 0} />
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 text-[11px] text-slate-600">
                    <span className="flex items-center gap-2">
                      {topic.lessons.length} lekcji
                      <DifficultyDots value={Math.round(topic.lessons.reduce((sum, item) => sum + item.difficulty, 0) / topic.lessons.length)} />
                    </span>
                    <span className="inline-flex items-center gap-1 text-violet-300 opacity-0 transition group-hover:opacity-100">
                      Otwórz <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { icon: Sparkles, title: 'Mastery z dowodów', body: 'Poziom rośnie tylko wtedy, gdy odpowiadasz na zadania bez podpowiedzi i bez podglądania rozwiązania.' },
          { icon: RefreshCw, title: 'Powtórki SM-2', body: 'Każda odpowiedź wyznacza termin powtórki. Zaległe umiejętności same wracają na górę planu.' },
          { icon: Trophy, title: 'Test opanowania', body: 'W każdym dziale uruchamiasz realną sesję zadań i od razu widzisz, co już umiesz.' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <span className="grid size-9 place-items-center rounded-xl bg-white/[0.05] text-violet-300"><Icon size={16} /></span>
              <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.body}</p>
            </div>
          )
        })}
      </section>
    </main>
  )
}
