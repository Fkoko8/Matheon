import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#08080d] p-6 text-center text-slate-200">
      <div className="max-w-md">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Błąd 404</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Nie znaleźliśmy tej strony</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Sprawdź adres lub wróć do dashboardu, aby kontynuować naukę.</p>
        <Link href="/" className="mt-7 inline-flex rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white hover:bg-violet-400">Wróć do dashboardu</Link>
      </div>
    </main>
  )
}
