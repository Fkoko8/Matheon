import type { ContentTopic } from '@/content/types'

export const rownania: ContentTopic = {
  slug: 'rownania',
  title: 'Równania i nierówności',
  description: 'Równania liniowe, układy równań, nierówności, równania wymierne i z modułem — pełny warsztat rozwiązywania, od pierwszego kroku po zapis odpowiedzi.',
  level: 'basic',
  lessons: [
    {
      slug: 'rownania-liniowe',
      title: 'Równania i nierówności liniowe',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['III.1'],
      objectives: [
        'Rozwiązujesz równanie liniowe metodą przekształceń równoważnych',
        'Rozwiązujesz nierówność liniową i zapisujesz zbiór rozwiązań przedziałem',
        'Pamiętasz, że mnożenie nierówności przez liczbę ujemną zmienia jej znak',
      ],
      skills: [
        { slug: 'rownania-liniowe', name: 'Równania liniowe', description: 'Rozwiązuje równania liniowe, także z nawiasami i ułamkami.', level: 'basic' },
        { slug: 'rownania-nierownosci-liniowe', name: 'Nierówności liniowe', description: 'Rozwiązuje nierówności liniowe i zapisuje zbiór rozwiązań przedziałem.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Równanie liniowe to najczęściej pojawiające się zadanie otwarte na poziomie podstawowym. Punkt zdobywasz nie za „domysł”, ale za poprawny zapis przekształceń i odpowiedź podaną w prosty sposób. W tej lekcji opanujesz schemat, który działa zawsze: uporządkuj, przenieś niewiadome na jedną stronę, podziel, sprawdź.',
        },
        {
          type: 'formula',
          title: 'Postać równania liniowego',
          body: 'Równanie liniowe z jedną niewiadomą sprowadzasz do postaci $ax + b = 0$. Rozwiązanie istnieje dokładnie jedno, gdy $a \\neq 0$.',
          formula: 'ax + b = 0 \\quad (a \\neq 0) \\iff x = -\\frac{b}{a}',
        },
        {
          type: 'paragraph',
          title: 'Przekształcenia równoważne',
          body: 'Równanie nie zmienia zbioru rozwiązań, gdy do obu stron dodasz (lub odejmiesz) tę samą liczbę oraz gdy obie strony pomnożysz (podzielisz) przez tę samą liczbę różną od zera. Każde przekształcenie zapisuj w nowej linii — egzaminator ocenia tok, nie tylko wynik.',
        },
        {
          type: 'example',
          title: 'Przykład — równanie z nawiasami',
          body: 'Rozwiąż $3(x-2) = 2x + 5$. Opuszczamy nawias: $3x - 6 = 2x + 5$. Przenosimy niewiadome na lewo, liczby na prawo: $3x - 2x = 5 + 6$, czyli $x = 11$. Sprawdzenie: $3(11-2) = 27$ i $2 \\cdot 11 + 5 = 27$ — zgadza się.',
        },
        {
          type: 'example',
          title: 'Przykład — równanie z ułamkami',
          body: 'Rozwiąż $\\frac{x+2}{3} = \\frac{2x-1}{5}$. Mnożymy obie strony przez $15$: $5(x+2) = 3(2x-1)$, więc $5x + 10 = 6x - 3$ i $x = 13$. Sprawdzenie: $\\frac{15}{3} = 5$ oraz $\\frac{25}{5} = 5$.',
        },
        {
          type: 'paragraph',
          title: 'Gdy współczynnik wynosi zero',
          body: 'Jeśli po uporządkowaniu niewiadoma znika, równanie jest albo **sprzeczne** (np. $0 = 3$ — brak rozwiązań), albo **tożsamościowe** (np. $0 = 0$ — każda liczba jest rozwiązaniem). To częsty element zadań zamkniętych.',
        },
        {
          type: 'heading',
          title: 'Nierówności liniowe',
          body: 'Nierówność rozwiązujesz tak samo jak równanie, z jedną różnicą: mnożenie lub dzielenie obu stron przez liczbę **ujemną** odwraca znak nierówności.',
        },
        {
          type: 'formula',
          title: 'Reguła odwracania znaku',
          body: 'Pamiętaj o tej linijce — to najczęściej gubiony punkt w nierównościach.',
          formula: '-2x \\geq -4 \\iff x \\leq 2',
        },
        {
          type: 'example',
          title: 'Przykład — nierówność',
          body: 'Rozwiąż $5 - 2x \\geq 1$. Odejmujemy $5$: $-2x \\geq -4$. Dzielimy przez $-2$ i odwracamy znak: $x \\leq 2$. Zbiór rozwiązań to przedział $(-\\infty, 2]$. Największą liczbą całkowitą spełniającą tę nierówność jest $2$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Odejmowanie nawiasu bez zmiany znaków wszystkich wyrazów: $-(x-3) = -x + 3$.
• Pominięcie odwrócenia znaku nierówności przy dzieleniu przez liczbę ujemną.
• Zgubiony wyraz wolny przy przenoszeniu na drugą stronę.
• Odpowiedź w postaci „$x$ jest mniejsze od dwóch” — na maturze wymagany jest zapis przedziału.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Przy nierówności zawsze naszkicuj oś liczbową i zaznacz na niej rozwiązanie, a odpowiedź zapisz przedziałem. W zadaniach otwartych to osobny punkt w schemacie oceniania, a przy okazji natychmiast widać błąd w znaku.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Równanie liniowe sprowadzasz do $ax + b = 0$ i dzielisz przez $a$.
• Mnożenie lub dzielenie nierówności przez liczbę ujemną odwraca znak.
• Sprawdzenie wyniku podstawieniem zajmuje kilkanaście sekund i ratuje punkty.
• Zbiór rozwiązań nierówności zapisujesz przedziałem.`,
        },
      ],
    },
    {
      slug: 'rownania-uklady',
      title: 'Układy równań liniowych',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['III.2'],
      objectives: [
        'Rozwiązujesz układ dwóch równań metodą podstawiania i metodą przeciwnych współczynników',
        'Rozpoznajesz układ oznaczony, nieoznaczony i sprzeczny',
        'Zapisujesz zadanie tekstowe w postaci układu równań i wracasz z rozwiązaniem do treści',
      ],
      skills: [
        { slug: 'rownania-uklady', name: 'Układy równań', description: 'Rozwiązuje układy równań liniowych obiema metodami i bada liczbę rozwiązań.', level: 'basic' },
        { slug: 'rownania-zadania-tekstowe', name: 'Zadania tekstowe z równań', description: 'Zapisuje treść zadania jako równanie lub układ i sprawdza wynik w kontekście zadania.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Układ dwóch równań pojawia się i w zadaniach zamkniętych, i w tekstowych, które na maturze są warte po 2–3 punkty. Liczy się nie tylko para liczb, ale też metoda: egzaminator ocenia zapis układu i kolejne kroki.',
        },
        {
          type: 'heading',
          title: 'Metoda podstawiania',
          body: 'Z jednego równania wyznaczasz jedną niewiadomą i podstawiasz do drugiego. Sięgasz po nią wtedy, gdy któryś współczynnik wynosi $1$ lub $-1$ — wtedy rachunki są najkrótsze.',
        },
        {
          type: 'example',
          title: 'Przykład — metoda podstawiania',
          body: 'Rozwiąż układ $\\begin{cases} x + y = 7 \\\\ 2x - y = 2 \\end{cases}$. Z pierwszego równania $y = 7 - x$. Podstawiamy: $2x - (7 - x) = 2$, czyli $3x = 9$ i $x = 3$. Wtedy $y = 7 - 3 = 4$. Odpowiedź: $x = 3$, $y = 4$.',
        },
        {
          type: 'heading',
          title: 'Metoda przeciwnych współczynników',
          body: 'Mnożysz równania przez takie liczby, żeby współczynniki przy jednej niewiadomej były liczbami przeciwnymi. Dodajesz równania stronami — jedna niewiadoma znika.',
        },
        {
          type: 'example',
          title: 'Przykład — przeciwnych współczynników',
          body: 'Rozwiąż układ $\\begin{cases} 2x + 3y = 12 \\\\ 2x - y = 4 \\end{cases}$. Odejmujemy równania stronami: $4y = 8$, więc $y = 2$. Podstawiamy do drugiego: $2x - 2 = 4$, czyli $x = 3$. Odpowiedź: $x = 3$, $y = 2$.',
        },
        {
          type: 'paragraph',
          title: 'Ile rozwiązań ma układ',
          body: 'Geometrycznie każde równanie to prosta. Dwie proste mogą przeciąć się w jednym punkcie (układ **oznaczony**), pokrywać się (układ **nieoznaczony** — nieskończenie wiele rozwiązań) albo być równoległe i różne (układ **sprzeczny** — brak rozwiązań). Rachunkowo rozpoznasz to po proporcjach współczynników.',
        },
        {
          type: 'example',
          title: 'Przykład — układ sprzeczny',
          body: 'Układ $\\begin{cases} 2x + y = 4 \\\\ 4x + 2y = 9 \\end{cases}$ nie ma rozwiązań: lewe strony są proporcjonalne ($4x + 2y = 2(2x + y)$), więc z drugiego równania wynikałoby $2 \\cdot 4 = 9$, co jest nieprawdą.',
        },
        {
          type: 'heading',
          title: 'Zadania tekstowe',
          body: 'Dwie niewiadome opisujesz dwoma równaniami: jedno zwykle dotyczy liczby sztuk, drugie — wartości (ceny, wagi, odległości). Zawsze zapisz słownie, co oznaczają litery.',
        },
        {
          type: 'example',
          title: 'Przykład — bilety',
          body: 'Sprzedano $200$ biletów: normalne po $12$ zł i ulgowe po $8$ zł, razem za $2200$ zł. Ile sprzedano biletów ulgowych? Oznaczmy: $n$ — normalne, $u$ — ulgowe. Mamy $n + u = 200$ oraz $12n + 8u = 2200$. Podstawiamy $n = 200 - u$: $12(200-u) + 8u = 2200$, czyli $2400 - 4u = 2200$ i $u = 50$. Sprawdzenie: $150 \\cdot 12 + 50 \\cdot 8 = 1800 + 400 = 2200$ — zgadza się.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Jedna litera użyta do dwóch różnych wielkości — układ opisuje wtedy nie to zadanie, co trzeba.
• Brak powrotu do treści: wynik trzeba sprawdzić w kontekście (liczba biletów nie może być ułamkiem).
• Pomylenie metody przeciwnych współczynników z dodawaniem tylko prawych stron równania.
• Zgubiony minus przy odejmowaniu całego równania stronami.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniu tekstowym napisz na początku: „niech $x$ oznacza…, a $y$ oznacza…”. To zdanie jest punktowane, a brak oznaczeń często kosztuje cały punkt mimo poprawnego wyniku.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Metoda podstawiania — gdy jakiś współczynnik to $1$ lub $-1$.
• Metoda przeciwnych współczynników — gdy współczynniki są „ładne”.
• Brak rozwiązań poznajesz po sprzeczności $0 = c$ z $c \\neq 0$.
• Rozwiązanie zawsze sprawdzasz w treści zadania.`,
        },
      ],
    },
    {
      slug: 'rownania-matura',
      title: 'Równania wymierne, z modułem i nierówności wielomianowe',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['III.4', 'III.6'],
      objectives: [
        'Rozwiązujesz równanie wymierne, pamiętając o założeniach dotyczących mianownika',
        'Rozwiązujesz równania z wartością bezwzględną, rozbijając je na dwa przypadki',
        'Rozwiązujesz nierówność wielomianową za pomocą siatki znaków',
      ],
      skills: [
        { slug: 'rownania-wymierne', name: 'Równania wymierne', description: 'Rozwiązuje równania wymierne z założeniami dla mianownika.', level: 'basic' },
        { slug: 'rownania-z-modulem', name: 'Równania z wartością bezwzględną', description: 'Rozwiązuje równania i proste nierówności z modułem.', level: 'basic' },
        { slug: 'rownania-nierownosci-wielomianowe', name: 'Nierówności wielomianowe', description: 'Rozwiązuje nierówności wielomianowe metodą siatki znaków.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'To typy zadań, po których poznaje się dobrego maturzystę: równanie wymierne z założeniem, równanie z modułem rozbite na przypadki i nierówność wielomianowa rozwiązana siatką znaków. Każde z nich ma stały schemat — poznasz go raz i użyjesz zawsze.',
        },
        {
          type: 'heading',
          title: 'Równania wymierne',
          body: 'Równanie wymierne to równanie z niewiadomą w mianowniku. Pierwszy krok to zawsze **założenie**: mianownik musi być różny od zera.',
        },
        {
          type: 'formula',
          title: 'Warunek rozwiązania',
          body: 'Ułamek jest równy zeru tylko wtedy, gdy licznik jest zerem, a mianownik jest różny od zera.',
          formula: '\\frac{W(x)}{Q(x)} = 0 \\iff Q(x) \\neq 0 \\ \\text{oraz}\\ W(x) = 0',
        },
        {
          type: 'example',
          title: 'Przykład — równanie wymierne',
          body: 'Rozwiąż $\\frac{x+1}{x-2} = 3$. Założenie: $x \\neq 2$. Mnożymy obie strony przez $x-2$: $x + 1 = 3x - 6$, czyli $-2x = -7$ i $x = 3{,}5$. Założenie jest spełnione, więc odpowiedź to $x = 3{,}5$.',
        },
        {
          type: 'example',
          title: 'Przykład — równanie wymierne sprzeczne',
          body: 'Rozwiąż $\\frac{x-1}{x+2} = 1$. Założenie: $x \\neq -2$. Mnożymy: $x - 1 = x + 2$, czyli $-1 = 2$ — sprzeczność. Równanie nie ma rozwiązań.',
        },
        {
          type: 'warning',
          title: 'Pułapka: skracanie i odrzucanie pierwiastków',
          body: `• W równaniu $\\frac{x^{2}-4}{x-2} = 0$ rozwiązaniem jest tylko $x = -2$ — liczba $x = 2$ wypada przez założenie, mimo że zeruje licznik.
• Założenie zapisujesz **przed** przekształceniami; brak założenia to zwykle utrata punktu, nawet przy poprawnym wyniku.
• Wynik, który łamie założenie, zawsze odrzucasz — nie „dopisujesz” go do odpowiedzi.`,
        },
        {
          type: 'heading',
          title: 'Równania z wartością bezwzględną',
          body: 'Wartość bezwzględna $|x|$ to odległość liczby $x$ od zera. Dlatego $|x| = a$ ma rozwiązania tylko dla $a \\geq 0$ — i zawsze są to dwie liczby (dla $a > 0$).',
        },
        {
          type: 'formula',
          title: 'Rozbijanie modułu',
          body: 'Wyrażenie pod modułem przyrównujesz do liczby i do jej przeciwności.',
          formula: '|x| = a \\ (a \\geq 0) \\iff x = a \\ \\text{lub}\\ x = -a',
        },
        {
          type: 'example',
          title: 'Przykład — równanie z modułem',
          body: 'Rozwiąż $|2x+1| = 5$. Mamy dwa przypadki: $2x + 1 = 5$, czyli $x = 2$, oraz $2x + 1 = -5$, czyli $x = -3$. Suma rozwiązań wynosi $-1$, a większym z nich jest $2$.',
        },
        {
          type: 'heading',
          title: 'Nierówności wielomianowe — siatka znaków',
          body: 'Lewą stronę rozkładasz na czynniki, wyznaczasz miejsca zerowe, zaznaczasz je na osi i ustalasz znak wyrażenia w każdym przedziale. Wybierasz przedziały zgodne ze znakiem nierówności.',
        },
        {
          type: 'example',
          title: 'Przykład — nierówność wielomianowa',
          body: 'Rozwiąż $(x-1)(x-3) > 0$. Miejsca zerowe: $1$ i $3$. W przedziale $(-\\infty, 1)$ oba czynniki są ujemne, więc iloczyn jest dodatni; w $(1,3)$ iloczyn jest ujemny; w $(3, \\infty)$ dodatni. Zbiór rozwiązań: $(-\\infty, 1) \\cup (3, \\infty)$ — bez nawiasów domkniętych, bo dla $x = 1$ i $x = 3$ wyrażenie jest równe zeru, a nierówność jest ostra.',
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W nierównościach wielomianowych, które nie są ostre ($\\leq$, $\\geq$), miejsca zerowe wchodzą do zbioru rozwiązań. Gdy pierwiastek rozkładu występuje w parzystej potędze (np. $(x-2)^{2}$), wyrażenie nie zmienia tam znaku — taki punkt trzeba przeanalizować osobno.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Równanie wymierne zaczynasz od założenia $Q(x) \\neq 0$.
• $|x| = a$ daje dwa rozwiązania, o ile $a \\geq 0$.
• Nierówność wielomianowa: rozkład $\\rightarrow$ miejsca zerowe $\\rightarrow$ znaki $\\rightarrow$ odpowiedź.
• Odpowiedź zawsze zapisujesz jako zbiór lub przedział.`,
        },
      ],
    },
  ],
}
