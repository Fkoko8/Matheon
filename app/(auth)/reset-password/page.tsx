'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { requestPasswordReset } from '@/lib/auth'
import { useAuth } from '@/hooks/use-auth'

function ResetForm() {
  const router = useRouter()
  const { user, loading, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // Zalogowany uczeń nie potrzebuje recovery — kierujemy go do zmiany hasła.
  useEffect(() => {
    if (!loading && user) router.replace('/update-password')
  }, [loading, user, router])

  async function submit() {
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const result = await requestPasswordReset(email.trim())
      if (result.error) {
        setError(result.error.message)
        return
      }
      setSent(true)
    } catch {
      setError('Nie udało się połączyć z serwerem. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
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
          <h1 className="max-w-md text-4xl font-semibold leading-tight text-white">Odzyskaj dostęp do konta<span className="text-violet-400">.</span></h1>
          <p className="max-w-md text-sm leading-6 text-slate-400">Podaj adres e-mail, a wyślemy Ci link do ustawienia nowego hasła. Twoje postępy — mastery, powtórki i seria dni — pozostaną nietknięte.</p>
        </section>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl backdrop-blur md:p-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Reset hasła</p>
          <h2 className="text-2xl font-semibold text-white">Nie pamiętasz hasła?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Podaj adres e-mail — wyślemy link do ustawienia nowego hasła.</p>

          {!configured && (
            <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100">
              Supabase nie jest jeszcze skonfigurowany, więc odzyskiwanie hasła jest nieaktywne.
            </div>
          )}
          {sent && (
            <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs leading-5 text-emerald-100">
              Jeśli konto istnieje, wysłaliśmy na <b>{email}</b> link do ustawienia nowego hasła. Sprawdź też folder spam.
            </div>
          )}
          {error && <p className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}

          <form onSubmit={(event) => { event.preventDefault(); void submit() }} className="mt-6 flex flex-col gap-4">
            <label className="text-xs text-slate-400">Adres e-mail
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="uczen@example.com" className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60" />
            </label>
            <button type="submit" disabled={busy || !configured} className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Wyślij link
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            <Link href="/login" className="text-violet-300 hover:text-violet-200">Wróć do logowania</Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#08080d] text-sm text-slate-500">Ładowanie…</div>}>
      <ResetForm />
    </Suspense>
  )
}
