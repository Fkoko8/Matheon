'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { updatePassword } from '@/lib/auth'
import { useAuth } from '@/hooks/use-auth'

/**
 * Ustawianie nowego hasła.
 *
 * Dwie ścieżki wejścia:
 *  - link z e-maila recovery (`/auth/callback?next=/update-password`),
 *  - ręczne wejście z ustawień (wtedy wymagana aktualna sesja — jest, bo trasa jest chroniona proxy).
 */
export default function UpdatePasswordPage() {
  const router = useRouter()
  const { user, loading, configured } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Bez sesji (np. wygasły link recovery) — wracamy do logowania.
  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=%2Fupdate-password')
  }, [loading, user, router])

  const mismatch = confirm.length > 0 && password !== confirm

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setError('')
    if (password.length < 6) { setError('Nowe hasło musi mieć co najmniej 6 znaków.'); return }
    if (password !== confirm) { setError('Hasła nie są identyczne.'); return }
    setBusy(true)
    try {
      const result = await updatePassword(password)
      if (result.error) {
        setError(result.error.message)
        return
      }
      setSaved(true)
      setTimeout(() => router.replace('/'), 1500)
    } catch {
      setError('Nie udało się połączyć z serwerem. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#08080d] px-6 text-slate-200">
      <div className="absolute -left-40 top-[-10rem] size-[28rem] rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute -right-32 bottom-[-12rem] size-[26rem] rounded-full bg-blue-600/15 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl backdrop-blur md:p-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Nowe hasło</p>
        <h1 className="text-2xl font-semibold text-white">Ustaw nowe hasło</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Wybierz nowe hasło do swojego konta MATHEON.</p>

        {saved ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            <Check size={16} className="shrink-0" /> Hasło zostało zmienione. Przenosimy Cię do aplikacji…
          </div>
        ) : (
          <>
            {!configured && (
              <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100">
                Supabase nie jest jeszcze skonfigurowany, więc zmiana hasła jest nieaktywna.
              </div>
            )}
            {error && <p className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}
            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <label className="text-xs text-slate-400">Nowe hasło
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Minimum 6 znaków" className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60" />
              </label>
              <label className="text-xs text-slate-400">Powtórz nowe hasło
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={`mt-2 w-full rounded-xl border bg-black/25 px-4 py-3 text-sm text-white outline-none ${mismatch ? 'border-rose-400/50' : 'border-white/[0.1] focus:border-violet-400/60'}`} />
              </label>
              {mismatch && <p className="text-xs text-rose-300">Hasła nie są identyczne.</p>}
              <button type="submit" disabled={busy || !configured || mismatch} className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50">
                {busy && <Loader2 size={16} className="animate-spin" />}
                Zapisz nowe hasło
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-violet-300 hover:text-violet-200">Wróć do aplikacji</Link>
        </p>
      </section>
    </main>
  )
}
