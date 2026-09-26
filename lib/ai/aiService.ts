import type { TutorContext, TutorMode } from './tutor-prompt'
export type TutorRequest = { messages: { role: 'user' | 'assistant'; content: string }[]; context?: TutorContext; mode?: TutorMode; conversationId?: string }
export async function generateTutorResponse(input: TutorRequest) { const response = await fetch('/api/ai/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }); if (!response.ok) throw new Error('AI_UNAVAILABLE'); return response }
export async function sendTutorFeedback(messageId: string, helpful: boolean) { await fetch('/api/ai/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messageId, helpful }) }) }
