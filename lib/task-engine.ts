import { getHints, getSolution } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import type { AnswerResult, Mistake, SubmitAnswerInput, TaskEngine, UserAnswer, UserProgress } from '@/lib/types'
import { DEMO_USER_ID, nowIso } from '@/lib/types'

async function currentUserId() { const supabase = createClient(); if (!supabase) return null; const { data } = await supabase.auth.getUser(); return data.user?.id ?? null }
async function questionAnswer(questionId: string) { const supabase = createClient(); if (!supabase) return questionId === 'question-triangle' ? '20' : null; const { data } = await supabase.from('questions').select('correct_answer,topic_id,subtopic_id').eq('id', questionId).maybeSingle(); return data }

export const taskEngine: TaskEngine = {
  async submitAnswer(input: SubmitAnswerInput): Promise<AnswerResult> {
    const question = await questionAnswer(input.questionId)
    const correctAnswer = typeof question === 'string' ? question : question?.correct_answer
    const isCorrect = Boolean(correctAnswer && input.answer.trim().toLowerCase() === String(correctAnswer).trim().toLowerCase())
    const attempt = await this.recordAttempt({ ...input, isCorrect } as SubmitAnswerInput & { isCorrect: boolean })
    if (!isCorrect) await this.recordMistake(input.questionId, input.answer)
    if (typeof question !== 'string' && question?.topic_id) await this.updateProgress(String(question.topic_id), isCorrect)
    return { isCorrect, answerId: attempt.id, feedback: isCorrect ? 'Poprawna odpowiedź.' : 'Odpowiedź została zapisana do analizy.' }
  },
  async requestHint(questionId) { const hints = await getHints(questionId); const supabase = createClient(); const userId = await currentUserId(); if (supabase && userId) await supabase.from('user_progress').upsert({ user_id: userId, topic_id: null, hints_used: 1 }, { onConflict: 'user_id,topic_id' }); return hints[0] ?? null },
  async revealSolution(questionId) { return getSolution(questionId) },
  async recordAttempt(input: SubmitAnswerInput & { isCorrect?: boolean }): Promise<UserAnswer> {
    const supabase = createClient(); const userId = await currentUserId(); const createdAt = nowIso();
    if (supabase && userId) { const { data, error } = await supabase.from('user_answers').insert({ user_id: userId, question_id: input.questionId, answer: input.answer, is_correct: Boolean(input.isCorrect), attempt_number: 1 }).select('id,user_id,question_id,answer,is_correct,created_at').single(); if (!error && data) return { id: String(data.id), userId: String(data.user_id), questionId: String(data.question_id), answer: String(data.answer), isCorrect: Boolean(data.is_correct), createdAt: String(data.created_at) } }
    return { id: `answer-${Date.now()}`, userId: userId ?? DEMO_USER_ID, questionId: input.questionId, answer: input.answer, isCorrect: Boolean(input.isCorrect), createdAt }
  },
  async recordMistake(questionId, userAnswer = ''): Promise<Mistake> {
    const supabase = createClient(); const userId = await currentUserId(); const question = await questionAnswer(questionId); const topicId = typeof question === 'object' && question?.topic_id ? String(question.topic_id) : 'unknown'; const correctAnswer = typeof question === 'string' ? question : String(question?.correct_answer ?? '');
    if (supabase && userId && topicId !== 'unknown') { const { data, error } = await supabase.from('mistakes').upsert({ user_id: userId, question_id: questionId, topic_id: topicId, user_answer: userAnswer, correct_answer: correctAnswer, attempt_count: 1, last_seen_at: nowIso() }, { onConflict: 'user_id,question_id' }).select('id,user_id,question_id,topic_id,attempt_count,last_seen_at').single(); if (!error && data) return { id: String(data.id), userId: String(data.user_id), questionId: String(data.question_id), topicId: String(data.topic_id), count: Number(data.attempt_count), lastSeenAt: String(data.last_seen_at) } }
    return { id: `mistake-${Date.now()}`, userId: userId ?? DEMO_USER_ID, questionId, topicId, count: 1, lastSeenAt: nowIso() }
  },
  async updateProgress(topicId, isCorrect): Promise<UserProgress> {
    const supabase = createClient(); const userId = await currentUserId();
    if (supabase && userId) { const { data: current } = await supabase.from('user_progress').select('attempts,correct_attempts,mastery,accuracy').eq('user_id', userId).eq('topic_id', topicId).maybeSingle(); const attempts = Number(current?.attempts ?? 0) + 1; const correct = Number(current?.correct_attempts ?? 0) + (isCorrect ? 1 : 0); const accuracy = Math.round(correct / attempts * 100); const mastery = Math.min(100, Number(current?.mastery ?? 0) + (isCorrect ? 2 : 0)); const { data, error } = await supabase.from('user_progress').upsert({ user_id: userId, topic_id: topicId, attempts, correct_attempts: correct, incorrect_attempts: attempts - correct, accuracy, mastery, last_attempt_at: nowIso(), updated_at: nowIso() }, { onConflict: 'user_id,topic_id' }).select('user_id,topic_id,mastery,accuracy,attempts,updated_at').single(); if (!error && data) return { userId: String(data.user_id), topicId: String(data.topic_id), mastery: Number(data.mastery), accuracy: Number(data.accuracy), attempts: Number(data.attempts), updatedAt: String(data.updated_at) } }
    return { userId: userId ?? DEMO_USER_ID, topicId, mastery: isCorrect ? 2 : 0, accuracy: isCorrect ? 100 : 0, attempts: 1, updatedAt: nowIso() }
  },
}
