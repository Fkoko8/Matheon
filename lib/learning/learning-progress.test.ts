import { describe, expect, it } from 'vitest'
import { buildLearningProgress, buildTopicProgress, curriculumCoverage, LESSON_COMPLETE_MASTERY } from './learning-progress'
import type { CurriculumLesson, CurriculumTopic } from './curriculum'
import type { SkillRow } from './skill-state'
import type { SkillReviewState } from './skill-model'

const NOW = new Date('2026-01-10T12:00:00.000Z')
const PAST = '2026-01-05T00:00:00.000Z'
const FUTURE = '2026-02-01T00:00:00.000Z'

function lesson(slug: string, skillSlugs: string[]): CurriculumLesson {
  return {
    slug,
    title: slug,
    duration: 20,
    difficulty: 1,
    objectives: [],
    blocks: [],
    taskCount: 1,
    skills: skillSlugs.map((skill) => ({ slug: skill, name: skill, description: '', level: 'basic' as const, mastery: 0 })),
  }
}

const topic: CurriculumTopic = {
  slug: 'demo',
  title: 'Demo',
  description: '',
  level: 'basic',
  mastery: 0,
  authored: true,
  taskCount: 2,
  durationMinutes: 40,
  lessons: [lesson('demo-a', ['a1', 'a2']), lesson('demo-b', ['b1', 'b2'])],
}

const catalog = new Map<string, SkillRow>(
  ['a1', 'a2', 'b1', 'b2'].map((slug) => [slug, { id: slug, slug, name: slug, level: 'basic' as const, difficulty: 1 }]),
)

function state(skillId: string, mastery: number, dueAt: string): SkillReviewState {
  return {
    skillId,
    mastery,
    ease: 2.5,
    intervalDays: 1,
    repetitions: 1,
    lapses: 0,
    attempts: 2,
    correct: 2,
    dueAt,
    lastPracticedAt: '2026-01-08T00:00:00.000Z',
  }
}

describe('buildTopicProgress', () => {
  it('bez odpowiedzi pokazuje zera i wskazuje pierwszą lekcję jako następny krok', () => {
    const progress = buildTopicProgress(topic, catalog, new Map(), NOW)
    expect(progress.mastery).toBe(0)
    expect(progress.practisedSkills).toBe(0)
    expect(progress.totalSkills).toBe(4)
    expect(progress.started).toBe(false)
    expect(progress.completed).toBe(false)
    expect(progress.nextLessonSlug).toBe('demo-a')
    expect(progress.nextDueAt).toBeNull()
    expect(progress.lastPracticedAt).toBeNull()
  })

  it('lekcja z wszystkimi umiejętnościami powyżej progu jest ukończona', () => {
    const states = new Map([
      ['a1', state('a1', 90, FUTURE)],
      ['a2', state('a2', 80, FUTURE)],
    ])
    const progress = buildTopicProgress(topic, catalog, states, NOW)
    expect(progress.lessons[0].completed).toBe(true)
    expect(progress.lessons[0].started).toBe(true)
    expect(progress.lessons[0].mastery).toBe(85)
    expect(progress.lessons[1].completed).toBe(false)
    expect(progress.nextLessonSlug).toBe('demo-b')
    expect(progress.mastery).toBe(85)
    expect(progress.practisedSkills).toBe(2)
  })

  it('słaba lekcja pozostaje „następnym krokiem”, mimo że jest zaczęta', () => {
    const states = new Map([['a1', state('a1', 40, FUTURE)]])
    const progress = buildTopicProgress(topic, catalog, states, NOW)
    expect(progress.lessons[0].started).toBe(true)
    expect(progress.lessons[0].completed).toBe(false)
    expect(progress.nextLessonSlug).toBe('demo-a')
    expect(progress.weakSkills).toBe(1)
  })

  it('dokładnie na progu uznaje lekcję za ukończoną', () => {
    const states = new Map([
      ['a1', state('a1', LESSON_COMPLETE_MASTERY, FUTURE)],
      ['a2', state('a2', LESSON_COMPLETE_MASTERY, FUTURE)],
    ])
    expect(buildTopicProgress(topic, catalog, states, NOW).lessons[0].completed).toBe(true)
  })

  it('liczy zaległe powtórki i najbliższy termin', () => {
    const states = new Map([
      ['a1', state('a1', 80, PAST)],
      ['a2', state('a2', 80, FUTURE)],
    ])
    const progress = buildTopicProgress(topic, catalog, states, NOW)
    expect(progress.dueSkills).toBe(1)
    expect(progress.lessons[0].dueSkills).toBe(1)
    expect(progress.nextDueAt).toBe(PAST)
    expect(progress.lastPracticedAt).toBe('2026-01-08T00:00:00.000Z')
  })

  it('gdy wszystko ukończone, nie ma następnego kroku', () => {
    const states = new Map([
      ['a1', state('a1', 80, FUTURE)],
      ['a2', state('a2', 80, FUTURE)],
      ['b1', state('b1', 80, FUTURE)],
      ['b2', state('b2', 80, FUTURE)],
    ])
    const progress = buildTopicProgress(topic, catalog, states, NOW)
    expect(progress.completed).toBe(true)
    expect(progress.nextLessonSlug).toBeNull()
  })

  it('nieznane umiejętności (brak w katalogu) traktuje jak nietknięte', () => {
    const partialCatalog = new Map([['a1', { id: 'a1', slug: 'a1', name: 'a1', level: 'basic' as const, difficulty: 1 }]])
    const progress = buildTopicProgress(topic, partialCatalog, new Map([['a1', state('a1', 90, FUTURE)]]), NOW)
    expect(progress.totalSkills).toBe(4)
    expect(progress.practisedSkills).toBe(1)
    expect(progress.lessons[0].completed).toBe(false)
  })
})

describe('buildLearningProgress', () => {
  it('zwraca mapę po slugu działu', () => {
    const progress = buildLearningProgress([topic], catalog, new Map(), NOW)
    expect([...progress.keys()]).toEqual(['demo'])
    expect(progress.get('demo')?.nextLessonSlug).toBe('demo-a')
  })
})

describe('curriculumCoverage', () => {
  it('opisuje program działami, lekcjami i zadaniami', () => {
    const coverage = curriculumCoverage()
    expect(coverage.topics).toBeGreaterThan(15)
    expect(coverage.lessons).toBeGreaterThan(coverage.authoredLessons - 1)
    expect(coverage.tasks).toBeGreaterThan(250)
    expect(coverage.minutes).toBeGreaterThan(500)
  })
})
