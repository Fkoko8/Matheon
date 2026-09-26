/**
 * MATHEON — uzupełnianie embeddingów bazy wiedzy (Faza 4).
 *
 * Treść trafia do `knowledge_chunks` przy imporcie (`pnpm content:import`), a ten modul
 * domyka brakujące wektory, żeby RAG działał semantycznie. Uruchamiany:
 * - z CLI: `pnpm content:embed` (albo `pnpm content:embed --all`, by przeliczyć wszystko),
 * - na końcu importu treści, jeśli w środowisku jest klucz bramki AI.
 *
 * Operuje kluczem service role po REST — nie rusza danych użytkowników.
 */
import { embedTexts, embeddingsConfigured } from '@/lib/ai/embeddings'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '').replace(/\/+$/, '')
const SERVICE_KEY =
  process.env.SERVICE_ROLE ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE ??
  process.env.SERVICE_ROLE_KEY ??
  ''

export interface EmbedBackfillResult {
  /** Ile fragmentów dostało właśnie wektor. */
  embedded: number
  /** Ile fragmentów nadal nie ma wektora. */
  remaining: number
  /** `true`, gdy brakuje klucza bramki AI i nic nie policzono. */
  skipped: boolean
  reason?: string
}

interface ChunkRow {
  id: string
  title: string
  content: string
}

const BATCH = 48

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      authorization: `Bearer ${SERVICE_KEY}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${response.status} ${text.slice(0, 300)}`)
  return (text ? JSON.parse(text) : null) as T
}

async function countMissing(): Promise<number> {
  const result = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_chunks?select=id&embedding=is.null&limit=1`, {
    headers: { apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}`, prefer: 'count=exact' },
  })
  const range = result.headers.get('content-range') ?? ''
  const total = range.split('/')[1]
  return total ? Number(total) : 0
}

/**
 * Dopisuje embeddingi fragmentom wiedzy.
 * `onlyMissing: false` przelicza także te, które wektor już mają (np. po zmianie modelu).
 */
export async function backfillKnowledgeEmbeddings(
  options: { onlyMissing?: boolean; max?: number } = {},
): Promise<EmbedBackfillResult> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { embedded: 0, remaining: 0, skipped: true, reason: 'Brak NEXT_PUBLIC_SUPABASE_URL lub klucza service role.' }
  }
  if (!embeddingsConfigured()) {
    return {
      embedded: 0,
      remaining: await countMissing().catch(() => 0),
      skipped: true,
      reason: 'Brak AI_GATEWAY_API_KEY — wyszukiwanie wiedzy działa w trybie słownym.',
    }
  }

  const onlyMissing = options.onlyMissing ?? true
  const max = options.max ?? Number.POSITIVE_INFINITY
  let embedded = 0
  let fetched = 0

  while (embedded < max) {
    // Brakujące bierzemy filtrem (po zapisie same znikają z wyniku),
    // a pełny przebieg paginujemy offsetem.
    const query = onlyMissing
      ? `knowledge_chunks?select=id,title,content&embedding=is.null&order=id.asc&limit=${BATCH}`
      : `knowledge_chunks?select=id,title,content&order=id.asc&limit=${BATCH}&offset=${fetched}`
    const batch = await rest<ChunkRow[]>(query)
    if (!batch.length) break
    fetched += batch.length

    const vectors = await embedTexts(batch.map((row) => `${row.title}\n\n${row.content}`))
    for (const [index, row] of batch.entries()) {
      const vector = vectors[index]
      if (!vector) continue
      await rest(`knowledge_chunks?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: { prefer: 'return=minimal' },
        body: JSON.stringify({ embedding: vector, updated_at: new Date().toISOString() }),
      })
      embedded += 1
      if (embedded >= max) break
    }
    if (batch.length < BATCH) break
  }

  return { embedded, remaining: await countMissing().catch(() => 0), skipped: false }
}
