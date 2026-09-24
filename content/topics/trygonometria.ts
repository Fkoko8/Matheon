import type { ContentTopic } from '@/content/types'

export const trygonometria: ContentTopic = {
  slug: 'trygonometria',
  title: 'Trygonometria',
  description: 'Sinus, cosinus i tangens od trójkąta prostokątnego, przez kąty 30°, 45°, 60° i miarę łukową, aż po tożsamości i równania trygonometryczne w zakresie rozszerzonym.',
  level: 'basic',
  lessons: [
    {
      slug: 'trygonometria-trojkat',
      title: 'Funkcje trygonometryczne w trójkącie prostokątnym',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['VI.1'],
      objectives: [
        'Zapisujesz definicje sinusa, cosinusa i tangensa kąta ostrego',
        'Obliczasz wartości funkcji trygonometrycznych z boków trójkąta',
        'Wyznaczasz boki trójkąta z wykorzystaniem funkcji trygonometrycznych',
      ],
      skills: [
        { slug: 'trygonometria-trojkat', name: 'Trygonometria w trójkącie', description: 'Stosuje definicje sinusa, cosinusa i tangensa kąta ostrego w trójkącie prostokątnym.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Trygonometria w trójkącie prostokątnym to najczęstsza forma zadań trygonometrycznych na poziomie podstawowym: znasz dwa elementy (boki albo kąt), a wyliczasz trzeci. Wszystko opiera się na trzech definicjach, które musisz mieć w pamięci przed maturą.',
        },
        {
          type: 'formula',
          title: 'Definicje dla kąta ostrego α',
          body: 'Naprzeciw — bok leżący naprzeciw kąta, przyprostokątny — przylegający do kąta. Zaimki: „naprzeciw” w liczniku sinusa i tangensa.',
          formula: '\\sin \\alpha = \\frac{a}{c} \\qquad \\cos \\alpha = \\frac{b}{c} \\qquad \\tan \\alpha = \\frac{a}{b}',
        },
        {
          type: 'paragraph',
          title: 'Jak pracować z definicjami',
          body: 'Zawsze rysuj trójkąt i podpisuj boki względem kąta, o który pyta treść. Następnie wybierz definicję, która łączy znane elementy z szukanym. Jeśli znasz dwa boki — oblicz trzeci twierdzeniem Pitagorasa, a potem zapisz stosunek.',
        },
        {
          type: 'example',
          title: 'Przykład — obliczanie sinusa',
          body: 'Trójkąt prostokątny ma przyprostokątne $6$ i $8$. Dla kąta leżącego naprzeciw boku $6$: przeciwprostokątna $c = \\sqrt{36 + 64} = 10$, więc $\\sin \\alpha = \\frac{6}{10} = \\frac{3}{5}$. Tangens: $\\tan \\alpha = \\frac{6}{8} = \\frac{3}{4}$.',
        },
        {
          type: 'example',
          title: 'Przykład — wyznaczanie boku',
          body: 'Drabina o długości $5$ m opiera się o ścianę pod kątem $65^{\\circ}$ do podłoża. Na jakiej wysokości jest jej górny koniec? Wysokość to bok naprzeciw kąta: $h = 5 \\cdot \\sin 65^{\\circ} \\approx 5 \\cdot 0{,}9063 \\approx 4{,}53$ m. W zadaniach praktycznych podawaj wynik z zaokrągleniem i jednostką.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Zamiana miejscami „naprzeciw” i „przy” w definicjach — ratuje rysunek z podpisanymi bokami.
• Liczenie sinusa z przyprostokątnych bez przeciwprostokątnej: w definicji zawsze jest przeciwprostokątna (sinus, cosinus).
• Brak trybu DEG na kalkulatorze — wynik trygonometryczny liczony w radianach jest bezsensowny.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Na maturze podstawowej wartości kątów podają w treści (albo wynik jest „ładny”). Jeśli dostajesz liczbę dziesiętną z długim rozwinięciem, sprawdź, czy nie zamieniłeś boków w definicji.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $\\sin \\alpha = \\frac{\\text{naprzeciw}}{\\text{przeciwprostokątna}}$, $\\cos \\alpha = \\frac{\\text{przy}}{\\text{przeciwprostokątna}}$, $\\tan \\alpha = \\frac{\\text{naprzeciw}}{\\text{przy}}$.
• Rysuj i podpisuj trójkąt przed każdym rachunkiem.
• Pitagoras uzupełnia trzeci bok, gdy brakuje danych do definicji.`,
        },
      ],
    },
    {
      slug: 'trygonometria-katy',
      title: 'Kąty 30°, 45°, 60° i jedynka trygonometryczna',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['VI.2', 'VI.3'],
      objectives: [
        'Posługujesz się wartościami funkcji trygonometrycznych dla kątów 30°, 45°, 60°',
        'Stosujesz jedynkę trygonometryczną do wyznaczania wartości funkcji',
        'Posługujesz się miarą łukową kąta',
      ],
      skills: [
        { slug: 'trygonometria-katy-specjalne', name: 'Kąty 30°, 45°, 60°', description: 'Podaje i stosuje wartości funkcji trygonometrycznych dla kątów 30°, 45°, 60°.', level: 'basic' },
        { slug: 'trygonometria-jedynka', name: 'Jedynka trygonometryczna', description: 'Stosuje tożsamość sin²α + cos²α = 1 oraz miarę łukową kąta.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Trzy „szkolne” kąty mają dokładne wartości trygonometryczne, które matura wymaga na pamięć. Do tego dochodzi jedynka trygonometryczna — związek między sinusem a cosinusem, który pozwala wyliczyć jedną wartość z drugiej.',
        },
        {
          type: 'table',
          title: 'Wartości dla kątów specjalnych',
          body: `| Kąt | $\\sin$ | $\\cos$ | $\\tan$ |
| --- | --- | --- | --- |
| $30^{\\circ}$ | $\\frac{1}{2}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{3}}{3}$ |
| $45^{\\circ}$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $1$ |
| $60^{\\circ}$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$ | $\\sqrt{3}$ |

Zapamiętaj: dla $30^{\\circ}$ i $60^{\\circ}$ sinus i cosinus „zamieniają się miejscami”, a tangens $45^{\\circ}$ to jedynka.`,
        },
        {
          type: 'formula',
          title: 'Jedynka trygonometryczna',
          body: 'Fundamentalna tożsamość — obowiązuje dla każdego kąta:',
          formula: '\\sin^{2} \\alpha + \\cos^{2} \\alpha = 1',
        },
        {
          type: 'example',
          title: 'Przykład — wyznaczanie cosinusa',
          body: 'Wiadomo, że $\\sin \\alpha = \\frac{3}{5}$, a $\\alpha$ jest kątem ostrym. Z jedynki: $\\cos \\alpha = \\sqrt{1 - \\frac{9}{25}} = \\sqrt{\\frac{16}{25}} = \\frac{4}{5}$. Dla kąta ostrego cosinus jest dodatni, więc odpowiedź jest jednoznaczna. Tangens: $\\tan \\alpha = \\frac{3/5}{4/5} = \\frac{3}{4}$.',
        },
        {
          type: 'heading',
          title: 'Miara łukowa',
          body: 'Kąt można mierzyć stopniami albo radianami. Pełny obrót to $360^{\\circ} = 2\\pi$ rad, więc $180^{\\circ} = \\pi$ rad. Przeliczanie: stopnie razy $\\frac{\\pi}{180}$ daje radiany, radiany razy $\\frac{180^{\\circ}}{\\pi}$ daje stopnie. Na przykład $30^{\\circ} = \\frac{\\pi}{6}$, $45^{\\circ} = \\frac{\\pi}{4}$, $60^{\\circ} = \\frac{\\pi}{3}$, $90^{\\circ} = \\frac{\\pi}{2}$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie wartości dla $30^{\\circ}$ i $60^{\\circ}$ — pomyśl: przy mniejszym kącie sinus jest mniejszy.
• Zgubiony znak pierwiastka: $\\cos \\alpha = \\frac{\\sqrt{2}}{2}$, a nie $\\frac{2}{\\sqrt{2}}$... choć po wymnożeniu przez $\\frac{\\sqrt{2}}{\\sqrt{2}}$ to to samo.
• Przeliczanie stopni na radiany bez mnożenia przez $\\frac{\\pi}{180}$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniu otwartym „wykaż, że…” z jedynką trygonometryczną zapisuj każdy krok: podstawienie, przekształcenie, wniosek. Pomijanie kroków to najczęstsza przyczyna utraty punktów w dowodach tożsamości.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Tabela wartości dla $30^{\\circ}$, $45^{\\circ}$, $60^{\\circ}$ — na pamięć.
• $\\sin^{2} \\alpha + \\cos^{2} \\alpha = 1$ wylicza brakującą funkcję.
• $180^{\\circ} = \\pi$ rad; przeliczanie mnożeniem przez $\\frac{\\pi}{180}$.`,
        },
      ],
    },
    {
      slug: 'trygonometria-tozsamosci',
      title: 'Tożsamości i równania trygonometryczne (rozszerzenie)',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['VI.4', 'VI.5'],
      objectives: [
        'Stosujesz wzory na sinus i cosinus sumy oraz różnicy kątów',
        'Stosujesz wzory na kąt podwojony',
        'Rozwiązujesz podstawowe równania trygonometryczne',
      ],
      skills: [
        { slug: 'trygonometria-tozsamosci', name: 'Tożsamości trygonometryczne', description: 'Stosuje wzory na sumę, różnicę i kąt podwojony do upraszczania wyrażeń.', level: 'extended' },
        { slug: 'trygonometria-rownania', name: 'Równania trygonometryczne', description: 'Rozwiązuje równania typu sin x = a, cos x = a, tg x = a w podstawowym zakresie.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji (rozszerzenie)',
          body: 'Wzory trygonometryczne są narzędziem dwóch typów zadań: upraszczania wyrażeń („uproszcz…”, „wykaż, że…”) i rozwiązywania równań. Obie grupy pojawiają się na maturze rozszerzonej regularnie.',
        },
        {
          type: 'formula',
          title: 'Wzory na sumę i różnicę',
          body: 'Cztery najważniejsze wzory — z nich wynikają wzory na kąt podwojony:',
          formula: '\\begin{aligned} \\sin(\\alpha \\pm \\beta) &= \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta \\\\ \\cos(\\alpha \\pm \\beta) &= \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta \\end{aligned}',
        },
        {
          type: 'formula',
          title: 'Kąt podwojony',
          body: 'Podstaw $\\beta = \\alpha$ do wzorów na sumę:',
          formula: '\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha \\qquad \\cos 2\\alpha = \\cos^{2}\\alpha - \\sin^{2}\\alpha = 1 - 2\\sin^{2}\\alpha',
        },
        {
          type: 'example',
          title: 'Przykład — upraszczanie',
          body: 'Uprość $\\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta$. To od razu wzór na sinus sumy: wyrażenie równa się $\\sin(\\alpha + \\beta)$. Odwrotnie: $2\\sin x \\cos x = \\sin 2x$ — jeśli w wyrażeniu widzisz iloczyn „sinus razy cosinus”, myśl o kącie podwojonym.',
        },
        {
          type: 'heading',
          title: 'Równania trygonometryczne',
          body: 'Podstawowe równania rozwiązujesz według schematu: znajdź jeden kąt spełniający równanie (kalkulator albo tabela), a potem dodaj wszystkie kąty o tej samej wartości funkcji. Dla sinusa są zwykle dwa rozwiązania w pełnym obrocie: $x_0$ oraz $180^{\\circ} - x_0$.',
        },
        {
          type: 'example',
          title: 'Przykład — równanie',
          body: 'Rozwiąż $\\sin x = \\frac{1}{2}$ dla $x \\in [0^{\\circ}, 360^{\\circ}]$. Pierwsze rozwiązanie: $x_1 = 30^{\\circ}$. Drugie: $x_2 = 180^{\\circ} - 30^{\\circ} = 150^{\\circ}$. Odpowiedź: $x \\in \\{30^{\\circ}, 150^{\\circ}\\}$. Dla $\\tan x = 1$ byłoby $x = 45^{\\circ}$ oraz $x = 225^{\\circ}$ (tangens powtarza się co $180^{\\circ}$).',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Zapominanie o drugim rozwiązaniu sinusa i cosinusa w $[0^{\\circ}, 360^{\\circ}]$.
• Mylenie znaków we wzorze na cosinus sumy/różnicy ($\\mp$ to kluczowa część wzoru).
• Ograniczanie zbioru rozwiązań bez czytania przedziału z treści zadania.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Narysuj okrąg jednostkowy i zaznacz na nim rozwiązania — obraz natychmiast pokazuje, ile jest kątów i gdzie leżą. Egzaminatorzy chętnie przyznają punkty za poprawnie użyty okrąg jednostkowy.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Wzory na sumę/różnicę i z nich kąt podwojony: $\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$.
• Równanie $\\sin x = a$: dwa kąty w pełnym obrocie ($x_0$ i $180^{\\circ} - x_0$).
• Okrąg jednostkowy to najpewniejsze narzędzie kontroli rozwiązań.`,
        },
      ],
    },
  ],
}
