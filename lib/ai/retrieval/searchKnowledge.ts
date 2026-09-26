/**
 * MATHEON — wyszukiwanie wiedzy dla tutora (RAG).
 *
 * Dwie ścieżki, jedna odpowiedź:
 * 1. **wektorowa** — gdy w środowisku jest klucz bramki AI: zapytanie zamieniamy na
 *    embedding i pytamy bazę przez RPC `match_knowledge_chunks` (pgvector, HNSW, cosine),
 * 2. **słowna** — gdy brakuje klucza albo baza nie ma jeszcze wektorów dla treści:
 *    ten sam ranking po trafieniach w tytule i treści, bez udawania, że to semantyka.
 *
 * Wynik zawsze niesie `matchType`, więc UI i prompt wiedzą, na czym oparto odpowiedź.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { embedQuery, vectorLiteral, embeddingsConfigured } from '@/lib/ai/embeddings'

export interface KnowledgeFilters {
  level?: string
  topic?: string
  subtopic?: string
  limit?: number
}

export interface KnowledgeResult {
  id: string
  title: string
  content: string
  sourceType: string
  sourceId: string
  metadata: Record<string, unknown>
  /** 0–1: podobieństwo kosinusowe (wektory) albo udział trafionych słów (tryb słowny). */
  similarity: number
  matchType: 'vector' | 'keyword'
}

export type KnowledgeClient = SupabaseClient | null

const MAX_LIMIT = 12
const MIN_TERM_LENGTH = 3

async function resolveClient(client?: KnowledgeClient): Promise<KnowledgeClient> {
  if (client !== undefined) return client
  // Import dynamiczny: moduł działa też poza Next (skrypty QA, import treści).
  const { createServerSupabaseClient } = await import('@/lib/supabase/server')
  return createServerSupabaseClient()
}

function mapRow(row: Record<string, unknown>, similarity: number, matchType: KnowledgeResult['matchType']): KnowledgeResult {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    sourceType: String(row.source_type ?? ''),
    sourceId: String(row.source_id ?? ''),
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    similarity,
    matchType,
  }
}

/**
 * Znaki, które mają znaczenie dla składni filtrów PostgREST — usuwamy je z zapytania ucznia.
 * Zostawiamy litery i cyfry, więc wzorzec ILIKE nigdy nie zmieni kształtu żądania.
 */
function searchTerms(query: string): string[] {
  return [...new Set(
    query
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((term) => term.length >= MIN_TERM_LENGTH),
  )].slice(0, 6)
}

/**
 * Tryb słowny: prawdziwe wyszukiwanie w bazie (ILIKE po słowach zapytania) i ranking
 * po udziale trafionych słów. Wcześniej przeglądaliśmy tylko pierwsze kilkanaście
 * wierszy tabeli, więc trafienia poza próbką po prostu nie istniały.
 */
export async function keywordSearchKnowledge(
  query: string,
  filters: KnowledgeFilters = {},
  client?: KnowledgeClient,
): Promise<KnowledgeResult[]> {
  const supabase = await resolveClient(client)
  if (!supabase) return []

  const limit = Math.min(filters.limit ?? 6, MAX_LIMIT)
  const terms = searchTerms(query)

  let request = supabase
    .from('knowledge_chunks')
    .select('id,title,content,source_type,source_id,metadata')
    .limit(Math.min(limit * 6, 80))
  if (filters.level) request = request.contains('metadata', { level: filters.level })
  if (filters.topic) request = request.ilike('title', `%${filters.topic}%`)
  if (terms.length) {
    request = request.or(terms.flatMap((term) => [`title.ilike.*${term}*`, `content.ilike.*${term}*`]).join(','))
  }

  const { data, error } = await request
  if (error) return []

  return ((data ?? []) as Array<Record<string, unknown>>)
    .map((row) => {
      const haystack = `${row.title} ${row.content}`.toLowerCase()
      const matched = terms.filter((term) => haystack.includes(term)).length
      // Zapytanie bez użytecznych słów (np. samo „a”) nie ma czego rankingować —
      // zwracamy fragmenty z neutralnym wynikiem, żeby tutor miał na czym pracować.
      const similarity = terms.length ? matched / terms.length : 0.1
      return mapRow(row, similarity, 'keyword')
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
}

async function vectorSearchKnowledge(
  query: string,
  filters: KnowledgeFilters,
  supabase: SupabaseClient,
  limit: number,
): Promise<KnowledgeResult[] | null> {
  const vector = await embedQuery(query)
  if (!vector) return null

  const args = {
    query_embedding: vector as unknown,
    match_count: limit,
    filter_metadata: filters.level ? { level: filters.level } : {},
  }

  const attempt = await supabase.rpc('match_knowledge_chunks', args)
  // PostgREST potrafi wymagać dosłownej postaci wektora — wtedy ponawiamy raz.
  const result = attempt.error
    ? await supabase.rpc('match_knowledge_chunks', { ...args, query_embedding: vectorLiteral(vector) as unknown })
    : attempt
  if (result.error || !result.data) return null

  const rows = (result.data as Array<Record<string, unknown>>).filter((row) => row.embedding !== null)
  if (!rows.length) return null
  return rows.map((row) => mapRow(row, Number(row.similarity ?? 0), 'vector'))
}

/**
 * Wyszukiwanie wiedzy dla zapytania ucznia.
 * `client === undefined` → klient serwerowy (aplikacja); `null` → brak danych (tryb demo).
 */
export async function searchKnowledge(
  query: string,
  filters: KnowledgeFilters = {},
  client?: KnowledgeClient,
): Promise<KnowledgeResult[]> {
  const supabase = await resolveClient(client)
  if (!supabase || !query.trim()) return []

  const limit = Math.min(filters.limit ?? 6, MAX_LIMIT)

  if (embeddingsConfigured()) {
    const vectorResults = await vectorSearchKnowledge(query, filters, supabase, limit)
    if (vectorResults?.length) return vectorResults
  }

  return keywordSearchKnowledge(query, filters, supabase)
}
