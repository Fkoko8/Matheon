import { describe, expect, it } from 'vitest'
import { emptyAchievementStats, isSatisfied, type AchievementStats } from '@/lib/learning/achievements'

const base: AchievementStats = { ...emptyAchievementStats(), streak: 0 }

describe('reguły osiągnięć', () => {
  it('answers — próg liczby odpowiedzi', () => {
    expect(isSatisfied('answers', 1, { ...base, answers: 1 })).toBe(true)
    expect(isSatisfied('answers', 100, { ...base, answers: 99 })).toBe(false)
  })

  it('correct_streak — najdłuższa seria poprawnych', () => {
    expect(isSatisfied('correct_streak', 10, { ...base, correctStreak: 10 })).toBe(true)
    expect(isSatisfied('correct_streak', 10, { ...base, correctStreak: 9 })).toBe(false)
  })

  it('mastery — próg opanowania umiejętności', () => {
    expect(isSatisfied('mastery', 80, { ...base, bestSkillMastery: 80 })).toBe(true)
    expect(isSatisfied('mastery', 80, { ...base, bestSkillMastery: 79 })).toBe(false)
  })

  it('streak — seria dni z profilu', () => {
    expect(isSatisfied('streak', 7, { ...base, streak: 8 })).toBe(true)
    expect(isSatisfied('streak', 7, { ...base, streak: 6 })).toBe(false)
  })

  it('lessons — liczba otwartych lekcji', () => {
    expect(isSatisfied('lessons', 5, { ...base, lessonsOpened: 5 })).toBe(true)
    expect(isSatisfied('lessons', 5, { ...base, lessonsOpened: 4 })).toBe(false)
  })

  it('nieznany typ reguły nigdy nie jest spełniony', () => {
    expect(isSatisfied('nieistniejacy', 1, { ...base, answers: 1000 })).toBe(false)
  })
})
