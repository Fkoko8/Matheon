import { createServerSupabaseClient } from '@/lib/supabase/server'
import { chunkEducationalContent, type KnowledgeChunk } from './chunk'
export async function ingestKnowledge(input: KnowledgeChunk & { sourceType: string; sourceId: string }) { const supabase = await createServerSupabaseClient(); const chunks = chunkEducationalContent(input); const rows = chunks.map((chunk) => ({ source_type: input.sourceType, source_id: input.sourceId, title: chunk.title, content: chunk.content, metadata: chunk.metadata })); const { error } = await supabase.from('knowledge_chunks').upsert(rows, { onConflict: 'source_type,source_id,title' }); if (error) throw error; return rows.length }
export const ingestLesson = ingestKnowledge
export const ingestTopic = ingestKnowledge
export const ingestQuestion = ingestKnowledge
export const ingestSolution = ingestKnowledge
