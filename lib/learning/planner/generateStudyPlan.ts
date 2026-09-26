import { calculatePriority } from './calculatePriority'

export type PlannerActivityType = 'lesson' | 'training' | 'review' | 'mistakes' | 'exam' | 'exam_analysis' | 'AI_session'
export interface PlannerConfig { goal: 'basic' | 'extended' | 'both'; targetScore: number; examDate: string | null; dailyMinutes: number; studyDays: number[]; sessionMinutes: number; startDate?: string; horizonDays?: number }
export interface PlannerDiagnostic { currentMastery: number; weakestAreas: { id: string; name: string; mastery: number }[]; mostUrgent: string | null; reason: string }
export interface PlannerCandidate { id: string; topicId?: string; title: string; description: string; activityType: PlannerActivityType; estimatedMinutes: number; mastery: number; mistakeCount: number; overdueDays: number; examWeakness: number; prerequisite?: boolean; sourceType?: string; sourceId?: string; }
export interface GeneratedPlanItem extends PlannerCandidate { scheduledDate: string; priority: number; reason: string; status: 'pending' | 'completed' | 'skipped' }

const isoDate = (date: Date) => date.toISOString().slice(0, 10)
const daysBetween = (a: string, b: string | null) => b ? Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000) : null

export function buildDiagnostic(candidates: PlannerCandidate[], today = isoDate(new Date())): PlannerDiagnostic {
  const topicMap = new Map<string, { name: string; mastery: number }>()
  candidates.forEach((candidate) => { if (candidate.topicId && !topicMap.has(candidate.topicId)) topicMap.set(candidate.topicId, { name: candidate.title, mastery: candidate.mastery }) })
  const weakestAreas = [...topicMap.entries()].map(([id, item]) => ({ id, ...item })).sort((a, b) => a.mastery - b.mastery).slice(0, 3)
  const currentMastery = candidates.length ? Math.round(candidates.reduce((sum, item) => sum + item.mastery, 0) / candidates.length) : 0
  const urgent = [...candidates].sort((a, b) => calculatePriority({ mastery: b.mastery, mistakeCount: b.mistakeCount, overdueDays: b.overdueDays, examWeakness: b.examWeakness, prerequisite: b.prerequisite ?? false, daysToExam: null, lastActivityDays: 0 }) - calculatePriority({ mastery: a.mastery, mistakeCount: a.mistakeCount, overdueDays: a.overdueDays, examWeakness: a.examWeakness, prerequisite: a.prerequisite ?? false, daysToExam: null, lastActivityDays: 0 }))[0]
  return { currentMastery, weakestAreas, mostUrgent: urgent?.title ?? null, reason: urgent ? `Mastery ${urgent.mastery}% + ${urgent.mistakeCount} nierozwiązanych błędów.` : 'Dodaj dane nauki, aby otrzymać diagnozę.' }
}

export function generateStudyPlan(candidates: PlannerCandidate[], config: PlannerConfig): { diagnostic: PlannerDiagnostic; items: GeneratedPlanItem[] } {
  const start = new Date(config.startDate ?? isoDate(new Date()) + 'T12:00:00')
  const horizon = config.horizonDays ?? 28
  const diagnostic = buildDiagnostic(candidates, isoDate(start))
  const ranked = candidates.map((candidate) => ({ candidate, priority: calculatePriority({ mastery: candidate.mastery, mistakeCount: candidate.mistakeCount, overdueDays: candidate.overdueDays, examWeakness: candidate.examWeakness, prerequisite: candidate.prerequisite ?? false, daysToExam: daysBetween(isoDate(start), config.examDate), lastActivityDays: candidate.overdueDays }) })).sort((a, b) => b.priority - a.priority)
  const items: GeneratedPlanItem[] = []
  let rank = 0
  for (let offset = 0; offset < horizon && ranked.length; offset += 1) {
    const day = new Date(start); day.setDate(day.getDate() + offset)
    const weekday = day.getDay() || 7
    if (!config.studyDays.includes(weekday)) continue
    let remaining = config.dailyMinutes
    while (remaining >= 10 && ranked.length) {
      const { candidate, priority } = ranked[rank % ranked.length]
      const minutes = Math.min(candidate.estimatedMinutes, config.sessionMinutes, remaining)
      if (minutes < 10) break
      const type = candidate.activityType
      const reason = candidate.overdueDays > 0 ? `Powtórka jest zaległa o ${candidate.overdueDays} dni.` : candidate.mistakeCount > 0 ? `${candidate.mistakeCount} nierozwiązanych błędów wymaga analizy.` : `Mastery jest obecnie na poziomie ${candidate.mastery}%.`
      items.push({ ...candidate, estimatedMinutes: minutes, scheduledDate: isoDate(day), priority, reason, status: 'pending' })
      remaining -= minutes; rank += 1
      if (type === 'exam') break
    }
  }
  return { diagnostic, items }
}
