/**
 * MATHEON — embeddingi treści (Faza 4).
 *
 * Jedno miejsce, w którym powstają wektory dla RAG:
 * - `embeddingsConfigured()` mówi wprost, czy w środowisku jest klucz bramki AI,
 *   dzięki czemu wyszukiwanie wiedzy wie, kiedy zejść na tryb słowny (keyword),
 * - `embedTexts()` obsługuje wsad (backfill lekcji i zadań),
 * - `embedQuery()` jest bezpieczne dla ścieżki zapytania: brak klucza albo błąd
 *   dostawcy nie wywala tutora, tylko zwraca `null` i wyszukiwanie działa dalej.
 *
 * Model: `openai/text-embedding-3-small` (1536 wymiarów — tyle ma kolumna
 * `knowledge_chunks.embedding` z migracji 006), przez Vercel AI Gateway.
 */
import { embedMany, gateway } from 'ai'

export const EMBEDDING_MODEL_ID = 'openai/text-embedding-3-small'

/** Wymiary muszą zgadzać się z `vector(1536)` w schemacie bazy. */
export const EMBEDDING_DIMENSIONS = 1536

/** Znaki na wejściu — model ma limit tokenów, a treść i tak jest streszczana. */
const MAX_INPUT_CHARS = 6000

/**
 * Czy embeddingi da się w ogóle policzyć?
 * Bramka AI przyjmuje klucz z `AI_GATEWAY_API_KEY`; lokalne środowisko bez klucza
 * świadomie działa w trybie słownym, a nie udaje wektorów.
 */
export function embeddingsConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim())
}

/** Postać wektora w formacie pgvector: `[0.1,0.2,...]`. */
export function vectorLiteral(values: number[]): string {
  return `[${values.map((value) => Number(value).toFixed(8)).join(',')}]`
}

function prepare(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_INPUT_CHARS)
}

/**
 * Liczy embeddingi dla listy tekstów.
 * Rzuca, gdy brakuje klucza — ścieżki zapisu (import, backfill) muszą to wiedzieć.
 */
export async function embedTexts(values: string[]): Promise<number[][]> {
  const inputs = values.map(prepare).filter((value) => value.length > 0)
  if (!inputs.length) return []
  if (!embeddingsConfigured()) throw new Error('EMBEDDINGS_UNAVAILABLE')

  const { embeddings } = await embedMany({
    model: gateway.embeddingModel(EMBEDDING_MODEL_ID),
    values: inputs,
    maxParallelCalls: 4,
  })
  return embeddings
}

/** Embedding zapytania — nigdy nie rzuca, `null` oznacza „użyj trybu słownego”. */
export async function embedQuery(query: string): Promise<number[] | null> {
  if (!embeddingsConfigured() || !query.trim()) return null
  try {
    const [vector] = await embedTexts([query])
    return vector ?? null
  } catch {
    return null
  }
}
