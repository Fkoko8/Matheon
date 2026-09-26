'use client'

/**
 * MATHEON — czytanie lekcji.
 *
 * Lekcja jest tu tekstem do przeczytania, a nie listą kart: nawigacja po nagłówkach
 * (spis treści + podświetlanie aktywnej sekcji), pasek postępu czytania, cele lekcji,
 * realne mastery umiejętności i uczciwy checkpoint. Na klawiaturze przechodzisz między
 * lekcjami strzałkami ←/→, a na końcu masz test opanowania działu.
 */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, List, Target, Trophy } from 'lucide-react'
import { getTopic } from '@/lib/learning/curriculum'
import { useLearningProgress } from '@/hooks/use-learning-progress'
import { LessonBlock, blockOutline } from '@/components/learn-lesson-blocks'
import { DifficultyDots, MasteryPill, Pill, ProgressBar, formatDue, formatMinutes } from '@/components/learn-ui'

export function LessonCurriculumPage({ topicSlug, lessonSlug }: { topicSlug: string; lessonSlug: string }) {
  const router = useRouter()
  const topic = getTopic(topicSlug)
  const lesson = topic?.lessons.find((item) => item.slug === lessonSlug)
  const { progress, loading } = useLearningProgress()
  const topicProgress = progress?.get(topicSlug)
  const lessonProgress = topicProgress?.lessons.find((item) => item.lessonSlug === lessonSlug)

  // Obiekt lekcji pochodzi ze stałego katalogu programu (moduł, nie stan) — referencja jest stabilna.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- fałszywy alarm kompilatora na mutację, której nie ma
  const outline = useMemo(() => (lesson ? blockOutline(lesson.blocks) : []), [lesson])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [readPercent, setReadPercent] = useState(0)

  const index = topic && lesson ? topic.lessons.findIndex((item) => item.slug === lesson.slug) : -1
  const previous = topic && index > 0 ? topic.lessons[index - 1] : undefined
  const next = topic && index >= 0 ? topic.lessons[index + 1] : undefined

  // Podświetlanie aktywnej sekcji w spisie treści.
  useEffect(() => {
    if (!outline.length) return
    const elements = outline.map((entry) => document.getElementById(entry.id)).filter((element): element is HTMLElement => Boolean(element))
    if (!elements.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-100px 0px -65% 0px', threshold: 0 },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [outline])

  // Postęp czytania — informacja zwrotna, że lekcja ma swój koniec.
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setReadPercent(scrollable > 0 ? Math.min(100, Math.round((window.scrollY / scrollable) * 100)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lessonSlug])

  // ←/→ przenoszą między lekcjami (poza polami tekstowymi).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key === 'ArrowLeft' && previous) router.push(`/learn/lesson/${topicSlug}/${previous.slug}`)
      if (event.key === 'ArrowRight' && next) router.push(`/learn/lesson/${topicSlug}/${next.slug}`)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, previous, router, topicSlug])

  if (!topic || !lesson) {
    return (
      <main className="mx-auto max-w-3xl p-10">
        <p className="text-white">Nie znaleziono lekcji.</p>
        <Link href="/learn" className="mt-4 inline-flex items-center gap-2 text-sm text-violet-300"><ArrowLeft size={14} /> Wróć do biblioteki nauki</Link>
      </main>
    )
  }

  const done = lessonProgress?.completed ?? false

  return (
    <main className="matheon-enter mx-auto max-w-6xl p-5 pb-28 lg:p-10">
      {/* Pasek postępu czytania — podklejony pod nagłówkiem shella. */}
      <div className="sticky top-[64px] z-10 -mx-5 mb-6 border-b border-white/[0.06] bg-[#08080d]/90 px-5 py-2 backdrop-blur lg:-mx-10 lg:px-10">
        <div className="flex items-center gap-3">
          <Link href={`/learn/topic/${topic.slug}`} className="inline-flex items-center gap-1.5 truncate text-xs text-slate-500 hover:text-white">
            <ArrowLeft size={13} /> <span className="truncate">{topic.title}</span>
          </Link>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="text-[10px] uppercase tracking-wider text-slate-600">przeczytane {readPercent}%</span>
            <div className="w-24"><ProgressBar value={readPercent} tone="violet" size="sm" /></div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <header className="border-b border-white/[0.08] pb-7">
            <p className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Lekcja {index + 1} / {topic.lessons.length}
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">{topic.level === 'basic' ? 'Podstawa' : 'Rozszerzenie'}</span>
              {done && <Pill tone="emerald" icon={<Check size={11} />}>przeczytana i opanowana</Pill>}
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">{lesson.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {formatMinutes(lesson.duration)}</span>
              <span className="inline-flex items-center gap-2">trudność <DifficultyDots value={lesson.difficulty} /></span>
              <span className="inline-flex items-center gap-1.5"><BookOpen size={13} /> {lesson.taskCount} zadań w banku</span>
              <MasteryPill value={lessonProgress?.mastery ?? 0} loading={loading} />
            </div>

            {lesson.objectives.length > 0 && (
              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Po tej lekcji będziesz umieć</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {lesson.objectives.map((objective) => (
                    <li key={objective} className="flex items-start gap-2.5 text-sm leading-6 text-slate-300">
                      <Check size={15} className="mt-0.5 shrink-0 text-emerald-300" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(lesson.requirements?.length || lesson.skills.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {lesson.requirements?.map((code) => <Pill key={code} tone="violet">CKE {code}</Pill>)}
                {lessonProgress?.skills.map((skill) => (
                  <Pill key={skill.slug} tone={skill.attempts > 0 ? (skill.mastery < 40 ? 'rose' : skill.mastery < 70 ? 'amber' : 'emerald') : 'slate'}>
                    {skill.name}{skill.attempts > 0 ? ` · ${skill.mastery}%` : ''}
                  </Pill>
                ))}
              </div>
            )}
          </header>

          <div className="mt-8 flex flex-col gap-6">
            {lesson.blocks.map((block, blockIndex) => (
              <LessonBlock key={`${block.type}-${blockIndex}`} block={block} index={blockIndex} topicSlug={topic.slug} lessonSlug={lesson.slug} level={topic.level} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-blue-500/[0.07] p-6">
            <h2 className="text-lg font-semibold text-white">Zamknij tę lekcję dowodem</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Mastery rośnie wyłącznie od odpowiedzi na zadania. {lesson.taskCount > 0
                ? `W banku czeka ${lesson.taskCount} zadań przypisanych do tej lekcji.`
                : 'Bank zadań tego działu jest dostępny w treningu.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/learn/topic/${topic.slug}/mastery`} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">
                <Target size={15} /> Test opanowania działu
              </Link>
              <Link href={`/learn/topic/${topic.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-200 hover:bg-white/[0.05]">
                Wróć do planu działu
              </Link>
            </div>
          </div>

          <nav className="mt-8 flex flex-col justify-between gap-3 border-t border-white/[0.08] pt-6 sm:flex-row">
            {previous ? (
              <Link href={`/learn/lesson/${topic.slug}/${previous.slug}`} className="group inline-flex items-center gap-3 rounded-xl border border-white/[0.08] px-4 py-3 text-left hover:border-violet-400/30">
                <ArrowLeft size={15} className="text-slate-500 group-hover:text-violet-300" />
                <span><span className="block text-[10px] uppercase tracking-wider text-slate-600">Poprzednia</span><span className="text-sm text-slate-200">{previous.title}</span></span>
              </Link>
            ) : <span className="hidden sm:block" />}
            {next ? (
              <Link href={`/learn/lesson/${topic.slug}/${next.slug}`} className="group inline-flex items-center gap-3 rounded-xl border border-white/[0.08] px-4 py-3 text-right hover:border-violet-400/30 sm:justify-end">
                <span><span className="block text-[10px] uppercase tracking-wider text-slate-600">Następna</span><span className="text-sm text-slate-200">{next.title}</span></span>
                <ArrowRight size={15} className="text-violet-300" />
              </Link>
            ) : (
              <Link href={`/learn/topic/${topic.slug}/mastery`} className="inline-flex items-center gap-3 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">
                <Trophy size={15} /> Ostatnia lekcja — zmierz mastery działu <ArrowRight size={14} />
              </Link>
            )}
          </nav>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 flex flex-col gap-5">
            {outline.length > 1 && (
              <nav className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <p className="flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"><List size={12} /> Spis treści</p>
                <ol className="mt-3 flex flex-col gap-0.5">
                  {outline.map((entry, entryIndex) => (
                    <li key={entry.id}>
                      <a
                        href={`#${entry.id}`}
                        className={`block truncate rounded-lg px-2 py-1.5 text-xs transition ${activeId === entry.id ? 'bg-violet-500/15 text-white' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}
                      >
                        {entryIndex + 1}. {entry.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Postęp działu</p>
              <p className="mt-3 px-1 text-3xl font-semibold text-white">{topicProgress?.mastery ?? 0}%</p>
              <div className="mt-3 px-1"><ProgressBar value={topicProgress?.mastery ?? 0} /></div>
              <p className="mt-3 px-1 text-[11px] text-slate-500">
                {topicProgress ? `${topicProgress.practisedSkills}/${topicProgress.totalSkills} umiejętności ćwiczonych` : 'Brak danych o postępie'}
              </p>
              {topicProgress && topicProgress.dueSkills > 0 && (
                <p className="mt-2 px-1 text-[11px] text-amber-300">{topicProgress.dueSkills} umiejętności czeka na powtórkę · {formatDue(topicProgress.nextDueAt)}</p>
              )}
              <Link href={`/learn/topic/${topic.slug}`} className="mt-4 block rounded-xl border border-white/[0.1] px-3 py-2 text-center text-xs text-slate-200 hover:bg-white/[0.05]">
                Plan działu
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
