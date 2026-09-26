'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, BookOpen, Check, Flame, Loader2, Target } from 'lucide-react'
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from '@/lib/auth'
import { useAuth } from '@/hooks/use-auth'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/'
  const { user, loading, configured } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!loading && user) router.replace(redirect)
  }, [loading, user, redirect, router])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const result = mode === 'signin'
        ? await signInWithPassword(email.trim(), password)
        : await signUpWithPassword(email.trim(), password)
      if (result.error) {
        setError(result.error.message)
        return
      }
      if (mode === 'signup' && !result.data?.session) {
        setNotice('Konto utworzone. Potwierdź adres e-mail, aby się zalogować.')
        return
      }
      router.replace(redirect)
    } catch {
      setError('Nie udało się połączyć z serwerem. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
  }

  async function google() {
    setError('')
    const result = await signInWithGoogle()
    if (result.error) setError(result.error.message)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080d] text-slate-200">
      <div className="absolute -left-40 top-[-10rem] size-[28rem] rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute -right-32 bottom-[-12rem] size-[26rem] rounded-full bg-blue-600/15 blur-3xl" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-10">
        <section className="hidden flex-col gap-8 lg:flex">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-base font-bold text-white shadow-lg shadow-violet-500/30">M</span>
            <span className="text-lg font-semibold tracking-[0.25em] text-white">MATHEON</span>
          </div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight text-white">Twój system nauki do matury z matematyki<span className="text-violet-400">.</span></h1>
          <p className="max-w-md text-sm leading-6 text-slate-400">Poziom podstawowy i rozszerzony w jednym miejscu: teoria, zadania, powtórki, arkusze i AI Tutor, który tłumaczy krok po kroku.</p>
          <ul className="flex flex-col gap-4 text-sm text-slate-300">
            {[[BookOpen, 'Pełny program zgodny z wymaganiami CKE'], [Target, 'Plan nauki dopasowany do daty matury'], [Flame, 'Powtórki, seria dni i widoczny postęp']].map(([Icon, label]) => {
              const I = Icon as typeof BookOpen
              return <li key={label as string} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-white/[0.06] text-violet-300"><I size={16} /></span>{label as string}</li>
            })}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white">M</span>
            <span className="text-sm font-semibold tracking-[0.25em] text-white">MATHEON</span>
          </div>

          <div className="mb-6 flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            {(['signin', 'signup'] as const).map((item) => (
              <button key={item} onClick={() => { setMode(item); setError(''); setNotice('') }} className={`flex-1 rounded-lg px-4 py-2 text-xs font-medium transition ${mode === item ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'}`}>{item === 'signin' ? 'Zaloguj się' : 'Załóż konto'}</button>
            ))}
          </div>

          {!configured && (
            <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100">
              Supabase nie jest jeszcze skonfigurowany, więc logowanie jest nieaktywne. Dodaj zmienne <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> i <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> w Ustawieniach → Environment.
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="text-xs text-slate-400">Adres e-mail
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="uczen@example.com" className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60" />
            </label>
            <label className="text-xs text-slate-400">Hasło
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Minimum 6 znaków" className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60" />
            </label>
            {mode === 'signin' && <Link href="/reset-password" className="-mt-2 text-right text-xs text-slate-500 hover:text-violet-200">Nie pamiętasz hasła?</Link>}
            {error && <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}
            {notice && <p className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-100"><Check size={14} className="mt-0.5 shrink-0" />{notice}</p>}
            <button type="submit" disabled={busy || !configured} className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {mode === 'signin' ? 'Zaloguj się' : 'Utwórz konto'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-600"><span className="h-px flex-1 bg-white/[0.08]" />albo<span className="h-px flex-1 bg-white/[0.08]" /></div>

          <button onClick={() => void google()} disabled={!configured} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50">
            Kontynuuj z Google
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            Nie pamiętasz hasła? <Link href="/reset-password" className="text-violet-300 hover:text-violet-200">Zresetuj je</Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#08080d] text-sm text-slate-500">Ładowanie…</div>}>
      <LoginForm />
    </Suspense>
  )
}
