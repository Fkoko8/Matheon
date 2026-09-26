'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CalendarDays, ChevronRight, Clock3, Flame, Loader2, RefreshCw, Target, TrendingUp, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRecentSessions } from '@/lib/learning/sessions'
import { loadPracticeOverview, type PracticeOverview } from '@/lib/learning/practice'
import { getCurrentUserId, joinSkillStates, loadSkillCatalog, loadSkillStates, type SkillWithState } from '@/lib/learning/skill-state'
import { WEAK_MASTERY, daysUntilDue, isDue, masteryLabel } from '@/lib/learning/skill-model'
import { useProfile } from '@/hooks/use-profile'

function Progress({ value, color = 'bg-violet-500' }: { value: number; color?: string }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
}

function SectionTitle({ eyebrow, title, action, href }: { eyebrow?: string; title: string; action?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">{eyebrow}</p>}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {action && href && <Link href={href} className="text-xs font-medium text-slate-400 hover:text-white">{action} <ChevronRight className="ml-1 inline" size={14} /></Link>}
    </div>
  )
}

const todayLabel = () => {
  const text = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface DashboardState {
  overview: PracticeOverview
  skills: SkillWithState[]
  week: Array<{ date: string; questions: number }>
  streakSessions: number
}

const EMPTY_OVERVIEW: PracticeOverview = { totalSkills: 0, practisedSkills: 0, mastery: 0, dueToday: 0, weakSkills: 0, unlockedQuestions: 0, unanswered: 0 }

export function DashboardPage() {
  const [state, setState] = useState<DashboardState | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useProfile()

  useEffect(() => {
    let active = true
    const load = async () => {
      const supabase = createClient()
      const userId = await getCurrentUserId(supabase)
      if (!supabase || !userId) { setLoading(false); return }

      const [overview, catalog, skillStates, sessions] = await Promise.all([
        loadPracticeOverview(userId, supabase),
        loadSkillCatalog(supabase),
        loadSkillStates(userId, supabase),
        getRecentSessions(userId, 60, supabase),
      ])

      const days: Array<{ date: string; questions: number }> = []
      const byDate = new Map<string, number>()
      for (const session of sessions) {
        const key = session.startedAt.slice(0, 10)
        byDate.set(key, (byDate.get(key) ?? 0) + session.questionsCount)
      }
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10)
        days.push({ date, questions: byDate.get(date) ?? 0 })
      }

      if (!active) return
      setState({
        overview,
        skills: joinSkillStates(catalog, skillStates).filter((entry) => entry.state.attempts > 0),
        week: days,
        streakSessions: sessions.length,
      })
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const overview = state?.overview ?? EMPTY_OVERVIEW
  const skills = state?.skills ?? []
  const due = skills.filter((entry) => isDue(entry.state))
  const weak = skills.filter((entry) => entry.state.mastery < WEAK_MASTERY).slice(0, 4)
  const basic = skills.filter((entry) => entry.skill.level === 'basic')
  const extended = skills.filter((entry) => entry.skill.level === 'extended')
  const average = (list: SkillWithState[]) => (list.length ? Math.round(list.reduce((sum, entry) => sum + entry.state.mastery, 0) / list.length) : 0)

  const name = profile?.displayName ?? 'Uczeń'
  const streak = profile?.streak ?? 0
  const maxWeek = Math.max(1, ...(state?.week ?? []).map((day) => day.questions))

  if (loading) {
    return (
      <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
        <p className="mb-2 text-sm text-slate-500">{todayLabel()}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Dzień dobry, {name}<span className="text-violet-400">.</span></h1>
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Wczytuję Twój postęp…</div>
      </main>
    )
  }

  const isEmpty = overview.practisedSkills === 0

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm text-slate-500">{todayLabel()}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dzień dobry, {name}<span className="text-violet-400">.</span></h1>
          <p className="mt-2 text-sm text-slate-400">
            {isEmpty
              ? 'Zacznij od pierwszego zadania — od razu zobaczysz swój poziom opanowania.'
              : `Masz ${due.length} umiejętności do powtórki i ${overview.weakSkills} obszarów wymagających pracy.`}
          </p>
        </div>
        <Link href="/plan" className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08]"><CalendarDays size={16} className="text-violet-300" /> Twój plan <ChevronRight size={15} className="text-slate-500" /></Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 via-[#19162d] to-[#11111a] p-6 md:p-8">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <div className="mb-5 flex items-center gap-2 text-xs font-medium text-violet-300"><span className="size-2 rounded-full bg-violet-400" />Twój postęp</div>
              <p className="text-5xl font-semibold tracking-tight text-white">{overview.mastery}<span className="text-2xl text-slate-400">%</span></p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                Mastery {overview.practisedSkills} z {overview.totalSkills} umiejętności, liczone wyłącznie z Twoich odpowiedzi.
              </p>
            </div>
            <div className="flex min-w-52 flex-col justify-end gap-5">
              <div>
                <div className="mb-2 flex justify-between text-xs"><span className="text-slate-300">Matura podstawowa</span><span className="font-medium text-white">{average(basic)}%</span></div>
                <Progress value={average(basic)} color="bg-violet-400" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs"><span className="text-slate-300">Matura rozszerzona</span><span className="font-medium text-white">{average(extended)}%</span></div>
                <Progress value={average(extended)} color="bg-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-xs text-slate-500">Dzisiejsza seria</p><p className="mt-1 text-2xl font-semibold text-white">{streak} dni</p></div>
            <span className="grid size-11 place-items-center rounded-2xl bg-orange-500/15 text-orange-300"><Flame size={22} /></span>
          </div>
          <div className="flex items-end gap-1.5">
            {(state?.week ?? []).map((day, index) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div className={`w-full rounded-t-md ${index === 6 ? 'bg-violet-400' : 'bg-white/[0.1]'}`} style={{ height: `${Math.max(3, (day.questions / maxWeek) * 90)}px` }} />
                <span className="text-[10px] text-slate-600">{['N', 'P', 'W', 'Ś', 'C', 'P', 'S'][new Date(day.date).getDay()]}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">{state?.streakSessions ?? 0} sesji nauki w historii · dziś rozwiązanych {state?.week.at(-1)?.questions ?? 0} zadań</p>
        </div>
      </div>

      <section className="mt-10">
        <SectionTitle eyebrow="Priorytety" title="Co zrobić teraz" action="Bank zadań" href="/tasks" />
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/review" className="group rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 transition hover:-translate-y-0.5">
            <div className="mb-5 flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300"><Clock3 size={17} /></span>
              <span className="rounded-full bg-black/20 px-2 py-1 text-[10px] text-emerald-100">{due.length} umiejętności</span>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-white">Powtórki SM-2</h3>
            <p className="mb-4 text-xs leading-5 text-emerald-100/80">
              {due.length ? `Najstarsza zaległość: ${due[0].skill.name} (${Math.abs(daysUntilDue(due[0].state))} dni).` : 'Nic nie jest zaległe — harmonogram jest na bieżąco.'}
            </p>
            <span className="flex items-center justify-between text-xs font-medium text-emerald-200">Rozpocznij <ChevronRight size={15} /></span>
          </Link>

          <Link href="/tasks" className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-violet-400/30">
            <div className="mb-5 flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Target size={17} /></span>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-slate-400">{overview.unlockedQuestions} zadań</span>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-white">Trening z banku</h3>
            <p className="mb-4 text-xs leading-5 text-slate-500">
              {weak.length ? `Zacznij od: ${weak.map((entry) => entry.skill.name).slice(0, 2).join(', ')}.` : 'Sesja mieszana z zadań dopasowanych do poziomu.'}
            </p>
            <span className="flex items-center justify-between text-xs font-medium text-violet-300">Trenuj <ChevronRight size={15} /></span>
          </Link>

          <Link href="/mistakes" className="group rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-5 transition hover:-translate-y-0.5">
            <div className="mb-5 flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-rose-500/15 text-rose-300"><AlertTriangle size={17} /></span>
              <span className="rounded-full bg-black/20 px-2 py-1 text-[10px] text-rose-100">analiza błędów</span>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-white">Pętla naprawy błędów</h3>
            <p className="mb-4 text-xs leading-5 text-rose-100/80">Wróć do zadań, w których się pomyliłeś. Poprawna odpowiedź zamyka błąd i planuje powtórkę.</p>
            <span className="flex items-center justify-between text-xs font-medium text-rose-200">Zobacz błędy <ChevronRight size={15} /></span>
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <SectionTitle eyebrow="Obszary do poprawy" title="Twoje słabe umiejętności" action="Zobacz statystyki" href="/stats" />
          {weak.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 text-sm text-slate-400">
              <Trophy className="mb-3 text-emerald-400" size={18} />
              {skills.length === 0 ? 'Rozwiąż pierwsze zadania, żeby zobaczyć rozbicie na umiejętności.' : `Brak umiejętności poniżej ${WEAK_MASTERY}% mastery. Utrzymaj tempo w powtórkach.`}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {weak.map((entry) => (
                <div key={entry.skill.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <span className="size-2.5 rounded-full bg-rose-400" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex justify-between gap-3 text-sm"><span className="truncate text-slate-200">{entry.skill.name}</span><span className="font-medium text-white">{entry.state.mastery}%</span></div>
                    <Progress value={entry.state.mastery} color="bg-rose-400" />
                  </div>
                  <span className="hidden text-xs text-slate-500 sm:block">{entry.state.attempts} odp. · {masteryLabel(entry.state.mastery)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <SectionTitle eyebrow="Rozwój" title="Najbliższe powtórki" action="Wszystkie" href="/review" />
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            {skills.length === 0 ? (
              <p className="text-sm text-slate-500">Harmonogram powtórek powstanie po pierwszych odpowiedziach.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {skills
                  .slice()
                  .sort((a, b) => daysUntilDue(a.state) - daysUntilDue(b.state))
                  .slice(0, 5)
                  .map((entry) => (
                    <div key={entry.skill.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-slate-300">{entry.skill.name}</span>
                      <span className={`shrink-0 text-xs ${isDue(entry.state) ? 'text-amber-300' : 'text-slate-500'}`}>
                        {isDue(entry.state) ? 'teraz' : `za ${daysUntilDue(entry.state)} dni`} · {entry.state.mastery}%
                      </span>
                    </div>
                  ))}
              </div>
            )}
            <Link href="/learn" className="mt-6 flex items-center gap-2 border-t border-white/[0.07] pt-5 text-xs font-medium text-violet-300 hover:text-violet-200">
              <TrendingUp size={14} /> Przejdź do biblioteki nauki
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle eyebrow="Skrót" title="Niezbędnik" />
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/learn" className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-sm text-slate-300 transition hover:border-violet-400/30">
            <RefreshCw className="mb-3 text-violet-300" size={17} />
            <p className="font-medium text-white">Biblioteka nauki</p>
            <p className="mt-1 text-xs text-slate-500">Teoria, wzory i pułapki egzaminacyjne dla każdego działu.</p>
          </Link>
          <Link href="/exams" className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-sm text-slate-300 transition hover:border-violet-400/30">
            <CalendarDays className="mb-3 text-violet-300" size={17} />
            <p className="font-medium text-white">Arkusze maturalne</p>
            <p className="mt-1 text-xs text-slate-500">Pełne próby egzaminu z punktacją i raportem.</p>
          </Link>
          <Link href="/ai" className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-sm text-slate-300 transition hover:border-violet-400/30">
            <Target className="mb-3 text-violet-300" size={17} />
            <p className="font-medium text-white">AI Tutor</p>
            <p className="mt-1 text-xs text-slate-500">Wskazówki i analiza toku rozumowania bez podawania wyniku.</p>
          </Link>
        </div>
      </section>
    </main>
  )
}
