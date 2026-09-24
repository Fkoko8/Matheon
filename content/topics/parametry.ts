import type { ContentTopic } from '@/content/types'

export const parametry: ContentTopic = {
  slug: 'parametry', title: 'Równania i funkcje z parametrem', description: 'Badasz rozwiązania równań i zachowanie funkcji w zależności od wartości parametru.', level: 'extended',
  lessons: [
    { slug: 'parametry-rownania', title: 'Równania z parametrem', durationMinutes: 30, difficulty: 4, requirements: ['III.5'], objectives: ['Rozwiązujesz równanie z parametrem', 'Badasz liczbę rozwiązań'], skills: [{ slug: 'parametry-rownania', name: 'Równania z parametrem', description: 'Wyznacza warunki istnienia rozwiązań.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Równanie z parametrem', body: 'Rozwiązanie może zależeć od wartości parametru. Zamiast rozwiązywać dla jednej liczby, przygotuj wyrażenie na wynik i sprawdź, kiedy dzielenie jest dozwolone.' },
      { type: 'example', title: 'Przykład', body: 'Dla $ax=4$ mamy $a\\neq0$ i $x=4/a$. Dla $a=0$ równanie $0=4$ jest sprzeczne, więc nie ma rozwiązania.' },
      { type: 'warning', title: 'Nie dziel przez parametr bez zabezpieczenia', body: 'Przypadek $a=0$ omów osobno, zanim podzielisz przez $a$. To najczęstsze miejsce błędu.' },
      { type: 'summary', title: 'Schemat', body: 'Wydziel przypadek zerowy → wyznacz wynik → nałóż ograniczenia z wyrażenia i sprawdź liczbę rozwiązań.' },
    ] },
    { slug: 'parametry-pochodna', title: 'Pochodna i warunki przejścia', durationMinutes: 30, difficulty: 5, requirements: ['XII.5'], objectives: ['Wyznaczasz warunek na maksimum/minimum', 'Wykorzystujesz pochodną do badania parametru'], skills: [{ slug: 'parametry-pochodna', name: 'Pochodna z parametrem', description: 'Bada wartości parametru przez warunki pochodnej.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Zmiana monotoniczności', body: 'Jeśli funkcja zależy od parametru, wyznacz jej pochodną, a następnie rozwiąż warunek $f(x)=0$ lub $f(x)=1$ zależnie od zadania.' },
      { type: 'example', title: 'Przykład', body: 'Dla $f(x)=x^2-2ax$ warunek minimum w $x=a$ wynika z $f\'(a)=2a-2a=0$ i $f\'\'(x)=2>0$.' },
      { type: 'tip', title: 'Nie gub dziedziny', body: 'Parametr może wykluczać wartości, przy których funkcja nie istnieje. Sprawdź to po wyznaczeniu warunku.' },
      { type: 'summary', title: 'Co zapamiętać', body: 'Pochodna daje warunek na zmianę znaku, a druga pochodna często wskazuje rodzaj ekstremum.' },
    ] },
  ],
}
