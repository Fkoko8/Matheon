import type { ContentTopic } from '@/content/types'

export const wielomiany: ContentTopic = {
  slug: 'wielomiany',
  title: 'Wielomiany',
  description: 'Rozkładasz wielomiany na czynniki, dzielisz wielomiany i stosujesz twierdzenie o reszcie oraz twierdzenie Bézouta.',
  level: 'extended',
  lessons: [
    {
      slug: 'wielomiany-rozklad',
      title: 'Rozkład na czynniki',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['II.4'],
      objectives: [
        'Wyłączasz wspólny czynnik i stosujesz wzory skróconego mnożenia',
        'Rozkładasz wielomiany metodą grupowania',
        'Odczytujesz miejsca zerowe wprost z postaci iloczynowej',
      ],
      skills: [
        { slug: 'wielomiany-rozkladanie', name: 'Rozkład na czynniki', description: 'Rozkłada wielomiany metodą grupowania i wzorów.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Rozkład na czynniki to pierwszy krok prawie każdego zadania z wielomianami: upraszcza wyrażenia, pozwala rozwiązywać równania i od razu pokazuje miejsca zerowe. Na maturze rozszerzonej rozkład jest zwykle punktowany jako osobna umiejętność — warto mieć wypracowany schemat.',
        },
        {
          type: 'formula',
          title: 'Trzy wzory, które robią najwięcej',
          body: 'Zacznij zawsze od wspólnego czynnika, potem szukaj jednego z tych kształtów.',
          formula: 'a^2-b^2=(a-b)(a+b), \\qquad a^2\\pm 2ab+b^2=(a\\pm b)^2, \\qquad a^3\\pm b^3=(a\\pm b)(a^2\\mp ab+b^2)',
        },
        {
          type: 'heading',
          title: 'Kolejność działań',
          body: 'Rozkładaj w ustalonej kolejności, żeby nie zgubić czynnika: 1) wspólny czynnik, 2) wzór skróconego mnożenia, 3) grupowanie, 4) twierdzenie Bézouta (dla stopni ≥ 3).',
        },
        {
          type: 'example',
          title: 'Przykład — wspólny czynnik i wzór',
          body: `Rozłóż $x^{3} - 4x$. Najpierw wyłączamy $x$: $x(x^{2} - 4)$. W nawiasie rozpoznajemy różnicę kwadratów, więc $x(x-2)(x+2)$.

Zwróć uwagę na kolejność — gdybyś zaczął od wzoru, nie zobaczyłbyś wspólnego $x$.`,
        },
        {
          type: 'example',
          title: 'Przykład — grupowanie',
          body: `Rozłóż $x^{3} + 2x^{2} - 3x - 6$. Grupujemy po dwa wyrazy: $x^{2}(x+2) - 3(x+2) = (x+2)(x^{2} - 3)$.

Kluczowe jest to, że obie grupy mają ten sam czynnik $(x+2)$ — dlatego grupowanie się udaje.`,
        },
        {
          type: 'diagram',
          title: 'Rozkład widoczny na wykresie',
          body: 'Liczba czynników liniowych to liczba miejsc zerowych (z uwzględnieniem krotności). Na wykresie $W(x) = (x+2)(x-1)(x-3)$ widzimy trzy przecięcia z osią $OX$.',
          figure: {
            kind: 'plot',
            xMin: -3.4,
            xMax: 4.2,
            yMin: -9,
            yMax: 11,
            caption: 'W(x) = (x+2)(x−1)(x−3) — trzy czynniki liniowe, więc trzy miejsca zerowe: −2, 1 i 3.',
            curves: [{ expr: 'x^3-2x^2-5x+6', label: 'W(x) = (x+2)(x−1)(x−3)', color: 'violet' }],
            points: [
              { x: -2, y: 0, label: 'x = −2', color: 'emerald' },
              { x: 1, y: 0, label: 'x = 1', color: 'emerald' },
              { x: 3, y: 0, label: 'x = 3', color: 'emerald' },
            ],
          },
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Pomylenie $a^{2} - b^{2}$ z sumą kwadratów — $a^{2} + b^{2}$ **nie** rozkłada się nad liczbami rzeczywistymi.\n• Zgubienie wspólnego czynnika: $2x^{2} - 8 = 2(x^{2}-4) = 2(x-2)(x+2)$, a nie $(2x-2)(2x+2)$.\n• Niepełny rozkład: $(x^{2}-9)$ to jeszcze nie koniec — to $(x-3)(x+3)$.\n• Przy grupowaniu brak wspólnego czynnika w jednej z grup oznacza, że trzeba spróbować innego podziału.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Po rozkładzie zawsze pomnóż czynniki z powrotem — to 10 sekund, a ratuje przed błędem. Jeśli widzisz wielomian stopnia 3 bez wspólnego czynnika, sprawdź najpierw dzielniki wyrazu wolnego (twierdzenie Bézouta) — jeden pierwiastek sprowadza zadanie do trójmianu.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Kolejność: wspólny czynnik → wzór → grupowanie → Bézout.\n• $a^{2}-b^{2}=(a-b)(a+b)$ oraz $a^{3}\\pm b^{3}=(a\\pm b)(a^{2}\\mp ab+b^{2})$.\n• Z postaci iloczynowej miejsca zerowe czytasz natychmiast.\n• Rozkład zawsze można sprawdzić mnożeniem.`,
        },
      ],
    },
    {
      slug: 'wielomiany-dzielenie',
      title: 'Dzielenie wielomianów i reszta',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['II.5'],
      objectives: [
        'Dzielisz wielomiany pisemnie i wyznaczasz iloraz oraz resztę',
        'Stosujesz twierdzenie o reszcie bez wykonywania dzielenia',
        'Wykorzystujesz twierdzenie Bézouta do szukania pierwiastków całkowitych',
      ],
      skills: [
        { slug: 'wielomiany-dzielenie', name: 'Dzielenie wielomianów', description: 'Wykonuje dzielenie wielomianów i oblicza resztę.', level: 'extended' },
        { slug: 'wielomiany-bezout', name: 'Twierdzenie Bézouta', description: 'Bada pierwiastki całkowite i dzielniki.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Dzielenie wielomianów to narzędzie: pozwala rozłożyć wielomian stopnia wyższego niż 2, sprawdzić, czy liczba jest pierwiastkiem, i wyznaczyć resztę. Zamiast liczyć resztę „na siłę”, użyjemy twierdzenia o reszcie — jest krótsze i bezpieczniejsze.',
        },
        {
          type: 'formula',
          title: 'Twierdzenie o reszcie i twierdzenie Bézouta',
          body: 'Reszta z dzielenia przez $x-a$ jest równa wartości wielomianu w punkcie $a$. Szczególny przypadek: reszta $0$ oznacza, że $a$ jest pierwiastkiem.',
          formula: 'P(x)=Q(x)\\cdot(x-a)+P(a) \\qquad \\text{oraz} \\qquad P(a)=0 \\iff (x-a) \\mid P(x)',
        },
        {
          type: 'example',
          title: 'Przykład — reszta bez dzielenia',
          body: 'Dla $P(x) = x^{2} + 2x - 5$ i dzielnika $x - 3$ reszta to $P(3) = 9 + 6 - 5 = 10$. Nie trzeba było wykonywać żadnego dzielenia — podstawiamy i gotowe.',
        },
        {
          type: 'example',
          title: 'Przykład — dzielenie pisemne',
          body: `Podziel $x^{3} - 2x^{2} - 5x + 6$ przez $x - 1$.

$x^{3} \\div x = x^{2}$; mnożymy: $x^{3} - x^{2}$; odejmujemy i zostaje $-x^{2} - 5x + 6$.
$-x^{2} \\div x = -x$; mnożymy: $-x^{2} + x$; zostaje $-6x + 6$.
$-6x \\div x = -6$; mnożymy: $-6x + 6$; reszta $0$.

Iloraz: $x^{2} - x - 6 = (x-3)(x+2)$, więc $P(x) = (x-1)(x-3)(x+2)$.`,
        },
        {
          type: 'table',
          title: 'Jak szukać pierwiastków całkowitych',
          body: `| Krok | Co robisz | Przykład dla $x^{3}-2x^{2}-5x+6$ |\n|---|---|---|\n| 1 | Wypisz dzielniki wyrazu wolnego | $\\pm1, \\pm2, \\pm3, \\pm6$ |\n| 2 | Testuj kandydatów wartością $P(a)$ | $P(1)=0$ — trafione |\n| 3 | Podziel przez $(x-a)$ | dostajesz $x^{2}-x-6$ |\n| 4 | Rozłóż trójmian | $(x-3)(x+2)$ |`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Zmiana znaku przy odejmowaniu w dzieleniu pisemnym — to najczęstsze źródło błędów; odejmuj cały nawias.\n• Zły dzielnik w twierdzeniu o reszcie: dla $x + a$ podstawiamy $x = -a$, a nie $a$.\n• Sprawdzanie zbyt wielu kandydatów — po znalezieniu pierwszego stopień spada i dalej zwykle działa trójmian.\n• Zapominanie, że reszta ma stopień mniejszy niż dzielnik (przy dzielniku liniowym reszta jest liczbą).`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Gdy w zadaniu napisano „wykaż, że $2$ jest pierwiastkiem”, wystarczy policzyć $W(2)$ i pokazać $0$. Przy rozkładzie wielomianu stopnia 3 zapisz kolejno: kandydaci → sprawdzenie → dzielenie → rozkład trójmianu → wszystkie pierwiastki. Za każdy etap są punkty.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Reszta z dzielenia przez $x-a$ to $P(a)$.\n• $a$ jest pierwiastkiem $\\iff (x-a)$ dzieli $P$ (Bézout).\n• Kandydaci na pierwiastki całkowite to dzielniki wyrazu wolnego.\n• Po znalezieniu jednego pierwiastka dzielisz i rozkładasz resztę.`,
        },
      ],
    },
  ],
}
