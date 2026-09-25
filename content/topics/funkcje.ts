import type { ContentTopic } from '@/content/types'

export const funkcje: ContentTopic = {
  slug: 'funkcje',
  title: 'Funkcje',
  description: 'Odczytywanie własności z wykresu, dziedzina i miejsca zerowe, funkcja liniowa oraz logarytmy i funkcja wykładnicza — fundament czytania matematyki na maturze.',
  level: 'basic',
  lessons: [
    {
      slug: 'funkcje-wlasnosci',
      title: 'Własności funkcji: odczyt z wykresu i ze wzoru',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['IV.1', 'IV.2'],
      objectives: [
        'Odczytujesz z wykresu dziedzinę, zbiór wartości, miejsca zerowe i przedziały monotoniczności',
        'Wyznaczasz dziedzinę funkcji zadanej wzorem (mianownik, pierwiastek)',
        'Obliczasz miejsca zerowe funkcji i wartość funkcji dla danego argumentu',
      ],
      skills: [
        { slug: 'funkcje-odczyt-wykresu', name: 'Odczyt własności z wykresu', description: 'Odczytuje dziedzinę, zbiór wartości, miejsca zerowe i monotoniczność z wykresu funkcji.', level: 'basic' },
        { slug: 'funkcje-dziedzina-wzor', name: 'Dziedzina ze wzoru', description: 'Wyznacza dziedzinę funkcji z mianownikiem lub pierwiastkiem.', level: 'basic' },
        { slug: 'funkcje-miejsca-zerowe', name: 'Miejsca zerowe', description: 'Oblicza miejsca zerowe funkcji zadanej wzorem.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Pierwsze zadania z funkcji na maturze to prawie zawsze odczyt z wykresu: dziedzina, zbiór wartości, miejsca zerowe, przedziały rosnania i malewania. To darmowe punkty — jeśli wiesz, co dokładnie oznacza każde pojęcie.',
        },
        {
          type: 'table',
          title: 'Cztery pojęcia, które musisz rozróżniać',
          body: `| Pojęcie | Co to jest | Gdzie szukać na wykresie |
|---|---|---|
| dziedzina | argumenty, dla których funkcja istnieje | rzut wykresu na oś $OX$ |
| zbiór wartości | wartości, które funkcja przyjmuje | rzut wykresu na oś $OY$ |
| miejsca zerowe | argumenty $x$, dla których $f(x) = 0$ | punkty przecięcia z osią $OX$ |
| monotoniczność | przedziały rosnania i malewania | gdzie wykres „idzie w górę”, gdzie „w dół” |`,
        },
        {
          type: 'example',
          title: 'Przykład — odczyt z wykresu',
          body: `Wykres funkcji $f$ jest zdefiniowany na $[-3, 5]$ i przechodzi przez punkty $(-3, 0)$, $(-1, 4)$, $(2, -2)$ i $(5, 1)$.

- **dziedzina:** $[-3, 5]$
- **zbiór wartości:** najniższa wartość to $-2$ (w $x=2$), najwyższa $4$ (w $x=-1$), więc $[-2, 4]$
- **miejsce zerowe:** wykres przecina oś $OX$ w $x = -3$ (i ewentualnie między $2$ a $5$)
- **monotoniczność:** rośnie na $[-3, -1]$, maleje na $[-1, 2]$, rośnie na $[2, 5]$`,
        },
        {
          type: 'diagram',
          title: 'Szkic omówionego wykresu',
          body: 'Punkty z treści zadania połączone łamaną — dokładnie taki szkic warto zrobić na brudnopisie.',
          figure: {
            caption: 'Dziedzina $[-3, 5]$, zbiór wartości $[-2, 4]$, monotoniczność odczytana z przebiegu.',
            kind: 'plot',
            xMin: -4,
            xMax: 6,
            yMin: -3.5,
            yMax: 5,
            points: [
              { x: -3, y: 0, label: '(-3, 0)', color: 'emerald' },
              { x: -1, y: 4, label: '(-1, 4)', color: 'amber' },
              { x: 2, y: -2, label: '(2, -2)', color: 'rose' },
              { x: 5, y: 1, label: '(5, 1)', color: 'emerald' },
            ],
          },
        },
        {
          type: 'heading',
          title: 'Dziedzina funkcji zadanej wzorem',
          body: 'Dwa zakazy: **nie dzielimy przez zero** i **nie wyciągamy pierwiastka parzystego stopnia z liczby ujemnej**. Dziedziną są wszystkie liczby poza tymi, które łamią któryś z zakazów.',
        },
        {
          type: 'example',
          title: 'Przykład — dziedzina',
          body: `$f(x) = \\frac{x-1}{x+2}$: warunek $x + 2 \\neq 0$, więc dziedzina: $x \\neq -2$, czyli $\\mathbb{R} \\setminus \\{-2\\}$.

$g(x) = \\sqrt{2x - 6}$: warunek $2x - 6 \\geq 0$, więc $x \\geq 3$, dziedzina $[3, +\\infty)$.`,
        },
        {
          type: 'example',
          title: 'Przykład — miejsca zerowe ze wzoru',
          body: '$f(x) = (x+1)(x-4)$: miejsce zerowe zeruje jeden z czynników, więc $x = -1$ lub $x = 4$. Funkcja $g(x) = x^{2} + 3$ nie ma miejsc zerowych — kwadrat plus $3$ jest zawsze dodatni.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie dziedziny ze zbiorem wartości — dziedzina jest „poziomo” (oś $OX$), zbiór wartości „pionowo” (oś $OY$).
• Zapisywanie dziedziny funkcji z mianownikiem z nawiasem kwadratowym w miejscu wyłączonego punktu — wykluczony punkt nie może być w dziedzinie.
• Wskazywanie miejsca zerowego tam, gdzie wykres tylko dotyka osi w wykluczonym punkcie dziedziny.
• Odczyt monotoniczności bez ograniczenia do dziedziny — przedziały podaje się wewnątrz dziedziny.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zadania „odczytaj z wykresu” punktują za słowa kluczowe: jeśli pytanie brzmi „podaj przedział malewania”, odpowiedź zapisz dokładnie jako przedział, np. $[-1, 2]$, a nie zdaniem „funkcja maleje od minus jedynki do dwójki”.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Dziedzina: rzut na oś $OX$; zbiór wartości: rzut na oś $OY$.
• Miejsca zerowe = przecięcia z osią $OX$.
• Mianownik różny od zera, wyrażenie pod pierwiastkiem parzystym nieujemne.
• Rosnąca: większemu argumentowi odpowiada większa wartość.`,
        },
      ],
    },
    {
      slug: 'funkcje-liniowa',
      title: 'Funkcja liniowa',
      durationMinutes: 22,
      difficulty: 2,
      requirements: ['IV.3'],
      objectives: [
        'Odczytujesz znaczenie współczynników $a$ i $b$ we wzorze $f(x) = ax + b$',
        'Wyznaczasz wzór funkcji liniowej z dwóch punktów lub z warunków',
        'Stosujesz funkcję liniową w zadaniach praktycznych (koszty, przeliczenia)',
      ],
      skills: [
        { slug: 'funkcje-liniowa', name: 'Funkcja liniowa', description: 'Interpretuje współczynniki, wyznacza wzór i stosuje funkcję liniową w zadaniach.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'formula',
          title: 'Wzór i współczynniki',
          body: 'Wykres to prosta: $a$ to nachylenie (o ile zmienia się wartość, gdy argument rośnie o $1$), $b$ to przecięcie z osią $OY$. $a > 0$ — rosnąca, $a < 0$ — malejąca, $a = 0$ — stała.',
          formula: 'f(x) = ax + b \\quad \\text{gdzie} \\quad a = \\frac{\\Delta y}{\\Delta x} = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}',
        },
        {
          type: 'diagram',
          title: 'Znaczenie współczynników $a$ i $b$',
          body: 'Ta sama rzędna przecięcia $b = 1$, trzy różne nachylenia: rosnąca, stroma rosnąca i malejąca.',
          figure: {
            caption: 'Współczynnik $a$ steruje nachyleniem, $b$ — przecięciem z osią $OY$.',
            kind: 'plot',
            xMin: -4,
            xMax: 4,
            yMin: -5,
            yMax: 6,
            curves: [
              { expr: 'x+1', label: 'a = 1', color: 'violet' },
              { expr: '3x+1', label: 'a = 3', color: 'emerald' },
              { expr: '-0.5x+1', label: 'a = -1/2', color: 'rose' },
            ],
            points: [{ x: 0, y: 1, label: 'b = 1', color: 'amber' }],
          },
        },
        {
          type: 'example',
          title: 'Przykład — wyznaczanie wzoru',
          body: `Funkcja liniowa przecina oś $OY$ w punkcie $(0, 3)$ i ma miejsce zerowe $x = 2$. Zatem $b = 3$, a z $0 = 2a + 3$ dostajemy $a = -\\frac{3}{2}$. Wzór: $f(x) = -\\frac{3}{2}x + 3$.`,
        },
        {
          type: 'example',
          title: 'Przykład — z dwóch punktów',
          body: `Prosta przechodzi przez $(1, 4)$ i $(3, 10)$. Nachylenie: $a = \\frac{10-4}{3-1} = 3$. Podstawiam $(1,4)$: $4 = 3 \\cdot 1 + b$, więc $b = 1$. Wzór: $f(x) = 3x + 1$.`,
        },
        {
          type: 'paragraph',
          title: 'Zadania praktyczne',
          body: 'Funkcja liniowa rządzi stałymi stawkami: taryfa taksówki (opłata początkowa = $b$, cena za kilometr = $a$), abonament plus opłata za minutę, naliczanie za bagaż. Uwaga na kontekst: cena nie może być ujemna, liczba kilometrów nie ułamkowa — dziedzinę zapisuj zgodnie z zadaniem.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Liczenie nachylenia „na odwrót”: $\\frac{x_2-x_1}{y_2-y_1}$ zamiast $\\frac{\\Delta y}{\\Delta x}$.
• Podstawienie punktu do niewłaściwego miejsca równania: współrzędne $(x, y)$ to $(x, f(x))$.
• Mylenie „miejsca zerowego” (argument!) z wartością funkcji w zerze ($f(0) = b$).
• Zapominanie o jednostkach w zadaniach praktycznych.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach o taryfach zawsze sprawdź, co oznacza punkt przecięcia z osią $OY$ (koszt startowy) i co nachylenie (koszt jednostkowy). Odpowiedź w zadaniu tekstowym kończ zdaniem z jednostkami — „za $8$ km zapłacimy $39$ zł”.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $a$ = nachylenie = $\\frac{\\Delta y}{\\Delta x}$; $b$ = przecięcie z osią $OY$.
• Wzór z dwóch punktów: najpierw $a$, potem $b$ przez podstawienie.
• Miejsce zerowe: rozwiąż $ax + b = 0$.
• W zadaniach praktycznych pilnuj sensu dziedziny.`,
        },
      ],
    },
    {
      slug: 'funkcje-logarytmy',
      title: 'Logarytmy i funkcja wykładnicza',
      durationMinutes: 28,
      difficulty: 3,
      requirements: ['IV.6'],
      objectives: [
        'Obliczasz logarytmy i stosujesz prawa logarytmów',
        'Rozpoznajesz własności funkcji wykładniczej w zależności od podstawy',
        'Rozwiązujesz proste równania wykładnicze i logarytmiczne',
      ],
      skills: [
        { slug: 'funkcje-logarytmy', name: 'Logarytmy', description: 'Oblicza logarytmy i stosuje prawa logarytmów do upraszczania wyrażeń.', level: 'basic' },
        { slug: 'funkcje-wykladnicza', name: 'Funkcja wykładnicza', description: 'Posługuje się funkcją wykładniczą i rozwiązuje proste równania wykładnicze.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'formula',
          title: 'Definicja logarytmu',
          body: 'Logarytm odpowiada na pytanie: „do jakiej potęgi podnieść podstawę, by dostać liczbę logarytmowaną?”. Warunki: podstawa $a > 0$, $a \\neq 1$, liczba logarytmowana $c > 0$.',
          formula: '\\log_a c = x \\iff a^{x} = c',
        },
        {
          type: 'example',
          title: 'Przykład — rachunek w pamięci',
          body: '$\\log_2 32 = 5$ (bo $2^5 = 32$), $\\log_3 \\frac{1}{9} = -2$ (bo $3^{-2} = \\frac{1}{9}$), $\\log_{\\frac{1}{2}} 8 = -3$ (bo $\\left(\\frac{1}{2}\\right)^{-3} = 8$).',
        },
        {
          type: 'formula',
          title: 'Prawa logarytmów',
          body: 'Te trzy prawa załatwiają niemal wszystkie zadania zamknięte z logarytmów.',
          formula: '\\log_a (xy) = \\log_a x + \\log_a y \\quad | \\quad \\log_a \\frac{x}{y} = \\log_a x - \\log_a y \\quad | \\quad \\log_a x^{n} = n \\log_a x',
        },
        {
          type: 'example',
          title: 'Przykład — uproszczenie',
          body: `Wiadomo, że $\\log_2 6 = m$. Wtedy $\\log_2 48 = \\log_2 (8 \\cdot 6) = \\log_2 8 + \\log_2 6 = 3 + m$, a $\\log_2 \\sqrt{6} = \\frac{1}{2}m$.`,
        },
        {
          type: 'heading',
          title: 'Funkcja wykładnicza',
          body: '$f(x) = a^{x}$ z $a > 0$, $a \\neq 1$: dla $a > 1$ rosnąca (wzrost, odsetki składane), dla $0 < a < 1$ malejąca (rozpad, zużycie). Wykres zawsze przechodzi przez $(0, 1)$ i nigdy nie dotyka osi $OX$ — zbiór wartości to $(0, +\\infty)$.',
        },
        {
          type: 'example',
          title: 'Przykład — równanie wykładnicze',
          body: `Rozwiąż $2^{x+1} = \\frac{1}{8}$. Zapisujemy $\\frac{1}{8} = 2^{-3}$, więc $x + 1 = -3$ i $x = -4$.

Rozwiąż $3^{2x} = 27$: $27 = 3^{3}$, więc $2x = 3$, $x = 1{,}5$.`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Logarytmowanie liczb niedodatnich: $\\log_2 (-4)$ i $\\log_2 0$ nie istnieją.
• „Rozbijanie” $\\log_a (x+y)$ na $\\log_a x + \\log_a y$ — to NIE jest prawdziwe! Prawo dotyczy tylko iloczynu i ilorazu.
• Pomylenie $\\log_a x^{n}$ z $\\left(\\log_a x\\right)^{n}$ — potęga schodzi przed logarytm, nie odwrotnie.
• Zapominanie, że $a^{-x} = \\frac{1}{a^{x}}$, przy porównywaniu potęg.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach zamkniętych z logarytmami najpierw doprowadź wszystko do jednej podstawy i jednej liczby logarytmowanej przez prawa logarytmów — zwykle zostaje prosty rachunek na liczbach $2$, $3$, $5$. Funkcja wykładnicza pojawia się też w procentach składanych (dział Ciągi) — tam użyj $w_n = w_0 \\cdot q^{n}$.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $\\log_a c = x \\iff a^x = c$; argument zawsze większy od zera.
• Iloczyn to suma logarytmów; iloraz to różnica; potęga schodzi przed logarytm.
• $a^u = a^v \\iff u = v$ — klucz do równań wykładniczych.
• $a > 1$: rośnie; $0 < a < 1$: maleje.`,
        },
      ],
    },
  ],
}
