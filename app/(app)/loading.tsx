/**
 * Szkielet ładowania tras workspace'u — łagodzi pierwsze renderowanie
 * widoków klienta (dane i tak dogrywa każdy ekran własnym stanem).
 */
export default function AppLoading() {
  return (
    <main className="matheon-enter mx-auto max-w-7xl p-5 pb-28 lg:p-10" aria-busy="true" aria-label="Ładowanie widoku">
      <div className="h-4 w-40 animate-pulse rounded-full bg-white/[0.07]" />
      <div className="mt-3 h-8 w-72 animate-pulse rounded-full bg-white/[0.09]" />
      <div className="mt-8 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" />
        <div className="h-48 animate-pulse rounded-3xl bg-white/[0.05]" />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </main>
  )
}
