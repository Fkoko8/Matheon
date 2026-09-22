import { getHints, getQuestion, getSolution } from '@/lib/data'
import type { AnswerResult, Mistake, SubmitAnswerInput, TaskEngine, UserAnswer, UserProgress } from '@/lib/types'
import { DEMO_USER_ID, nowIso } from '@/lib/types'

const answerStore: UserAnswer[] = []
const mistakeStore: Mistake[] = []
const progressStore = new Map<string, UserProgress>()

export const taskEngine: TaskEngine = {
  async submitAnswer(input: SubmitAnswerInput): Promise<AnswerResult> { const attempt = await this.recordAttempt(input); const isCorrect = input.questionId === 'question-triangle' && input.answer.trim() === '20'; attempt.isCorrect = isCorrect; if (!isCorrect) await this.recordMistake(input.questionId); return { isCorrect, answerId: attempt.id, feedback: isCorrect ? 'Poprawna odpowiedź.' : 'Odpowiedź została zapisana do analizy.' } },
  async requestHint(questionId) { return getHints(questionId)[0] ?? null },
  async revealSolution(questionId) { return getSolution(questionId) },
  async recordAttempt(input) { const answer = { id: `answer-${answerStore.length + 1}`, userId: DEMO_USER_ID, questionId: input.questionId, answer: input.answer, createdAt: nowIso() }; answerStore.push(answer); return answer },
  async recordMistake(questionId) { const question = getQuestion(questionId); const mistake = { id: `mistake-${mistakeStore.length + 1}`, userId: DEMO_USER_ID, questionId, topicId: question?.topicId ?? 'unknown', count: 1, lastSeenAt: nowIso() }; mistakeStore.push(mistake); return mistake },
  async updateProgress(topicId, isCorrect) { const current = progressStore.get(topicId) ?? { userId: DEMO_USER_ID, topicId, mastery: 0, accuracy: 0, attempts: 0, updatedAt: nowIso() }; const attempts = current.attempts + 1; const accuracy = Math.round(((current.accuracy * current.attempts) + (isCorrect ? 100 : 0)) / attempts); const updated = { ...current, attempts, accuracy, mastery: Math.min(100, current.mastery + (isCorrect ? 2 : 0)), updatedAt: nowIso() }; progressStore.set(topicId, updated); return updated },
}
