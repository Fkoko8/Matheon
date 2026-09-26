'use client'

/**
 * Granica błędu dla całego workspace'u ucznia.
 *
 * Bez tego pliku każdy nieprzechwycony błąd renderowania zabija aplikację do białego
 * ekranu z overlayem Next.js. Tutaj uczeń dostaje zrozumiały komunikat i może ponowić
 * render sekcji bez utraty sesji.
 */
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCw } from 'lucide-react'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[MATHEON] Błąd widoku:', error)
  }, [error])

  return (
    <main className="matheon-enter mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center p-5 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
        <AlertTriangle size={26} />
      </span>
      <h1 className="mt-6 text-2xl font-semibold text-white">Coś poszło nie tak</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
        Ten widok nie mógł się wyrenderować. Twoje postępy są bezpieczne — spróbuj ponownie albo wróć na dashboard.
      </p>
      {error.digest && <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-600">Kod błędu: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400">
          <RotateCw size={15} /> Spróbuj ponownie
        </button>
        <Link href="/" className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.05]">
          Wróć na dashboard
        </Link>
      </div>
    </main>
  )
}
