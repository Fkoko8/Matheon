'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Award, BarChart3, BookOpen, Check, Command, FileText, Flame, Loader2, Lock, LogOut, PencilLine, Search, Settings2, Shield, Sparkles, Target, Trophy, UserRound, X } from 'lucide-react'
import { signOut, updatePassword } from '@/lib/auth'
import { initialsOf, useProfile } from '@/hooks/use-profile'
import { loadSearchHits, matchHits, SEARCH_KIND_LABEL, type SearchHit, type SearchHitKind } from '@/lib/search'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserId } from '@/lib/learning/skill-state'
import { loadAchievementCatalog, loadAchievementStats, loadEarnedAchievements, syncAchievements, type AchievementRow, type EarnedAchievement } from '@/lib/learning/achievements'
import { getRecentSessions, getTotalStudyTime } from '@/lib/learning/sessions'
import { loadPracticeOverview } from '@/lib/learning/practice'

const KIND_ICON: Record<SearchHitKind, typeof BookOpen> = { topic: Target, lesson: BookOpen, task: PencilLine, exam: FileText }

/** Szybkie zapytania startowe — wszystkie wskazują realne działy z programu. */
const QUICK_QUERIES = ['Logarytmy', 'Pochodne', 'Geometria analityczna']

export function SearchOverlay({ open, close }: { open: boolean; close: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [loading, setLoading] = useState(false)

  // Indeks pobieramy raz, przy pierwszym otwarciu — dalej wyszukiwanie działa lokalnie.
  useEffect(() => {
    if (!open || hits !== null) return
    let mounted = true
    setLoading(true)
    void loadSearchHits().then((result) => {
      if (!mounted) return
      setHits(result)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [open, hits])

  const results = useMemo(() => matchHits(hits ?? [], query), [hits, query])
  if (!open) return null

  const go = (href: string) => { close(); setQuery(''); router.push(href) }
  const move = (delta: number) => setActive((value) => Math.min(Math.max(value + delta, 0), Math.max(results.length - 1, 0)))

  return <div className="fixed inset-0 z-50 bg-black/70 p-0 backdrop-blur-sm sm:grid sm:place-items-start sm:p-16" role="dialog" aria-modal="true" aria-label="Wyszukiwanie">
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#11111a] sm:mx-auto sm:h-auto sm:max-h-[690px] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-white/[0.1] sm:shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4"><Search className="text-violet-300" size={20} /><input autoFocus value={query} onChange={(e) => { setQuery(e.target.value); setActive(0) }} onKeyDown={(e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }; if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }; if (e.key === 'Enter' && results[active]) go(results[active].href) }} placeholder="Szukaj działu, lekcji, zadania lub arkusza…" className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-600" /><kbd className="hidden rounded-md border border-white/[0.1] px-2 py-1 text-[10px] text-slate-500 sm:block">ESC</kbd><button onClick={close} aria-label="Zamknij wyszukiwanie" className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X size={18} /></button></div>
      <div className="overflow-auto p-3">
        {!query && <><p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Zacznij od</p><div className="mb-5 flex flex-wrap gap-2 px-3">{QUICK_QUERIES.map((x) => <button key={x} onClick={() => setQuery(x)} className="rounded-full border border-white/[0.08] px-3 py-2 text-xs text-slate-400 hover:border-violet-400/30 hover:text-white">{x}</button>)}</div>{hits && <p className="px-3 pb-3 text-[11px] text-slate-600">W indeksie: {hits.length} pozycji (program, bank zadań, arkusze).</p>}</>}
        {loading && !hits && <div className="flex items-center gap-3 px-3 py-14 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Buduję indeks wyszukiwania…</div>}
        {hits && query && (results.length ? <><p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{results.length} wyników</p><div className="flex flex-col gap-1">{results.map((item, index) => { const Icon = KIND_ICON[item.kind]; return <button key={item.id} onClick={() => go(item.href)} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left ${index === active ? 'bg-violet-500/15' : 'hover:bg-white/[0.05]'}`}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-violet-300"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{item.title}</span><span className="block truncate text-xs text-slate-500">{SEARCH_KIND_LABEL[item.kind]} · {item.subtitle}</span></span>{index === active && <kbd className="hidden rounded border border-white/[0.1] px-2 py-1 text-[10px] text-slate-500 sm:block">↵</kbd>}</button> })}</div></> : <div className="px-3 py-14 text-center"><Search className="mx-auto text-slate-600" size={28} /><p className="mt-4 text-sm font-medium text-white">Nic nie znaleziono</p><p className="mt-1 text-xs text-slate-500">Spróbuj innego działu, lekcji lub fragmentu treści zadania.</p></div>)}
      </div>
      <div className="hidden items-center gap-4 border-t border-white/[0.08] px-5 py-3 text-[10px] text-slate-600 sm:flex"><span>↑↓ Nawiguj</span><span>↵ Otwórz</span><span>ESC Zamknij</span><span className="ml-auto flex items-center gap-1"><Command size={12} /> K</span></div>
    </div>
  </div>
}

export function ProfileMenu({ name, level, xp, initials, close }: { name: string; level: number; xp: number; initials: string; close: () => void }) { const router = useRouter(); const [busy, setBusy] = useState(false); const logout = async () => { setBusy(true); await signOut(); close(); router.replace('/login') }; return <div className="absolute right-0 top-11 z-40 w-64 rounded-2xl border border-white/[0.1] bg-[#15151e] p-2 shadow-2xl"><div className="flex items-center gap-3 border-b border-white/[0.08] px-3 py-3"><span className="grid size-10 place-items-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200">{initials}</span><span><b className="block text-sm text-white">{name}</b><span className="text-xs text-slate-500">Poziom {level} · {xp.toLocaleString('pl-PL')} XP</span></span></div><div className="flex flex-col gap-1 py-2">{[['Profil','/profile',UserRound],['Statystyki','/stats',BarChart3],['Plan nauki','/plan',Target],['Ustawienia','/settings',Settings2]].map(([label, href, Icon]) => { const I = Icon as typeof UserRound; return <Link key={label as string} href={href as string} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white"><I size={16} />{label as string}</Link> })}</div><button onClick={() => void logout()} disabled={busy} className="flex w-full items-center gap-3 border-t border-white/[0.08] px-3 py-3 text-sm text-slate-500 hover:text-white disabled:opacity-50"><LogOut size={16} />{busy ? 'Wylogowywanie…' : 'Wyloguj się'}</button></div> }

/* ------------------------------------------------------------------ *
 * Profil — wyłącznie realne dane ucznia
 * ------------------------------------------------------------------ */

interface ProfileData {
  mastery: number
  practisedSkills: number
  totalSkills: number
  answers: number
  correct: number
  studyHours: number
  weakSkills: string[]
  strongSkills: string[]
  recentActivity: Array<{ id: string; label: string; detail: string }>
  achievements: Array<AchievementRow & { earnedAt: string | null }>
  newAchievements: number
}

const EMPTY_PROFILE_DATA: ProfileData = {
  mastery: 0,
  practisedSkills: 0,
  totalSkills: 0,
  answers: 0,
  correct: 0,
  studyHours: 0,
  weakSkills: [],
  strongSkills: [],
  recentActivity: [],
  achievements: [],
  newAchievements: 0,
}

function relativeDays(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return 'dziś'
  if (days === 1) return 'wczoraj'
  if (days < 30) return `${days} dni temu`
  const months = Math.floor(days / 30)
  return months === 1 ? 'miesiąc temu' : `${months} mies. temu`
}

const ACHIEVEMENT_ICON: Record<string, typeof Award> = { target: Award, flame: Flame, trophy: Trophy, sparkles: Sparkles, shield: Shield }
function achievementIcon(icon: string | null): typeof Award {
  return ACHIEVEMENT_ICON[icon ?? ''] ?? Award
}

export function ProfilePage() {
  const [tab, setTab] = useState<'overview' | 'achievements'>('overview')
  const { profile } = useProfile()
  const [data, setData] = useState<ProfileData>(EMPTY_PROFILE_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      const supabase = createClient()
      const userId = await getCurrentUserId(supabase)
      if (!supabase || !userId) { setLoading(false); return }

      const [catalog, earned, stats, sessions, overview, history] = await Promise.all([
        loadAchievementCatalog(supabase),
        loadEarnedAchievements(userId, supabase),
        loadAchievementStats(userId, supabase, profile?.streak ?? 0),
        getRecentSessions(userId, 8, supabase),
        loadPracticeOverview(userId, supabase),
        supabase.from('learning_events').select('event_type,question_id,lesson_id,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(6),
      ])

      // Identyfikatory do podpisów aktywności — pytania i lekcje z realnych zdarzeń.
      const questionIds = [...new Set((history.data ?? []).map((row) => row.question_id).filter(Boolean))] as string[]
      const lessonIds = [...new Set((history.data ?? []).map((row) => row.lesson_id).filter(Boolean))] as string[]
      const [questions, lessons] = await Promise.all([
        questionIds.length ? supabase.from('questions').select('id,prompt').in('id', questionIds) : Promise.resolve({ data: [] } as const),
        lessonIds.length ? supabase.from('lessons').select('id,title').in('id', lessonIds) : Promise.resolve({ data: [] } as const),
      ])
      const questionById = new Map((questions.data ?? []).map((row) => [String(row.id), String(row.prompt).slice(0, 60)]))
      const lessonById = new Map((lessons.data ?? []).map((row) => [String(row.id), String(row.title)]))

      // Zapisuje osiągnięcia zdobyte poza ekranem profilu (np. po sesji treningu).
      const sync = await syncAchievements(userId, supabase, stats)

      const activity = (history.data ?? []).map((row, index) => {
        const kind = String(row.event_type)
        const id = `${kind}-${index}`
        if (kind === 'answer') {
          const prompt = row.question_id ? questionById.get(String(row.question_id)) : undefined
          return { id, label: 'Rozwiązano zadanie', detail: prompt ?? 'Trening umiejętności' }
        }
        if (kind === 'lesson_opened') {
          return { id, label: 'Otwarto lekcję', detail: row.lesson_id ? lessonById.get(String(row.lesson_id)) ?? 'Lekcja' : 'Lekcja' }
        }
        return { id, label: 'Aktywność nauki', detail: kind }
      })

      if (!active) return
      setData({
        mastery: overview.mastery,
        practisedSkills: overview.practisedSkills,
        totalSkills: overview.totalSkills,
        answers: stats.answers,
        correct: stats.correct,
        studyHours: await getTotalStudyTime(userId, supabase),
        weakSkills: [],
        strongSkills: [],
        recentActivity: activity,
        achievements: catalog.map((item) => ({ ...item, earnedAt: earned.get(item.id)?.earnedAt ?? null })),
        newAchievements: sync.newlyEarned.length,
      })
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [profile?.streak])

  const name = profile?.displayName ?? 'Uczeń'
  const initials = initialsOf(name)
  const level = profile?.level ?? 1
  const xp = profile?.xp ?? 0
  const streak = profile?.streak ?? 0
  const accuracy = data.answers ? Math.round((data.correct / data.answers) * 100) : 0

  if (loading) {
    return (
      <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
        <div className="flex items-center gap-3 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Wczytuję Twój profil…</div>
      </main>
    )
  }

  const sortedAchievements = [...data.achievements].sort((a, b) => (a.earnedAt ? 0 : 1) - (b.earnedAt ? 0 : 1))

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-blue-500/10 p-6 md:flex-row md:items-center md:p-8">
        <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-violet-500/25 text-2xl font-semibold text-violet-100">{initials}</span>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Twój profil</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{name}</h1>
          <p className="mt-1 text-sm text-slate-400">{profile?.preferredLevel === 'extended' ? 'Zakres rozszerzony' : 'Zakres podstawowy'} · poziom {level}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:flex sm:gap-8">
          <div><span className="block text-xs text-slate-500">Seria</span><b className="text-white">{streak} dni</b></div>
          <div><span className="block text-xs text-slate-500">XP</span><b className="text-white">{xp.toLocaleString('pl-PL')}</b></div>
          <div><span className="block text-xs text-slate-500">Mastery</span><b className="text-white">{data.mastery}%</b></div>
        </div>
      </div>

      {data.newAchievements > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <Trophy size={17} className="shrink-0 text-emerald-300" />
          Zdobyto nowe osiągnięcia: <b>{data.newAchievements}</b>. Sprawdź zakładkę „Osiągnięcia”.
        </div>
      )}

      <div className="mb-6 flex gap-2 border-b border-white/[0.08] pb-2">
        <button onClick={() => setTab('overview')} className={`rounded-lg px-4 py-2 text-sm ${tab === 'overview' ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Przegląd</button>
        <button onClick={() => setTab('achievements')} className={`rounded-lg px-4 py-2 text-sm ${tab === 'achievements' ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Osiągnięcia</button>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Mastery', `${data.mastery}%`, `${data.practisedSkills} z ${data.totalSkills} umiejętności`],
              ['Zadania', String(data.answers), `${data.correct} poprawnych`],
              ['Skuteczność', `${accuracy}%`, 'z wszystkich odpowiedzi'],
              ['Czas nauki', `${data.studyHours} h`, 'łącznie w sesjach'],
            ].map(([label, value, detail]) => (
              <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-[11px] text-slate-600">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <h2 className="font-semibold text-white">Najbliższe powtórki</h2>
              <p className="mt-1 text-xs text-slate-500">Harmonogram SM-2 — pełna lista w zakładce „Powtórki”.</p>
              <div className="mt-5 flex flex-col gap-3">
                {data.recentActivity.length === 0 && <p className="text-sm text-slate-500">Rozwiąż pierwsze zadania, aby zobaczyć aktywność.</p>}
                {data.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-300"><Check size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-slate-300">{item.label}</p>
                      <p className="truncate text-xs text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <h2 className="font-semibold text-white">Twoja droga do matury</h2>
              <div className="mt-5 flex flex-col gap-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">Opanowanie umiejętności</span><b className="text-white">{data.practisedSkills}/{data.totalSkills}</b></div>
                  <div className="h-2 rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-violet-400" style={{ width: `${Math.min(100, data.totalSkills ? (data.practisedSkills / data.totalSkills) * 100 : 0)}%` }} /></div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">Skuteczność odpowiedzi</span><b className="text-white">{accuracy}%</b></div>
                  <div className="h-2 rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-blue-400" style={{ width: `${accuracy}%` }} /></div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div><p className="mb-2 text-slate-500">Seria dni</p><p className="flex items-center gap-2 leading-6 text-orange-300"><Flame size={14} /> {streak} dni z rzędu</p></div>
                <div><p className="mb-2 text-slate-500">Zdobyte odznaki</p><p className="flex items-center gap-2 leading-6 text-emerald-300"><Trophy size={14} /> {data.achievements.filter((item) => item.earnedAt).length} z {data.achievements.length}</p></div>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAchievements.map((item) => {
            const Icon = achievementIcon(item.icon)
            return (
              <div key={item.id} className={`rounded-2xl border p-6 ${item.earnedAt ? 'border-violet-400/20 bg-violet-500/10' : 'border-white/[0.07] bg-white/[0.02] opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.08] text-violet-300">{item.earnedAt ? <Icon size={22} /> : <Lock size={20} />}</span>
                  {item.earnedAt && <Check className="text-emerald-300" size={16} />}
                </div>
                <h3 className="mt-5 font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-xs text-slate-500">{item.description}</p>
                <p className="mt-5 text-[10px] uppercase tracking-wider text-slate-600">
                  {item.earnedAt ? `Zdobyto ${relativeDays(item.earnedAt)} · +${item.xpReward} XP` : `Cel: ${item.conditionValue} (${item.conditionType})`}
                </p>
              </div>
            )
          })}
          {!sortedAchievements.length && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 text-sm text-slate-400">
              Katalog osiągnięć jest pusty — pojawi się po wgraniu seeda na produkcji.
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/stats" className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-white hover:bg-white/[0.05]">Statystyki</Link>
        <Link href="/plan" className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-white hover:bg-white/[0.05]">Plan nauki</Link>
        <Link href="/settings" className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">Ustawienia</Link>
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------ *
 * Ustawienia — realne zapisy do profilu, bez udawanych akcji
 * ------------------------------------------------------------------ */

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 border-b border-white/[0.07] py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">{description}</p></div>{children}</div>
}

export function SettingsPage() {
  const { profile } = useProfile()
  const [displayName, setDisplayName] = useState('')
  const [preferredLevel, setPreferredLevel] = useState<'basic' | 'extended'>('basic')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setPreferredLevel(profile.preferredLevel)
    }
  }, [profile])

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    if (busy || !profile) return
    setBusy(true)
    setError('')
    const supabase = createClient()
    if (!supabase) { setError('Brak połączenia z bazą.'); setBusy(false); return }
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() || 'Uczeń', preferred_level: preferredLevel })
      .eq('id', profile.id)
    setBusy(false)
    if (updateError) { setError(updateError.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault()
    if (passwordBusy) return
    setPasswordError('')
    if (password.length < 6) { setPasswordError('Hasło musi mieć co najmniej 6 znaków.'); return }
    setPasswordBusy(true)
    try {
      const result = await updatePassword(password)
      if (result.error) { setPasswordError(result.error.message); return }
      setPasswordSaved(true)
      setPassword('')
      setTimeout(() => setPasswordSaved(false), 2500)
    } catch {
      setPasswordError('Nie udało się połączyć z serwerem. Spróbuj ponownie.')
    } finally {
      setPasswordBusy(false)
    }
  }

  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10">
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Preferencje</p>
        <h1 className="text-3xl font-semibold text-white">Ustawienia</h1>
        <p className="mt-2 text-sm text-slate-400">Dostosuj MATHEON do swojego sposobu nauki.</p>
      </div>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7">
          <h2 className="text-lg font-semibold text-white">Konto</h2>
          <form onSubmit={saveProfile}>
            <SettingRow title="Nazwa wyświetlana" description="Tak będziemy się do Ciebie zwracać w całej aplikacji.">
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-xl border border-white/[0.1] bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/50 sm:w-64" />
            </SettingRow>
            <SettingRow title="Zakres matury" description="Określa, które treści i zadania traktujemy jako priorytet.">
              <div className="flex rounded-xl border border-white/[0.1] bg-black/20 p-1">
                {(['basic', 'extended'] as const).map((item) => (
                  <button key={item} type="button" onClick={() => setPreferredLevel(item)} className={`rounded-lg px-4 py-2 text-xs ${preferredLevel === item ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {item === 'basic' ? 'Podstawowy' : 'Rozszerzony'}
                  </button>
                ))}
              </div>
            </SettingRow>
            {error && <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}
            <div className="mt-5 flex items-center gap-3">
              <button type="submit" disabled={busy || !profile} className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50">{busy ? 'Zapisywanie…' : 'Zapisz zmiany'}</button>
              {saved && <span className="flex items-center gap-1.5 text-xs text-emerald-300"><Check size={14} /> Zapisano</span>}
            </div>
          </form>

          <div className="mt-8 border-t border-white/[0.08] pt-8">
            <h2 className="text-lg font-semibold text-white">Hasło</h2>
            <p className="mt-1 text-xs text-slate-500">Zmień hasło do logowania. Nie musisz podawać starego — sesja jest aktywna.</p>
            <form onSubmit={savePassword} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Nowe hasło (min. 6 znaków)" minLength={6} required className="w-full rounded-xl border border-white/[0.1] bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/50 sm:w-64" />
              <button type="submit" disabled={passwordBusy} className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-white hover:bg-white/[0.05] disabled:opacity-50">{passwordBusy ? 'Zapisywanie…' : 'Zmień hasło'}</button>
            </form>
            {passwordSaved && <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300"><Check size={14} /> Hasło zostało zmienione.</p>}
            {passwordError && <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{passwordError}</p>}
          </div>

          <div className="mt-8 border-t border-white/[0.08] pt-8">
            <h2 className="text-lg font-semibold text-white">Sesja</h2>
            <p className="mt-1 text-xs text-slate-500">Wylogowanie działa na wszystkich urządzeniach w tej przeglądarce.</p>
            <div className="mt-4">
              <LogoutButtonInline />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function LogoutButtonInline() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <button
      onClick={async () => { setBusy(true); await signOut(); router.replace('/login') }}
      disabled={busy}
      className="flex items-center gap-2 rounded-xl border border-rose-400/20 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
    >
      <LogOut size={15} /> {busy ? 'Wylogowywanie…' : 'Wyloguj się'}
    </button>
  )
}

