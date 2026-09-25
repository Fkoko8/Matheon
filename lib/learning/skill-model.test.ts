import { describe, expect, it } from 'vitest'
import {
  applyAnswer,
  applyEvidence,
  applyReview,
  clamp,
  daysUntilDue,
  decayedMastery,
  emptySkillState,
  evidenceWeight,
  gradeAnswer,
  isDue,
  masteryLabel,
  masteryLevel,
  replayState,
  sessionScore,
  type SkillReviewState,
} from './skill-model'

const AT = new Date('2026-01-01T00:00:00.000Z')
const DAY_MS = 24 * 60 * 60 * 1000

describe('clamp', () => {
  it('ogranicza wartość do przedziału', () => {
    expect(clamp(5, 1.3, 2.8)).toBe(2.8)
    expect(clamp(0, 1.3, 2.8)).toBe(1.3)
    expect(clamp(2, 1.3, 2.8)).toBe(2)
  })
})

describe('emptySkillState', () => {
  it('startuje z domyślnymi parametrami SM-2', () => {
    const state = emptySkillState('sk-1', AT)
    expect(state).toMatchObject({
      skillId: 'sk-1',
      mastery: 0,
      ease: 2.5,
      intervalDays: 0,
      repetitions: 0,
      lapses: 0,
      attempts: 0,
      correct: 0,
      dueAt: AT.toISOString(),
    })
  })
})

describe('gradeAnswer', () => {
  it('ocenia odpowiedź w skali 0–5', () => {
    expect(gradeAnswer({ isCorrect: false })).toBe(1)
    expect(gradeAnswer({ isCorrect: false, solutionViewed: true })).toBe(0)
    expect(gradeAnswer({ isCorrect: true, solutionViewed: true })).toBe(2)
    expect(gradeAnswer({ isCorrect: true, hintsUsed: 1 })).toBe(3)
    expect(gradeAnswer({ isCorrect: true, hintsUsed: 3 })).toBe(3)
    expect(gradeAnswer({ isCorrect: true, timeSeconds: 300 })).toBe(4)
    expect(gradeAnswer({ isCorrect: true, timeSeconds: 30 })).toBe(5)
    expect(gradeAnswer({ isCorrect: true })).toBe(5)
  })

  it('podpowiedź waży więcej niż wolne tempo', () => {
    expect(gradeAnswer({ isCorrect: true, hintsUsed: 1, timeSeconds: 400 })).toBe(3)
  })
})

describe('evidenceWeight', () => {
  it('nie podnosi mastery za błędną odpowiedź', () => {
    expect(evidenceWeight({ isCorrect: false })).toBeLessThan(0)
    expect(evidenceWeight({ isCorrect: false, solutionViewed: true })).toBeLessThan(0)
    expect(evidenceWeight({ isCorrect: false, solutionViewed: true })).toBeLessThan(evidenceWeight({ isCorrect: false }))
  })

  it('maleje wraz z użyciem pomocy', () => {
    expect(evidenceWeight({ isCorrect: true })).toBe(1)
    expect(evidenceWeight({ isCorrect: true, hintsUsed: 1 })).toBe(0.75)
    expect(evidenceWeight({ isCorrect: true, hintsUsed: 3 })).toBe(0.5)
    expect(evidenceWeight({ isCorrect: true, solutionViewed: true })).toBe(0.5)
  })
})

describe('applyReview (SM-2)', () => {
  it('rozbudowuje interwały: 1 → 6 → ease * poprzedni', () => {
    let state = emptySkillState('sk', AT)
    state = applyReview(state, 5, AT)
    expect(state.intervalDays).toBe(1)
    expect(state.repetitions).toBe(1)
    expect(state.ease).toBeCloseTo(2.6, 10)
    expect(state.dueAt).toBe(new Date(AT.getTime() + DAY_MS).toISOString())

    state = applyReview(state, 5, AT)
    expect(state.intervalDays).toBe(6)
    expect(state.repetitions).toBe(2)
    expect(state.ease).toBeCloseTo(2.7, 10)

    state = applyReview(state, 5, AT)
    expect(state.intervalDays).toBe(16) // round(6 * 2.7)
    expect(state.repetitions).toBe(3)
    expect(state.ease).toBeCloseTo(2.8, 10) // ograniczone do MAX_EASE

    state = applyReview(state, 5, AT)
    expect(state.intervalDays).toBe(45) // round(16 * 2.8)
    expect(state.ease).toBeCloseTo(2.8, 10)
  })

  it('wpadka zeruje serię i skraca interwał, obniżając łatwość', () => {
    let state = applyReview(emptySkillState('sk', AT), 5, AT)
    state = applyReview(state, 5, AT)
    state = applyReview(state, 2, AT)
    expect(state.repetitions).toBe(0)
    expect(state.intervalDays).toBe(1)
    expect(state.lapses).toBe(1)
    expect(state.ease).toBeCloseTo(2.38, 10) // 2.7 - 0.32
    expect(state.dueAt).toBe(new Date(AT.getTime() + DAY_MS).toISOString())
  })

  it('nie schodzi z łatwością poniżej MIN_EASE', () => {
    let state = emptySkillState('sk', AT)
    for (let i = 0; i < 12; i += 1) state = applyReview(state, 0, AT)
    expect(state.ease).toBe(1.3)
  })
})

describe('applyEvidence / applyAnswer', () => {
  it('mastery rośnie wykładniczo w stronę 100%', () => {
    let state = applyEvidence(emptySkillState('sk', AT), { isCorrect: true }, AT)
    expect(state.mastery).toBe(35)
    expect(state.attempts).toBe(1)
    expect(state.correct).toBe(1)

    state = applyEvidence(state, { isCorrect: true }, AT)
    expect(state.mastery).toBe(58)

    state = applyEvidence(state, { isCorrect: false }, AT)
    expect(state.mastery).toBe(36)
    expect(state.attempts).toBe(3)
    expect(state.correct).toBe(2)
  })

  it('applyAnswer łączy mastery i harmonogram', () => {
    const state = applyAnswer(emptySkillState('sk', AT), { isCorrect: true }, AT)
    expect(state.mastery).toBe(35)
    expect(state.intervalDays).toBe(1)
    expect(state.repetitions).toBe(1)
    expect(state.ease).toBeCloseTo(2.6, 10)
    expect(state.lastPracticedAt).toBe(AT.toISOString())
  })
})

describe('replayState', () => {
  it('odtwarza stan z historii ocen', () => {
    const state = replayState('sk', [
      { grade: 5, at: '2026-01-01T00:00:00.000Z' },
      { grade: 5, at: '2026-01-02T00:00:00.000Z' },
    ])
    expect(state.repetitions).toBe(2)
    expect(state.intervalDays).toBe(6)
  })

  it('przyjmuje też pełne dowody odpowiedzi', () => {
    const state = replayState('sk', [
      { grade: 5, evidence: { isCorrect: true }, at: '2026-01-01T00:00:00.000Z' },
      { grade: 1, evidence: { isCorrect: false }, at: '2026-01-02T00:00:00.000Z' },
    ])
    expect(state.attempts).toBe(2)
    expect(state.correct).toBe(1)
    expect(state.lapses).toBe(1)
  })

  it('pusta historia daje stan początkowy', () => {
    expect(replayState('sk', []).mastery).toBe(0)
  })
})

describe('decayedMastery', () => {
  const state: SkillReviewState = {
    ...emptySkillState('sk', AT),
    mastery: 80,
    attempts: 5,
    dueAt: '2026-01-01T00:00:00.000Z',
  }

  it('brak dowodów = brak mastery', () => {
    expect(decayedMastery(emptySkillState('sk', AT), AT)).toBe(0)
  })

  it('świeża umiejętność nie traci wartości', () => {
    expect(decayedMastery(state, new Date('2025-12-31T00:00:00.000Z'))).toBe(80)
  })

  it('zaległość obniża mastery o 1,5 pkt na dzień (max 30)', () => {
    expect(decayedMastery(state, new Date('2026-01-11T00:00:00.000Z'))).toBe(65)
    expect(decayedMastery(state, new Date('2026-06-01T00:00:00.000Z'))).toBe(50)
  })
})

describe('masteryLevel / masteryLabel', () => {
  it('mapuje progi na poziomy', () => {
    expect(masteryLevel(0)).toBe('not_learned')
    expect(masteryLevel(29)).toBe('not_learned')
    expect(masteryLevel(30)).toBe('beginner')
    expect(masteryLevel(49)).toBe('beginner')
    expect(masteryLevel(50)).toBe('developing')
    expect(masteryLevel(69)).toBe('developing')
    expect(masteryLevel(70)).toBe('strong')
    expect(masteryLevel(85)).toBe('mastered')
    expect(masteryLabel(90)).toBe('Opanowany')
    expect(masteryLabel('beginner')).toBe('Początkujący')
  })
})

describe('daysUntilDue / isDue', () => {
  const state: SkillReviewState = { ...emptySkillState('sk', AT), attempts: 1, dueAt: '2026-01-11T00:00:00.000Z' }

  it('liczy dni do terminu', () => {
    expect(daysUntilDue(state, AT)).toBe(10)
    expect(daysUntilDue(state, new Date('2026-01-12T00:00:00.000Z'))).toBe(-1)
  })

  it('bez dowodów nigdy nie jest zaległe', () => {
    expect(isDue(emptySkillState('sk', AT), new Date('2030-01-01T00:00:00.000Z'))).toBe(false)
  })

  it('zaległe po terminie', () => {
    expect(isDue(state, AT)).toBe(false)
    expect(isDue(state, new Date('2026-01-11T00:00:00.000Z'))).toBe(true)
  })
})

describe('sessionScore', () => {
  it('liczy procent zdobytych punktów', () => {
    expect(sessionScore([])).toBe(0)
    expect(
      sessionScore([
        { isCorrect: true, points: 2, earned: 2 },
        { isCorrect: false, points: 3, earned: 0 },
      ]),
    ).toBe(40)
    expect(sessionScore([{ isCorrect: true, points: 1, earned: 1 }])).toBe(100)
  })

  it('ignoruje zadania bez punktów', () => {
    expect(sessionScore([{ isCorrect: true, points: 0, earned: 0 }])).toBe(0)
  })
})
