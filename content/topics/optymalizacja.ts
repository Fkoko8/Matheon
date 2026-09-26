import type { ContentTopic } from '@/content/types'

export const optymalizacja: ContentTopic = {
  slug: 'optymalizacja',
  title: 'Zadania optymalizacyjne',
  description: 'Modelujesz wielkości, wyznaczasz optimum za pomocą pochodnej i sprawdzasz wynik.',
  level: 'extended',
  lessons: [
    {
      slug: 'optymalizacja-model',
      title: 'Modelowanie zadania',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['XII.4'],
      objectives: [
        'Zapisujesz zależność jako funkcję jednej zmiennej',
        'Wyznaczasz dziedzinę wynikającą z treści zadania',
        'Odróżniasz zmienną niezależną od wielkości optymalizowanej',
      ],
      skills: [
        { slug: 'optymalizacja-model', name: 'Modelowanie', description: 'Tworzy model funkcji zależnej od jednej zmiennej.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'W zadaniu optymalizacyjnym występują zwykle dwie wielkości powiązane warunkiem. Jedną z nich wyrażasz przez drugą, dzięki czemu cel (pole, zysk, koszt) staje się funkcją jednej zmiennej. Dobry model to połowa punktów — i połowa sukcesu.',
        },
        {
          type: 'formula',
          title: 'Schemat modelowania',
          body: 'Kolejność jest zawsze ta sama: zmienna → zależność z warunku → funkcja celu → dziedzina.',
          formula: 'V = f(x), \\qquad x\\in D \\quad\\text{(dziedzina z treści zadania)}',
        },
        {
          type: 'example',
          title: 'Przykład — prostokąt o danym obwodzie',
          body: `Prostokąt ma obwód $20$, a jedna krawędź to $x$. Druga krawędź: z $2(x+b) = 20$ dostajemy $b = 10 - x$. Pole: $P(x) = x(10-x)$.

Dziedzina z sensu geometrycznego: $0 < x < 10$ — długość krawędzi musi być dodatnia, a drugi bok też.`,
        },
        {
          type: 'example',
          title: 'Przykład — pole z warunkiem na sumę boków',
          body: '$P(x) = x(5-x)$ dla $0 < x < 5$, gdy suma dwóch sąsiednich boków wynosi $5$. Po wymnożeniu: $P(x) = -x^{2} + 5x$. To parabola o ramionach w dół — maksimum w wierzchołku. Wkrótce policzymy, że wynosi ono $6{,}25$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Brak dziedziny: funkcję można zapisać, ale bez przedziału $x$ odpowiedź jest niepełna.\n• Zły warunek związku: np. pomylenie obwodu $2(x+b)$ z sumą boków $x+b$.\n• Dwie zmienne w funkcji celu — trzeba wyeliminować jedną, korzystając z warunku zadania.\n• Oznaczenie zmiennej bez opisu, co oznacza — potem nie da się odczytać poprawnej odpowiedzi.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zapisz na początku zdanie: „Niech $x$ oznacza …, wtedy …”. Za sam poprawny model i dziedzinę są punkty, nawet jeśli dalszy rachunek się nie uda. Zawsze sprawdzaj, że wzór funkcji celu zawiera tylko jedną zmienną.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Oznacz zmienną i opisz ją słowami.\n• Wyraź drugą wielkość z warunku (obwód, suma, objętość).\n• Zapisz funkcję celu jednej zmiennej.\n• Dziedzinę wyznacz z sensu geometrycznego lub ekonomicznego.`,
        },
      ],
    },
    {
      slug: 'optymalizacja-pochodna',
      title: 'Optimum przez pochodną',
      durationMinutes: 30,
      difficulty: 5,
      requirements: ['XII.4'],
      objectives: [
        'Wyznaczasz punkty krytyczne funkcji celu',
        'Porównujesz wartości na końcach przedziału i w punkcie krytycznym',
        'Interpretujesz wynik w kontekście zadania',
      ],
      skills: [
        { slug: 'optymalizacja-pochodna', name: 'Optimum', description: 'Wyznacza maksimum lub minimum funkcji.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Gdy model jest gotowy, optimum znajdujesz pochodną: rozwiążesz $f\'(x) = 0$, sprawdzisz znak pochodnej i porównasz wartości w punktach krytycznych oraz na końcach przedziału. Na przedziale domkniętym największa wartość leży albo w punkcie krytycznym, albo na brzegu.',
        },
        {
          type: 'formula',
          title: 'Warunek i procedura',
          body: 'Punkt krytyczny to miejsce zerowania się pochodnej; o rodzaju ekstremum decyduje zmiana znaku.',
          formula: "f'(x)=0 \\Rightarrow x_0, \\qquad f'(x_0^-)>0,\\ f'(x_0^+)<0 \\Rightarrow \\text{maksimum}",
        },
        {
          type: 'example',
          title: 'Przykład — maksymalne pole',
          body: `Dla $P(x) = x(10-x)$ mamy $P'(x) = 10 - 2x$. Warunek $P'(x) = 0$ daje $x = 5$.

Pochodna zmienia znak z dodatniego na ujemny, więc to maksimum: $P(5) = 25$. Na końcach przedziału $(0, 10)$ pole dąży do $0$, więc $25$ jest największą wartością. To największe pole wśród prostokątów o obwodzie $20$ — czyli kwadrat o boku $5$.`,
        },
        {
          type: 'example',
          title: 'Przykład — porównanie końców',
          body: 'Dla $P(x) = x(6-x)$ na $[0, 6]$: $P\'(x) = 6 - 2x$, więc $x = 3$ i $P(3) = 9$. Na końcach $P(0) = P(6) = 0$. Maksimum $9$ dla $x = 3$ — ale gdyby przedział był np. $[1, 6]$, trzeba by jeszcze policzyć $P(1) = 5$ i porównać.',
        },
        {
          type: 'table',
          title: 'Gdzie szukać największej wartości',
          body: `| Miejsce | Kiedy sprawdzać |\n|---|---|\n| punkt krytyczny wewnątrz przedziału | zawsze, gdy $f' = 0$ w dziedzinie |\n| końce przedziału domkniętego | zawsze przy przedziale $[a, b]$ |\n| granice przedziału otwartego | gdy optimum „ucieka” poza dziedzinę |`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Poprzestanie na $f'(x) = 0$ bez sprawdzenia, czy to maksimum, a nie minimum.\n• Zapomnienie o końcach przedziału domkniętego.\n• Odpowiedź bez jednostek i bez zdania interpretującego wynik.\n• Zgubienie minusa przy pochodnej wyrażenia typu $x(10-x) = 10x - x^{2}$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zakończ zadanie pełnym zdaniem: „Największe pole wynosi $25$ i jest osiągane dla $x = 5$”. Za interpretację z jednostką (np. $\\text{cm}^{2}$) jest osobny punkt. Jeśli wierzchołek wypada między liczbami całkowitymi, a kontekst wymaga liczby całkowitej — porównaj wartości w sąsiednich punktach.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Optimum: rozwiąż $f'(x) = 0$ i sprawdź zmianę znaku.\n• Na przedziale domkniętym porównaj też wartości na końcach.\n• Maksimum wymaga zmiany znaku pochodnej z $+$ na $-$.\n• Odpowiedź z jednostką i interpretacją.`,
        },
      ],
    },
  ],
}
