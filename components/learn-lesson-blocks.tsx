'use client'

/**
 * MATHEON — renderer treści lekcji.
 *
 * Każdy typ bloku ma własną, rozpoznawalną formę, więc uczeń od razu widzi, czy czyta
 * teorię, wzór, przykład, ostrzeżenie czy podsumowanie. Bloki dostają identyfikatory
 * (`id`), po których działa spis treści i podświetlanie aktywnej sekcji.
 */
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CircleHelp, Highlighter, Lightbulb, ListChecks, Sigma, Table2, TriangleAlert } from 'lucide-react'
import { Figure } from '@/components/figure'
import { MathBlock, MathText } from '@/components/math-text'
import type { CurriculumBlock } from '@/lib/learning/curriculum'

export const BLOCK_ORDER = ['heading', 'paragraph', 'formula', 'example', 'warning', 'tip', 'diagram', 'table', 'interactive_question', 'summary'] as const

/** Parsuje tabelę w markdownie (| a | b |) i renderuje komórki z LaTeX-em. */
export function MarkdownTable({ body }: { body: string }) {
  const lines = body.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return <p className="text-sm leading-7 text-slate-300"><MathText>{body}</MathText></p>

  const cells = (line: string) =>
    line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())

  const header = cells(lines[0])
  const rows = lines
    .slice(1)
    .filter((line) => !/^\|?[\s:-]*\|[\s:|-]*$/.test(line))
    .map(cells)

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th key={index} className="border-b border-white/[0.12] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <MathText>{cell}</MathText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/[0.06] last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2.5 align-top text-slate-300">
                  <MathText>{cell}</MathText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export interface OutlineEntry {
  id: string
  title: string
  type: CurriculumBlock['type']
}

export function blockId(index: number): string {
  return `blok-${index}`
}

/** Spis treści: nagłówki oraz bloki nazwane (wzór, przykład, podsumowanie, tabela, rysunek). */
export function blockOutline(blocks: CurriculumBlock[]): OutlineEntry[] {
  const outline: OutlineEntry[] = []
  blocks.forEach((block, index) => {
    if (block.type === 'heading' && block.title) outline.push({ id: blockId(index), title: block.title, type: block.type })
    else if (['formula', 'example', 'summary', 'table', 'diagram'].includes(block.type) && block.title) {
      outline.push({ id: blockId(index), title: block.title, type: block.type })
    }
  })
  return outline
}

function SectionShell({
  id,
  tone,
  title,
  label,
  icon,
  children,
}: {
  id: string
  tone: 'violet' | 'amber' | 'blue' | 'emerald' | 'slate'
  title?: string
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const tones = {
    violet: 'border-violet-400/20 bg-violet-500/[0.07]',
    amber: 'border-amber-400/20 bg-amber-400/[0.07]',
    blue: 'border-blue-400/20 bg-blue-400/[0.07]',
    emerald: 'border-emerald-400/20 bg-emerald-400/[0.07]',
    slate: 'border-white/[0.08] bg-white/[0.025]',
  }
  const labels = {
    violet: 'text-violet-300',
    amber: 'text-amber-300',
    blue: 'text-blue-300',
    emerald: 'text-emerald-300',
    slate: 'text-slate-400',
  }
  return (
    <section id={id} className={`scroll-mt-28 rounded-2xl border p-5 md:p-6 ${tones[tone]}`}>
      <p className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${labels[tone]}`}>{icon}{label}</p>
      {title && <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Checkpoint({ body, level, topicSlug, lessonSlug, storageKey }: { body: string; level: string; topicSlug: string; lessonSlug: string; storageKey: string }) {
  const [answer, setAnswer] = useState(() => (typeof window === 'undefined' ? '' : window.localStorage.getItem(storageKey) ?? ''))
  const [saved, setSaved] = useState(false)

  const save = () => {
    try {
      window.localStorage.setItem(storageKey, answer)
    } catch {
      // Brak localStorage (tryb prywatny) nie może blokować nauki.
    }
    setSaved(true)
  }

  return (
    <SectionShell id={storageKey} tone="slate" label="Sprawdź się" icon={<CircleHelp size={13} />}>
      <p className="text-sm leading-7 text-slate-300"><MathText>{body}</MathText></p>
      <p className="mt-3 text-xs leading-6 text-slate-500">
        Sformułowanie odpowiedzi własnymi słowami to najskuteczniejsze ćwiczenie pamięci. Notatka zostaje w tej przeglądarce —
        wynik trafia do mastery tylko przez zadania.
      </p>
      <textarea
        value={answer}
        onChange={(event) => { setAnswer(event.target.value); setSaved(false) }}
        rows={3}
        placeholder="Twoja odpowiedź własnymi słowami…"
        className="mt-3 w-full rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={!answer.trim()} className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/[0.14] disabled:opacity-40">
          Zapisz notatkę
        </button>
        <Link href={`/learn/topic/${topicSlug}/mastery`} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-400">
          Sprawdź się w zadaniach <ArrowRight size={13} />
        </Link>
        {saved && <span className="text-xs text-emerald-300">Zapisano lokalnie.</span>}
      </div>
      <p className="mt-3 text-[11px] text-slate-600">
        Zadania działu: test opanowania {topicSlug} (poziom {level === 'extended' ? 'rozszerzony' : 'podstawowy'}).
      </p>
    </SectionShell>
  )
}

export function LessonBlock({ block, index, topicSlug, lessonSlug, level }: { block: CurriculumBlock; index: number; topicSlug: string; lessonSlug: string; level: string }) {
  const id = blockId(index)

  if (block.type === 'heading') {
    return (
      <h2 id={id} className="scroll-mt-28 pt-3 text-xl font-semibold text-white md:text-2xl">
        <span className="mr-3 inline-block h-5 w-1 rounded-full bg-violet-400 align-middle" />
        {block.title ?? ''}
      </h2>
    )
  }

  if (block.type === 'paragraph') {
    return (
      <section id={id} className="scroll-mt-28">
        {block.title && <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{block.title}</h3>}
        <p className="text-[15px] leading-8 text-slate-300"><MathText>{block.body}</MathText></p>
        {block.figure != null && <Figure spec={block.figure} />}
      </section>
    )
  }

  if (block.type === 'formula') {
    return (
      <SectionShell id={id} tone="violet" title={block.title} label="Wzór" icon={<Sigma size={13} />}>
        {block.body && <p className="text-sm leading-7 text-slate-300"><MathText>{block.body}</MathText></p>}
        {block.formula && <MathBlock latex={block.formula} className="mt-4 overflow-x-auto rounded-xl bg-[#090910] px-5 py-5 text-center text-lg text-violet-200" />}
        {block.figure != null && <Figure spec={block.figure} />}
      </SectionShell>
    )
  }

  if (block.type === 'example') {
    return (
      <SectionShell id={id} tone="violet" title={block.title} label="Przykład" icon={<Lightbulb size={13} />}>
        <p className="text-sm leading-7 text-slate-200"><MathText>{block.body}</MathText></p>
        {block.formula && <MathBlock latex={block.formula} className="mt-4 overflow-x-auto rounded-xl bg-[#090910] px-5 py-4 text-center text-base text-violet-200" />}
        {block.figure != null && <Figure spec={block.figure} />}
      </SectionShell>
    )
  }

  if (block.type === 'warning') {
    return (
      <SectionShell id={id} tone="amber" title={block.title} label="Uważaj" icon={<TriangleAlert size={13} />}>
        <p className="text-sm leading-7 text-amber-50"><MathText>{block.body}</MathText></p>
      </SectionShell>
    )
  }

  if (block.type === 'tip') {
    return (
      <SectionShell id={id} tone="blue" title={block.title} label="Wskazówka maturalna" icon={<Highlighter size={13} />}>
        <p className="text-sm leading-7 text-blue-50"><MathText>{block.body}</MathText></p>
      </SectionShell>
    )
  }

  if (block.type === 'summary') {
    return (
      <SectionShell id={id} tone="emerald" title={block.title} label="Bierz to na maturę" icon={<ListChecks size={13} />}>
        <p className="text-sm leading-7 text-emerald-50"><MathText>{block.body}</MathText></p>
      </SectionShell>
    )
  }

  if (block.type === 'table') {
    return (
      <SectionShell id={id} tone="slate" title={block.title} label="Tabela" icon={<Table2 size={13} />}>
        <MarkdownTable body={block.body} />
      </SectionShell>
    )
  }

  if (block.type === 'diagram') {
    return (
      <section id={id} className="scroll-mt-28">
        {block.figure != null ? <Figure spec={block.figure} /> : null}
        {block.title && <p className="mt-2 text-center text-xs text-slate-500">{block.title}</p>}
        {block.body && <p className="mt-3 text-sm leading-7 text-slate-300"><MathText>{block.body}</MathText></p>}
      </section>
    )
  }

  if (block.type === 'interactive_question') {
    return <Checkpoint body={block.body} level={level} topicSlug={topicSlug} lessonSlug={lessonSlug} storageKey={`matheon:note:${topicSlug}:${lessonSlug}:${index}`} />
  }

  return (
    <section id={id} className="scroll-mt-28">
      {block.title && <h3 className="mb-2 text-sm font-semibold text-white">{block.title}</h3>}
      <p className="text-sm leading-7 text-slate-300"><MathText>{block.body}</MathText></p>
    </section>
  )
}
