import type { ContentTopic } from '@/content/types'

export const kwadratowa: ContentTopic = {
  slug: 'kwadratowa',
  title: 'Funkcja kwadratowa',
  description: 'Najważniejszy dział matury podstawowej: postacie trójmianu, wierzchołek, delta, nierówności kwadratowe i zadania optymalizacyjne — od fundamentów po pełne zadania otwarte.',
  level: 'basic',
  lessons: [
    {
      slug: 'kwadratowa-postacie',
      title: 'Postacie funkcji kwadratowej',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['III.3', 'IV.4'],
      objectives: [
        'Rozpoznajesz postać ogólną, kanoniczną i iloczynową trójmianu',
        'Wyznaczasz współrzędne wierzchołka paraboli każdą z trzech metod',
        'Zamieniasz postacie między sobą i odczytujesz z nich własności funkcji',
      ],
      skills: [
        { slug: 'kwadratowa-postacie', name: 'Postacie funkcji kwadratowej', description: 'Zamienia postać ogólną w kanoniczną i iloczynową, odczytuje własności z każdej postaci.', level: 'basic' },
        { slug: 'kwadratowa-wierzcholek', name: 'Wierzchołek paraboli', description: 'Wyznacza współrzędne wierzchołka paraboli.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Funkcja kwadratowa pojawia się na każdej maturze podstawowej — zwykle kilka razy: w zamkniętych, otwartych i w zadaniach optymalizacyjnych. Kluczem jest swobodne poruszanie się między trzema postaciami: każda z nich „wystawia” inne własności funkcji.',
        },
        {
          type: 'formula',
          title: 'Trzy postacie trójmianu',
          body: 'Każdą funkcję kwadratową możesz zapisać na trzy sposoby — i z każdego z nich odczytujesz inne informacje.',
          formula: 'f(x) = ax^{2} + bx + c \\quad | \\quad f(x) = a(x-p)^{2} + q \\quad | \\quad f(x) = a(x - x_1)(x - x_2)',
        },
        {
          type: 'table',
          title: 'Co odczytujesz z każdej postaci',
          body: `| Postać | Co od razu widać |
|---|---|
| ogólna $ax^2+bx+c$ | $a$, iloczyn $a \\cdot c$, wartość $f(0) = c$ |
| kanoniczna $a(x-p)^2+q$ | wierzchołek $W = (p, q)$, oś symetrii $x = p$, zbiór wartości |
| iloczynowa $a(x-x_1)(x-x_2)$ | miejsca zerowe $x_1, x_2$, oś symetrii $x = \\frac{x_1+x_2}{2}$ |`,
        },
        {
          type: 'formula',
          title: 'Wierzchołek — trzy sposoby',
          body: 'Wybierz metodę odpowiednią do danych, ale wynik zawsze możesz zweryfikować inną.',
          formula: 'p = -\\frac{b}{2a} \\quad q = f(p) \\quad \\text{lub} \\quad p = \\frac{x_1 + x_2}{2}',
        },
        {
          type: 'example',
          title: 'Przykład — pełne przejście między postaciami',
          body: `Dana jest $f(x) = x^{2} - 6x + 5$.

**Postać kanoniczna:** $p = -\\frac{-6}{2 \\cdot 1} = 3$, $q = f(3) = 9 - 18 + 5 = -4$, więc $f(x) = (x-3)^{2} - 4$.

**Miejsca zerowe:** $x^{2} - 6x + 5 = 0$ po rozkładzie daje $(x-1)(x-5) = 0$, więc $x_1 = 1$, $x_2 = 5$.

**Postać iloczynowa:** $f(x) = (x-1)(x-5)$.

**Kontrola:** oś symetrii z miejsc zerowych $\\frac{1+5}{2} = 3$ = $p$ — zgadza się.`,
        },
        {
          type: 'paragraph',
          title: 'Kierunek ramion i zbiór wartości',
          body: 'Współczynnik $a$ decyduje o kierunku ramion: $a > 0$ — ramiona w górę, wierzchołek to **minimum**; $a < 0$ — ramiona w dół, wierzchołek to **maksimum**. Zbiór wartości to odpowiednio $[q, +\\infty)$ lub $(-\\infty, q]$. Najmniejsza/największa wartość funkcji to zawsze $q$ — i to o nią zwykle pyta matura.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Wzór na $p$: zapominanie minusa ($p = -\\frac{b}{2a}$) albo dzielenie tylko przez $2$ bez $a$.
• Liczenie $q = f\\left(-\\frac{b}{2a}\\right)$ z błędem znaku — podstawiaj do wzoru ostrożnie, krok po kroku.
• Mylenie postaci kanonicznej $a(x-p)^2+q$ z iloczynową: w kanonicznej $p$ to NIE miejsce zerowe.
• Odczytywanie miejsc zerowych z postaci kanonicznej, gdy są one dane tylko w postaci iloczynowej.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach zamkniętych najszybsza jest postać kanoniczna: doprowadź wyrażenie do $a(x-p)^2 + q$ i odczytaj wierzchołek bez liczenia delty. Przykładowo $f(x) = 2x^2 - 12x + 19 = 2(x^2 - 6x) + 19 = 2\\left[(x-3)^2 - 9\\right] + 19 = 2(x-3)^2 + 1$ — wierzchołek $(3, 1)$ od razu.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $p = -\\frac{b}{2a}$, $q = f(p)$; z postaci iloczynowej $p = \\frac{x_1+x_2}{2}$.
• $a > 0$ oznacza minimum w $W$ i zbiór wartości $[q, +\\infty)$; $a < 0$ oznacza maksimum i zbiór $(-\\infty, q]$.
• Kanoniczną wyznaczasz przez wyłączenie $a$ przed nawias i dokończenie kwadratu.
• Oś symetrii przechodzi przez wierzchołek i środek między miejscami zerowymi.`,
        },
      ],
    },
    {
      slug: 'kwadratowa-delta',
      title: 'Delta, miejsca zerowe i nierówności',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['III.3'],
      objectives: [
        'Obliczasz deltę i interpretujesz jej znak',
        'Wyznaczasz miejsca zerowe wzorem skróconym i pełnym',
        'Rozwiązujesz nierówności kwadratowe i zapisujesz zbiór rozwiązań',
      ],
      skills: [
        { slug: 'kwadratowa-delta', name: 'Delta i miejsca zerowe', description: 'Oblicza deltę, wyznacza miejsca zerowe i interpretuje liczbę rozwiązań.', level: 'basic' },
        { slug: 'kwadratowa-nierownosci', name: 'Nierówności kwadratowe', description: 'Rozwiązuje nierówności kwadratowe, zapisuje zbiór rozwiązań przedziałami.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Delta to decyzja: ile miejsc zerowych ma funkcja. A nierówności kwadratowe to jeden z najpewniejszych punktów na maturze — schemat zawsze ten sam: delta, miejsca zerowe, parabola, wybór przedziałów.',
        },
        {
          type: 'formula',
          title: 'Delta i wzory na miejsca zerowe',
          body: 'Dla trójmianu $ax^{2} + bx + c$ z $a \\neq 0$ liczymy deltę, a z niej miejsca zerowe.',
          formula: '\\Delta = b^{2} - 4ac \\quad x_{1,2} = \\frac{-b \\mp \\sqrt{\\Delta}}{2a}',
        },
        {
          type: 'table',
          title: 'Znak delty',
          body: `| $\\Delta$ | Ile miejsc zerowych | Parabola względem osi $OX$ |
|---|---|---|
| $\\Delta > 0$ | dwa | przecina w dwóch punktach |
| $\\Delta = 0$ | jedno $x_0 = -\\frac{b}{2a}$ | dotyka w wierzchołku |
| $\\Delta < 0$ | brak | nie przecina |`,
        },
        {
          type: 'example',
          title: 'Przykład — pełny schemat',
          body: `Rozwiąż nierówność $x^{2} - 5x + 4 \\leq 0$.

**1. Delta:** $\\Delta = 25 - 16 = 9$, $\\sqrt{\\Delta} = 3$.

**2. Miejsca zerowe:** $x_1 = \\frac{5-3}{2} = 1$, $x_2 = \\frac{5+3}{2} = 4$.

**3. Znak:** ramiona w górę ($a = 1 > 0$), więc trójmian jest $\\leq 0$ **między** miejscami zerowymi.

**Odpowiedź:** $x \\in [1, 4]$ (nawiasy domknięte, bo nierówność nieostra).`,
        },
        {
          type: 'example',
          title: 'Przykład — nierówność odwrotna',
          body: 'Rozwiąż $-x^{2} + 2x + 3 > 0$. Mnożymy przez $-1$ (zmiana znaku nierówności!): $x^{2} - 2x - 3 < 0$. Delta: $\\Delta = 4 + 12 = 16$, $\\sqrt{\\Delta} = 4$, miejsca zerowe $x_1 = -1$, $x_2 = 3$. Ramiona w górę, wartości ujemne między pierwiastkami: $x \\in (-1, 3)$.',
        },
        {
          type: 'paragraph',
          title: 'Nierówności „niemożliwe” i „zawsze prawdziwe”',
          body: 'Gdy $\\Delta < 0$: trójmian z $a > 0$ jest **zawsze dodatni**, z $a < 0$ — **zawsze ujemny**. Nierówność $x^2 + x + 3 > 0$ ma zbiór rozwiązań $\\mathbb{R}$ (delta ujemna, ramiona w górę), a $x^2 + x + 3 < 0$ — zbiór pusty. Takie odpowiedzi są częste w zadaniach zamkniętych.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Wyliczenie $\\Delta = b^2 - 4ac$ z błędem znaku przy ujemnych współczynnikach — zapisuj jawne mnożenia.
• Brak zmiany kierunku nierówności po pomnożeniu przez $-1$.
• Otwarte i domknięte nawiasy w odpowiedzi: $\\leq$ daje nawiasy kwadratowe, $<$ — okrągłe.
• Wskazanie przedziału „na zewnątrz” pierwiastków, gdy trójmian ma być ujemny (ramiona w górę).`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zawsze naszkicuj parabolę: ramiona w górę lub w dół, przecięcia z osią. Wtedy odpowiedź widzisz — nie musisz pamiętać reguł „wewnątrz/na zewnątrz”. Egzaminatorzy premiuje też sam szkic w zadaniach otwartych.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $\\Delta = b^2 - 4ac$; jej znak = liczba miejsc zerowych.
• $x_{1,2} = \\frac{-b \\mp \\sqrt{\\Delta}}{2a}$.
• Ramiona w górę: ujemny **między** pierwiastkami, dodatni **poza nimi**.
• $\\Delta < 0$ i $a > 0$: trójmian zawsze dodatni; $\\Delta < 0$ i $a < 0$: zawsze ujemny.`,
        },
      ],
    },
    {
      slug: 'kwadratowa-zastosowania',
      title: 'Zadania optymalizacyjne i z parametrem',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['IV.5'],
      objectives: [
        'Budujesz funkcję kwadratową opisującą zadanie praktyczne',
        'Wyznaczasz maksimum/minimum w zadaniu optymalizacyjnym',
        'Stosujesz warunek istnienia rozwiązania równania kwadratowego',
      ],
      skills: [
        { slug: 'kwadratowa-optymalizacja', name: 'Zadania optymalizacyjne', description: 'Modeluje zadanie praktyczne funkcją kwadratową i wyznacza ekstremum.', level: 'basic' },
        { slug: 'kwadratowa-parametr', name: 'Warunek na rozwiązania', description: 'Stosuje deltę do badania liczby rozwiązań równania z parametrem.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Zadania optymalizacyjne (maksymalny zysk, najmniejszy koszt, największe pole) to klasyczne zadania otwarte za 4–5 punktów. Schemat jest niezmienny: model → funkcja jednej zmiennej → wierzchołek → odpowiedź z jednostkami.',
        },
        {
          type: 'heading',
          title: 'Schemat zadania optymalizacyjnego',
          body: `1. **Oznacz** niewiadomą (np. $x$ — długość boku) i zapisz, co oznacza.
2. **Zbuduj** szukaną wielkość jako funkcję $x$ (pole, zysk, koszt).
3. **Wyznacz dziedzinę** z kontekstu (długości dodatnie, ograniczenia).
4. **Znajdź wierzchołek** ($p = -\\frac{b}{2a}$) — minimum lub maksimum.
5. **Odpowiedz zdaniem** z jednostkami, sprawdzając dziedzinę.`,
        },
        {
          type: 'example',
          title: 'Przykład — maksymalny przychód',
          body: `Kino sprzedaje bilety po $20$ zł i wypełnia się wtedy w całości — przychodzi $300$ osób. Każde $2$ zł podwyżki oznacza $20$ osób mniej. Jaka cena daje maksymalny przychód?

Oznaczmy $x$ — liczba podwyżek o $2$ zł. Cena: $20 + 2x$, widzowie: $300 - 20x$.

$$W(x) = (20 + 2x)(300 - 20x) = 6000 - 400x + 600x - 40x^{2} = -40x^{2} + 200x + 6000$$

Wierzchołek: $x = -\\frac{200}{2 \\cdot (-40)} = 2{,}5$. Liczba podwyżek musi być całkowita — sprawdzamy $x = 2$ i $x = 3$: $W(2) = 24 \\cdot 260 = 6240$ oraz $W(3) = 26 \\cdot 240 = 6240$. Optymalna cena: $24$ zł albo $26$ zł (przychód $6240$ zł).`,
        },
        {
          type: 'example',
          title: 'Przykład — warunek na rozwiązanie',
          body: `Dla jakich wartości parametru $m$ równanie $x^{2} - 4x + m = 0$ ma dwa różne rozwiązania?

Równanie kwadratowe ma dwa różne pierwiastki, gdy $\\Delta > 0$:
$$\\Delta = 16 - 4m > 0 \\iff m < 4$$

Gdyby pytano o dokładnie jedno rozwiązanie: $\\Delta = 0$, czyli $m = 4$.`,
        },
        {
          type: 'paragraph',
          title: 'Typowe konteksty',
          body: 'Zysk $=$ przychód $-$ koszt (przychód = cena · liczba sztuk, gdzie liczba zależy od ceny — to daje kwadrat), pole prostokąta o zadanym obwodzie, wysokość rzutu $h(t) = -5t^2 + v_0 t + h_0$. W każdym z nich maksimum leży w wierzchołku paraboli — a gdy wynik wyjdzie połówkowy (jak $2{,}5$ powyżej), sprawdź sąsiednie liczby całkowite.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Brak dziedziny: maksimum poza dopuszczalnymi wartościami $x$ jest bezwartościowe.
• Odpowiedź bez jednostek — punkt za interpretację przepada.
• Mnożenie wyrażeń typu $(300-20x)$ z błędami — rozpisz jawnie każdy iloczyn.
• Badanie $\\Delta$ dla równania, którego współczynnik przy $x^2$ zawiera parametr — wtedy trzeba osobno sprawdzić przypadek zerowania się tego współczynnika.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniu optymalizacyjnym zawsze zapisz zdanie: „funkcja $f(x)$ opisuje…, a jej dziedziną jest…”. Za sformułowanie modelu i dziedziny jest wyraźnie punktowana część zadania — nawet gdy dalszy rachunek się nie uda.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Model → dziedzina → wierzchołek → odpowiedź z jednostkami.
• Dwa różne pierwiastki: $\\Delta > 0$; jedno: $\\Delta = 0$; brak: $\\Delta < 0$.
• Jeśli współczynnik przy $x^2$ zależy od parametru — sprawdź osobno przypadek, gdy jest zerem.
• Gdy wierzchołek wypada między liczbami całkowitymi, porównaj wartości w sąsiednich punktach.`,
        },
      ],
    },
  ],
}
