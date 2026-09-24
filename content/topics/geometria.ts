import type { ContentTopic } from '@/content/types'

export const geometria: ContentTopic = {
  slug: 'geometria',
  title: 'Geometria analityczna',
  description: 'Równania prostych, równoległość i prostopadłość, odległości i środek odcinka, równanie okręgu, odległość punktu od prostej oraz styczna do okręgu.',
  level: 'basic',
  lessons: [
    {
      slug: 'geometria-proste',
      title: 'Równania prostych, równoległość i prostopadłość',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['VIII.1', 'VIII.2'],
      objectives: [
        'Wyznaczasz równanie prostej przechodzącej przez dwa punkty',
        'Rozpoznajesz położenie prostych: równoległe, prostopadłe, przecinające się',
        'Klasyfikujesz proste w zależności od współczynników',
      ],
      skills: [
        { slug: 'geometria-prosta', name: 'Równania prostych', description: 'Wyznacza i interpretuje równania prostych oraz bada ich wzajemne położenie.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Geometria analityczna przenosi rysunek na układ współrzędnych. Zamiast patrzeć na kąty, liczysz współczynniki — i zadania o położeniu prostych stają się zwykłymi rachunkami.',
        },
        {
          type: 'formula',
          title: 'Postać ogólna i kierunkowa',
          body: 'Każdą prostą można zapisać na dwa sposoby:',
          formula: 'Ax + By + C = 0 \\qquad y = kx + b',
        },
        {
          type: 'paragraph',
          title: 'Równanie prostej przez dwa punkty',
          body: 'Jeśli prosta przechodzi przez punkty $A(x_1, y_1)$ i $B(x_2, y_2)$ (o różnych odciętych), to jej współczynnik kierunkowy wynosi $k = \\frac{y_2 - y_1}{x_2 - x_1}$, a wyraz wolny $b = y_1 - k x_1$.',
        },
        {
          type: 'example',
          title: 'Przykład — równanie prostej',
          body: 'Prosta przechodzi przez $A(2, 1)$ i $B(5, 7)$. Współczynnik kierunkowy: $k = \\frac{7 - 1}{5 - 2} = 2$. Wyraz wolny: $b = 1 - 2 \\cdot 2 = -3$. Równanie: $y = 2x - 3$. Sprawdzenie dla punktu $B$: $2 \\cdot 5 - 3 = 7$ — zgadza się.',
        },
        {
          type: 'table',
          title: 'Położenie dwóch prostych',
          body: `| Warunek | Współczynniki kierunkowe | Postać ogólna |
| --- | --- | --- |
| Równoległe | $k_{1} = k_{2}$ | $A_{1}B_{2} - A_{2}B_{1} = 0$ |
| Prostopadłe | $k_{1} \\cdot k_{2} = -1$ | $A_{1}A_{2} + B_{1}B_{2} = 0$ |
| Przebiegające w jednym punkcie | $k_{1} \\neq k_{2}$ | $A_{1}B_{2} - A_{2}B_{1} \\neq 0$ |`,
        },
        {
          type: 'example',
          title: 'Przykład — prostopadłość',
          body: 'Czy proste $y = 2x + 1$ i $y = -\frac{1}{2}x + 3$ są prostopadłe? Iloczyn współczynników: $2 \\cdot (-\\frac{1}{2}) = -1$, więc tak — są prostopadłe. Zwykłe spotkanie się w jednym punkcie nie wystarcza: tu decyduje iloczyn równy $-1$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie prostej pionowej $x = 3$ z poziomą — pionowej nie da się zapisać w postaci $y = kx + b$.
• Sprawdzanie prostopadłości samym „mają różne współczynniki” — to nie jest kryterium.
• Zapominanie o warunku $x_1 \\neq x_2$ we wzorze na $k$ przy dwóch punktach.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach o przecięciu prostych z okręgiem najpierw sprowadź wszystko do postaci $y = kx + b$ — wtedy podstawienie do równania okręgu daje zwykłe równanie kwadratowe.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $k = \\frac{y_2 - y_1}{x_2 - x_1}$ i $b = y_1 - k x_{1}$.
• Równoległość: $k_{1} = k_{2}$; prostopadłość: $k_{1} k_{2} = -1$.
• Prosta pionowa ma postać $x = c$.`,
        },
      ],
    },
    {
      slug: 'geometria-punkty',
      title: 'Odległość, środek odcinka i odległość od prostej',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['VIII.3', 'VIII.5'],
      objectives: [
        'Obliczasz odległość między punktami',
        'Wyznaczasz środek odcinka',
        'Obliczasz odległość punktu od prostej',
      ],
      skills: [
        { slug: 'geometria-odleglosc', name: 'Odległości w geometrii analitycznej', description: 'Oblicza odległość punktów, wyznacza środek odcinka i odległość punktu od prostej.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Trzy wzory, które w geometrii analitycznej zastępują linijkę i kątomierz. Warto zapamiętać je na pamięć — są w każdym zadaniu o odległościach.',
        },
        {
          type: 'formula',
          title: 'Odległość punktów',
          body: 'Dla punktów $A(x_1, y_1)$ i $B(x_2, y_2)$:',
          formula: '|AB| = \\sqrt{(x_2 - x_1)^{2} + (y_2 - y_1)^{2}}',
        },
        {
          type: 'formula',
          title: 'Środek odcinka',
          body: 'Środek odcinka $AB$ to punkt o współrzędnych będących średnimi arytmetycznymi:',
          formula: 'S = \\left(\\frac{x_1 + x_2}{2}, \\ \\frac{y_1 + y_2}{2}\\right)',
        },
        {
          type: 'example',
          title: 'Przykład — odległość i środek',
          body: 'Punkty $A(-1, 3)$ i $B(4, -1)$: $|AB| = \\sqrt{(4 - (-1))^{2} + (-1 - 3)^{2}} = \\sqrt{25 + 16} = \\sqrt{41}$. Środek odcinka: $S = (\\frac{-1 + 4}{2}, \\frac{3 + (-1)}{2}) = (1{,}5, 1)$.',
        },
        {
          type: 'formula',
          title: 'Odległość punktu od prostej',
          body: 'Odległość punktu $P(x_0, y_0)$ od prostej $Ax + By + C = 0$ wynosi:',
          formula: 'd = \\frac{|A x_{0} + B y_{0} + C|}{\\sqrt{A^{2} + B^{2}}}',
        },
        {
          type: 'paragraph',
          title: 'Czemu jest wartość bezwzględna?',
          body: 'Wyrażenie $A x_{0} + B y_{0} + C$ może być dodatnie albo ujemne — zależy od tego, po której stronie prostej leży punkt. Wartość bezwzględna zapewnia, że odległość jest zawsze dodatnia. Moduł z poprzedniej lekcji działa dokładnie tak samo.',
        },
        {
          type: 'example',
          title: 'Przykład — odległość od prostej',
          body: 'Odległość punktu $P(3, 4)$ od prostej $2x - y - 7 = 0$: $d = \\frac{|2 \\cdot 3 - 4 - 7|}{\\sqrt{4 + 1}} = \\frac{|-5|}{\\sqrt{5}} = \\frac{5}{\\sqrt{5}} = \\sqrt{5}$. Uproszczenie: mnożenie licznika i mianownika przez $\\sqrt{5}$ daje $\\frac{5\\sqrt{5}}{5} = \\sqrt{5}$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Zapominanie o module w wzorze na odległość od prostej.
• Mylenie odległości punktu od prostej z odległością punktu od początku układu.
• Radiany zamiast pierwiastków: $\\sqrt{41}$ to wynik dokładny, dopiero $\\approx 6{,}4$ to przybliżenie.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Odległość od prostej to wysokość trójkąta o podstawie na tej prostej. Gdy masz dwie proste równoległe, odległość między nimi liczysz jako odległość dowolnego punktu jednej od drugiej.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $|AB| = \\sqrt{(\\Delta x)^{2} + (\\Delta y)^{2}}$.
• Środek odcinka: średnie arytmetyczne współrzędnych.
• $d = \\frac{|Ax_{0} + By_{0} + C|}{\\sqrt{A^{2} + B^{2}}}$.`,
        },
      ],
    },
    {
      slug: 'geometria-okrag-analityczny',
      title: 'Równanie okręgu i jego przecięcia',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['VIII.4', 'VIII.6'],
      objectives: [
        'Zapisujesz i interpretujesz równanie okręgu',
        'Wyznaczasz środek i promień z równania okręgu',
        'Rozwiązujesz zadania o przecięciu prostej z okręgiem',
      ],
      skills: [
        { slug: 'geometria-okrag', name: 'Równanie okręgu', description: 'Zapisuje równanie okręgu i odczytuje z niego środek oraz promień.', level: 'basic' },
        { slug: 'geometria-przeciecia', name: 'Przecięcia prostej i okręgu', description: 'Wyznacza punkty przecięcia prostej z okręgiem i analizuje ich liczbę.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Okrąg w układzie współrzędnych ma zawsze ten sam wzór — różnią się tylko liczby w środku. Umiejąc go zapisać, łatwo policzyć, kiedy prosta go przecina, a kiedy omija.',
        },
        {
          type: 'formula',
          title: 'Postać środkowa i ogólna',
          body: 'Okrąg o środku $O(p, q)$ i promieniu $r$ opisują dwa równoważne wzory:',
          formula: '(x - p)^{2} + (y - q)^{2} = r^{2} \\qquad x^{2} + y^{2} - 2px - 2qy + p^{2} + q^{2} - r^{2} = 0',
        },
        {
          type: 'paragraph',
          title: 'Jak odczytać środek i promień',
          body: 'W postaci ogólnej porównuj współczynniki przy $x$ i $y$: środek to $(p, q)$ ze znakami przeciwnymi niż połowa tych współczynników. Promień liczysz z $r^{2} = p^{2} + q^{2} - C$, gdzie $C$ to wyraz wolny.',
        },
        {
          type: 'example',
          title: 'Przykład — analiza okręgu',
          body: 'Okrąg $x^{2} + y^{2} - 6x + 4y - 12 = 0$ ma środek $O(3, -2)$, bo $p = -\\frac{-6}{2} = 3$ oraz $q = -\\frac{4}{2} = -2$. Promień: $r^{2} = 3^{2} + (-2)^{2} - (-12) = 9 + 4 + 12 = 25$, więc $r = 5$.',
        },
        {
          type: 'heading',
          title: 'Prosta i okrąg',
          body: 'Rozwiązanie zadania o przecięciu to zawsze ten sam schemat: zapisz okrąg i prostą w postaci ogólnej, połącz je w układ, rozwiąż metodą podstawiania lub przeciwnych współczynników, a potem podstaw współrzędne do prostej. Liczba punktów przecięcia zależy od odległości środka okręgu od prostej.',
        },
        {
          type: 'example',
          title: 'Przykład — przecięcie',
          body: 'Okrąg $x^{2} + y^{2} = 25$ i prosta $y = 3$. Podstawiamy: $x^{2} + 9 = 25$, więc $x^{2} = 16$ i $x = \\pm 4$. Punkty przecięcia to $(4, 3)$ i $(-4, 3)$ — dokładnie dwa, zgodnie z tym, że prosta nie przechodzi przez środek okręgu.',
        },
        {
          type: 'heading',
          title: 'Styczna do okręgu',
          body: 'Prosta przechodząca przez środek okręgu nigdy nie jest jego styczną. Odległość od środka okręgu do stycznej musi być równa promieniowi — to najprostszy warunek do sprawdzenia.',
        },
        {
          type: 'example',
          title: 'Przykład — sprawdzenie stycznej',
          body: 'Czy prosta $3x + 4y - 25 = 0$ jest styczna do okręgu o środku $(0, 0)$ i promieniu $5$? Odległość środka od prostej: $d = \\frac{|-25|}{\\sqrt{9 + 16}} = \\frac{25}{5} = 5 = r$, więc prosta jest styczną (przebiega w odległości jednego promienia).',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Błędny znak przy odczytywaniu środka z równania okręgu — środek to $(-\\frac{A}{2}, -\\frac{B}{2})$.
• Zapominanie, że $r^{2}$ trzeba jeszcze spierwiastkować.
• Uznawanie prostej przechodzącej przez środek za styczną — to wykluczone.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Rysuj okrąg i prostą zanim zaczniesz liczyć. Z rysunku od razu widać, ile jest punktów przecięcia i czy prosta jest styczną, co pozwala zweryfikować wynik.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $(x - p)^{2} + (y - q)^{2} = r^{2}$ — środek czytamy wprost.
• Środek z postaci ogólnej to $(-\\frac{A}{2}, -\\frac{B}{2})$.
• Prosta jest styczna, gdy odległość środka od niej równa się promieniowi.`,
        },
      ],
    },
  ],
}
