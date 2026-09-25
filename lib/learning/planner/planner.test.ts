import { describe, expect, it } from 'vitest'
import { calculatePriority, type PriorityInput } from './calculatePriority'
import { buildDiagnostic, generateStudyPlan, type PlannerCandidate, type PlannerConfig } from './generateStudyPlan'
import { scheduleActivity } from './scheduleActivity'

const baseInput: PriorityInput = {
  mastery: 0,
  mistakeCount: 0,
  overdueDays: 0,
  examWeakness: 0,
  prerequisite: false,
  daysToExam: null,
  lastActivityDays: 0,
}

function candidate(overrides: Partial<PlannerCandidate> = {}): PlannerCandidate {
  return {
    id: 'c1',
    topicId: 't1',
    title: 'Temat',
    description: 'Opis',
    activityType: 'training',
    estimatedMinutes: 15,
    mastery: 0,
    mistakeCount: 0,
    overdueDays: 0,
    examWeakness: 0,
    ...overrides,
  }
}

function config(overrides: Partial<PlannerConfig> = {}): PlannerConfig {
  return {
    goal: 'basic',
    targetScore: 80,
    examDate: null,
    dailyMinutes: 45,
    studyDays: [1, 2, 3, 4, 5, 6, 7],
    sessionMinutes: 30,
    startDate: '2026-01-05',
    horizonDays: 1,
    ...overrides,
  }
}

describe('calculatePriority', () => {
  it('same zera dają bazę 42 pkt (brak mastery)', () => {
    expect(calculatePriority(baseInput)).toBe(42)
  })

  it('sumuje wszystkie składniki i zaokrągla', () => {
    expect(
      calculatePriority({
        mastery: 50,
        mistakeCount: 4,
        overdueDays: 2,
        examWeakness: 10,
        prerequisite: true,
        daysToExam: 10,
        lastActivityDays: 3,
      }),
    ).toBe(21 + 30 + 14 + 2 + 8 + 16.5 + 4.5)
  })

  it('ogranicza błędy, zaległości i świeżość', () => {
    expect(calculatePriority({ ...baseInput, mastery: 0, mistakeCount: 100, overdueDays: 100, lastActivityDays: 100 })).toBe(
      42 + 30 + 28 + 10,
    )
  })

  it('bliskość matury zwiększa priorytet, ale nie ujemnie', () => {
    expect(calculatePriority({ ...baseInput, daysToExam: 0 })).toBe(74) // round(42 + 31,5)
    expect(calculatePriority({ ...baseInput, daysToExam: 21 })).toBe(42)
    expect(calculatePriority({ ...baseInput, daysToExam: 100 })).toBe(42)
  })

  it('wysokie mastery nie wytwarza ujemnego długu', () => {
    expect(calculatePriority({ ...baseInput, mastery: 200 })).toBe(0)
  })
})

describe('buildDiagnostic', () => {
  it('liczy średnie mastery i wskazuje 3 najsłabsze działy', () => {
    const candidates = [
      candidate({ id: 'a', topicId: 't1', title: 'A', mastery: 10, mistakeCount: 2 }),
      candidate({ id: 'b', topicId: 't2', title: 'B', mastery: 90 }),
      candidate({ id: 'c', topicId: 't3', title: 'C', mastery: 40 }),
      candidate({ id: 'd', topicId: 't4', title: 'D', mastery: 60 }),
    ]
    const diagnostic = buildDiagnostic(candidates, '2026-01-05')
    expect(diagnostic.currentMastery).toBe(50)
    expect(diagnostic.weakestAreas.map((area) => area.id)).toEqual(['t1', 't3', 't4'])
    expect(diagnostic.mostUrgent).toBe('A')
    expect(diagnostic.reason).toBe('Mastery 10% + 2 nierozwiązanych błędów.')
  })

  it('bez kandydatów zwraca komunikat zachęty', () => {
    const diagnostic = buildDiagnostic([], '2026-01-05')
    expect(diagnostic.currentMastery).toBe(0)
    expect(diagnostic.weakestAreas).toEqual([])
    expect(diagnostic.mostUrgent).toBeNull()
    expect(diagnostic.reason).toBe('Dodaj dane nauki, aby otrzymać diagnozę.')
  })
})

describe('generateStudyPlan', () => {
  it('planuje cały dzienny budżet minut', () => {
    const { items } = generateStudyPlan(
      [candidate({ id: 'a' }), candidate({ id: 'b' }), candidate({ id: 'c' })],
      config({ dailyMinutes: 45, sessionMinutes: 15 }),
    )
    expect(items).toHaveLength(3)
    expect(new Set(items.map((item) => item.scheduledDate))).toEqual(new Set(['2026-01-05']))
    expect(items.reduce((sum, item) => sum + item.estimatedMinutes, 0)).toBe(45)
    expect(items.every((item) => item.status === 'pending')).toBe(true)
    expect(items.every((item) => item.scheduledDate >= '2026-01-05')).toBe(true)
  })

  it('nie planuje sesji krótszych niż 10 minut', () => {
    const { items } = generateStudyPlan(
      [candidate({ id: 'a', estimatedMinutes: 15 }), candidate({ id: 'b', estimatedMinutes: 15 })],
      config({ dailyMinutes: 20, sessionMinutes: 30 }),
    )
    expect(items).toHaveLength(1)
    expect(items[0].estimatedMinutes).toBe(15)
  })

  it('układa zadania malejąco po priorytecie: najpierw najsłabsze działy', () => {
    const { items } = generateStudyPlan(
      [
        candidate({ id: 'slaby', title: 'Słaby', mastery: 5 }),
        candidate({ id: 'sredni', title: 'Średni', mastery: 50 }),
        candidate({ id: 'mocny', title: 'Mocny', mastery: 95 }),
      ],
      config({ dailyMinutes: 45, sessionMinutes: 15 }),
    )
    expect(items.map((item) => item.id)).toEqual(['slaby', 'sredni', 'mocny'])
    const priorities = items.map((item) => item.priority)
    expect([...priorities].sort((a, b) => b - a)).toEqual(priorities)
  })

  it('tłumaczy powód zadania (zaległość, błędy, mastery)', () => {
    const { items } = generateStudyPlan(
      [
        candidate({ id: 'zalegle', overdueDays: 4, mastery: 30 }),
        candidate({ id: 'bledy', mistakeCount: 3, mastery: 30 }),
        candidate({ id: 'zwykle', mastery: 30 }),
      ],
      config({ dailyMinutes: 60, sessionMinutes: 20 }),
    )
    const byId = Object.fromEntries(items.map((item) => [item.id, item]))
    expect(byId.zalegle.reason).toBe('Powtórka jest zaległa o 4 dni.')
    expect(byId.bledy.reason).toBe('3 nierozwiązanych błędów wymaga analizy.')
    expect(byId.zwykle.reason).toBe('Mastery jest obecnie na poziomie 30%.')
  })

  it('respektuje dni nauki (tylko poniedziałek)', () => {
    const { items } = generateStudyPlan([candidate({ id: 'a' })], config({ studyDays: [1], horizonDays: 8, dailyMinutes: 15, sessionMinutes: 15 }))
    expect(items.length).toBeGreaterThan(0)
    const weekdays = new Set(items.map((item) => new Date(item.scheduledDate).getUTCDay()))
    expect([...weekdays]).toEqual([1])
  })

  it('przerywa dzień po sesji egzaminacyjnej', () => {
    const { items } = generateStudyPlan(
      [candidate({ id: 'exam', activityType: 'exam', estimatedMinutes: 15 }), candidate({ id: 'next', activityType: 'training', estimatedMinutes: 15 })],
      config({ dailyMinutes: 60, sessionMinutes: 15 }),
    )
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('exam')
  })

  it('bez kandydatów nie tworzy pozycji planu', () => {
    expect(generateStudyPlan([], config()).items).toEqual([])
  })
})

describe('scheduleActivity', () => {
  it('przenosi zadanie na nową datę i przywraca status oczekujący', () => {
    const item = {
      ...candidate({ id: 'a' }),
      scheduledDate: '2026-01-05',
      priority: 50,
      reason: 'test',
      status: 'completed' as const,
    }
    const moved = scheduleActivity(item, '2026-01-09')
    expect(moved.scheduledDate).toBe('2026-01-09')
    expect(moved.status).toBe('pending')
  })
})
