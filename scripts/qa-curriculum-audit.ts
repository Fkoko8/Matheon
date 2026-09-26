/**
 * Audyt kompletności sekcji Nauka (bez dostępu do bazy).
 *
 * Odpowiada na pytanie „czy wszystkie działy są opisane wyczerpująco” liczbami,
 * a nie wrażeniem. Sprawdza:
 *  1. grubość treści: lekcje, bloki, bloki na lekcję, obecność kluczowych typów bloków,
 *  2. pokrycie: czy każda umiejętność działu ma zadania i czy każdy dział ma bank zadań,
 *  3. spójność referencji: zadania → umiejętności lekcji, wymagania CKE → działy,
 *  4. status wymagań CKE (planned / mapped / lesson_ready / published).
 *
 * Twarde błędy (osierocone referencje) kończą się kodem 1; braki treści są raportowane
 * jako ostrzeżenia, bo to one wyznaczają kolejkę pracy redakcyjnej.
 *
 * Uruchomienie: `pnpm qa:curriculum` (bez .env).
 */
import { authoredTasks, authoredTopics, ckeRequirements } from '@/content'
import { curriculum } from '@/lib/learning/curriculum'

const THIN_LESSON_BLOCKS = 6
const WANTED_BLOCK_TYPES = ['formula', 'example', 'warning', 'summary'] as const

let hardFailures = 0
const warnings: string[] = []

function fail(message: string) {
  hardFailures += 1
  console.log(`FAIL  ${message}`)
}

function warn(message: string) {
  warnings.push(message)
}

function pad(value: string | number, width: number): string {
  return String(value).padEnd(width)
}

/* ---------------------------- 1. Grubość treści ---------------------------- */

console.log('=== Działy autorskie: grubość treści ===')
console.log(`${pad('dział', 16)} ${pad('lekcje', 7)} ${pad('bloki', 6)} ${pad('bloki/lek', 10)} ${pad('umiejęt.', 9)} ${pad('zadania', 8)} braki`)

for (const topic of authoredTopics) {
  const blocks = topic.lessons.reduce((sum, lesson) => sum + lesson.blocks.length, 0)
  const skills = topic.lessons.flatMap((lesson) => lesson.skills)
  const tasks = authoredTasks.filter((task) => task.topicSlug === topic.slug)

  const gaps: string[] = []
  const thinLessons = topic.lessons.filter((lesson) => lesson.blocks.length < THIN_LESSON_BLOCKS)
  if (thinLessons.length) gaps.push(`cienkie lekcje: ${thinLessons.map((lesson) => `${lesson.slug}(${lesson.blocks.length})`).join(', ')}`)

  const presentTypes = new Set(topic.lessons.flatMap((lesson) => lesson.blocks.map((block) => block.type)))
  const missingTypes = WANTED_BLOCK_TYPES.filter((type) => !presentTypes.has(type))
  if (missingTypes.length) gaps.push(`brak bloków: ${missingTypes.join(', ')}`)

  if (!tasks.length) gaps.push('brak zadań')

  const taskSkillSlugs = new Set(tasks.flatMap((task) => task.skills))
  const uncoveredSkills = skills.filter((skill) => !taskSkillSlugs.has(skill.slug))
  if (uncoveredSkills.length) gaps.push(`umiejętności bez zadań: ${uncoveredSkills.map((skill) => skill.slug).join(', ')}`)

  console.log(
    `${pad(topic.slug, 16)} ${pad(topic.lessons.length, 7)} ${pad(blocks, 6)} ${pad(Math.round((blocks / Math.max(1, topic.lessons.length)) * 10) / 10, 10)} ${pad(skills.length, 9)} ${pad(tasks.length, 8)} ${gaps.length ? gaps.join(' | ') : 'OK'}`,
  )

  if (gaps.length) warn(`${topic.slug}: ${gaps.join(' | ')}`)
}

/* ---------------------- 2. Pokrycie programu lekcjami ---------------------- */

console.log('\n=== Program (z szablonami): działy bez pełnej treści ===')
const templateTopics = curriculum.filter((topic) => !topic.authored)
for (const topic of templateTopics) {
  console.log(`BRAK TREŚCI  ${pad(topic.slug, 16)} ${topic.title} — ${topic.lessons.length} lekcje z szablonu`)
}
if (!templateTopics.length) console.log('OK  każdy dział programu ma autorską treść')
console.log(`Działy: ${authoredTopics.length} z treścią / ${curriculum.length} w programie`)

/* --------------------------- 3. Spójność referencji --------------------------- */

console.log('\n=== Spójność referencji ===')
const authoredSlugs = new Set(authoredTopics.map((topic) => topic.slug))
const curriculumSkills = new Map<string, string>()
for (const topic of authoredTopics) {
  for (const lesson of topic.lessons) {
    for (const skill of lesson.skills) curriculumSkills.set(skill.slug, topic.slug)
  }
}

for (const task of authoredTasks) {
  if (!authoredSlugs.has(task.topicSlug)) fail(`zadanie ${task.id} wskazuje nieistniejący dział „${task.topicSlug}”`)
  for (const skill of task.skills) {
    if (!curriculumSkills.has(skill)) fail(`zadanie ${task.id} wskazuje nieistniejącą umiejętność „${skill}”`)
    else if (curriculumSkills.get(skill) !== task.topicSlug) {
      fail(`zadanie ${task.id} (dział ${task.topicSlug}) używa umiejętności „${skill}” z działu „${curriculumSkills.get(skill)}”`)
    }
  }
  if (task.lessonSlug && !authoredTopics.find((topic) => topic.slug === task.topicSlug)?.lessons.some((lesson) => lesson.slug === task.lessonSlug)) {
    fail(`zadanie ${task.id} wskazuje nieistniejącą lekcję „${task.lessonSlug}”`)
  }
}

for (const requirement of ckeRequirements) {
  if (!authoredSlugs.has(requirement.topicSlug)) fail(`wymaganie ${requirement.code} wskazuje nieistniejący dział „${requirement.topicSlug}”`)
  if (requirement.skillSlug && !curriculumSkills.has(requirement.skillSlug)) {
    fail(`wymaganie ${requirement.code} wskazuje nieistniejącą umiejętność „${requirement.skillSlug}”`)
  }
}

const duplicateSkillSlugs = new Map<string, number>()
for (const slug of curriculumSkills.keys()) duplicateSkillSlugs.set(slug, (duplicateSkillSlugs.get(slug) ?? 0) + 1)
const repeated = [...duplicateSkillSlugs.entries()].filter(([, count]) => count > 1)
if (repeated.length) fail(`powtórzone slugi umiejętności: ${repeated.map(([slug]) => slug).join(', ')}`)

const duplicateTaskIds = authoredTasks.map((task) => task.id).filter((id, index, all) => all.indexOf(id) !== index)
if (duplicateTaskIds.length) fail(`powtórzone identyfikatory zadań: ${[...new Set(duplicateTaskIds)].join(', ')}`)
else console.log(`OK  ${authoredTasks.length} zadań, ${curriculumSkills.size} umiejętności, brak osieroconych referencji`)

/* ----------------------------- 4. Wymagania CKE ----------------------------- */

console.log('\n=== Wymagania CKE ===')
const byStatus = new Map<string, number>()
for (const requirement of ckeRequirements) byStatus.set(requirement.status, (byStatus.get(requirement.status) ?? 0) + 1)
const statusLine = [...byStatus.entries()].map(([status, count]) => `${status}: ${count}`).join(' · ')
console.log(statusLine)

const unfinished = ckeRequirements.filter((requirement) => requirement.status === 'planned' || requirement.status === 'mapped')
if (unfinished.length) {
  console.log('Do opracowania:')
  for (const requirement of unfinished) console.log(`  ${requirement.code} (${requirement.level}) ${requirement.topicSlug} — ${requirement.title} [${requirement.status}]`)
  warn(`${unfinished.length} wymagań CKE bez gotowej lekcji`)
}

const unmappedByTopic = [...authoredTopics]
  .map((topic) => ({ slug: topic.slug, count: ckeRequirements.filter((requirement) => requirement.topicSlug === topic.slug && requirement.skillSlug).length }))
  .filter((entry) => entry.count === 0)
if (unmappedByTopic.length) warn(`działy bez żadnego wymagania CKE wskazującego umiejętność: ${unmappedByTopic.map((entry) => entry.slug).join(', ')}`)

/* --------------------------------- Podsumowanie --------------------------------- */

console.log('\n=== Podsumowanie ===')
if (warnings.length) {
  console.log(`Ostrzeżenia (${warnings.length}):`)
  for (const message of warnings) console.log(`  WARN  ${message}`)
}
console.log(`Błędy twarde: ${hardFailures}`)

if (hardFailures > 0) process.exit(1)
console.log('\nAudyt zakończony bez błędów twardych.')
