'use client'

/**
 * MATHEON — AI Tutor.
 *
 * Dwie ważne zasady tego ekranu:
 * - tożsamość i poziom ucznia pochodzą z profilu w bazie (wcześniej wpisane na sztywno),
 * - tutor można otworzyć z konkretnym zadaniem (sesja treningowa, raport egzaminu):
 *   wtedy widzi treść, odpowiedź ucznia i matrycę punktów, a pierwsza wiadomość
 *   startuje automatycznie — jedno kliknięcie zamiast przepisywania zadania.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bot, RefreshCw, Send, ThumbsDown, ThumbsUp } from 'lucide-react'
import { generateTutorResponse, sendTutorFeedback } from '@/lib/ai/aiService'
import { MathText } from '@/components/math-text'
import { useProfile } from '@/hooks/use-profile'
import { defaultTaskPrompt, taskContextToPrompt, type TutorTaskContext } from '@/lib/ai/task-context'
import type { TutorContext } from '@/lib/ai/tutor-prompt'

type Message = { id?: string; role: 'user' | 'assistant'; content: string; helpful?: boolean }

export function AITutorPage({ task, initialPrompt }: { task?: TutorTaskContext; initialPrompt?: string }) {
  const { profile } = useProfile()
  const [messages, setMessages] = useState<Message[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const abortRef = useRef<AbortController | null>(null)
  const autoSentRef = useRef(false)

  const userLevel = profile?.preferredLevel === 'extended' ? 'rozszerzony' : 'podstawowy'
  const context = useMemo<TutorContext>(() => ({ userLevel, ...taskContextToPrompt(task ?? {}) }), [userLevel, task])

  useEffect(() => {
    let active = true
    fetch('/api/ai/conversations')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active) return
        if (data?.messages?.length) {
          setConversationId(data.conversation.id)
          setMessages(
            data.messages.map((message: { id: string; role: 'user' | 'assistant'; content: string; helpful?: boolean }) => ({
              id: message.id,
              role: message.role,
              content: message.content,
              helpful: message.helpful,
            })),
          )
        }
      })
      .catch(() => undefined)
      .finally(() => { if (active) setHistoryLoaded(true) })
    return () => {
      active = false
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!historyLoaded || messages.length) return
    const name = profile?.displayName ? `, ${profile.displayName}` : ''
    setMessages([{
      role: 'assistant',
      content: task?.question
        ? `Cześć${name}. Widzę Twoje zadanie i odpowiedź — przeanalizuję tok rozumowania i wskażę, gdzie warto się zatrzymać.`
        : `Cześć${name}. Pomogę Ci zrozumieć problem, ale nie podam rozwiązania od razu. Nad czym dziś pracujesz?`,
    }])
  }, [historyLoaded, messages.length, profile?.displayName, task?.question])

  const send = useCallback(
    async (value = text) => {
      const content = value.trim()
      if (!content || loading) return
      const userMessage: Message = { role: 'user', content }
      const next = [...messages, userMessage]
      setMessages([...next, { role: 'assistant', content: '' }])
      setText('')
      setLoading(true)
      setError(false)

      const controller = new AbortController()
      abortRef.current = controller
      try {
        const response = await generateTutorResponse({
          messages: next.filter((message) => message.role !== 'assistant' || message.content).map(({ role, content: body }) => ({ role, content: body })),
          context,
          conversationId,
        })
        const headerId = response.headers.get('x-conversation-id')
        if (headerId) setConversationId(headerId)
        if (!response.body) throw new Error('EMPTY_STREAM')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let answer = ''
        while (true) {
          const { done, value: chunk } = await reader.read()
          if (done) break
          answer += decoder.decode(chunk, { stream: true })
          setMessages((current) => [...current.slice(0, -1), { role: 'assistant', content: answer }])
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(true)
          setMessages((current) => current.slice(0, -1))
        }
      } finally {
        setLoading(false)
        abortRef.current = null
      }
    },
    [context, conversationId, loading, messages, text],
  )

  useEffect(() => {
    if (!historyLoaded || autoSentRef.current || !initialPrompt) return
    autoSentRef.current = true
    void send(initialPrompt)
    // Startujemy raz, po wczytaniu historii i profilu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoaded, initialPrompt])

  const suggestions = task?.question
    ? ['Wyjaśnij pierwszy krok', 'Gdzie jest błąd w moim rozumowaniu?', 'Daj mi podobne zadanie']
    : ['Wyjaśnij mi pochodną', 'Daj mi małą wskazówkę', 'Daj mi podobne zadanie']

  return (
    <main className="matheon-enter mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl flex-col p-5 pb-28 lg:p-10">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Twój osobisty nauczyciel</p>
        <h1 className="text-3xl font-semibold text-white">AI Tutor</h1>
        <p className="mt-2 text-sm text-slate-400">
          Poziom {userLevel} · pytaj, rozumiej i rozwiązuj krok po kroku.
        </p>
      </div>

      {task?.question && (
        <section className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200">
            Kontekst zadania{task.source ? ` · ${task.source}` : ''}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-100"><MathText>{task.question}</MathText></p>
          {task.answer && <p className="mt-3 text-xs text-slate-400">Twoja odpowiedź: <span className="text-slate-200">{task.answer}</span></p>}
          {task.rubric && <p className="mt-2 text-xs text-slate-400">Matryca punktów: <span className="text-slate-200">{task.rubric}</span></p>}
          {task.skills && <p className="mt-2 text-xs text-slate-500">Umiejętności: {task.skills}</p>}
        </section>
      )}

      <div className="mt-6 flex flex-1 flex-col rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 md:p-7">
        <div className="flex items-center gap-3 border-b border-white/[0.07] pb-5">
          <span className="grid size-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Bot size={20} /></span>
          <div>
            <p className="text-sm font-medium text-white">MATHEON Tutor</p>
            <p className="text-xs text-emerald-300">Online · odpowiada po polsku, bez podawania gotowego wyniku</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 py-6">
          {messages.map((message, index) => (
            <div key={message.id ?? index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-violet-500 text-white' : 'bg-white/[0.06] text-slate-200'}`}>
                <div className="whitespace-pre-wrap"><MathText>{message.content || (loading ? 'Myślę…' : '')}</MathText></div>
                {message.role === 'assistant' && message.content && index > 0 && (
                  <div className="mt-3 flex gap-2 border-t border-white/[0.08] pt-2">
                    <button aria-label="Pomocna odpowiedź" onClick={() => message.id && sendTutorFeedback(message.id, true)} className="text-slate-500 hover:text-emerald-300"><ThumbsUp size={14} /></button>
                    <button aria-label="Niepomocna odpowiedź" onClick={() => message.id && sendTutorFeedback(message.id, false)} className="text-slate-500 hover:text-rose-300"><ThumbsDown size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => void send(suggestion)} className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-slate-400 hover:border-violet-400/30 hover:text-white">
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
              AI Tutor jest chwilowo niedostępny.
              <button onClick={() => void send(messages.at(-2)?.content)} className="ml-auto flex items-center gap-2 text-xs text-white">
                <RefreshCw size={14} /> Spróbuj ponownie
              </button>
            </div>
          )}
        </div>

        <div className="flex items-end gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-2">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                event.preventDefault()
                void send()
              }
            }}
            placeholder="Napisz wiadomość..."
            className="min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
          />
          <button onClick={() => void send()} disabled={loading || !text.trim()} aria-label="Wyślij wiadomość" className="grid size-10 place-items-center rounded-xl bg-violet-500 text-white disabled:opacity-40">
            <Send size={17} />
          </button>
        </div>
      </div>
    </main>
  )
}
