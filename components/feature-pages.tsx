'use client'

/**
 * MATHEON — mapa wiedzy.
 *
 * Zamiast dekoracyjnego grafu z wymyślonymi liczbami: realny katalog umiejętności
 * z bazy (`skills`, `question_skills`) w zestawieniu z postępem ucznia (`learning_events`).
 * Pokazuje, które umiejętności są opanowane, które wymagają pracy i kiedy wypada powtórka.
 */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Loader2, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserId, joinSkillStates, loadSkillCatalog, loadSkillStates, loadTopicSkillSlugs, type SkillWithState } from '@/lib/learning/skill-state'
import { WEAK_MASTERY, daysUntilDue, isDue, masteryLabel } from '@/lib/learning/skill-model'

interface TopicRow {
  id: string
  name: string
  slug: string
}

function tone(mastery: number): string {
  if (mastery === 0) return 'bg-slate-500'
  if (mastery < WEAK_MASTERY) return 'bg-rose-400'
  if (mastery < 85) return 'bg-amber-400'
  return 'bg-emerald-400'
}

export function KnowledgeMapPage() {
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState<TopicRow[]>([])
  const [skills, setSkills] = useState<SkillWithState[]>([])
  const [topicSkills, setTopicSkills] = useState<Map<string, string[]>>(new Map())
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const supabase = createClient()
      if (!supabase) { setLoading(false); return }
      const userId = await getCurrentUserId(supabase)
      const [catalog, topicRows, mapping, states] = await Promise.all([
        loadSkillCatalog(supabase),
        supabase.from('topics').select('id,name,slug').order('order_index'),
        loadTopicSkillSlugs(supabase),
        userId ? loadSkillStates(userId, supabase) : Promise.resolve(new Map()),
      ])
      if (!active) return
      setSkills(joinSkillStates(catalog, states))
      setTopics(((topicRows.data ?? []) as Array<Record<string, unknown>>).map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug) })))
      setTopicSkills(mapping)
      setSelected(catalog[0]?.id ?? null)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const skillBySlug = useMemo(() => new Map(skills.map((entry) => [entry.skill.slug, entry])), [skills])
  const selectedEntry = skills.find((entry) => entry.skill.id === selected) ?? null

  const groups = useMemo(() => {
    return topics
      .map((topic) => ({
        topic,
        skills: (topicSkills.get(topic.id) ?? [])
          .map((slug) => skillBySlug.get(slug))
          .filter((entry): entry is SkillWithState => Boolean(entry)),
      }))
      .filter((group) => group.skills.length > 0)
  }, [topics, topicSkills, skillBySlug])

  const practised = skills.filter((entry) => entry.state.attempts > 0)
  const mastered = practised.filter((entry) => entry.state.mastery >= 85)
  const due = practised.filter((entry) => isDue(entry.state))

  if (loading) {
    return <main className="mx-auto flex max-w-7xl items-center gap-3 p-10 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Wczytuję mapę wiedzy…</main>
  }

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Mapa umiejętności</p>
          <h1 className="text-3xl font-semibold text-white">Mapa wiedzy</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Każda maturalna umiejętność z osobna: {practised.length} ćwiczonych, {mastered.length} opanowanych, {due.length} do powtórki.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[['Opanowane', 'bg-emerald-400'], ['W toku', 'bg-amber-400'], ['Wymaga pracy', 'bg-rose-400'], ['Bez danych', 'bg-slate-500']].map(([label, color]) => (
            <span key={label} className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-400">
              <span className={`size-2 rounded-full ${color}`} />{label}
            </span>
          ))}
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c15] p-5 md:p-7">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative flex flex-col gap-7">
            {groups.length === 0 && <p className="text-sm text-slate-400">Brak umiejętności z powiązanymi zadaniami. Zaimportuj treść: <code className="rounded bg-black/40 px-2 py-1 text-xs">pnpm content:import</code>.</p>}
            {groups.map((group) => (
              <section key={group.topic.id}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-white">{group.topic.name}</h2>
                  <span className="text-[11px] text-slate-600">{group.skills.length} umiejętności</span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {group.skills.map((entry) => {
                    const state = entry.state
                    const canPractice = entry.skill.level === 'basic' || entry.skill.level === 'extended'
                    return (
                      <button
                        key={entry.skill.id}
                        onClick={() => setSelected(entry.skill.id)}
                        className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${selected === entry.skill.id ? 'border-violet-300 bg-violet-500/15' : 'border-white/[0.1] bg-[#161622] hover:border-violet-400/30'}`}
                      >
                        <span className="flex items-center gap-2 text-xs font-semibold text-white">
                          <span className={`size-2 rounded-full ${tone(state.mastery)}`} />
                          {entry.skill.name}
                        </span>
                        <span className="mt-2 block text-[11px] text-slate-500">
                          {state.attempts === 0 ? 'brak odpowiedzi' : `${state.mastery}% · ${state.attempts} odp. · ${masteryLabel(state.mastery)}`}
                        </span>
                        {state.attempts > 0 && (
                          <span className="mt-3 block h-1 overflow-hidden rounded-full bg-white/[0.08]">
                            <span className={`block h-full rounded-full ${tone(state.mastery)}`} style={{ width: `${state.mastery}%` }} />
                          </span>
                        )}
                        {canPractice && <span className="mt-3 block text-[10px] text-slate-600">{isDue(state) ? 'powtórka zaległa' : state.attempts ? `powtórka za ${daysUntilDue(state)} dni` : 'do pierwszego treningu'}</span>}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
          {selectedEntry ? (
            <>
              <p className="text-xs text-slate-500">Wybrana umiejętność</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{selectedEntry.skill.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedEntry.skill.level === 'basic' ? 'Matura podstawowa' : 'Matura rozszerzona'} · {selectedEntry.state.attempts === 0 ? 'brak danych' : masteryLabel(selectedEntry.state.mastery)}
              </p>

              {selectedEntry.skill.description && <p className="mt-4 text-xs leading-6 text-slate-400">{selectedEntry.skill.description}</p>}

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">Mastery</span><span className="text-white">{selectedEntry.state.mastery}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${tone(selectedEntry.state.mastery)}`} style={{ width: `${selectedEntry.state.mastery}%` }} /></div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div><dt className="text-slate-500">Odpowiedzi</dt><dd className="mt-1 text-sm text-white">{selectedEntry.state.attempts}</dd></div>
                <div><dt className="text-slate-500">Poprawne</dt><dd className="mt-1 text-sm text-white">{selectedEntry.state.correct}</dd></div>
                <div><dt className="text-slate-500">Interwał SM-2</dt><dd className="mt-1 text-sm text-white">{selectedEntry.state.intervalDays} dni</dd></div>
                <div><dt className="text-slate-500">Łatwość</dt><dd className="mt-1 text-sm text-white">{selectedEntry.state.ease.toFixed(2)}</dd></div>
                <div><dt className="text-slate-500">Wpadki</dt><dd className="mt-1 text-sm text-white">{selectedEntry.state.lapses}</dd></div>
                <div><dt className="text-slate-500">Powtórka</dt><dd className="mt-1 text-sm text-white">{selectedEntry.state.attempts === 0 ? '—' : isDue(selectedEntry.state) ? 'teraz' : `za ${daysUntilDue(selectedEntry.state)} dni`}</dd></div>
              </dl>

              <div className="mt-6 flex flex-col gap-2">
                <Link href="/tasks" className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-violet-400">
                  <Target size={14} /> Trenuj tę umiejętność
                </Link>
                <Link href="/review" className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs text-slate-300 hover:bg-white/[0.05]">
                  Powtórki <ChevronRight size={13} />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Wybierz umiejętność z mapy, żeby zobaczyć szczegóły.</p>
          )}
        </aside>
      </div>

    </main>
  )
}
