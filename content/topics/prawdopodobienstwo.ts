import type { ContentTopic } from '@/content/types'

export const prawdopodobienstwo: ContentTopic = {
  slug: 'prawdopodobienstwo',
  title: 'Prawdopodobieństwo',
  description: 'Prawdopodobieństwo klasyczne i jego własności, prawdopodobieństwo warunkowe i całkowite, schemat Bernoulliego oraz zastosowania w geometrii i kombinatoryce.',
  level: 'basic',
  lessons: [
    {
      slug: 'prawdopodobienstwo-klasyczne',
      title: 'Prawdopodobieństwo klasyczne',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['XI.1'],
      objectives: [
        'Obliczasz prawdopodobieństwo zdarzenia metodą klasyczną',
        'Stosujesz własności sumy i dopełnienia zdarzeń',
        'Rozpoznajesz zadania wymagające drzewka',
      ],
      skills: [
        { slug: 'prawdopodobienstwo-klasyczne', name: 'Prawdopodobieństwo klasyczne', description: 'Oblicza prawdopodobieństwo zdarzenia jako iloraz liczby sprzyjających i liczby wszystkich równie prawdopodobnych wyników.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Prawdopodobieństwo klasyczne jest najprostszym przypadkiem: zakładasz, że wszystkie wyniki są równie prawdopodobne, i liczysz, ile z nich sprzyja zdarzeniu. Cała sztuka polega na właściwym rozpoznaniu zbioru wyników.',
        },
        {
          type: 'formula',
          title: 'Definicja klasyczna',
          body: 'Jeśli wszystkie wyniki doświadczenia są równie prawdopodobne, to dla zdarzenia losowego $A$:',
          formula: 'P(A) = \\frac{\\text{liczba wyników sprzyjających } A}{\\text{liczba wszystkich wyników}}',
        },
        {
          type: 'formula',
          title: 'Podstawowe własności',
          body: 'Własności, które pozwalają skrócić obliczenia:',
          formula: 'P(\\Omega) = 1 \\quad P(\\varnothing) = 0 \\quad P(A^{c}) = 1 - P(A) \\quad P(A \\cup B) = P(A) + P(B) - P(A \\cap B)',
        },
        {
          type: 'example',
          title: 'Przykład — kostka',
          body: 'Rzucamy kostką sześcienną. Jakie jest prawdopodobieństwo, że wypadnie więcej niż $4$? Wyniki sprzyjające to $5$ i $6$, czyli $2$ z $6$: $P = \\frac{2}{6} = \\frac{1}{3}$. Prawdopodobieństwo przeciwnego zdarzenia to $1 - \\frac{1}{3} = \\frac{2}{3}$ — i warto skorzystać z tego skrócenia, gdy sprzyjających wyników jest dużo.',
        },
        {
          type: 'example',
          title: 'Przykład — dwa rzuty',
          body: 'Rzucamy dwiema kostkami. Liczba wyników sprzyjających sumie $7$ to $6$ (kombinacje $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$), a wszystkich wyników $6 \\cdot 6 = 36$: $P = \\frac{6}{36} = \\frac{1}{6}$. Dwa rzędy w tabeli $6 \\times 6$ to najprostsza wizualizacja takich zadań.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie licznika (sprzyjające) z mianownikiem (wszystkie) — wynik zawsze jest liczbą z zakresu $[0, 1]$.
• Założenie, że zdarzenia „niezależne” mają prawdopodobieństwo $\\frac{1}{2}$ — rzut monetą nie jest zawsze równy.
• Liczenie wyników, które nie są równie prawdopodobne (np. rzucone sześcianiane kostki).`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Po obliczeniu sprawdź, czy wynik mieści się w przedziale $[0, 1]$ oraz czy nie da się go skrócić — to najszybsza kontrola poprawności.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $P(A) = \\frac{\\text{sprzyjające}}{\\text{wszystkie}}$ dla równie prawdopodobnych wyników.
• $P(A^{c}) = 1 - P(A)$ oraz $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.
• Wynik zawsze należy do przedziału $[0, 1]$.`,
        },
      ],
    },
    {
      slug: 'prawdopodobienstwo-warunkowe',
      title: 'Prawdopodobieństwo warunkowe, całkowite i Bernoulliego',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['XI.3', 'XI.4', 'XI.5'],
      objectives: [
        'Obliczasz prawdopodobieństwo warunkowe',
        'Stosujesz wzór na prawdopodobieństwo całkowite',
        'Rozwiązujesz zadania z rozkładem dwumianowym',
      ],
      skills: [
        { slug: 'prawdopodobienstwo-warunkowe', name: 'Prawdopodobieństwo warunkowe', description: 'Oblicza prawdopodobieństwo warunkowe i stosuje wzór na prawdopodobieństwo całkowite.', level: 'extended' },
        { slug: 'prawdopodobienstwo-bernoulli', name: 'Schemat Bernoulliego', description: 'Stosuje schemat Bernoulliego do zliczania prawdopodobieństw powtórzeń doświadczenia.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Prawdopodobieństwo warunkowe pyta: „zakładając, że to już się stało, ile wynie prawdopodobieństwo reszty?”. To fundament zadań o losowaniu bez ograniczeń i o zdarzeniach powtarzających się.',
        },
        {
          type: 'formula',
          title: 'Prawdopodobieństwo warunkowe',
          body: 'Jeśli zdarzenie $B$ zachodzi, prawdopodobieństwo zdarzenia $A$ wynosi:',
          formula: 'P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}',
        },
        {
          type: 'example',
          title: 'Przykład — warunkowe',
          body: 'Z $30$ kart wybieramy jedną. $P(\\text{walet} \\mid \\text{figura}) = \\frac{4}{12} = \\frac{1}{3}$, bo wszystkie $12$ figur jest warunkiem, a waletów jest $4$. Zwróć uwagę, że w mianowniku zostaje tylko liczba wyników spełniających warunek, nie cała różnorodność.',
        },
        {
          type: 'formula',
          title: 'Prawdopodobieństwo całkowite',
          body: 'Jeśli zdarzenia $B_1, \\ldots, B_n$ są rozłączne i wyczerpują całą przestrzeń, to:',
          formula: 'P(A) = P(A \\mid B_{1}) \\cdot P(B_{1}) + P(A \\mid B_{2}) \\cdot P(B_{2}) + \\ldots + P(A \\mid B_{n}) \\cdot P(B_{n})',
        },
        {
          type: 'example',
          title: 'Przykład — całkowite',
          body: 'Z dwóch urn: pierwsza zawiera $3$ białe i $5$ czarnych, druga $1$ białą i $9$ czarnych. Losujemy urnę z prawdopodobieństwem $\\frac{2}{3}$ na pierwszą. Prawdopodobieństwo wylosowania białej kuli: $\\frac{2}{3} \\cdot \\frac{3}{8} + \\frac{1}{3} \\cdot \\frac{1}{10} = \\frac{1}{4} + \\frac{1}{30} = \\frac{17}{60}$.',
        },
        {
          type: 'heading',
          title: 'Schemat Bernoulliego',
          body: 'Powtarzamy doświadczenie $n$ razy, niezależnie, z prawdopodobieństwem sukcesu $p$. Prawdopodobieństwo dokładnie $k$ sukcesów daje wzór rozkładu dwumianowego (rozkładu Bernoulliego).',
        },
        {
          type: 'formula',
          title: 'Rozkład dwumianowy',
          body: 'Prawdopodobieństwo, że w $n$ niezależnych próbach zajdzie dokładnie $k$ sukcesów:',
          formula: 'P(X = k) = \\binom{n}{k} p^{k} (1 - p)^{n - k}',
        },
        {
          type: 'example',
          title: 'Przykład — rozkład dwumianowy',
          body: 'Rzucamy monetą $3$ razy. Prawdopodobieństwo dokładnie dwóch orłów: $\\binom{3}{2} \\cdot \\left(\\frac{1}{2}\\right)^{2} \\cdot \\left(\\frac{1}{2}\\right)^{1} = 3 \\cdot \\frac{1}{4} \\cdot \\frac{1}{2} = \\frac{3}{8}$. Współczynnik $3$ to liczba sposobów ustawienia dwóch orłów w trzech rzutach.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie prawdopodobieństwa warunkowego z niepod warunkiem — $P(A \\mid B) \\neq P(A)$.
• Pomijanie współczynnika $\\binom{n}{k}$ w rozkładzie dwumianowym.
• Użycie prawdopodobieństwa całkowitego dla zdarzeń, które się nie wykluczają.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Gdy w zadaniu pojawia się „następnie” albo „pod warunkiem”, zapisz wyraźnie, co jest warunkiem — to zawsze wskazuje mianownik we wzorze na prawdopodobieństwo warunkowe.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$.
• Wzór na prawdopodobieństwo całkowite sumuje wagi po rozłącznych przypadkach.
• $\\binom{n}{k} p^{k} (1 - p)^{n - k}$ — rozkład dwumianowy.`,
        },
      ],
    },
  ],
}
