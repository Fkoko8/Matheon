export interface PriorityInput { mastery: number; mistakeCount: number; overdueDays: number; examWeakness: number; prerequisite: boolean; daysToExam: number | null; lastActivityDays: number }

export function calculatePriority(input: PriorityInput): number {
  const masteryScore = Math.max(0, 100 - input.mastery) * 0.42
  const mistakeScore = Math.min(30, input.mistakeCount * 8)
  const overdueScore = Math.min(28, Math.max(0, input.overdueDays) * 7)
  const examScore = input.examWeakness * 0.2
  const prerequisiteScore = input.prerequisite ? 8 : 0
  const deadlineScore = input.daysToExam === null ? 0 : Math.max(0, 21 - input.daysToExam) * 1.5
  const recencyScore = Math.min(10, input.lastActivityDays * 1.5)
  return Math.round(masteryScore + mistakeScore + overdueScore + examScore + prerequisiteScore + deadlineScore + recencyScore)
}
