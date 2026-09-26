import type { GeneratedPlanItem } from './generateStudyPlan'

export function scheduleActivity(item: GeneratedPlanItem, scheduledDate: string): GeneratedPlanItem { return { ...item, scheduledDate, status: 'pending' } }
