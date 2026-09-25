import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brak połączenia — MATHEON',
  robots: { index: false, follow: false },
}

/**
 * Offline shell — ekran zapisywany w cache service workera (`public/sw.js`)
 * i pokazywany, gdy nawigacja nie ma połączenia z siecią.
 */
export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#08080d] p-6 text-slate-200">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-base font-bold text-white">M</span>
        <h1 className="mt-5 text-2xl font-semibold text-white">Brak połączenia</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          MATHEON potrzebuje internetu, żeby zapisać Twoje odpowiedzi i postęp powtórek.
          Sprawdź sieć i spróbuj ponownie — otwarta sesja nie zostanie utracona.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-400">Spróbuj ponownie</Link>
          <Link href="/tasks" className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-slate-200 hover:bg-white/[0.05]">Bank zadań</Link>
        </div>
      </div>
    </main>
  )
}
