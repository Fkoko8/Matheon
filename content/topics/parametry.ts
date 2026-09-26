import type { ContentTopic } from '@/content/types'

export const parametry: ContentTopic = {
  slug: 'parametry',
  title: 'Równania i funkcje z parametrem',
  description: 'Badasz rozwiązania równań i zachowanie funkcji w zależności od wartości parametru.',
  level: 'extended',
  lessons: [
    {
      slug: 'parametry-rownania',
      title: 'Równania z parametrem',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['III.5'],
      objectives: [
        'Rozwiązujesz równanie liniowe z parametrem i omawiasz przypadki',
        'Badasz liczbę rozwiązań w zależności od parametru',
        'Zapisujesz odpowiedź jako zbiór przypadków',
      ],
      skills: [
        { slug: 'parametry-rownania', name: 'Równania z parametrem', description: 'Wyznacza warunki istnienia rozwiązań.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Parametr to liczba, o której nie wiemy, ile wynosi. Rozwiązanie nie jest więc jedną liczbą, lecz **omówieniem przypadków**: dla jednych wartości parametru równanie ma jedno rozwiązanie, dla innych — żadnego lub nieskończenie wiele. Spokojne rozbicie na przypadki to cała sztuka.',
        },
        {
          type: 'formula',
          title: 'Równanie liniowe z parametrem',
          body: 'Kluczowy jest współczynnik przy $x$ — to on decyduje, czy wolno dzielić. Zanim podzielisz, wydziel przypadek, gdy jest zerem.',
          formula: 'ax=b \\quad\\Longrightarrow\\quad \\begin{cases} a\\neq0: & x=\\frac{b}{a}\\ \\text{(jedno rozwiązanie)} \\\\ a=0,\\ b\\neq0: & \\text{brak rozwiązań} \\\\ a=0,\\ b=0: & \\text{nieskończenie wiele rozwiązań} \\end{cases}',
        },
        {
          type: 'table',
          title: 'Mapa przypadków',
          body: `| Współczynnik przy $x$ | Wyraz wolny | Liczba rozwiązań |\n|---|---|---|\n| różny od zera | dowolny | dokładnie jedno |\n| zero | różny od zera | zero (sprzeczne) |\n| zero | zero | nieskończenie wiele (tożsamość) |`,
        },
        {
          type: 'example',
          title: 'Przykład — pełne omówienie',
          body: `Rozwiąż równanie $(a-2)x = 4$ ze względu na $a$.

**Przypadek 1:** $a - 2 \\neq 0$, czyli $a \\neq 2$. Wtedy $x = \\frac{4}{a-2}$ — jedno rozwiązanie.

**Przypadek 2:** $a = 2$. Równanie ma postać $0 \\cdot x = 4$, czyli $0 = 4$ — sprzeczność, brak rozwiązań.

Odpowiedź: dla $a \\neq 2$ rozwiązaniem jest $x = \\frac{4}{a-2}$; dla $a = 2$ równanie nie ma rozwiązania.`,
        },
        {
          type: 'example',
          title: 'Przykład — tożsamość',
          body: 'Równanie $(a-2)x = 0$ ma nieskończenie wiele rozwiązań dla $a = 2$: wtedy dostajemy $0 = 0$, a każda liczba $x$ spełnia równanie. Dla $a \\neq 2$ rozwiązaniem jest $x = 0$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Dzielenie przez wyrażenie z parametrem bez sprawdzenia, czy nie jest zerem — gubi to cały przypadek.\n• Pomylenie „brak rozwiązań” z „nieskończenie wiele” — decyduje wyraz wolny.\n• Zły podział na przypadki, gdy parametr stoi też w wyrażeniu wolnym.\n• Brak końcowej odpowiedzi „dla jakich $a$ co się dzieje” — egzaminator wymaga omówienia.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zanim cokolwiek policzysz, zapisz równanie w postaci $Ax = B$ i wskaż, co jest współczynnikiem $A$. Potem osobno rozważ $A = 0$. Odpowiedź zawsze kończ pełnym zdaniem: „Dla $a \\neq \\ldots$ równanie ma rozwiązanie …, a dla $a = \\ldots$ …”.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Sprowadź równanie do $Ax = B$ i wydziel $A = 0$.\n• $A \\neq 0$: jedno rozwiązanie; $A = 0$, $B \\neq 0$: brak; $A = 0$, $B = 0$: nieskończenie wiele.\n• Odpowiedź to omówienie przypadków, nie jedna liczba.\n• Parametr w mianowniku zawsze wnosi dodatkowe ograniczenie.`,
        },
      ],
    },
    {
      slug: 'parametry-pochodna',
      title: 'Pochodna i warunki przejścia',
      durationMinutes: 30,
      difficulty: 5,
      requirements: ['XII.5'],
      objectives: [
        'Wyznaczasz pochodną funkcji z parametrem',
        'Zapisujesz warunek na ekstremum w zadanym punkcie',
        'Sprawdzasz poprawność warunkiem drugiej pochodnej',
      ],
      skills: [
        { slug: 'parametry-pochodna', name: 'Pochodna z parametrem', description: 'Bada wartości parametru przez warunki pochodnej.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Zadania z parametrem i pochodną pytają zwykle: dla jakiej wartości parametru funkcja ma ekstremum (albo punkt stacjonarny) w danym punkcie? Schemat jest krótki: policz pochodną, podstaw współrzędną punktu, przyrównaj do zera i sprawdź rodzaj ekstremum.',
        },
        {
          type: 'formula',
          title: 'Warunki ekstremum w punkcie $x_0$',
          body: 'Warunek konieczny to zerowanie się pochodnej; o tym, czy to minimum, czy maksimum, decyduje znak drugiej pochodnej (albo zmiana znaku pierwszej).',
          formula: "f'(x_0)=0 \\quad \\text{(warunek konieczny)}, \\qquad f''(x_0)>0 \\Rightarrow \\text{minimum}, \\qquad f''(x_0)<0 \\Rightarrow \\text{maksimum}",
        },
        {
          type: 'example',
          title: 'Przykład — punkt stacjonarny',
          body: `Dla $f(x) = x^{3} - 3ax^{2}$ wyznacz $a$ tak, aby $x = 1$ było punktem stacjonarnym.

$f'(x) = 3x^{2} - 6ax$. Podstawiamy $x = 1$: $f'(1) = 3 - 6a = 0$, stąd $a = \\frac{1}{2}$.

Sprawdzenie: dla $a = \\frac{1}{2}$ mamy $f'(x) = 3x^{2} - 3x = 3x(x-1)$, więc pochodna zeruje się w $x = 0$ i $x = 1$ — punkt $x = 1$ jest punktem stacjonarnym.`,
        },
        {
          type: 'example',
          title: 'Przykład — minimum o zadanej wartości',
          body: `Dla $f(x) = x^{2} - 2ax$ minimum wynosi $-4$. Wyznacz $a$.

Wierzchołek paraboli (i zarazem minimum) leży w $x = a$, a jego wartość to $f(a) = a^{2} - 2a^{2} = -a^{2}$. Z warunku $-a^{2} = -4$ dostajemy $a = 2$ lub $a = -2$. Ponieważ $f''(x) = 2 > 0$, dla obu wartości mamy minimum.`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Uznanie warunku $f'(x_0) = 0$ za wystarczający — trzeba potwierdzić rodzaj ekstremum.\n• Podstawienie do pochodnej zamiast do funkcji przy liczeniu wartości ekstremum.\n• Zgubienie jednego z rozwiązań równania na parametr (np. $\\pm2$).\n• Pomylenie „punktu stacjonarnego” (tam, gdzie $f' = 0$) z ekstremum — $x^{3}$ ma stacjonarny punkt $x = 0$, ale nie ma ekstremum.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: `W zadaniu „dla jakich $a$ funkcja ma ekstremum w punkcie $x_0$” zapisz jawnie oba warunki: $f'(x_0) = 0$ oraz $f''(x_0) \\neq 0$ (albo analizę znaku $f'$). Sam pierwszy warunek w zadaniu otwartym bywa niewystarczający do pełnego punktu.`,
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Pochodna daje warunek konieczny $f'(x_0) = 0$.\n• Druga pochodna (lub zmiana znaku pierwszej) wskazuje rodzaj ekstremum.\n• Wartość ekstremum liczysz, podstawiając $x_0$ do funkcji, nie do pochodnej.\n• Równanie na parametr może mieć kilka rozwiązań — sprawdź wszystkie.`,
        },
      ],
    },
  ],
}
