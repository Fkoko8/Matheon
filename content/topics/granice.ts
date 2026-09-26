import type { ContentTopic } from '@/content/types'

export const granice: ContentTopic = {
  slug: 'granice',
  title: 'Granice i ciągłość',
  description: 'Obliczasz granice funkcji i badasz jej ciągłość.',
  level: 'extended',
  lessons: [
    {
      slug: 'granice-obliczanie',
      title: 'Obliczanie granic',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['XII.1'],
      objectives: [
        'Obliczasz granicę funkcji ciągłej przez podstawienie',
        'Usuwasz nieoznaczoność typu 0/0 przez skrócenie czynnika',
        'Stosujesz podstawowe granice, w tym sinus przez argument',
      ],
      skills: [
        { slug: 'granice-obliczanie', name: 'Obliczanie granic', description: 'Oblicza granice z wykorzystaniem podstawowych własności.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Granica opisuje, do czego zmierza funkcja w pobliżu punktu — nawet jeśli w samym punkcie funkcja nie istnieje. Na maturze rozszerzonej to zwykle krótkie zadanie: podstaw, a gdy wyjdzie $\\frac{0}{0}$ albo nieskończoność, uprość wyrażenie.',
        },
        {
          type: 'formula',
          title: 'Dwie podstawowe granice',
          body: 'Pierwsza mówi, że dla funkcji ciągłej wystarczy podstawić. Druga (sinus przez argument) pojawia się w zadaniach trygonometrycznych.',
          formula: '\\lim_{x\\to a}f(x)=f(a)\\ \\ (f\\ \\text{ciągła}), \\qquad \\lim_{u\\to0}\\frac{\\sin u}{u}=1',
        },
        {
          type: 'example',
          title: 'Przykład — podstawienie',
          body: 'Funkcja $f(x) = 3x + 1$ jest ciągła, więc $\\lim_{x \\to 2}(3x+1) = 3 \\cdot 2 + 1 = 7$. Tak działa każdy wielomian — wystarczy wstawić wartość.',
        },
        {
          type: 'example',
          title: 'Przykład — skrócenie czynnika',
          body: `Oblicz $\\lim_{x \\to 1} \\frac{x^{2}-1}{x-1}$. Bezpośrednie podstawienie daje $\\frac{0}{0}$ — to nieoznaczoność, a nie odpowiedź.

Rozkładamy licznik: $\\frac{(x-1)(x+1)}{x-1} = x+1$ dla $x \\neq 1$. Teraz funkcja jest ciągła, więc granica wynosi $1 + 1 = 2$.`,
        },
        {
          type: 'example',
          title: 'Przykład — granica z sinusem',
          body: 'Oblicz $\\lim_{x \\to 0} \\frac{\\sin 2x}{x}$. Zapiszmy $\\frac{\\sin 2x}{x} = 2 \\cdot \\frac{\\sin 2x}{2x}$. Gdy $x \\to 0$, to $2x \\to 0$, więc ułamek $\\frac{\\sin 2x}{2x} \\to 1$. Stąd granica wynosi $2 \\cdot 1 = 2$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Uznanie $\\frac{0}{0}$ za wynik — to sygnał „uprość”, nie odpowiedź.\n• Skrócenie czynnika bez rozkładu: $\\frac{x^{2}-1}{x-1}\\neq\\frac{x^{2}}{1}$ — najpierw rozłóż.\n• Zgubienie czynnika $2$ przy sinusie: $\\frac{\\sin 2x}{x}\\neq\\frac{\\sin 2x}{2x}$.\n• Podstawienie do funkcji nieciągłej zamiast policzenia granicy.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Schemat „od 3 do 5 linii”: podstaw → sprawdź formę → rozłóż i skróć → policz granicę funkcji ciągłej. Zapisuj przekształcenia (np. „$x\\neq1$, więc $\\frac{x^{2}-1}{x-1}=x+1$”), bo to one są punktowane.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Dla funkcji ciągłej $\\lim_{x\\to a}f(x)=f(a)$.\n• Forma $\\frac{0}{0}$ wymaga rozkładu i skrócenia wspólnego czynnika.\n• $\\lim_{u\\to0}\\frac{\\sin u}{u}=1$ — sprowadzaj wyrażenie do tej postaci.\n• Granica nie musi być równa wartości funkcji w punkcie.`,
        },
      ],
    },
    {
      slug: 'granice-ciaglosc',
      title: 'Rodzaje nieciągłości',
      durationMinutes: 25,
      difficulty: 4,
      requirements: ['XII.1'],
      objectives: [
        'Badasz ciągłość funkcji w punkcie',
        'Rozróżniasz nieciągłość usuwalną od nieusuwalnej',
        'Wyznaczasz dziedzinę i opisujesz zachowanie przy wykluczonych punktach',
      ],
      skills: [
        { slug: 'granice-ciaglosc', name: 'Ciągłość', description: 'Bada ciągłość i interpretuje jej zaburzenia.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Ciągłość to jedność wykresu: żadnych dziur i przerw. Formalnie trzeba trzech rzeczy naraz — punkt należy do dziedziny, granica istnieje i jest równa wartości funkcji. Gdy któryś warunek zawodzi, mówimy o nieciągłości.',
        },
        {
          type: 'formula',
          title: 'Warunek ciągłości w punkcie $a$',
          body: 'Wszystkie trzy warunki muszą zachodzić jednocześnie.',
          formula: '\\lim_{x\\to a}f(x)=f(a) \\quad\\text{przy czym } a\\in D_f \\text{ i granica istnieje}',
        },
        {
          type: 'example',
          title: 'Przykład — nieciągłość usuwalna',
          body: `Funkcja $f(x) = \\frac{x^{2}-4}{x-2}$ nie jest ciągła w $x = 2$, bo punkt ten nie należy do dziedziny. Po skróceniu $\\frac{(x-2)(x+2)}{x-2} = x+2$ funkcja „chciałaby” przyjąć wartość $4$. To nieciągłość **usuwalna**: dziurę można załatać, dodefiniowując $f(2) = 4$.`,
        },
        {
          type: 'example',
          title: 'Przykład — nieciągłość nieusuwalna',
          body: `Dla $f(x) = \\frac{1}{x}$ w punkcie $x = 0$ granice jednostronne są różne: funkcja ucieka do $+\\infty$ po prawej i $-\\infty$ po lewej. Tego nie da się naprawić żadną wartością — to nieciągłość nieusuwalna (asymptota pionowa).`,
        },
        {
          type: 'table',
          title: 'Rodzaje nieciągłości',
          body: `| Sytuacja | Rodzaj | Wykres |\n|---|---|---|\n| granica istnieje, punkt poza dziedziną | usuwalna | dziura |\n| granice jednostronne różne lub nieskończone | nieusuwalna | przerwa / asymptota |\n| funkcja ciągła w każdym punkcie przedziału | ciągła na przedziale | jednym pociągnięciem |`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Uznanie funkcji za ciągłą na $\\mathbb{R}$, gdy ma wykluczony punkt (np. pierwiastek mianownika).\n• Liczenie ciągłości bez uprzedniego wyznaczenia dziedziny.\n• Utożsamienie nieciągłości usuwalnej z asymptotą — przy usuwalnej granica jest skończona.\n• Zapominanie, że ilorazy są ciągłe tylko tam, gdzie mianownik nie znika.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Badanie ciągłości zacznij od dziedziny, potem sprawdź granice w punktach „podejrzanych” (zera mianownika, styki wzorów kawałkowych). W zadaniu otwartym zapisz dziedzinę jawnie — to często pierwszy punkt kryteriów.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Ciągłość = punkt w dziedzinie + istnieje granica + są równe.\n• Usuwalna: granica skończona, ale punkt wypada z dziedziny.\n• Nieusuwalna: granice jednostronne różne lub nieskończone.\n• Zawsze najpierw wyznacz dziedzinę.`,
        },
      ],
    },
  ],
}
