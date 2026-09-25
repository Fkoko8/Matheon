'use client'

/**
 * MATHEON — kreator pierwszego startu.
 *
 * Cztery kroki, które zamieniają pusty profil w działający plan nauki:
 * zakres → cel i data matury → rytm tygodnia → start (opcjonalny quiz diagnostyczny).
 * Quiz nie jest osobną atrapą: to zwykła sesja treningowa z banku zadań, której
 * odpowiedzi zasilają mastery, więc plan od pierwszej minuty uwzględnia słabe obszary.
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, GraduationCap, Loader2, Rocket, Target, TriangleAlert } from 'lucide-react'
import { signOut } from '@/lib/auth'
import { PracticeSession, type SessionSummary } from '@/components/practice-session'
import {
  completeOnboarding,
  DAILY_MINUTES_OPTIONS,
  DEFAULT_ONBOARDING,
  normalizeChoices,
  TARGET_SCORE_OPTIONS,
  WEEKDAY_LABELS,
  type OnboardingChoices,
} from '@/lib/learning/onboarding'

const STEPS = ['Zakres', 'Cel i termin', 'Rytm nauki', 'Start'] as const
const DIAGNOSTIC_SIZE = 10

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function defaultExamDate(): string {
  // Domyślnie najbliższy 4 maja — typowy termin matury.
  const now = new Date()
  const candidate = new Date(Date.UTC(now.getUTCFullYear(), 4, 4))
  if (candidate.getTime() < now.getTime()) candidate.setUTCFullYear(now.getUTCFullYear() + 1)
  return toDateInputValue(candidate)
}

function daysToExam(examDate: string | null): number | null {
  if (!examDate) return null
  return Math.ceil((new Date(`${examDate}T00:00:00Z`).getTime() - Date.now()) / 86400000)
}

export function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [choices, setChoices] = useState<OnboardingChoices>({ ...DEFAULT_ONBOARDING, examDate: defaultExamDate() })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [diagnosticSummary, setDiagnosticSummary] = useState<SessionSummary | null>(null)
  const [diagnosticRunning, setDiagnosticRunning] = useState(false)

  const normalized = useMemo(() => normalizeChoices(choices), [choices])
  const remainingDays = daysToExam(normalized.examDate)
  const update = (patch: Partial<OnboardingChoices>) => setChoices((current) => ({ ...current, ...patch }))

  const toggleDay = (day: number) =>
    update({ studyDays: choices.studyDays.includes(day) ? choices.studyDays.filter((value) => value !== day) : [...choices.studyDays, day] })

  const startPlan = async () => {
    setBusy(true)
    setError('')
    const result = await completeOnboarding(normalized)
    setBusy(false)
    if (!result.ok) {
      setError(result.error ?? 'Nie udało się utworzyć planu.')
      return
    }
    router.replace('/plan')
  }

  if (diagnosticRunning) {
    if (!diagnosticSummary) {
      return (
        <PracticeSession
          mode="mixed"
          level={normalized.goal}
          limit={DIAGNOSTIC_SIZE}
          heading="Quiz diagnostyczny"
          description="10 zadań z całego materiału. Wynik ustawia startowy poziom umiejętności i kolejność planu."
          onFinished={setDiagnosticSummary}
        />
      )
    }

    return (
      <main className="matheon-enter mx-auto max-w-3xl p-5 pb-28 lg:p-10">
        <div className="rounded-3xl border border-violet-400/20 bg-violet-500/10 p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Diagnostyka zakończona</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{diagnosticSummary.score}% poprawności</h1>
          <p className="mt-2 text-sm text-violet-100">
            {diagnosticSummary.correct} z {diagnosticSummary.answered} zadań poprawnie. Te odpowiedzi są już wliczone w Twój stan umiejętności.
          </p>
        </div>

        {diagnosticSummary.skillGains.length > 0 && (
          <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <h2 className="text-sm font-semibold text-white">Startowy poziom umiejętności</h2>
            <div className="mt-4 flex flex-col gap-3">
              {diagnosticSummary.skillGains.slice(0, 8).map((gain) => (
                <div key={gain.slug} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{gain.name}</span>
                  <span className="text-violet-300">{gain.after}% mastery</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />{error}
          </p>
        )}

        <button
          onClick={() => void startPlan()}
          disabled={busy}
          className="mt-6 flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
          Utwórz plan nauki
        </button>
      </main>
    )
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <main className="matheon-enter min-h-screen bg-[#08080d] px-5 py-10 text-slate-200 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white shadow-lg shadow-violet-500/30">M</span>
          <span className="text-sm font-semibold tracking-[0.25em] text-white">MATHEON</span>
          <button onClick={() => void signOut().then(() => router.replace('/login'))} className="ml-auto text-xs text-slate-500 hover:text-white">Wyloguj się</button>
        </header>

        <div className="mt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Konfiguracja startowa</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Dopasujmy naukę do Ciebie</h1>
          <p className="mt-2 text-sm text-slate-400">Krok {step + 1} z {STEPS.length}: {STEPS[step]}. Wszystko możesz później zmienić w ustawieniach.</p>
        </div>

        <div className="mt-6 flex gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full ${index <= step ? 'bg-violet-400' : 'bg-white/[0.08]'}`} />
              <span className={`mt-2 block text-[10px] uppercase tracking-wider ${index <= step ? 'text-violet-300' : 'text-slate-600'}`}>{label}</span>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <StepIntro icon={<GraduationCap size={18} />} title="Do jakiej matury się przygotowujesz?" hint="Plan i dobór zadań zależą od poziomu." />
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ['basic', 'Podstawa', 'Matura obowiązkowa — materiał podstawy programowej.'],
                  ['extended', 'Rozszerzenie', 'Dodatkowo granice, pochodne, dowody i optymalizacja.'],
                ] as const).map(([value, label, description]) => (
                  <button
                    key={value}
                    onClick={() => update({ goal: value })}
                    className={`rounded-2xl border p-5 text-left transition ${choices.goal === value ? 'border-violet-400/50 bg-violet-500/10' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-white">{label}</span>
                      {choices.goal === value && <Check className="text-violet-300" size={16} />}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <StepIntro icon={<CalendarDays size={18} />} title="Data matury i cel punktowy" hint="Im mniej czasu, tym mocniej plan skupia się na powtórkach i najsłabszych działach." />
              <label className="text-xs text-slate-400">
                Data matury
                <input
                  type="date"
                  value={choices.examDate ?? ''}
                  onChange={(event) => update({ examDate: event.target.value || null })}
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60 sm:w-64"
                />
              </label>
              {remainingDays !== null && remainingDays >= 0 && (
                <p className="text-xs text-slate-500">Do matury zostało <b className="text-slate-300">{remainingDays}</b> dni.</p>
              )}
              {remainingDays !== null && remainingDays < 0 && (
                <p className="flex items-center gap-2 text-xs text-amber-300"><TriangleAlert size={14} /> Ta data już minęła — wybierz przyszły termin.</p>
              )}

              <div>
                <p className="text-xs text-slate-400">Cel punktowy (<Target size={12} className="inline" /> procent)</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TARGET_SCORE_OPTIONS.map((score) => (
                    <button
                      key={score}
                      onClick={() => update({ targetScore: score })}
                      className={`rounded-xl border px-4 py-2.5 text-sm transition ${choices.targetScore === score ? 'border-violet-400/50 bg-violet-500/15 text-white' : 'border-white/[0.08] text-slate-300 hover:border-white/[0.16]'}`}
                    >
                      {score}%
                    </button>
                  ))}
                  <label className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-400">
                    własny
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={choices.targetScore}
                      onChange={(event) => update({ targetScore: Number(event.target.value) || 1 })}
                      className="w-16 bg-transparent text-white outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <StepIntro icon={<Clock3 size={18} />} title="Kiedy i jak długo się uczysz?" hint="Plan rozłoży materiał tylko na wybrane dni i nie przekroczy dziennego limitu." />
              <div>
                <p className="text-xs text-slate-400">Dni nauki</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={choices.studyDays.includes(day.value)}
                      title={day.long}
                      className={`size-12 rounded-xl border text-sm transition ${choices.studyDays.includes(day.value) ? 'border-violet-400/50 bg-violet-500/15 text-white' : 'border-white/[0.08] text-slate-400 hover:border-white/[0.16]'}`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
                {choices.studyDays.length === 0 && <p className="mt-3 text-xs text-amber-300">Wybierz co najmniej jeden dzień.</p>}
              </div>
              <div>
                <p className="text-xs text-slate-400">Dzienny czas nauki</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DAILY_MINUTES_OPTIONS.map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => update({ dailyMinutes: minutes })}
                      className={`rounded-xl border px-4 py-2.5 text-sm transition ${choices.dailyMinutes === minutes ? 'border-violet-400/50 bg-violet-500/15 text-white' : 'border-white/[0.08] text-slate-300 hover:border-white/[0.16]'}`}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <StepIntro icon={<Rocket size={18} />} title="Gotowe do startu" hint="Możesz zacząć od razu albo najpierw sprawdzić swój poziom." />
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Poziom', normalized.goal === 'extended' ? 'Rozszerzenie' : 'Podstawa'],
                  ['Data matury', normalized.examDate ? new Date(`${normalized.examDate}T00:00:00Z`).toLocaleDateString('pl-PL') : 'Nie podano'],
                  ['Cel punktowy', `${normalized.targetScore}%`],
                  ['Dni nauki', normalized.studyDays.map((day) => WEEKDAY_LABELS[day - 1].short).join(', ')],
                  ['Czas dziennie', `${normalized.dailyMinutes} min`],
                  ['Długość sesji', `${Math.min(45, Math.max(15, Math.round(normalized.dailyMinutes / 2)))} min`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <dt className="text-[10px] uppercase tracking-wider text-slate-500">{label}</dt>
                    <dd className="mt-1.5 text-sm text-white">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => void startPlan()}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  Utwórz plan nauki
                </button>
                <button
                  onClick={() => setDiagnosticRunning(true)}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-5 py-3 text-sm text-slate-200 transition hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <Target size={16} /> Najpierw quiz diagnostyczny ({DIAGNOSTIC_SIZE} zadań)
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-6 flex items-start gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />{error}
            </p>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:text-white disabled:opacity-30"
          >
            <ArrowLeft size={15} /> Wstecz
          </button>
          {!isLastStep && (
            <button
              onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
              disabled={step === 2 && choices.studyDays.length === 0}
              className="flex items-center gap-2 rounded-xl bg-white/[0.07] px-5 py-2.5 text-sm text-white transition hover:bg-white/[0.12] disabled:opacity-40"
            >
              Dalej <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

function StepIntro({ icon, title, hint }: { icon: React.ReactNode; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300">{icon}</span>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
      </div>
    </div>
  )
}
