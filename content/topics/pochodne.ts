import type { ContentTopic } from '@/content/types'

export const pochodne: ContentTopic = {
  slug: 'pochodne', title: 'Pochodne', description: 'Obliczasz pochodne, badasz monotoniczność, ekstrema i wyznaczasz styczne.', level: 'extended',
  lessons: [
    { slug: 'pochodne-obliczanie', title: 'Pochodna i reguły różniczkowania', durationMinutes: 35, difficulty: 4, requirements: ['XII.2'], objectives: ['Obliczasz pochodne funkcji elementarnych', 'Stosujesz reguły sumy, iloczynu i złożenia'], skills: [{ slug: 'pochodne-obliczanie', name: 'Obliczanie pochodnych', description: 'Oblicza pochodne z reguł różniczkowania.', level: 'extended' }], blocks: [
      { type: 'formula', title: 'Podstawowe reguły', body: 'Pochodna opisuje tempo zmian funkcji.', formula: "(x^n)'=nx^{n-1}, \\quad (f+g)'=f'+g', \\quad (fg)'=f'g+fg'" },
      { type: 'example', title: 'Złożenie', body: '$f(x)=x^2+3x$ ma $f\'(x)=2x+3$. Funkcja $g(x)=\\sin x^2$ ma $g\'(x)=2x\\cos(x^2)$.' },
      { type: 'warning', title: 'Częsty błąd', body: 'Nie podstawiaj wyrażenia zamiast jego pochodnej. W $f(x)=\\sin x$ pochodną jest $\\cos x$, nie $\\sin x$.' },
      { type: 'summary', title: 'Schemat', body: 'Najpierw rozróżnij sumę, iloczyn, iloraz i złożenie, a potem pochoduj każdy czynnik osobno.' },
    ] },
    { slug: 'pochodne-monotonicznosc', title: 'Monotoniczność i ekstrema', durationMinutes: 30, difficulty: 4, requirements: ['XII.3'], objectives: ['Badasz znak pochodnej', 'Wyznaczasz extrema lokalne'], skills: [{ slug: 'pochodne-monotonicznosc', name: 'Monotoniczność i ekstrema', description: 'Bada monotoniczność za pomocą pochodnej.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Znak pochodnej', body: 'Funkcja jest rosnąca tam, gdzie pochodna jest dodatnia, i malejąca tam, gdzie jest ujemna. Zmiana znaku wskazuje ekstremum.' },
      { type: 'example', title: 'Minimum', body: 'Dla $f(x)=x^2-4x$ mamy $f\'(x)=2x-4$. Punkt $x=2$ dzieli znak pochodnej z ujemnego na dodatni, więc jest minimum: $f(2)=-4$.' },
      { type: 'warning', title: 'Punkt krytyczny', body: 'Pochodna zerująca się nie zawsze oznacza ekstremum. Zawsze sprawdź zmianę znaku, np. funkcja $x^3$ ma minimum algebraiczne, lecz nie minimum lokalne.' },
      { type: 'summary', title: 'Co zapamiętać', body: 'Zmiana znaku $f\'$ z minus na plus oznacza minimum, z plus na minus — maksimum.' },
    ] },
    { slug: 'pochodne-styczna', title: 'Styczna do wykresu', durationMinutes: 25, difficulty: 4, requirements: ['XII.6'], objectives: ['Wyznaczasz nachylenie stycznej', 'Zapisujesz równanie stycznej'], skills: [{ slug: 'pochodne-styczna', name: 'Styczna', description: 'Wyznacza równanie prostej stycznej do wykresu.', level: 'extended' }], blocks: [
      { type: 'formula', title: 'Równanie stycznej', body: 'Pochodna w punkcie jest współczynnikiem kierunkowym stycznej.', formula: 'y-f(x_0)=f\'(x_0)(x-x_0)' },
      { type: 'example', title: 'Przykład', body: 'Dla $f(x)=x^2$ w $x_0=1$ mamy $f(1)=1$ i $f\'(1)=2$, więc $y-1=2(x-1)$, czyli $y=2x-1$.' },
      { type: 'summary', title: 'Schemat', body: 'Oblicz wartość funkcji i pochodnej w punkcie, a następnie podstaw je do równania prostej.' },
    ] },
  ],
}
