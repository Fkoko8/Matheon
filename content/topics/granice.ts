import type { ContentTopic } from '@/content/types'

export const granice: ContentTopic = {
  slug: 'granice', title: 'Granice i ciągłość', description: 'Obliczasz granice funkcji i badasz jej ciągłość.', level: 'extended',
  lessons: [
    { slug: 'granice-obliczanie', title: 'Obliczanie granic', durationMinutes: 30, difficulty: 4, requirements: ['XII.1'], objectives: ['Obliczasz granice w punkcie', 'Stosujesz podstawowe granice'], skills: [{ slug: 'granice-obliczanie', name: 'Obliczanie granic', description: 'Oblicza granice z wykorzystaniem podstawowych własności.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Ciągłość w punkcie', body: 'Granica opisuje zachowanie funkcji w pobliżu punktu, a ciągłość wymaga, aby wartość granicy była równa wartości funkcji w tym punkcie.' },
      { type: 'formula', title: 'Podstawowe granice', body: 'Dla funkcji ciągłych granica jest równa wartości funkcji; ułamek przy zerze wymaga skrócenia.', formula: '\\lim_{x\\to a}f(x)=f(a), \\quad f\\ \\text{ciągła}' },
      { type: 'example', title: 'Skracanie czynnika', body: '$\\lim_{x\\to1}\\frac{x^2-1}{x-1}=\\lim_{x\\to1}(x+1)=2$, ponieważ $x-1$ zeruje się w punkcie $1$, ale po skróceniu dostajemy funkcję ciągłą.' },
      { type: 'warning', title: 'Nie podstawiaj', body: 'Jeśli bezpośrednie podstawienie daje $\\frac00$ lub nieskończoność, najpierw uprość wyrażenie.' },
      { type: 'summary', title: 'Schemat', body: 'Podstaw i sprawdź wynik. Przy $\\frac00$ skróć wspólny czynnik, a potem policz granicę uproszczonej funkcji.' },
    ] },
    { slug: 'granice-ciaglosc', title: 'Rodzaje nieciągłości', durationMinutes: 25, difficulty: 4, requirements: ['XII.1'], objectives: ['Badasz ciągłość funkcji', 'Rozróżniasz nieciągłość eliminowalną i nieusuwalną'], skills: [{ slug: 'granice-ciaglosc', name: 'Ciągłość', description: 'Bada ciągłość i interpretuje jej zaburzenia.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Badanie ciągłości', body: 'Dla funkcji złożonej z wielomianów, ilorazów, potęg i funkcji trygonometrycznych sprawdź miejsca, w których mogą pojawić się wyjątki: mianowniki i dziedzina.' },
      { type: 'example', title: 'Nieciągłość', body: 'Funkcja $f(x)=\\frac{x^2-4}{x-2}$ nie jest ciągła w $x=2$, bo punkt nie należy do dziedziny. Nie da się uznać jej za ciągłą na całym $\\mathbb R$.' },
      { type: 'summary', title: 'Co zapamiętać', body: 'Ciągłość wymaga trzech rzeczy: punktu w dziedzinie, istnienia granicy i równości tych wartości.' },
    ] },
  ],
}
