import type { PlannerConfig } from './generateStudyPlan'
import { generateStudyPlan, type GeneratedPlanItem } from './generateStudyPlan'

export function rebalanceStudyPlan(items: GeneratedPlanItem[], config: PlannerConfig, today = new Date().toISOString().slice(0, 10)) { const completed = items.filter((item) => item.status === 'completed'); const pending = items.filter((item) => item.status !== 'completed' && item.scheduledDate < today); const future = items.filter((item) => item.status !== 'completed' && item.scheduledDate >= today); const rebuilt = generateStudyPlan(pending.length ? pending : future, { ...config, startDate: today }).items; return [...completed, ...rebuilt] }
