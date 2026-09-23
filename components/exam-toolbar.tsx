'use client'

/**
 * Narzędzia egzaminacyjne: tablice matematyczne (jak zestaw „Wybrane wzory matematyczne” CKE)
 * oraz prosty kalkulator. Panel nie podpowiada treści zadania — pokazuje tylko to,
 * co na prawdziwej maturze uczeń ma pod ręką.
 */
import { useState } from 'react'
import { Calculator, Delete, Equal, Sigma, X } from 'lucide-react'
import { MathBlock } from '@/components/math-text'
import { formulaSheet } from '@/content/formula-sheet'
import { calculate, formatResult, type AngleMode } from '@/lib/calculator'

const KEYPAD = ['7', '8', '9', '/', 'sqrt(', '4', '5', '6', '*', '(', '1', '2', '3', '-', ')', '0', ',', '%', '+', '^']

export function ExamTools() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'formulas' | 'calculator'>('formulas')
  const [section, setSection] = useState(formulaSheet[0]?.id ?? '')
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [angleMode, setAngleMode] = useState<AngleMode>('deg')
  const [history, setHistory] = useState<string[]>([])

  const press = (value: string) => {
    setError(null)
    setResult(null)
    setExpression((current) => current + value)
  }

  const evaluate = () => {
    try {
      const value = calculate(expression, angleMode)
      const formatted = formatResult(value)
      setResult(formatted)
      setError(null)
      setHistory((current) => [`${expression} = ${formatted}`, ...current].slice(0, 6))
    } catch (cause) {
      setResult(null)
      setError(cause instanceof Error ? cause.message : 'Nie udało się obliczyć.')
    }
  }

  const activeSection = formulaSheet.find((item) => item.id === section) ?? formulaSheet[0]

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => { setTab('formulas'); setOpen(true) }} className="flex items-center gap-2 rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">
          <Sigma size={15} /> Tablice CKE
        </button>
        <button onClick={() => { setTab('calculator'); setOpen(true) }} className="flex items-center gap-2 rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">
          <Calculator size={15} /> Kalkulator
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <button aria-label="Zamknij panel" onClick={() => setOpen(false)} className="flex-1" />
          <aside role="dialog" aria-modal="true" aria-label="Narzędzia egzaminacyjne" className="flex h-full w-full max-w-md flex-col border-l border-white/[0.1] bg-[#0d0d16]">
            <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                {([['formulas', 'Tablice'], ['calculator', 'Kalkulator']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} className={`rounded-lg px-3 py-1.5 text-xs ${tab === id ? 'bg-white/[0.1] text-white' : 'text-slate-500'}`}>{label}</button>
                ))}
              </div>
              <button onClick={() => setOpen(false)} aria-label="Zamknij" className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X size={16} /></button>
            </header>

            {tab === 'formulas' ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex gap-2 overflow-x-auto border-b border-white/[0.08] px-4 py-3">
                  {formulaSheet.map((item) => (
                    <button key={item.id} onClick={() => setSection(item.id)} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${activeSection?.id === item.id ? 'border-violet-400/40 bg-violet-500/15 text-violet-200' : 'border-white/[0.08] text-slate-400 hover:text-white'}`}>
                      {item.title}
                    </button>
                  ))}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <h3 className="text-sm font-semibold text-white">{activeSection?.title}</h3>
                  <div className="mt-4 flex flex-col gap-5">
                    {activeSection?.items.map((item) => (
                      <div key={`${activeSection.id}-${item.label}`}>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">{item.label}</p>
                        <MathBlock latex={item.latex} className="mt-2 overflow-x-auto rounded-xl bg-[#08080d] px-4 py-4 text-center text-sm text-violet-100" />
                      </div>
                    ))}
                  </div>
                </div>
                <p className="border-t border-white/[0.08] px-5 py-3 text-[10px] text-slate-500">Zestaw wzorów w formie tablic maturalnych. Nie zawiera treści ani wyników zadań.</p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
                <div className="rounded-2xl border border-white/[0.08] bg-[#08080d] p-4">
                  <input
                    value={expression}
                    onChange={(event) => { setExpression(event.target.value); setError(null) }}
                    onKeyDown={(event) => { if (event.key === 'Enter') evaluate() }}
                    placeholder="np. 2^5*sqrt(3)"
                    aria-label="Wyrażenie do obliczenia"
                    className="w-full bg-transparent text-right text-lg text-white outline-none placeholder:text-slate-600"
                  />
                  <p className={`mt-2 text-right text-sm ${error ? 'text-rose-300' : 'text-emerald-300'}`}>{error ?? (result ? `= ${result}` : '')}</p>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Funkcje: sqrt, cbrt, abs, ln, log, exp, sin, cos, tan</span>
                  <button onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')} className="rounded-lg border border-white/[0.1] px-2 py-1 text-slate-300">{angleMode === 'deg' ? 'stopnie' : 'radiany'}</button>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {KEYPAD.map((key) => (
                    <button key={key} onClick={() => press(key)} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm text-slate-200 hover:bg-white/[0.08]">{key === 'sqrt(' ? '√' : key === ',' ? ',' : key}</button>
                  ))}
                  <button onClick={() => press('sin(')} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-xs text-slate-200 hover:bg-white/[0.08]">sin</button>
                  <button onClick={() => press('cos(')} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-xs text-slate-200 hover:bg-white/[0.08]">cos</button>
                  <button onClick={() => press('log(')} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-xs text-slate-200 hover:bg-white/[0.08]">log</button>
                  <button onClick={() => press('ln(')} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-xs text-slate-200 hover:bg-white/[0.08]">ln</button>
                  <button onClick={() => setExpression((current) => current.slice(0, -1))} aria-label="Usuń znak" className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-slate-300 hover:bg-white/[0.08]"><Delete size={15} className="mx-auto" /></button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={evaluate} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 py-3 text-sm font-medium text-white hover:bg-violet-400"><Equal size={15} /> Policz</button>
                  <button onClick={() => { setExpression(''); setResult(null); setError(null) }} className="rounded-xl border border-white/[0.1] px-4 text-sm text-slate-300 hover:bg-white/[0.06]">C</button>
                </div>

                {history.length > 0 && (
                  <div className="mt-5 min-h-0 flex-1 overflow-y-auto border-t border-white/[0.08] pt-4">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">Historia</p>
                    <div className="mt-2 flex flex-col gap-1.5 text-sm text-slate-400">
                      {history.map((entry) => <span key={entry} className="truncate">{entry}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
