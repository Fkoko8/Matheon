'use client'

/**
 * MATHEON — test opanowania działu.
 *
 * To nie jest osobny, wymyślony test: uruchamia realną sesję na zadaniach działu,
 * a wynik zapisuje się w mastery umiejętności i harmonogramie powtórek (SM-2).
 */
import Link from 'next/link'
import { ArrowLeft, Target } from 'lucide-react'
import { PracticeSession } from '@/components/practice-session'
import { getTopic } from '@/lib/learning/curriculum'

export function MasteryChallengePage({ slug }: { slug: string }) {
  const topic = getTopic(slug)
  if (!topic) return <main className="p-10 text-white">Nie znaleziono tematu.</main>

  return (
    <>
      <div className="mx-auto max-w-3xl px-5 pt-6 lg:px-10">
        <div className="rounded-3xl border border-violet-400/20 bg-violet-500/10 p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/learn/topic/${slug}`} className="inline-flex items-center gap-2 text-xs text-violet-200 hover:text-white"><ArrowLeft size={14} /> {topic.title}</Link>
            <span className="rounded-full border border-violet-400/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">Evidence-based mastery</span>
          </div>
          <h1 className="mt-5 flex items-center gap-3 text-2xl font-semibold text-white"><Target className="text-violet-300" size={22} /> Test opanowania: {topic.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Pytania pochodzą z banku zadań tego działu. Wynik podnosi mastery tylko wtedy, gdy odpowiadasz bez podpowiedzi
            i bez podglądania rozwiązania — otwarcie lekcji nie zmienia poziomu opanowania.
          </p>
        </div>
      </div>
      <PracticeSession
        mode="topic"
        topicSlug={slug}
        limit={8}
        heading={`Test opanowania · ${topic.title}`}
        description="Zadania z działu z oceną wg matrycy i aktualizacją harmonogramu powtórek."
        backHref={`/learn/topic/${slug}`}
      />
    </>
  )
}
