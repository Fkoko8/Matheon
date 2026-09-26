import type { ContentTopic } from '@/content/types'

export const pochodne: ContentTopic = {
  slug: 'pochodne',
  title: 'Pochodne',
  description: 'Obliczasz pochodne, badasz monotoniczność, ekstrema i wyznaczasz styczne.',
  level: 'extended',
  lessons: [
    {
      slug: 'pochodne-obliczanie',
      title: 'Pochodna i reguły różniczkowania',
      durationMinutes: 35,
      difficulty: 4,
      requirements: ['XII.2'],
      objectives: [
        'Obliczasz pochodne funkcji elementarnych',
        'Stosujesz reguły sumy, iloczynu i ilorazu',
        'Różniczkujesz złożenia prostej postaci',
      ],
      skills: [
        { slug: 'pochodne-obliczanie', name: 'Obliczanie pochodnych', description: 'Oblicza pochodne z reguł różniczkowania.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Pochodna to tempo zmian funkcji i zarazem nachylenie stycznej. Zanim wejdziesz w badanie funkcji, musisz pewnie liczyć pochodne — na maturze rozszerzonej prawie każde zadanie otwarte z analizy zaczyna się właśnie od tego kroku.',
        },
        {
          type: 'formula',
          title: 'Podstawowe pochodne',
          body: 'Warto znać je na pamięć — to one budują wszystkie pozostałe rachunki.',
          formula: "(x^n)'=nx^{n-1}, \\qquad (\\sin x)'=\\cos x, \\qquad (\\cos x)'=-\\sin x, \\qquad (e^x)'=e^x",
        },
        {
          type: 'formula',
          title: 'Reguły działań',
          body: 'Sumę różniczkujesz wyraz po wyrazie; iloczyn i iloraz mają własne wzory. Pamiętaj o minusie w regule ilorazu.',
          formula: "(f+g)'=f'+g', \\qquad (fg)'=f'g+fg', \\qquad \\left(\\frac{f}{g}\\right)'=\\frac{f'g-fg'}{g^2}",
        },
        {
          type: 'example',
          title: 'Przykład — wielomian',
          body: "Dla $f(x) = x^{3} - 6x$ mamy $f'(x) = 3x^{2} - 6$. Każdy wyraz pochodu­jemy osobno — stała $6$ przy $x$ znika, bo $(6x)' = 6$.",
        },
        {
          type: 'example',
          title: 'Przykład — reguła iloczynu',
          body: "Dla $f(x) = x^{2}\\sin x$ stosujemy $(fg)' = f'g + fg'$ z $f = x^{2}$, $g = \\sin x$: $f'(x) = 2x\\sin x + x^{2}\\cos x$. Nie mnożymy pochodnych „osobno” — to najczęstszy błąd.",
        },
        {
          type: 'example',
          title: 'Przykład — uproszczenie przed różniczkowaniem',
          body: "Dla $f(x) = \\frac{x^{2}+1}{x}$ (dla $x \\neq 0$) rozbijamy ułamek: $f(x) = x + \\frac{1}{x} = x + x^{-1}$. Wtedy $f'(x) = 1 - x^{-2} = 1 - \\frac{1}{x^{2}}$. To szybciej niż reguła ilorazu i mniej okazji do błędu.",
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Pomylenie $(\\sin x)' = \\cos x$ z odwrotnością znaku przy cosinusie: $(\\cos x)' = -\\sin x$.\n• Pochodna iloczynu liczona jako $f'g'$ — tak nie jest.\n• Zgubienie mianownika $g^{2}$ w regule ilorazu lub znaku w liczniku.\n• Pochodna stałej: $(5)' = 0$, a nie $5$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Przed różniczkowaniem upraszczaj: rozbij ułamki, wyłącz stałe przed pochodną, pozbądź się pierwiastków ($\\sqrt{x} = x^{1/2}$). Krótsze wyrażenie to mniej miejsc na błąd rachunkowy — a za poprawną pochodną są punkty nawet przy potknięciu w dalszej części.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $(x^{n})' = nx^{n-1}$; $(\\sin x)' = \\cos x$; $(\\cos x)' = -\\sin x$.\n• Suma: wyraz po wyrazie.\n• Iloczyn: $f'g + fg'$; iloraz: $\\frac{f'g-fg'}{g^{2}}$.\n• Upraszczaj wzór przed różniczkowaniem.`,
        },
      ],
    },
    {
      slug: 'pochodne-monotonicznosc',
      title: 'Monotoniczność i ekstrema',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['XII.3'],
      objectives: [
        'Badanie znaku pochodnej i wyznaczanie przedziałów monotoniczności',
        'Wyznaczasz ekstrema lokalne i ich wartości',
        'Odróżniasz punkt stacjonarny od ekstremum',
      ],
      skills: [
        { slug: 'pochodne-monotonicznosc', name: 'Monotoniczność i ekstrema', description: 'Bada monotoniczność za pomocą pochodnej.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Znak pochodnej mówi wszystko o przebiegu funkcji: gdzie pochodna jest dodatnia — funkcja rośnie, gdzie ujemna — maleje. Punkt, w którym znak się zmienia, to ekstremum. To najważniejsza umiejętność analizy na maturze rozszerzonej.',
        },
        {
          type: 'formula',
          title: 'Związek znaku pochodnej i monotoniczności',
          body: 'Ekstremum wymaga zmiany znaku pochodnej, nie tylko jej zerowania.',
          formula: "f'(x)>0 \\Rightarrow f \\text{ rosnąca}, \\qquad f'(x)<0 \\Rightarrow f \\text{ malejąca}, \\qquad f'(x_0)=0 \\text{ i zmiana znaku} \\Rightarrow \\text{ekstremum}",
        },
        {
          type: 'example',
          title: 'Przykład — pełne badanie',
          body: `Zbadaj monotoniczność $f(x) = x^{3} - 3x$.

$f'(x) = 3x^{2} - 3 = 3(x-1)(x+1)$. Miejsca zerowe pochodnej: $x = -1$ i $x = 1$.

- $x < -1$: $f'(x) > 0$ — funkcja rośnie.
- $-1 < x < 1$: $f'(x) < 0$ — funkcja maleje.
- $x > 1$: $f'(x) > 0$ — funkcja rośnie.

W $x = -1$ maksimum lokalne $f(-1) = 2$; w $x = 1$ minimum lokalne $f(1) = -2$.`,
        },
        {
          type: 'example',
          title: 'Przykład — punkt stacjonarny bez ekstremum',
          body: "Dla $f(x) = x^{3}$ mamy $f'(x) = 3x^{2}$, więc $f'(0) = 0$. Ale $f'$ jest nieujemna po obu stronach zera — brak zmiany znaku, więc $x = 0$ nie jest ekstremum. To pokazuje, że samo $f' = 0$ nie wystarcza.",
        },
        {
          type: 'table',
          title: 'Jak czytać tabelę znaku',
          body: `| Przedział | Znak $f'$ | Zachowanie $f$ |\n|---|---|---|\n| $(-\\infty, -1)$ | $+$ | rośnie $\\nearrow$ |\n| $(-1, 1)$ | $-$ | maleje $\\searrow$ |\n| $(1, +\\infty)$ | $+$ | rośnie $\\nearrow$ |`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Uznanie $f'(x_0) = 0$ za ekstremum bez sprawdzenia zmiany znaku.\n• Zgubienie jednego pierwiastka pochodnej (np. $x = -1$ przy rozkładzie).\n• Liczenie wartości ekstremum z pochodnej zamiast z funkcji.\n• Niepoprawne domykanie przedziałów monotoniczności — w punkcie stacjonarnym funkcja ani nie rośnie, ani nie maleje „w środku” przedziału.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniu otwartym zbadaj znak pochodnej i zapisz go w tabeli — egzaminator szuka właśnie tej tabeli i wniosku o ekstremach. Podaj wartości ekstremów (liczby), nie tylko ich położenie.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $f' > 0$: rośnie; $f' < 0$: maleje.\n• Ekstremum = miejsce zerowe pochodnej **ze zmianą znaku**.\n• Minus → plus to minimum; plus → minus to maksimum.\n• Wartość ekstremum liczysz z funkcji $f$, nie z $f'$.`,
        },
      ],
    },
    {
      slug: 'pochodne-styczna',
      title: 'Styczna do wykresu',
      durationMinutes: 25,
      difficulty: 4,
      requirements: ['XII.6'],
      objectives: [
        'Interpretujesz pochodną jako współczynnik kierunkowy stycznej',
        'Zapisujesz równanie stycznej w danym punkcie',
        'Wyznaczasz styczną, gdy dany jest tylko jej kierunek',
      ],
      skills: [
        { slug: 'pochodne-styczna', name: 'Styczna', description: 'Wyznacza równanie prostej stycznej do wykresu.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Geometryczny sens pochodnej to nachylenie stycznej. Jeśli znasz wartość funkcji i pochodnej w punkcie, równanie stycznej zapisujesz od ręki. To jedno z najczęstszych krótkich zadań na maturze rozszerzonej.',
        },
        {
          type: 'formula',
          title: 'Równanie stycznej w punkcie $x_0$',
          body: 'Współczynnik kierunkowy to $f\'(x_0)$, a punkt zaczepienia to $(x_0, f(x_0))$.',
          formula: "y-f(x_0)=f'(x_0)(x-x_0)",
        },
        {
          type: 'diagram',
          title: 'Styczna i pochodna',
          body: 'Dla $f(x) = x^{2}$ w punkcie $P = (1, 1)$ nachylenie stycznej to $f\'(1) = 2$. Prosta $y = 2x - 1$ dotyka paraboli w tym punkcie.',
          figure: {
            kind: 'plot',
            xMin: -2.6,
            xMax: 3.4,
            yMin: -3.5,
            yMax: 7,
            caption: 'Styczna y = 2x − 1 do paraboli y = x² w punkcie P = (1, 1): współczynnik kierunkowy stycznej to f′(1) = 2.',
            curves: [
              { expr: 'x^2', label: 'f(x) = x²', color: 'violet' },
              { expr: '2x-1', label: 'styczna: y = 2x − 1', color: 'emerald', width: 2.5 },
            ],
            points: [{ x: 1, y: 1, label: 'P(1, 1)', color: 'amber' }],
          },
        },
        {
          type: 'example',
          title: 'Przykład — styczna w punkcie',
          body: 'Wyznacz styczną do $f(x) = x^{2}$ w $x_0 = 1$. Mamy $f(1) = 1$ i $f\'(1) = 2$, więc $y - 1 = 2(x-1)$, czyli $y = 2x - 1$.',
        },
        {
          type: 'example',
          title: 'Przykład — dany kierunek stycznej',
          body: `Znajdź punkt na wykresie $f(x) = x^{2}$, w którym styczna jest prostopadła do prostej $y = -\\frac{1}{2}x + 3$.

Prostopadłość daje nachylenie $2$ (iloczyn współczynników $-\\frac{1}{2} \\cdot 2 = -1$). Zatem szukamy $x_0$, gdzie $f'(x_0) = 2x_0 = 2$, czyli $x_0 = 1$. Punkt to $(1, 1)$ — ten sam co poprzednio.`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Podstawienie do wzoru stycznej wartości $f'(x_0)$ zamiast $f(x_0)$ (i odwrotnie).\n• Pomylenie równoległości (równe nachylenia) z prostopadłością (iloczyn $= -1$).\n• Zapisanie stycznej jako $y = f'(x_0)$ bez wyrazu wolnego — to tylko nachylenie.\n• Zgubienie znaku minus przy zasadzie prostopadłości.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zawsze zapisz oba elementy: punkt $(x_0, f(x_0))$ i nachylenie $f\'(x_0)$ — egzaminator przyznaje za nie osobne punkty. W „kierunek stycznej” pytaj najpierw o nachylenie, a dopiero potem szukaj $x_0$.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $f'(x_0)$ to nachylenie stycznej w punkcie $x_0$.\n• Wzór: $y - f(x_0) = f'(x_0)(x - x_0)$.\n• Proste równoległe: $a_1 = a_2$; prostopadłe: $a_1 \\cdot a_2 = -1$.\n• Punkt zaczepienia liczymy z funkcji, nachylenie z pochodnej.`,
        },
      ],
    },
  ],
}
