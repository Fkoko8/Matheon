import type { ContentTopic } from '@/content/types'

export const wymierne: ContentTopic = {
  slug: 'wymierne', title: 'Funkcje wymierne', description: 'Badasz dziedzinę, miejsca zerowe, wartości i asymptoty funkcji wymiernych.', level: 'extended',
  lessons: [
    { slug: 'wymierne-dziedzina', title: 'Dziedzina i miejsca zerowe', durationMinutes: 25, difficulty: 3, requirements: ['IV.7'], objectives: ['Wyznaczasz dziedzinę', 'Znajdujesz miejsca zerowe'], skills: [{ slug: 'wymierne-dziedzina', name: 'Dziedzina', description: 'Wyznacza dziedzinę funkcji wymiernej.', level: 'extended' }, { slug: 'wymierne-zera', name: 'Miejsca zerowe', description: 'Wyznacza miejsca zerowe i redukuje ułamek.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Mianownik', body: 'Funkcja $\\frac{P(x)}{Q(x)}$ jest określona tylko tam, gdzie $Q(x) \\neq 0$. Pierwszą czynnością jest więc rozwiązanie równania mianownika.' },
      { type: 'example', title: 'Przykład', body: 'Dla $f(x)=\\frac{x+1}{x-2}$ mamy $x \\neq 2$. Licznik zeruje się dla $x=-1$, co jest miejscem zerowym, bo $-1$ należy do dziedziny.' },
      { type: 'warning', title: 'Skracanie', body: 'Nie skracaj czynnika wspólnego przed wyznaczeniem pierwiastków mianownika. Miejsca skasowane nadal wykluczają się z dziedziny.' },
      { type: 'summary', title: 'Schemat', body: 'Najpierw $Q(x)=0$ i odrzuć te wartości, potem szukaj pierwiastków licznika.' },
    ] },
    { slug: 'wymierne-asymptoty', title: 'Asymptoty i interpretacja wykresu', durationMinutes: 25, difficulty: 4, requirements: ['IV.7'], objectives: ['Wyznaczasz asymptoty poziome i pionowe', 'Opisujesz zachowanie funkcji'], skills: [{ slug: 'wymierne-asymptoty', name: 'Asymptoty', description: 'Wyznacza asymptoty funkcji wymiernej.', level: 'extended' }], blocks: [
      { type: 'formula', title: 'Asymptoty', body: 'Gdy stopień licznika jest mniejszy niż stopień mianownika, asymptotą poziomą jest $y=0$.', formula: '\\frac{P(x)}{Q(x)}\\to 0 \\quad (|x|\\to\\infty)' },
      { type: 'example', title: 'Asymptota pionowa', body: 'Dla $f(x)=\\frac{1}{x-3}$ mianownik zeruje się dla $x=3$, więc $x=3$ jest asymptotą pionową. Funkcja nigdy nie przyjmuje wartości $0$ po skróceniu, więc nie ma miejsca zerowego.' },
      { type: 'tip', title: 'Kontrola', body: 'Przy $x$ dążącym do pierwiastka mianownika sprawdź znak licznika z jednej i drugiej strony — to pomaga narysować gałęzie.' },
      { type: 'summary', title: 'Co zapamiętać', body: 'Asymptota pionowa to pierwiastek mianownika; pozioma $y=0$ występuje, gdy stopień licznika jest mniejszy niż mianownika.' },
    ] },
  ],
}
