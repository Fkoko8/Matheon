/**
 * MATHEON — globalne wyszukiwanie (⌘K).
 *
 * Indeks składa się wyłącznie z realnych danych:
 * - działów i lekcji z programu (`content/`),
 * - zadań z banku (`questions` pod RLS),
 * - arkuszy egzaminacyjnych (`exams`).
 *
 * Dopasowanie jest odporne na polską diakrytykę („rownania” znajduje „Równania”)
 * i wymaga wszystkich słów zapytania — dzięki temu wynik jest precyzyjny, a nie „prawie”.
 */
import { curriculum } from '@/lib/learning/curriculum'
import { loadPracticeBank, type PracticeQuestion } from '@/lib/learning/practice'
import { listExams } from '@/lib/exams'

export type SearchHitKind = 'topic' | 'lesson' | 'task' | 'exam'

export interface SearchHit {
  id: string
  kind: SearchHitKind
  title: string
  subtitle: string
  href: string
  /** Znormalizowany tekst do dopasowania (tytuł + opis + tagi). */
  haystack: string
}

export const SEARCH_KIND_LABEL: Record<SearchHitKind, string> = {
  topic: 'Dział',
  lesson: 'Lekcja',
  task: 'Zadanie',
  exam: 'Arkusz',
}

/** Sprowadza tekst do formy porównywalnej: bez diakrytyki, małych liter, bez interpunkcji. */
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0142/g, 'l')
    .replace(/\u0141/g, 'L')
    .toLowerCase()
}

function haystackOf(...parts: Array<string | null | undefined>): string {
  return fold(parts.filter(Boolean).join(' '))
}

/** Działy i lekcje z programu — dane lokalne, dostępne od razu po otwarciu wyszukiwania. */
export function curriculumHits(): SearchHit[] {
  return curriculum.flatMap((topic) => {
    const levelLabel = topic.level === 'extended' ? 'Rozszerzenie' : 'Podstawa'
    const topicHit: SearchHit = {
      id: `topic:${topic.slug}`,
      kind: 'topic',
      title: topic.title,
      subtitle: `${levelLabel} · ${topic.lessons.length} lekcji${topic.authored ? '' : ' · zarys'}`,
      href: `/learn/topic/${topic.slug}`,
      haystack: haystackOf(topic.title, topic.description, topic.slug, levelLabel),
    }
    const lessonHits = topic.lessons.map((lesson) => ({
      id: `lesson:${topic.slug}/${lesson.slug}`,
      kind: 'lesson' as const,
      title: lesson.title,
      subtitle: `${topic.title} · ${lesson.duration} min`,
      href: `/learn/lesson/${topic.slug}/${lesson.slug}`,
      haystack: haystackOf(lesson.title, topic.title, lesson.objectives.join(' '), lesson.skills.map((skill) => skill.name).join(' ')),
    }))
    return [topicHit, ...lessonHits]
  })
}

function questionHit(question: PracticeQuestion): SearchHit {
  const levelLabel = question.level === 'extended' ? 'Rozszerzenie' : 'Podstawa'
  const query = encodeURIComponent(question.code ?? question.title)
  return {
    id: `task:${question.id}`,
    kind: 'task',
    title: question.title,
    subtitle: `${question.topicName ?? 'Zadanie'} · ${question.points} pkt · ${levelLabel}`,
    href: `/tasks?level=${question.level}&q=${query}`,
    haystack: haystackOf(question.title, question.prompt, question.topicName, question.tags.join(' '), question.code),
  }
}

/**
 * Pełny indeks: program (natychmiast) + bank zadań i arkusze (jedno zapytanie każde).
 * Błąd bazy nie blokuje wyszukiwania lekcji — degraduje się do częściowego indeksu.
 */
export async function loadSearchHits(): Promise<SearchHit[]> {
  const [bank, exams] = await Promise.all([
    loadPracticeBank({ limit: 500 }).catch(() => null),
    listExams().catch(() => []),
  ])

  const taskHits = (bank?.questions ?? []).map(questionHit)
  const examHits: SearchHit[] = exams.map((exam) => ({
    id: `exam:${exam.id}`,
    kind: 'exam' as const,
    title: exam.title,
    subtitle: `${exam.year} · ${exam.level === 'extended' ? 'Rozszerzenie' : 'Podstawa'} · ${exam.questionCount} zadań`,
    href: `/exams/${exam.id}`,
    haystack: haystackOf(exam.title, exam.source, String(exam.year), exam.description),
  }))

  return [...curriculumHits(), ...taskHits, ...examHits]
}

/** Dopasowanie: wszystkie słowa zapytania muszą wystąpić; lepsze trafienia idą na górę. */
export function matchHits(hits: SearchHit[], query: string, limit = 24): SearchHit[] {
  const folded = fold(query).trim()
  if (!folded) return []
  const terms = folded.split(/\s+/).filter(Boolean)

  const scored: Array<{ hit: SearchHit; score: number }> = []
  for (const hit of hits) {
    const title = fold(hit.title)
    if (!terms.every((term) => hit.haystack.includes(term))) continue
    let score = 0
    if (title === folded) score += 100
    else if (title.startsWith(folded)) score += 60
    else if (title.includes(folded)) score += 30
    // Preferuj treść programu nad bankiem, żeby wynik był przewidywalny.
    if (hit.kind === 'topic') score += 8
    else if (hit.kind === 'lesson') score += 6
    scored.push({ hit, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title, 'pl'))
    .slice(0, limit)
    .map((entry) => entry.hit)
}
