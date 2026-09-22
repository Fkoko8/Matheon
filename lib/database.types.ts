export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type ContentLevel = 'basic' | 'extended'
export type QuestionKind = 'numeric' | 'text' | 'single_choice' | 'multiple_choice' | 'open' | 'proof'
export type SessionKind = 'lesson' | 'training' | 'review' | 'exam' | 'ai'
export type ActivityKind = 'lesson' | 'training' | 'review' | 'exam' | 'ai'
export type ItemStatus = 'pending' | 'completed' | 'skipped'
export type MessageRole = 'user' | 'assistant' | 'system'

type Row = Record<string, unknown>
type Table = { Row: Row; Insert: Row; Update: Row; Relationships: [] }
type Tables = { [name: string]: Table }

export type Database = {
  public: {
    Tables: Tables & {
      profiles: Table; subjects: Table; topics: Table; subtopics: Table; lessons: Table; questions: Table; hints: Table; solutions: Table; exams: Table; exam_questions: Table; user_progress: Table; user_answers: Table; mistakes: Table; study_sessions: Table; study_plans: Table; study_plan_items: Table; achievements: Table; user_achievements: Table; ai_conversations: Table; ai_messages: Table
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: { content_level: ContentLevel; question_kind: QuestionKind; session_kind: SessionKind; activity_kind: ActivityKind; item_status: ItemStatus; message_role: MessageRole }
    CompositeTypes: Record<string, never>
  }
}

export type TableName = keyof Database['public']['Tables']
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']
