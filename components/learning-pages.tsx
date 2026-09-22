'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getUnresolvedMistakes, type MistakeRecord } from '@/lib/learning/mistakes'
import { getReviewQueueForToday } from '@/lib/learning/review'
import { getQuestion } from '@/lib/data'
import type { Question } from '@/lib/types'

export function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([])
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  useEffect(() => { const load = async () => { const supabase = createClient(); if (!supabase) return; const { data } = await supabase.auth.getUser(); if (!data.user) return; const items = await getUnresolvedMistakes(data.user.id, 50, supabase); setMistakes(items); const entries = await Promise.all(items.map(async (item) => [item.questionId, await getQuestion(item.questionId)] as const)); setQuestions(Object.fromEntries(entries.filter((entry): entry is [string, Question] => Boolean(entry[1])))) }; void load() }, [])
  return <main className="matheon-enter mx-auto max-w-5xl p-5 pb-28 lg:p-10"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400">Analiza błędów</p><h1 className="text-3xl font-semibold text-white">Moje błędy</h1><p className="mt-2 text-sm text-slate-400">Wróć do zadań, które najlepiej pokażą Ci następny krok.</p><div className="mt-8 flex flex-col gap-3">{mistakes.length === 0 ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-sm text-emerald-100"><CheckCircle2 className="mb-3" />Brak nierozwiązanych błędów. Świetna praca.</div> : mistakes.map((mistake) => <article key={mistake.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-300"><AlertTriangle size={18} /></span><div className="min-w-0 flex-1"><h2 className="font-semibold text-white">{questions[mistake.questionId]?.title ?? 'Zadanie'}</h2><p className="mt-1 text-sm text-slate-500">Twoja odpowiedź: {mistake.userAnswer || 'brak'} · Poprawna: {mistake.correctAnswer}</p><p className="mt-3 text-xs text-slate-600">{mistake.attemptCount} prób · {mistake.mistakeType ?? 'careless_error'}</p></div><button className="flex items-center gap-2 rounded-xl bg-violet-500 px-3 py-2 text-xs font-medium text-white"><RefreshCw size={14} />Spróbuj ponownie</button></div></article>)}</div></main>
}

export function RealStatsPage() {
  const [stats, setStats] = useState<{ totalQuestions: number; accuracy: number; mastery: number; studyTimeHours: number; streak: number } | null>(null)
  useEffect(() => { const load = async () => { const supabase = createClient(); if (!supabase) return; const { data } = await supabase.auth.getUser(); if (!data.user) return; const { getLearningStatistics } = await import('@/lib/learning/statistics'); setStats(await getLearningStatistics(data.user.id, supabase)) }; void load() }, [])
  return <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Analityka nauki</p><h1 className="text-3xl font-semibold text-white">Twoje statystyki</h1><div className="mt-8 grid gap-4 md:grid-cols-5">{[['Mastery', `${stats?.mastery ?? 0}%`], ['Skuteczność', `${stats?.accuracy ?? 0}%`], ['Rozwiązane', String(stats?.totalQuestions ?? 0)], ['Czas nauki', `${stats?.studyTimeHours ?? 0}h`], ['Seria', `${stats?.streak ?? 0} dni`]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold text-white">{value}</p></div>)}</div></main>
}

export function RealReviewPage() {
  const [count, setCount] = useState(0)
  useEffect(() => { const load = async () => { const supabase = createClient(); if (!supabase) return; const { data } = await supabase.auth.getUser(); if (data.user) setCount((await getReviewQueueForToday(data.user.id, supabase)).length) }; void load() }, [])
  return <main className="matheon-enter mx-auto max-w-5xl p-5 pb-28 lg:p-10"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Spaced repetition</p><h1 className="text-3xl font-semibold text-white">Powtórki na dziś</h1><p className="mt-2 text-sm text-slate-400">Kolejka jest obliczana na podstawie Twoich realnych odpowiedzi.</p><section className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6"><div className="flex items-center gap-3 text-emerald-200"><Clock3 size={18} /><span className="text-sm">Due now</span></div><p className="mt-3 text-4xl font-semibold text-white">{count} <span className="text-lg font-normal text-slate-400">zadań</span></p></section></main>
}
