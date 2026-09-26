/**
 * Importer treści MATHEON.
 *
 * Publikuje autorskie działy z `content/` do Supabase: umiejętności, wymagania CKE,
 * lekcje (sekcje + bloki), bank zadań (podpowiedzi, rozwiązania, powiązania z umiejętnościami)
 * oraz indeks wiedzy dla tutora AI.
 *
 * Skrypt jest idempotentny: lekcje i umiejętności są dopasowywane po `slug`, a zadania po
 * `validation_metadata.code`, dzięki czemu ponowne uruchomienie aktualizuje treść zamiast
 * tworzyć duplikaty i nie usuwa historii odpowiedzi ucznia.
 *
 * Uruchomienie: `pnpm content:import`
 */
import { authoredTasks, authoredTopics, ckeRequirements } from '@/content'
import type { ContentBlock, ContentLesson, ContentTask, ContentTopic, LearningLevel } from '@/content/types'
import { embeddingsConfigured } from '@/lib/ai/embeddings'
import { backfillKnowledgeEmbeddings } from '@/lib/ai/retrieval/embedKnowledge'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '').replace(/\/+$/, '')
const SERVICE_KEY =
  process.env.SERVICE_ROLE ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE ??
  process.env.SERVICE_ROLE_KEY ??
  ''

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Brak NEXT_PUBLIC_SUPABASE_URL lub klucza service role w środowisku.')
  process.exit(1)
}

interface RestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  query?: string
  body?: unknown
  prefer?: string
}

async function rest<T = Record<string, unknown>>(table: string, options: RestOptions = {}): Promise<T> {
  const { method = 'GET', query = '', body, prefer } = options
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      authorization: `Bearer ${SERVICE_KEY}`,
      'content-type': 'application/json',
      ...(prefer ? { prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${method} ${table}${query} → ${response.status} ${text.slice(0, 400)}`)
  return (text ? JSON.parse(text) : null) as T
}

const RETURN_ONE = 'return=representation'

/** Zamienia LaTeX na tekst czytelny dla wyszukiwania i tytułów. */
function plainText(input: string): string {
  return input
    .replace(/\$\$([\s\S]+?)\$\$/g, ' $1 ')
    .replace(/\$([^$]+?)\$/g, ' $1 ')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\[3\]\{([^{}]*)\}/g, 'cbrt($1)')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\(cdot|times)/g, '*')
    .replace(/\\(leq|le)/g, '<=')
    .replace(/\\(geq|ge)/g, '>=')
    .replace(/\\(neq|ne)/g, '!=')
    .replace(/\\(left|right|quad|qquad|,|;|!)/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}$]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function blockText(block: ContentBlock): string {
  const header = block.title ? `${block.title}. ` : ''
  const formula = block.formula ? ` Wzór: ${plainText(block.formula)}.` : ''
  return `${header}${plainText(block.body)}${formula}`.trim()
}

function lessonPlainText(blocks: ContentBlock[]): string {
  return blocks.map(blockText).join('\n\n')
}

function chunkBody(body: string, maxLength = 1800): string[] {
  const paragraphs = body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''
  for (const paragraph of paragraphs) {
    if (current && (current + '\n\n' + paragraph).length > maxLength) {
      chunks.push(current.trim())
      current = paragraph
    } else {
      current += `${current ? '\n\n' : ''}${paragraph}`
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.length ? chunks : [body]
}

async function upsertBySlug<T extends { id: string }>(table: string, slug: string, row: Record<string, unknown>): Promise<T> {
  const rows = await rest<T[]>(table, {
    method: 'POST',
    query: '?on_conflict=slug',
    prefer: `${RETURN_ONE},resolution=merge-duplicates`,
    body: [row],
  })
  if (!rows?.[0]?.id) throw new Error(`Nie udało się zapisać ${table} (${slug}).`)
  return rows[0]
}

async function single<T extends { id: string }>(table: string, query: string): Promise<T | null> {
  const rows = await rest<T[]>(table, { query: `${query}&limit=1` })
  return rows?.[0] ?? null
}

async function replaceKnowledgeChunks(sourceType: string, sourceId: string, rows: Array<{ title: string; content: string; metadata: Record<string, unknown> }>) {
  await rest('knowledge_chunks', { method: 'DELETE', query: `?source_type=eq.${sourceType}&source_id=eq.${sourceId}` })
  if (!rows.length) return
  await rest('knowledge_chunks', {
    method: 'POST',
    prefer: RETURN_ONE,
    body: rows.map((row) => ({ source_type: sourceType, source_id: sourceId, title: row.title, content: row.content, metadata: row.metadata })),
  })
}

/**
 * Zapewnia, że dział i jego podtematy istnieją w bazie. Treść autorska jest źródłem prawdy
 * dla taksonomii CKE, więc importer dokłada brakujące działy zamiast wymagać ręcznego seedu.
 */
async function ensureTopic(level: LearningLevel, topic: ContentTopic) {
  const subject = await single<{ id: string }>('subjects', `?level=eq.${level}&select=id`)
  if (!subject) throw new Error(`Brak przedmiotu dla poziomu ${level}. Uruchom najpierw seed bazy.`)

  let topicRow = await single<{ id: string }>('topics', `?subject_id=eq.${subject.id}&slug=eq.${topic.slug}&select=id`)
  if (!topicRow) {
    const last = await rest<Array<{ order_index: number }>>('topics', { query: `?subject_id=eq.${subject.id}&select=order_index&order=order_index.desc` })
    const [created] = await rest<Array<{ id: string }>>('topics', {
      method: 'POST',
      prefer: RETURN_ONE,
      body: [{
        subject_id: subject.id,
        name: topic.title,
        slug: topic.slug,
        description: topic.description,
        order_index: (last[0]?.order_index ?? 0) + 1,
      }],
    })
    topicRow = created
    console.log(`  + nowy dział: ${topic.title} (${level})`)
  }

  const desiredSubtopics: Array<[slug: string, name: string]> = [
    ['podstawy', 'Podstawy'],
    ['zadania-maturalne', 'Zadania maturalne'],
  ]
  const existing = await rest<Array<{ id: string; slug: string }>>('subtopics', { query: `?topic_id=eq.${topicRow.id}&select=id,slug` })
  const missing = desiredSubtopics.filter(([slug]) => !existing.some((item) => item.slug === slug))
  if (missing.length) {
    await rest('subtopics', {
      method: 'POST',
      prefer: RETURN_ONE,
      body: missing.map(([slug, name], index) => ({ topic_id: topicRow!.id, name, slug, order_index: existing.length + index })),
    })
  }

  const subtopics = await rest<Array<{ id: string; slug: string }>>('subtopics', {
    query: `?topic_id=eq.${topicRow.id}&select=id,slug&order=order_index.asc`,
  })
  return { topicId: topicRow.id, subtopicIds: subtopics.map((item) => item.id) }
}

const subtopicPreference: Array<[RegExp, 'first' | 'second' | 'last']> = [
  [/fundamenty/, 'first'],
  [/zadania/, 'second'],
  [/matura/, 'last'],
]

function pickSubtopic(lessonSlug: string, subtopicIds: string[]): string | null {
  if (!subtopicIds.length) return null
  const rule = subtopicPreference.find(([pattern]) => pattern.test(lessonSlug))?.[1] ?? 'first'
  if (rule === 'first') return subtopicIds[0]
  if (rule === 'second') return subtopicIds[1] ?? subtopicIds[0]
  return subtopicIds[subtopicIds.length - 1]
}

async function importSkills(): Promise<Map<string, string>> {
  const skillIdBySlug = new Map<string, string>()
  const rows = new Map<string, { slug: string; name: string; description: string; level: LearningLevel; difficulty: number }>()
  for (const topic of authoredTopics) {
    for (const lesson of topic.lessons) {
      for (const skill of lesson.skills) {
        rows.set(skill.slug, { slug: skill.slug, name: skill.name, description: skill.description, level: skill.level, difficulty: lesson.difficulty })
      }
    }
  }
  for (const skill of rows.values()) {
    const saved = await upsertBySlug<{ id: string }>('skills', skill.slug, skill)
    skillIdBySlug.set(skill.slug, saved.id)
  }
  console.log(`✓ Umiejętności: ${skillIdBySlug.size}`)
  return skillIdBySlug
}

async function importRequirements(skillIdBySlug: Map<string, string>) {
  for (const requirement of ckeRequirements) {
    const row = {
      code: requirement.code,
      level: requirement.level,
      title: requirement.title,
      description: requirement.description,
      mapped_skill_id: requirement.skillSlug ? skillIdBySlug.get(requirement.skillSlug) ?? null : null,
      coverage_status: requirement.status,
    }
    await rest('cke_requirements', {
      method: 'POST',
      query: '?on_conflict=code',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: [row],
    })
  }
  console.log(`✓ Wymagania CKE: ${ckeRequirements.length} (z umiejętnością: ${ckeRequirements.filter((item) => item.skillSlug).length})`)
}

async function importLesson(topicId: string, topicLevel: LearningLevel, subtopicId: string | null, lesson: ContentLesson, orderIndex: number, skillIdBySlug: Map<string, string>) {
  const saved = await upsertBySlug<{ id: string }>('lessons', lesson.slug, {
    topic_id: topicId,
    subtopic_id: subtopicId,
    title: lesson.title,
    slug: lesson.slug,
    content: lessonPlainText(lesson.blocks),
    difficulty: lesson.difficulty,
    estimated_minutes: lesson.durationMinutes,
    order_index: orderIndex,
    published: true,
    objectives: lesson.objectives,
  })

  await rest('lesson_sections', { method: 'DELETE', query: `?lesson_id=eq.${saved.id}` })
  const [section] = await rest<Array<{ id: string }>>('lesson_sections', {
    method: 'POST',
    prefer: RETURN_ONE,
    body: [{ lesson_id: saved.id, title: 'Treść lekcji', order_index: 0 }],
  })
  await rest('lesson_blocks', {
    method: 'POST',
    prefer: RETURN_ONE,
    body: lesson.blocks.map((block, index) => ({
      section_id: section.id,
      block_type: block.type,
      content: { title: block.title ?? null, body: block.body, formula: block.formula ?? null, figure: block.figure ?? null },
      order_index: index,
    })),
  })

  await rest('lesson_skills', { method: 'DELETE', query: `?lesson_id=eq.${saved.id}` })
  const skillRows = lesson.skills
    .map((skill) => skillIdBySlug.get(skill.slug))
    .filter((id): id is string => Boolean(id))
    .map((skillId) => ({ lesson_id: saved.id, skill_id: skillId }))
  if (skillRows.length) await rest('lesson_skills', { method: 'POST', prefer: 'return=minimal', body: skillRows })

  const chunks = lesson.blocks.flatMap((block, index) =>
    chunkBody(block.body).map((content, part) => ({
      title: `${lesson.title} · ${block.title ?? block.type}${part ? ` (${part + 1})` : ''}`,
      content: `${block.formula ? `Wzór: ${block.formula}\n\n` : ''}${content}`,
      metadata: { level: topicLevel, lesson: lesson.slug, block: block.type, order: index },
    })),
  )
  await replaceKnowledgeChunks('lesson', saved.id, chunks)

  return saved.id
}

async function importTask(topicId: string, topicSlug: string, level: LearningLevel, subtopicId: string | null, lessonId: string | null, task: ContentTask, skillIdBySlug: Map<string, string>, existingId?: string) {
  const options = task.options ? `\n\nOpcje:\n${task.options.map((option, index) => `${'ABCD'[index]}) ${option}`).join('\n')}` : ''
  const row = {
    topic_id: topicId,
    subtopic_id: subtopicId,
    lesson_id: lessonId,
    title: plainText(task.prompt).slice(0, 120),
    question_text: `${task.prompt}${options}`,
    question_type: task.type,
    level: task.level ?? level,
    difficulty: task.difficulty,
    points: task.points,
    estimated_minutes: 2 + task.difficulty * 2,
    correct_answer: task.answer,
    solution_text: task.solution,
    source_type: task.sourceType ?? 'authored',
    source_name: task.sourceName ?? 'MATHEON',
    source_year: task.sourceYear ?? null,
    published: true,
    skills: task.skills,
    tags: [...task.tags, topicSlug],
    validation_status: 'published',
    validation_metadata: {
      code: task.id,
      topic: topicSlug,
      lesson: task.lessonSlug ?? null,
      acceptedAnswers: task.acceptedAnswers ?? [],
      options: task.options ?? [],
      steps: task.steps,
      rubric: task.rubric ?? [],
      figure: task.figure ?? null,
    },
  }

  let questionId = existingId
  if (questionId) {
    await rest('questions', { method: 'PATCH', query: `?id=eq.${questionId}`, prefer: 'return=minimal', body: row })
  } else {
    const rows = await rest<Array<{ id: string }>>('questions', { method: 'POST', prefer: RETURN_ONE, body: [row] })
    questionId = rows[0]?.id
  }
  if (!questionId) throw new Error(`Nie udało się zapisać zadania ${task.id}.`)

  await rest('hints', { method: 'DELETE', query: `?question_id=eq.${questionId}` })
  if (task.hints.length) {
    await rest('hints', {
      method: 'POST',
      prefer: 'return=minimal',
      body: task.hints.slice(0, 4).map((hint, index) => ({ question_id: questionId, hint_level: index + 1, content: hint, order_index: index })),
    })
  }

  await rest('solutions', { method: 'DELETE', query: `?question_id=eq.${questionId}` })
  await rest('solutions', {
    method: 'POST',
    prefer: 'return=minimal',
    body: [{ question_id: questionId, content: `${task.solution}\n\nKroki:\n${task.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}` }],
  })

  await rest('question_skills', { method: 'DELETE', query: `?question_id=eq.${questionId}` })
  const skillRows = task.skills
    .map((slug) => skillIdBySlug.get(slug))
    .filter((id): id is string => Boolean(id))
    .map((skillId) => ({ question_id: questionId, skill_id: skillId, weight: 1 }))
  if (skillRows.length) await rest('question_skills', { method: 'POST', prefer: 'return=minimal', body: skillRows })

  await replaceKnowledgeChunks('question', questionId, [
    {
      title: `Zadanie ${task.id}`,
      content: `Treść: ${task.prompt}\n\nOdpowiedź: ${task.answer}\n\nRozwiązanie: ${task.solution}`,
      metadata: { level: task.level ?? level, topic: topicSlug, code: task.id, difficulty: task.difficulty },
    },
  ])

  return questionId
}

async function main() {
  console.log(`Import treści → ${SUPABASE_URL}`)
  const skillIdBySlug = await importSkills()
  await importRequirements(skillIdBySlug)

  const summary: string[] = []

  for (const topic of authoredTopics) {
    const { topicId, subtopicIds } = await ensureTopic(topic.level, topic)

    const lessonIds = new Map<string, string>()
    for (const [index, lesson] of topic.lessons.entries()) {
      const subtopicId = pickSubtopic(lesson.slug, subtopicIds)
      lessonIds.set(lesson.slug, await importLesson(topicId, topic.level, subtopicId, lesson, index, skillIdBySlug))
    }

    const tasks = authoredTasks.filter((task) => task.topicSlug === topic.slug)
    const existing = await rest<Array<{ id: string; validation_metadata: { code?: string } }>>('questions', {
      query: `?topic_id=eq.${topicId}&select=id,validation_metadata&validation_metadata->>topic=eq.${topic.slug}`,
    })
    const existingByCode = new Map(existing.map((row) => [row.validation_metadata?.code ?? '', row.id]))

    await Promise.all(tasks.map(async (task) => {
      const lessonSlug = task.lessonSlug
      const lessonId = lessonSlug ? lessonIds.get(lessonSlug) ?? null : null
      const lesson = topic.lessons.find((item) => item.slug === lessonSlug)
      const subtopicId = lesson ? pickSubtopic(lesson.slug, subtopicIds) : subtopicIds[0] ?? null
      return importTask(topicId, topic.slug, topic.level, subtopicId, lessonId, task, skillIdBySlug, existingByCode.get(task.id))
    }))

    summary.push(`${topic.title} (${topic.level}): ${topic.lessons.length} lekcji, ${tasks.length} zadań`)
  }

  console.log('')
  for (const line of summary) console.log(`✓ ${line}`)

  const totalTasks = authoredTasks.length
  const totalLessons = authoredTopics.reduce((sum, topic) => sum + topic.lessons.length, 0)
  console.log(`\nGotowe: ${totalLessons} lekcji i ${totalTasks} zadań opublikowanych.`)

  // RAG tutora (Faza 4): nowe fragmenty wiedzy dostają wektory od razu.
  if (embeddingsConfigured()) {
    const embeddings = await backfillKnowledgeEmbeddings()
    console.log(`✓ Embeddingi RAG: ${embeddings.embedded} nowych fragmentów, bez wektora: ${embeddings.remaining}`)
  } else {
    console.log('i Brak AI_GATEWAY_API_KEY — fragmenty wiedzy czekają na wektory (`pnpm content:embed`).')
  }
}

main().catch((error) => {
  console.error('\nImport nie powiódł się:', error instanceof Error ? error.message : error)
  process.exit(1)
})
