'use client'

import { useMemo } from 'react'
import katex from 'katex'

type Segment = { type: 'text' | 'inline' | 'block'; value: string }

const MATH_PATTERN = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g

/** Splits a string into plain-text and LaTeX segments ($$...$$ block, $...$ inline). */
export function splitMath(input: string): Segment[] {
  const segments: Segment[] = []
  const pattern = new RegExp(MATH_PATTERN.source, 'g')
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) segments.push({ type: 'text', value: input.slice(lastIndex, match.index) })
    if (match[1] !== undefined) segments.push({ type: 'block', value: match[1] })
    else if (match[2] !== undefined) segments.push({ type: 'inline', value: match[2] })
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < input.length) segments.push({ type: 'text', value: input.slice(lastIndex) })
  return segments.length ? segments : [{ type: 'text', value: input }]
}

/** Renders plain text, keeping paragraph/line breaks from authored content. */
function TextLines({ value }: { value: string }) {
  const lines = value.split('\n')
  return (
    <>
      {lines.map((line, index) => (
        <span key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </>
  )
}

function renderLatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, strict: false, output: 'html' })
  } catch {
    return latex
  }
}

/** Renders a single LaTeX formula in display mode. */
export function MathBlock({ latex, className }: { latex: string; className?: string }) {
  const html = useMemo(() => renderLatex(latex, true), [latex])
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Renders a mixed text + LaTeX string, detecting $...$ and $$...$$ delimiters. */
export function MathText({ children, className }: { children: string; className?: string }) {
  const segments = useMemo(() => splitMath(children), [children])
  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.type === 'text' ? (
          <TextLines key={index} value={segment.value} />
        ) : (
          <span
            key={index}
            className={segment.type === 'block' ? 'my-3 block overflow-x-auto text-center' : 'inline-block max-w-full overflow-x-auto align-middle'}
            dangerouslySetInnerHTML={{ __html: renderLatex(segment.value, segment.type === 'block') }}
          />
        ),
      )}
    </span>
  )
}
