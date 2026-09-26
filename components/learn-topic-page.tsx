'use client'

/**
 * MATHEON — plan jednego działu.
 *
 * Odpowiada na pytanie „co mam teraz zrobić w tym dziale”: pokazuje kolejność lekcji
 * ze statusem każdej z nich, realne mastery umiejętności i wymagania CKE, które dział
 * realizuje. „Następny krok” jest wyróżniony, żeby nie trzeba było zgadywać.
 */
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Clock3, Flame, ListChecks, Play, RefreshCw, Target, TriangleAlert } from 'lucide-react'
import { getTopic } from '@/lib/learning/curriculum'
import { useLearningProgress } from '@/hooks/use-learning-progress'
import { DifficultyDots, MasteryPill, Pill, ProgressBar, StatusPill, formatDue, formatMinutes, masteryTone } from '@/components/learn-ui'

export function TopicPage({ slug }: { slug: string }) {
  const topic = getTopic(slug)
  const { progress, loading } = useLearningProgress()
  const topicProgress = progress?.get(slug)

  if (!topic) {
    return (
      <main className="mx-auto max-w-3xl p-10">
        <p className="text-white">Nie znaleziono tematu.</p>
        <Link href="/learn" className="mt-4 inline-flex items-center gap-2 text-sm text-violet-300"><ArrowLeft size={14} /> Biblioteka nauki</Link>
      </main>
    )
  }

  const nextLessonSlug = topicProgress?.nextLessonSlug ?? topic.lessons[0]?.slug ?? null
  const requirements = Array.from(new Set(topic.lessons.flatMap((lesson) => lesson.requirements ?? [])))
  const weakest = topicProgress?.skills.filter((skill) => skill.attempts > 0).slice(0, 6) ?? []

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <Link href="/learn" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white"><ArrowLeft size={14} /> Wszystkie działy</Link>

      <header className="mt-7 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              {topic.level === 'basic' ? 'Matura podstawowa' : 'Matura rozszerzona'}
            </p>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">{topic.title}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">{topic.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Pill tone="violet" icon={<ListChecks size={11} />}>{topic.lessons.length} lekcji</Pill>
              <Pill icon={<Clock3 size={11} />}>{formatMinutes(topic.durationMinutes)} materiału</Pill>
              <Pill icon={<Target size={11} />}>{topic.taskCount} zadań w banku</Pill>
              {topic.authored
                ? <Pill tone="emerald" icon={<Check size={11} />}>pełna treść autorska</Pill>
                : <Pill tone="amber" icon={<TriangleAlert size={11} />}>treść w przygotowaniu (szablon)</Pill>}
            </div>
          </div>

          <div className="w-full max-w-xs rounded-2xl border border-white/[0.08] bg-black/20 p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-slate-500">Mastery działu</p>
              <MasteryPill value={topicProgress?.mastery ?? 0} loading={loading} />
            </div>
            <p className="mt-3 text-4xl font-semibold text-white">{topicProgress?.mastery ?? 0}%</p>
            <div className="mt-3"><ProgressBar value={topicProgress?.mastery ?? 0} /></div>
            <p className="mt-3 text-[11px] text-slate-500">
              {topicProgress ? `${topicProgress.practisedSkills} z ${topicProgress.totalSkills} umiejętności ma dowody z zadań` : 'Wczytuję postęp…'}
            </p>
            {topicProgress && topicProgress.dueSkills > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300"><RefreshCw size={11} /> {topicProgress.dueSkills} do powtórki · najbliższa {formatDue(topicProgress.nextDueAt)}</p>
            )}
            <div className="mt-5 flex flex-col gap-2">
              {nextLessonSlug && (
                <Link href={`/learn/lesson/${topic.slug}/${nextLessonSlug}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-violet-400">
                  <Play size={13} /> {topicProgress?.started ? 'Kontynuuj naukę' : 'Rozpocznij dział'}
                </Link>
              )}
              <Link href={`/learn/topic/${topic.slug}/mastery`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs text-slate-200 hover:bg-white/[0.05]">
                <Target size={13} /> Test opanowania
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="flex flex-col gap-3">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Plan działu</h2>
            <span className="text-xs text-slate-500">kolejność jest celowa — trudność rośnie</span>
          </div>

          {topic.lessons.map((lesson, lessonIndex) => {
            const lessonProgress = topicProgress?.lessons.find((item) => item.lessonSlug === lesson.slug)
            const state: 'done' | 'active' | 'todo' = lessonProgress?.completed ? 'done' : lessonProgress?.started ? 'active' : 'todo'
            const isNext = lesson.slug === nextLessonSlug
            return (
              <Link
                key={lesson.slug}
                href={`/learn/lesson/${topic.slug}/${lesson.slug}`}
                className={`group flex gap-4 rounded-2xl border p-5 transition hover:-translate-y-0.5 ${isNext ? 'border-violet-400/40 bg-violet-500/[0.08]' : 'border-white/[0.07] bg-white/[0.025] hover:border-violet-400/25'}`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${state === 'done' ? 'bg-emerald-400/15 text-emerald-300' : isNext ? 'bg-violet-500/20 text-violet-200' : 'bg-white/[0.06] text-slate-400'}`}>
                  {state === 'done' ? <Check size={17} /> : lessonIndex + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{lesson.title}</h3>
                    <StatusPill state={state} />
                    {isNext && <Pill tone="violet" icon={<Flame size={11} />}>następny krok</Pill>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><Clock3 size={12} /> {formatMinutes(lesson.duration)}</span>
                    <span className="inline-flex items-center gap-2">trudność <DifficultyDots value={lesson.difficulty} /></span>
                    <span>{lesson.skills.length} umiejętności</span>
                    <span>{lesson.taskCount} zadań</span>
                    {lessonProgress && lessonProgress.practisedSkills > 0 && (
                      <span className="text-slate-400">{lessonProgress.practisedSkills}/{lessonProgress.totalSkills} ćwiczonych</span>
                    )}
                  </div>
                  {lesson.objectives.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1">
                      {lesson.objectives.slice(0, 2).map((objective) => (
                        <li key={objective} className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                          <Check size={12} className="mt-0.5 shrink-0 text-slate-600" />{objective}
                        </li>
                      ))}
                    </ul>
                  )}
                  {lessonProgress && lessonProgress.practisedSkills > 0 && (
                    <div className="mt-3 max-w-xs">
                      <ProgressBar value={lessonProgress.mastery} />
                    </div>
                  )}
                </div>

                <ArrowRight size={16} className={`mt-3 shrink-0 transition group-hover:translate-x-1 ${isNext ? 'text-violet-300' : 'text-slate-600'}`} />
              </Link>
            )
          })}
        </section>

        <aside className="flex flex-col gap-5">
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <h2 className="text-sm font-semibold text-white">Umiejętności działu</h2>
            <p className="mt-1 text-[11px] text-slate-500">Najsłabsze na górze — to one podnoszą priorytet w planie nauki.</p>
            <div className="mt-4 flex flex-col gap-3">
              {(topicProgress?.skills ?? []).map((skill) => (
                <div key={skill.slug}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-slate-300">{skill.name}</span>
                    <span className="shrink-0 text-slate-500">{skill.attempts > 0 ? `${skill.mastery}%` : '—'}</span>
                  </div>
                  <ProgressBar value={skill.mastery} tone={masteryTone(skill.mastery)} size="sm" />
                  {skill.dueAt && <p className="mt-1 text-[10px] text-slate-600">powtórka {formatDue(skill.dueAt)}</p>}
                </div>
              ))}
              {!topicProgress && <p className="text-xs text-slate-500">Wczytuję postęp…</p>}
            </div>
          </section>

          {requirements.length > 0 && (
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <h2 className="text-sm font-semibold text-white">Wymagania CKE</h2>
              <p className="mt-1 text-[11px] text-slate-500">Kody podstawy programowej realizowane w tym dziale.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {requirements.map((code) => <Pill key={code} tone="violet">{code}</Pill>)}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <h2 className="text-sm font-semibold text-white">Skróty</h2>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <Link href={`/learn/topic/${topic.slug}/mastery`} className="flex items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5 text-slate-200 hover:bg-white/[0.05]">
                Test opanowania <Target size={13} className="text-violet-300" />
              </Link>
              <Link href={`/tasks?level=${topic.level}`} className="flex items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5 text-slate-200 hover:bg-white/[0.05]">
                Bank zadań ({topic.level === 'basic' ? 'podstawa' : 'rozszerzenie'}) <ArrowRight size={13} className="text-slate-500" />
              </Link>
              <Link href="/review" className="flex items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5 text-slate-200 hover:bg-white/[0.05]">
                Powtórki na dziś <RefreshCw size={13} className="text-amber-300" />
              </Link>
              <Link href={`/stats`} className="flex items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5 text-slate-200 hover:bg-white/[0.05]">
                Statystyki i wykresy <ArrowRight size={13} className="text-slate-500" />
              </Link>
            </div>
          </section>

          {weakest.length > 0 && (
            <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
              <h2 className="text-sm font-semibold text-amber-100">Wymaga uwagi</h2>
              <ul className="mt-3 flex flex-col gap-2 text-xs text-amber-50">
                {weakest.filter((skill) => skill.mastery < 70).slice(0, 4).map((skill) => (
                  <li key={skill.slug} className="flex items-center justify-between gap-2">
                    <span className="truncate">{skill.name}</span>
                    <span className="shrink-0">{skill.mastery}%</span>
                  </li>
                ))}
              </ul>
              {weakest.every((skill) => skill.mastery >= 70) && <p className="mt-3 text-xs text-amber-50">Wszystkie ćwiczone umiejętności są powyżej 70%.</p>}
            </section>
          )}
        </aside>
      </div>
    </main>
  )
}
