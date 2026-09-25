'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, BookOpen, CalendarDays, ChevronRight, FileText, Flame, GitBranch, LayoutDashboard, Menu, PencilLine, RefreshCw, Search, Settings, Sparkles, Target, X } from 'lucide-react'
import { navItems } from '@/lib/navigation'
import { ProfileMenu, SearchOverlay } from '@/components/global-experiences'
import { initialsOf, useProfile } from '@/hooks/use-profile'
import { useOnboardingGate } from '@/hooks/use-onboarding'

const iconMap = { LayoutDashboard, BookOpen, PencilLine, FileText, RefreshCw, CalendarDays, Sparkles, GitBranch, BarChart3, Target }

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 px-2">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white shadow-lg shadow-violet-500/20">M</span>
      <span className="text-base font-semibold tracking-[0.2em] text-white">MATHEON</span>
    </Link>
  )
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, user } = useProfile()
  const { checking: onboardingCheck, needsOnboarding } = useOnboardingGate()

  // Pierwszy start: uczeń bez planu nauki przechodzi kreator, zanim zobaczy workspace.
  useEffect(() => {
    if (!onboardingCheck && needsOnboarding) router.replace('/onboarding')
  }, [onboardingCheck, needsOnboarding, router])

  // ⌘K / Ctrl+K otwiera globalne wyszukiwanie z każdego ekranu workspace'u.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  const name = profile?.displayName ?? user?.email?.split('@')[0] ?? 'Uczeń'
  const initials = initialsOf(name)
  const streak = profile?.streak ?? 0
  const activeItem = navItems.find((item) => isActive(pathname, item.href))

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-200">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.07] bg-[#0b0b12] px-4 py-6 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <button onClick={() => setOpen(false)} aria-label="Zamknij menu" className="text-slate-400 lg:hidden"><X size={18} /></button>
        </div>
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard
            const active = isActive(pathname, item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-white/[0.09] text-white shadow-inner' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}>
                <Icon className={active ? 'text-violet-400' : ''} size={18} />{item.label}
                {active && <span className="ml-auto size-1.5 rounded-full bg-violet-400" />}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"><Settings size={18} />Ustawienia</Link>
          <Link href="/profile" className="mt-2 flex items-center gap-3 border-t border-white/[0.07] px-3 pt-5">
            <span className="grid size-9 place-items-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">{initials}</span>
            <span><span className="block text-sm font-medium text-white">{name}</span><span className="text-xs text-slate-500">Poziom {profile?.level ?? 1} · {(profile?.xp ?? 0).toLocaleString('pl-PL')} XP</span></span>
            <ChevronRight className="ml-auto text-slate-600" size={16} />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.07] bg-[#08080d]/85 px-5 py-4 backdrop-blur-xl lg:px-10">
          <button onClick={() => setOpen(true)} aria-label="Otwórz menu" className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] lg:hidden"><Menu size={18} /></button>
          <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <span className="text-slate-300">{activeItem?.label ?? 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} aria-label="Otwórz wyszukiwanie" className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 hover:text-white"><Search size={17} /></button>
            {streak > 0 && <div className="hidden items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-medium text-orange-300 sm:flex"><Flame size={14} />{streak} dni</div>}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} aria-label="Otwórz menu profilu" className="grid size-8 place-items-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">{initials}</button>
              {profileOpen && <ProfileMenu name={name} level={profile?.level ?? 1} xp={profile?.xp ?? 0} initials={initials} close={() => setProfileOpen(false)} />}
            </div>
          </div>
        </header>
        {children}
      </div>

      <nav className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex justify-around rounded-2xl border border-white/[0.1] bg-[#15151e]/95 p-2 shadow-2xl backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard
          const active = isActive(pathname, item.href)
          return (
            <Link key={item.href} href={item.href} aria-label={item.label} className={`rounded-xl p-3 ${active ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:bg-white/[0.07] hover:text-white'}`}><Icon size={18} /></Link>
          )
        })}
      </nav>

      <SearchOverlay open={searchOpen} close={() => setSearchOpen(false)} />
    </div>
  )
}
