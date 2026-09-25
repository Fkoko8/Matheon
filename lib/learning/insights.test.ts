import { describe, expect, it } from 'vitest'
import { buildMasteryTrend } from './insights'
import type { AnswerHistoryEntry } from './skill-state'

function entry(skillId: string, at: string, isCorrect = true, hintsUsed = 0): AnswerHistoryEntry {
  return { skillId, grade: isCorrect ? 5 : 1, evidence: { isCorrect, hintsUsed, timeSeconds: 0 }, at }
}

const NOW = new Date('2026-01-10T12:00:00.000Z')

describe('buildMasteryTrend', () => {
  it('liczy stan na koniec każdego dnia i osobno liczbę odpowiedzi', () => {
    const history = [
      entry('a', '2026-01-08T10:00:00.000Z'),
      entry('a', '2026-01-09T09:00:00.000Z'),
      entry('b', '2026-01-10T08:00:00.000Z', false),
    ]

    expect(buildMasteryTrend(history, 3, NOW)).toEqual([
      { date: '2026-01-08', mastery: 35, answers: 1 },
      { date: '2026-01-09', mastery: 58, answers: 1 },
      { date: '2026-01-10', mastery: 29, answers: 1 },
    ])
  })

  it('starsze odpowiedzi budują stan, ale nie wchodzą do aktywności okna', () => {
    const trend = buildMasteryTrend([entry('a', '2026-01-01T10:00:00.000Z')], 2, NOW)
    expect(trend).toEqual([
      { date: '2026-01-09', mastery: 35, answers: 0 },
      { date: '2026-01-10', mastery: 35, answers: 0 },
    ])
  })

  it('bez historii zwraca same zera', () => {
    const trend = buildMasteryTrend([], 2, NOW)
    expect(trend.map((point) => point.mastery)).toEqual([0, 0])
    expect(trend.map((point) => point.answers)).toEqual([0, 0])
  })

  it('dni bez pracy mają zero odpowiedzi, a nie brak punktu', () => {
    const trend = buildMasteryTrend([entry('a', '2026-01-10T08:00:00.000Z')], 5, NOW)
    expect(trend).toHaveLength(5)
    expect(trend.filter((point) => point.answers === 0)).toHaveLength(4)
  })

  it('dla zerowego okna nie liczy nic', () => {
    expect(buildMasteryTrend([entry('a', '2026-01-10T08:00:00.000Z')], 0, NOW)).toEqual([])
  })
})
