export type ID = string

export interface UserProfile { id: ID; displayName: string; email?: string; avatarUrl?: string; level: number; xp: number; streak: number }
export interface Subject { id: ID; name: string; slug: string; level: 'basic' | 'extended' }
export interface Topic { id: ID; subjectId: ID; name: string; slug: string; mastery: number }
export interface Subtopic { id: ID; topicId: ID; name: string; slug: string; mastery: number }
export interface Lesson { id: ID; subtopicId: ID; title: string; slug: string; durationMinutes: number; order: number }
export interface Question { id: ID; topicId: ID; title: string; prompt: string; difficulty: 'easy' | 'medium' | 'hard'; points: number }
export interface Hint { id: ID; questionId: ID; content: string; order: number }
export interface Solution { id: ID; questionId: ID; content: string }
export interface Exam { id: ID; year: number; level: 'basic' | 'extended'; durationMinutes: number; points: number; status: 'not_started' | 'in_progress' | 'completed' }
export interface ExamQuestion { examId: ID; questionId: ID; order: number }
export interface UserProgress { userId: ID; topicId: ID; mastery: number; accuracy: number; attempts: number; updatedAt: string }
export interface UserAnswer { id: ID; userId: ID; questionId: ID; answer: string; isCorrect?: boolean; createdAt: string }
export interface Mistake { id: ID; userId: ID; questionId: ID; topicId: ID; count: number; lastSeenAt: string }
export interface StudySession { id: ID; userId: ID; startedAt: string; endedAt?: string; durationMinutes: number; questionsAnswered: number }
export interface StudyPlan { id: ID; userId: ID; title: string; startDate: string; endDate: string }
export interface StudyPlanItem { id: ID; planId: ID; title: string; scheduledAt: string; durationMinutes: number; type: 'review' | 'theory' | 'practice' | 'ai' | 'exam'; completed: boolean }
export interface AIConversation { id: ID; userId: ID; title: string; createdAt: string }
export interface AIMessage { id: ID; conversationId: ID; role: 'user' | 'assistant' | 'system'; content: string; createdAt: string }

export interface DashboardData { profile: UserProfile; mastery: number; accuracy: number; tasks: number; reviewQueue: number; weakTopics: Topic[]; recentActivity: StudySession[] }
export interface SubmitAnswerInput { questionId: ID; answer: string }
export interface AnswerResult { isCorrect: boolean; answerId: ID; feedback?: string }
export interface TaskEngine { submitAnswer(input: SubmitAnswerInput): Promise<AnswerResult>; requestHint(questionId: ID): Promise<Hint | null>; revealSolution(questionId: ID): Promise<Solution | null>; recordAttempt(input: SubmitAnswerInput): Promise<UserAnswer>; recordMistake(questionId: ID): Promise<Mistake>; updateProgress(topicId: ID, isCorrect: boolean): Promise<UserProgress> }

export const DEMO_USER_ID = 'demo-user'
export const nowIso = () => new Date().toISOString()
