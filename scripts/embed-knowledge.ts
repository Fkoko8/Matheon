/**
 * CLI: uzupełnianie embeddingów bazy wiedzy.
 *
 *   pnpm content:embed          → tylko fragmenty bez wektora
 *   pnpm content:embed --all    → przelicz wszystko (np. po zmianie modelu)
 *
 * Wymaga klucza bramki AI (`AI_GATEWAY_API_KEY`) — bez niego wyszukiwanie wiedzy
 * działa w trybie słownym, więc brak klucza nie jest błędem aplikacji.
 */
import { backfillKnowledgeEmbeddings } from '@/lib/ai/retrieval/embedKnowledge'

const all = process.argv.includes('--all')

backfillKnowledgeEmbeddings({ onlyMissing: !all })
  .then((result) => {
    if (result.skipped) {
      console.log(`Pominięto: ${result.reason}`)
      if (result.remaining) console.log(`Fragmentów bez wektora: ${result.remaining}`)
      return
    }
    console.log(`✓ Wektory: ${result.embedded} fragmentów${all ? ' (pełny przebieg)' : ''}`)
    console.log(`Pozostało bez wektora: ${result.remaining}`)
  })
  .catch((error) => {
    console.error('Nie udało się policzyć embeddingów:', error instanceof Error ? error.message : error)
    process.exit(1)
  })
