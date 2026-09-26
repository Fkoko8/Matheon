import type { ContentTopic } from '@/content/types'

export const wymierne: ContentTopic = {
  slug: 'wymierne',
  title: 'Funkcje wymierne',
  description: 'Badasz dziedzinę, miejsca zerowe, wartości i asymptoty funkcji wymiernych.',
  level: 'extended',
  lessons: [
    {
      slug: 'wymierne-dziedzina',
      title: 'Dziedzina i miejsca zerowe',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['IV.7'],
      objectives: [
        'Wyznaczasz dziedzinę funkcji wymiernej',
        'Znajdujesz miejsca zerowe i odróżniasz je od wykluczonych punktów',
        'Upraszczasz ułamek bez gubienia wykluczonych wartości',
      ],
      skills: [
        { slug: 'wymierne-dziedzina', name: 'Dziedzina', description: 'Wyznacza dziedzinę funkcji wymiernej.', level: 'extended' },
        { slug: 'wymierne-zera', name: 'Miejsca zerowe', description: 'Wyznacza miejsca zerowe i redukuje ułamek.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Funkcja wymierna to iloraz dwóch wielomianów. Cała trudność polega na jednym zakazie: mianownik nie może być zerem. Z tego wynikają dziedzina, asymptoty i osobliwości — dlatego to zawsze pierwszy krok.',
        },
        {
          type: 'formula',
          title: 'Dziedzina funkcji wymiernej',
          body: 'Dziedzinę wyznacza sam mianownik — licznik nie ma tu nic do rzeczy.',
          formula: 'f(x)=\\frac{P(x)}{Q(x)}, \\qquad D_f=\\{x : Q(x)\\neq 0\\}',
        },
        {
          type: 'example',
          title: 'Przykład — prosta dziedzina',
          body: 'Dla $f(x) = \\frac{x+1}{x-2}$ warunek to $x - 2 \\neq 0$, czyli $x \\neq 2$. Zatem $D_f = \\mathbb{R} \\setminus \\{2\\}$. Licznik zeruje się dla $x = -1$, a $-1$ należy do dziedziny, więc $x = -1$ jest miejscem zerowym.',
        },
        {
          type: 'example',
          title: 'Przykład — dwa wykluczenia',
          body: 'Dla $f(x) = \\frac{x-1}{(x-2)(x+3)}$ mianownik zeruje się dla $x = 2$ lub $x = -3$, więc $D_f = \\mathbb{R} \\setminus \\{2, -3\\}$. Miejsce zerowe: licznik $x - 1 = 0$ daje $x = 1$ (należy do dziedziny).',
        },
        {
          type: 'example',
          title: 'Przykład — osobliwość usuwalna',
          body: `Dla $f(x) = \\frac{x^{2}-9}{x-3}$ rozkładamy licznik: $\\frac{(x-3)(x+3)}{x-3} = x+3$ — ale tylko dla $x \\neq 3$. Punkt $x = 3$ pozostaje wykluczony z dziedziny, nawet jeśli po skróceniu wzór „działa”.

Wykres to prosta $y = x+3$ z dziurą w punkcie $(3, 6)$.`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Skracanie czynnika **przed** wyznaczeniem dziedziny — wykluczony punkt nie znika po skróceniu.\n• Wyznaczanie dziedziny z licznika zamiast z mianownika.\n• Pomylenie miejsca zerowego (licznik $=0$) z asymptotą pionową (mianownik $=0$).\n• Zapis dziedziny z domkniętym nawiasem w miejscu wykluczonego punktu — ten punkt nigdy nie należy do dziedziny.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zapisuj dziedzinę zawsze **przed** upraszczaniem. W zadaniach otwartych egzaminator sprawdza, czy pamiętasz o wykluczeniu — sam wynik bez dziedziny może nie dostać pełnej liczby punktów.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Dziedzinę wyznacza mianownik: $Q(x) \\neq 0$.\n• Miejsce zerowe to pierwiastek licznika należący do dziedziny.\n• Skracanie nie usuwa wykluczonego punktu — to osobliwość usuwalna.\n• Na wykresie wykluczony punkt to „dziura”.`,
        },
      ],
    },
    {
      slug: 'wymierne-asymptoty',
      title: 'Asymptoty i interpretacja wykresu',
      durationMinutes: 25,
      difficulty: 4,
      requirements: ['IV.7'],
      objectives: [
        'Wyznaczasz asymptoty pionowe i poziome funkcji wymiernej',
        'Porównujesz stopnie licznika i mianownika',
        'Szkicujesz wykres na podstawie asymptot i miejsc zerowych',
      ],
      skills: [
        { slug: 'wymierne-asymptoty', name: 'Asymptoty', description: 'Wyznacza asymptoty funkcji wymiernej.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Asymptoty to proste, do których wykres się zbliża, ale ich nie dotyka. Dla funkcji wymiernej wystarczą dwa pytania: gdzie zeruje się mianownik (asymptota pionowa) i co się dzieje przy $|x| \\to \\infty$ (asymptota pozioma).',
        },
        {
          type: 'formula',
          title: 'Asymptota pionowa i pozioma',
          body: 'Pionowa powstaje w pierwiastkach mianownika (gdy nie skracają się z licznikiem). Poziomą wyznacza granica w nieskończoności.',
          formula: 'x=a \\text{ — asymptota pionowa} \\iff Q(a)=0, \\qquad y=g \\iff \\lim_{|x|\\to\\infty} f(x)=g',
        },
        {
          type: 'table',
          title: 'Porównanie stopni licznika i mianownika',
          body: `| Stopnie | Asymptota pozioma | Przykład |\n|---|---|---|\n| licznik < mianownik | $y = 0$ | $\\frac{1}{x-3} \\to 0$ |\n| licznik = mianownik | $y = \\frac{a}{b}$ (iloraz współczynników wiodących) | $\\frac{2x+1}{x+4} \\to 2$ |\n| licznik > mianownik | brak asymptoty poziomej | $\\frac{x^{2}}{x+1}$ |`,
        },
        {
          type: 'diagram',
          title: 'Asymptoty w praktyce',
          body: 'Wykres $f(x) = \\frac{1}{x-3}$ ma asymptotę pionową $x = 3$ i poziomą $y = 0$. Punkt $(4, 1)$ pokazuje, że gałąź po prawej stronie leży nad osią.',
          figure: {
            kind: 'plot',
            xMin: -3,
            xMax: 9,
            yMin: -5,
            yMax: 5,
            caption: 'Wykres f(x) = 1/(x−3): asymptota pionowa x = 3 (linia przerywana) i pozioma y = 0; punkt (4, 1) należy do wykresu.',
            curves: [{ expr: '1/(x-3)', label: 'f(x) = 1/(x−3)', color: 'violet' }],
            guides: [
              { orientation: 'vertical', value: 3, label: 'x = 3', dashed: true },
              { orientation: 'horizontal', value: 0, label: 'y = 0', dashed: true },
            ],
            points: [{ x: 4, y: 1, label: '(4, 1)', color: 'amber' }],
          },
        },
        {
          type: 'example',
          title: 'Przykład — oba typy asymptot',
          body: `Dla $f(x) = \\frac{2x+1}{x+4}$: mianownik zeruje się dla $x = -4$, więc asymptota pionowa to $x = -4$. Stopnie licznika i mianownika są równe, więc asymptota pozioma to $y = \\frac{2}{1} = 2$. Miejsce zerowe: $2x + 1 = 0$, czyli $x = -\\frac{1}{2}$.`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Uznanie pierwiastka mianownika za asymptotę pionową, gdy czynnik się skraca (to wtedy dziura, nie asymptota).\n• Liczenie asymptoty pionowej z licznika.\n• Przy równych stopniach branie złego stosunku — interesują tylko współczynniki przy najwyższych potęgach.\n• Twierdzenie, że wykres przecina asymptotę pionową — nie może, bo ten punkt nie należy do dziedziny.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Szkic wykresu zrób w trzech krokach: narysuj asymptoty przerywaną linią, zaznacz miejsca zerowe i przecięcie z osią $OY$ (to $f(0)$), a potem poprowadź gałęzie. Taki rysunek w zadaniu otwartym często wystarcza do uzasadnienia odpowiedzi.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Asymptota pionowa: pierwiastek mianownika (nieskracający się).\n• Stopień licznika < mianownika: $y = 0$; równe: $y =$ iloraz współczynników wiodących; większy: brak.\n• Miejsce zerowe z licznika, asymptoty z mianownika i granicy.\n• Wykres nigdy nie przecina asymptoty pionowej.`,
        },
      ],
    },
  ],
}
