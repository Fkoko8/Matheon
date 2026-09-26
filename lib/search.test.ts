import { describe, expect, it } from 'vitest'
import { curriculumHits, fold, matchHits, type SearchHit } from './search'

function hit(partial: Partial<SearchHit> & Pick<SearchHit, 'id' | 'title'>): SearchHit {
  return {
    kind: 'task',
    subtitle: '',
    href: '/tasks',
    haystack: fold(`${partial.title} ${partial.subtitle ?? ''}`),
    ...partial,
  }
}

describe('fold', () => {
  it('usuwa polską diakrytykę i sprowadza do małych liter', () => {
    expect(fold('Równania')).toBe('rownania')
    expect(fold('ŁATWE Ćwiczenia')).toBe('latwe cwiczenia')
    expect(fold('Zażółć gęślą jaźń')).toBe('zazolc gesla jazn')
  })
})

describe('matchHits', () => {
  const index = [
    hit({ id: '1', title: 'Funkcja kwadratowa', kind: 'topic' }),
    hit({ id: '2', title: 'Równania kwadratowe', subtitle: 'Delta i miejsca zerowe' }),
    hit({ id: '3', title: 'Trygonometria', kind: 'topic' }),
    hit({ id: '4', title: 'Matura rozszerzona 2026', kind: 'exam', subtitle: '2026 · 15 zadań' }),
  ]

  it('puste zapytanie nie zwraca nic', () => {
    expect(matchHits(index, '')).toEqual([])
    expect(matchHits(index, '   ')).toEqual([])
  })

  it('dopasowuje bez diakrytyki', () => {
    expect(matchHits(index, 'rownania').map((item) => item.id)).toContain('2')
    expect(matchHits(index, 'RÓWNANIA').map((item) => item.id)).toContain('2')
  })

  it('wymaga wszystkich słów zapytania', () => {
    expect(matchHits(index, 'funkcja kwadratowa').map((item) => item.id)).toEqual(['1'])
    expect(matchHits(index, 'funkcja trygonometria')).toEqual([])
  })

  it('preferuje trafienie w tytuł i treść programu', () => {
    const results = matchHits(index, 'kwadratowa')
    expect(results[0].id).toBe('1') // tytuł jako prefiks + waga działu
  })

  it('szuka też w podtytule', () => {
    expect(matchHits(index, 'miejsca zerowe').map((item) => item.id)).toEqual(['2'])
  })

  it('respektuje limit wyników', () => {
    expect(matchHits(index, 'a', 2)).toHaveLength(2)
  })
})

describe('curriculumHits', () => {
  const hits = curriculumHits()

  it('zawiera działy i lekcje z programu', () => {
    expect(hits.length).toBeGreaterThan(20)
    expect(hits.some((item) => item.id === 'topic:kwadratowa')).toBe(true)
    expect(hits.some((item) => item.kind === 'lesson')).toBe(true)
  })

  it('linkuje lekcje do tras workspace', () => {
    const lesson = hits.find((item) => item.id.startsWith('lesson:kwadratowa/'))
    expect(lesson?.href).toMatch(/^\/learn\/lesson\/kwadratowa\/[\w-]+$/)
  })
})
