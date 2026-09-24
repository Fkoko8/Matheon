import type { ContentTopic } from '@/content/types'

export const ciagi: ContentTopic = {
  slug: 'ciagi',
  title: 'Ciągi',
  description: 'Ciągi arytmetyczne i geometryczne od pierwszych wyrazów po procent składany, a w zakresie rozszerzonym granice i szeregi — materiał, który regularnie pojawia się na maturze w zadaniach za 2–5 punktów.',
  level: 'basic',
  lessons: [
    {
      slug: 'ciagi-pojecie',
      title: 'Pojęcie ciągu i wzór ogólny',
      durationMinutes: 20,
      difficulty: 2,
      requirements: ['V.1'],
      objectives: [
        'Wyznaczasz wyrazy ciągu zadanego wzorem ogólnym',
        'Zapisujesz wzór ogólny na podstawie pierwszych wyrazów',
        'Badasz monotoniczność ciągu',
      ],
      skills: [
        { slug: 'ciagi-pojecie', name: 'Ciągi i wzory ogólne', description: 'Wyznacza wyrazy ciągu z wzoru ogólnego, odtwarza wzór z wyrazów i bada monotoniczność.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Ciąg to uporządkowana lista liczb ponumerowanych od 1 w górę. Na maturze prawie zawsze jest zadany wzorem ogólnym $a_n$ albo rekurencyjnie (poprzedni wyraz + reguła). Zanim przejdziesz do arytmetycznych i geometrycznych, musisz swobodnie obliczać wyrazy i odczytywać monotoniczność — to fundament całego działu.',
        },
        {
          type: 'formula',
          title: 'Ciąg zadany wzorem ogólnym',
          body: 'Wyraz ogólny to funkcja numeru: podstawiasz $n = 1, 2, 3, \\ldots$ i otrzymujesz kolejne wyrazy.',
          formula: 'a_n = n^{2} + 3 \\quad \\Rightarrow \\quad a_1 = 4, \\; a_2 = 7, \\; a_3 = 12',
        },
        {
          type: 'paragraph',
          title: 'Ciąg rekurencyjny',
          body: 'Wzór rekurencyjny mówi, jak z poprzednich wyrazów dostać następny. Na przykład $a_1 = 2$, $a_{n+1} = 3a_n - 1$ daje: $a_2 = 5$, $a_3 = 14$, $a_4 = 41$. Każdy wyraz liczysz od początku — nie da się od razu wskoczyć na setny, dlatego na maturze wzór rekurencyjny zwykle trzeba zamienić na ogólny.',
        },
        {
          type: 'example',
          title: 'Przykład — wzór z wyrazów',
          body: 'Ciąg $5, 8, 11, 14, \\ldots$ rośnie o $3$, więc jego wzór to $a_n = 3n + 2$. Sprawdzenie: $a_1 = 5$, $a_2 = 8$. Schemat: wyznacz różnicę $r$ między sąsiednimi wyrazami, wtedy $a_n = rn + b$, a $b$ znajdziesz podstawiając $n = 1$.',
        },
        {
          type: 'heading',
          title: 'Monotoniczność',
          body: 'Ciąg jest rosnący, gdy $a_{n+1} > a_n$, malejący, gdy $a_{n+1} < a_n$, a stały, gdy różnica wynosi zero. Rozstrzyga to znak różnicy $a_{n+1} - a_n$.',
        },
        {
          type: 'example',
          title: 'Przykład — badanie monotoniczności',
          body: '$a_n = \\frac{n+1}{n}$. Liczymy $a_{n+1} - a_n = \\frac{n+2}{n+1} - \\frac{n+1}{n} = \\frac{n(n+2) - (n+1)^{2}}{n(n+1)} = \\frac{-1}{n(n+1)} < 0$, więc ciąg jest malejący. Wzrost wykładnika „wygrywa” z dodatkiem $1$ do licznika.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Numeracja od zera: jeżeli ciąg zaczyna się od $a_0$, to $a_1$ nie jest pierwszym wyrazem.
• Wzór $a_n = 3n + 2$ sprawdzany tylko na jednym wyrazie — podstaw $n = 1$ i $n = 2$.
• Mylenie indeksu $n$ z wartością wyrazu: $a_5$ to piąty wyraz, nie liczba $5$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Jeżeli w zadaniu jest „wyznacz wzór ogólny”, zawsze sprawdzaj wzór na dwóch wyrazach — kosztuje to kilka sekund, a ratuje cały punkt. Przy monotoniczności licz różnicę $a_{n+1} - a_n$ albo iloraz $\\frac{a_{n+1}}{a_n}$ i rozstrzygnij znak.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Wyrazy ciągu obliczasz podstawiając $n = 1, 2, 3, \\ldots$ do wzoru.
• Ciąg rosnący: $a_{n+1} - a_n > 0$; malejący: $a_{n+1} - a_n < 0$.
• Ciąg o stałej różnicy między sąsiednimi wyrazami to ciąg arytmetyczny (następna lekcja).`,
        },
      ],
    },
    {
      slug: 'ciagi-arytmetyczny',
      title: 'Ciąg arytmetyczny i jego suma',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['V.2'],
      objectives: [
        'Stosujesz wzór na n-ty wyraz ciągu arytmetycznego',
        'Wyznaczasz różnicę i pierwszy wyraz z dwóch danych wyrazów',
        'Obliczasz sumę n początkowych wyrazów oboma wzorami',
      ],
      skills: [
        { slug: 'ciagi-arytmetyczny', name: 'Ciąg arytmetyczny', description: 'Stosuje wzór a_n = a_1 + (n-1)r i wyznacza elementy ciągu arytmetycznego.', level: 'basic' },
        { slug: 'ciagi-suma-arytmetyczna', name: 'Suma ciągu arytmetycznego', description: 'Oblicza sumę n początkowych wyrazów ciągu arytmetycznego i stosuje ją w zadaniach tekstowych.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Ciąg arytmetyczny to ciąg, w którym każdy następny wyraz powstaje przez dodanie tej samej liczby $r$ (różnicy). To najczęstszy typ ciągu w zadaniach zamkniętych, a jego suma — stały element zadań otwartych o rzędach, trasach i składowanych elementach.',
        },
        {
          type: 'formula',
          title: 'N-ty wyraz',
          body: 'Od pierwszego wyrazu do $n$-tego robiisz $n - 1$ kroków po $r$, stąd wzór:',
          formula: 'a_n = a_1 + (n - 1) \\cdot r',
        },
        {
          type: 'formula',
          title: 'Suma n początkowych wyrazów',
          body: 'Dwa równoważne wzory — pierwszy wygodny, gdy znasz pierwszy i ostatni wyraz, drugi, gdy znasz różnicę:',
          formula: 'S_n = \\frac{a_1 + a_n}{2} \\cdot n = \\frac{2a_1 + (n - 1)r}{2} \\cdot n',
        },
        {
          type: 'example',
          title: 'Przykład — wyznaczanie r i a_1',
          body: 'W ciągu arytmetycznym $a_3 = 7$ i $a_8 = 22$. Między trzecim a ósmym wyrazem jest $5$ kroków: $a_8 - a_3 = 5r = 15$, więc $r = 3$. Wtedy $a_1 = a_3 - 2r = 7 - 6 = 1$. Sprawdzenie: $a_8 = 1 + 7 \\cdot 3 = 22$.',
        },
        {
          type: 'example',
          title: 'Przykład — suma',
          body: 'Oblicz sumę $2 + 5 + 8 + \\ldots + 59$. To $20$ wyrazów ($a_1 = 2$, $r = 3$, $a_n = 59$ daje $n = 20$). Suma: $S_{20} = \\frac{2 + 59}{2} \\cdot 20 = 61 \\cdot 10 = 610$.',
        },
        {
          type: 'paragraph',
          title: 'Dlaczego suma działa',
          body: 'Skracaj sumę z obu końców: pierwsza para $a_1 + a_n$, druga $a_2 + a_{n-1}$ — każda daje tę samą wartość. Par jest $\\frac{n}{2}$, stąd wzór $S_n = \\frac{a_1 + a_n}{2} \\cdot n$. Ta idea (metoda Gaußa) pozwala też wyliczyć sumę w głowie, gdy zapomnisz wzoru.',
        },
        {
          type: 'example',
          title: 'Przykład — zadanie tekstowe',
          body: 'Na trybunie $20$ rzędów; w pierwszym rzędzie jest $12$ miejsc, a każdy następny ma o $3$ więcej. Ile miejsc ma cała trybuna? To ciąg arytmetyczny: $a_1 = 12$, $r = 3$, $n = 20$. Suma: $S_{20} = \\frac{2 \\cdot 12 + 19 \\cdot 3}{2} \\cdot 20 = \\frac{24 + 57}{2} \\cdot 20 = 40{,}5 \\cdot 20 = 810$. Trybuna ma $810$ miejsc.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Liczba kroków między $a_k$ a $a_m$ to $m - k$, a nie $m - k + 1$.
• Podstawienie $n$ zamiast $n - 1$ przy różnicy: $a_n = a_1 + (n-1)r$.
• Suma $2 + 4 + \\ldots + 60$: jest $30$ wyrazów, bo $60 = 2n$ daje $n = 30$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach tekstowych najpierw zapisz, co jest $a_1$, co $r$ i ile jest wyrazów $n$ — dopiero potem wstawiaj do wzoru. Egzaminator przyznaje punkty za poprawny model, nawet jeśli pomyli się końcowy rachunek.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $a_n = a_1 + (n-1)r$; różnicę wyznaczasz z różnicy dwóch wyrazów podzielonej przez liczbę kroków.
• $S_n = \\frac{a_1 + a_n}{2} \\cdot n$ lub $S_n = \\frac{2a_1 + (n-1)r}{2} \\cdot n$.
• Zadania tekstowe: najpierw model ($a_1$, $r$, $n$), potem rachunek.`,
        },
      ],
    },
    {
      slug: 'ciagi-geometryczny',
      title: 'Ciąg geometryczny i procent składany',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['V.3', 'V.4'],
      objectives: [
        'Stosujesz wzór na n-ty wyraz ciągu geometrycznego',
        'Obliczasz sumę n początkowych wyrazów ciągu geometrycznego',
        'Stosujesz procent składany jako ciąg geometryczny w zadaniach praktycznych',
      ],
      skills: [
        { slug: 'ciagi-geometryczny', name: 'Ciąg geometryczny', description: 'Stosuje wzór b_n = b_1 q^{n-1} oraz wzór na sumę n początkowych wyrazów.', level: 'basic' },
        { slug: 'ciagi-procent-skladany', name: 'Procent składany', description: 'Modeluje lokaty i wzrost procentowy ciągiem geometrycznym: K_n = K_0(1 + p/100)^n.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Ciąg geometryczny mnoży każdy wyraz przez tę samą liczbę $q$ (iloraz). Występuje wszędzie tam, gdzie coś rośnie albo maleje „procentowo”: lokaty, odsetki, rozpad, powiększanie figury. Na maturze pojawia się w zadaniach zamkniętych, w zadaniach o lokatach i w treściach o procencie składanym.',
        },
        {
          type: 'formula',
          title: 'N-ty wyraz i suma',
          body: 'Od $b_1$ do $b_n$ wykonujesz $n - 1$ mnożeń przez $q$. Sumę obliczasz wzorem obowiązującym dla $q \\neq 1$:',
          formula: 'b_n = b_1 \\cdot q^{n - 1} \\qquad S_n = \\frac{b_1 (q^{n} - 1)}{q - 1} = \\frac{b_1 (1 - q^{n})}{1 - q}',
        },
        {
          type: 'example',
          title: 'Przykład — wyznaczanie ilorazu',
          body: 'W ciągu geometrycznym $b_2 = 6$ i $b_5 = 48$. Między nimi są $3$ kroki: $b_5 = b_2 \\cdot q^{3}$, więc $q^{3} = 8$ i $q = 2$. Wtedy $b_1 = 3$, a cały ciąg to $3, 6, 12, 24, 48$.',
        },
        {
          type: 'example',
          title: 'Przykład — suma',
          body: '$S = 1 + 2 + 4 + \\ldots + 2^{8}$ — dziewięć wyrazów ($2^0$ do $2^8$). Ze wzoru: $S_9 = \\frac{1 \\cdot (2^{9} - 1)}{2 - 1} = 511$.',
        },
        {
          type: 'heading',
          title: 'Procent składany',
          body: 'Kapitał $K_0$ powiększany co rok o $p\\%$ rośnie jak ciąg geometryczny: po jednym roku masz $K_0$ pomnożone przez $1 + \\frac{p}{100}$, po dwóch latach przez $\\left(1 + \\frac{p}{100}\\right)^{2}$ i tak dalej. Po $n$ latach obowiązuje wzór $K_n = K_0 \\left(1 + \\frac{p}{100}\\right)^{n}$. Kapitalizacja kwartalna? Podziel roczny procent przez $4$ i licz kwartały.',
        },
        {
          type: 'formula',
          title: 'Wzór na procent składany',
          body: 'Podstawowy wzorzec zadań o lokatach — zapamiętaj interpretację każdego elementu.',
          formula: 'K_n = K_0 \\cdot \\left(1 + \\frac{p}{100}\\right)^{n}',
        },
        {
          type: 'example',
          title: 'Przykład — lokata',
          body: 'Wpłacasz $5000$ zł na $2$ lata, $8\\%$ rocznie z kapitalizacją roczną. $K_2 = 5000 \\cdot 1{,}08^{2} = 5000 \\cdot 1{,}1664 = 5832$ zł. Odsetki to $832$ zł — więcej niż $800$ zł z odsetek prostych, bo w drugim roku pracuje też odsetek z pierwszego roku.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Potęga $n-1$ w wyrazie ogólnym, a $n$ we wzorze na procent składany — pierwsza kapitalizacja to już jeden „krok”.
• Mnożenie przez $\\frac{p}{100}$ zamiast przez $1 + \\frac{p}{100}$: procent opisuje przyrost, nie nową wartość.
• Suma przy $q = 1$: wzór przestaje działać, bo wtedy $S_n = n \\cdot b_1$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach o pieniądzach zapisuj jednostki i kończ odpowiedź zdaniem: „lokata będzie wynosić 5832 zł”. Za brak interpretacji kontekstowej w zadaniu otwartym tracisz punkt, mimo poprawnego rachunku.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $b_n = b_1 q^{n-1}$; iloraz wyznaczasz z relacji $q^{m-k} = \\frac{b_m}{b_k}$.
• $S_n = \\frac{b_1(1 - q^{n})}{1 - q}$ dla $q \\neq 1$.
• Procent składany: $K_n = K_0 (1 + p/100)^{n}$ — ciąg geometryczny w praktyce.`,
        },
      ],
    },
    {
      slug: 'ciagi-granica',
      title: 'Granica ciągu i szereg geometryczny',
      durationMinutes: 25,
      difficulty: 4,
      requirements: ['V.5', 'V.6'],
      objectives: [
        'Obliczasz granice ciągów z podstawowych wzorców i twierdzeń o działaniach',
        'Rozpoznajesz ciągi rozbieżne do nieskończoności',
        'Obliczasz sumę szeregu geometrycznego zbieżnego',
      ],
      skills: [
        { slug: 'ciagi-granica', name: 'Granica ciągu', description: 'Oblicza granice ciągów (wzorce i działania na granicach) oraz bada zbieżność.', level: 'extended' },
        { slug: 'ciagi-szereg', name: 'Szereg geometryczny', description: 'Oblicza sumę szeregu geometrycznego dla |q| < 1 i stosuje ją w zadaniach.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji (rozszerzenie)',
          body: 'Granica ciągu opisuje, dokąd zmierzają wyrazy, gdy numer rośnie w nieskończoność. Wymagania maturalne ograniczają się do kilku wzorców i działań na granicach — da się je opanować metodami schematycznymi bez rozbudowanej teorii.',
        },
        {
          type: 'formula',
          title: 'Podstawowe granice',
          body: 'Trzy wzorce, z których zbudowane jest niemal wszystko:',
          formula: '\\lim_{n \\to \\infty} \\frac{a}{n^{k}} = 0 \\qquad \\lim_{n \\to \\infty} q^{n} = 0 \\; (|q| < 1) \\qquad \\lim_{n \\to \\infty} \\frac{a_{k} n^{k} + \\ldots}{b_{m} n^{m} + \\ldots} = \\begin{cases} 0 & k < m \\\\ \\frac{a_k}{b_m} & k = m \\end{cases}',
        },
        {
          type: 'example',
          title: 'Przykład — ułamek wielomianowy',
          body: '$\\lim \\frac{3n + 1}{n + 2}$: stopnie licznika i mianownika są równe, więc granica to stosunek współczynników przy najwyższych potęgach: $\\frac{3}{1} = 3$. Równoważnie: podziel licznik i mianownik przez $n$ i skorzystaj, że $\\frac{1}{n} \\to 0$.',
        },
        {
          type: 'example',
          title: 'Przykład — nieoznaczoność ∞/∞',
          body: '$\\lim \\frac{n^{2} + 5}{n + 1}$: licznik rośnie szybciej (stopień $2$ vs $1$), więc granica nie istnieje — ciąg jest rozbieżny do $+\\infty$. W odpowiedzi maturalnej pisz „ciąg rozbieżny do $+\\infty$”, nie „granica równa się nieskończoności”.',
        },
        {
          type: 'paragraph',
          title: 'Działania na granicach',
          body: 'Granica sumy, różnicy i iloczynu równa się odpowiedniej kombinacji granic — o ile istnieją. Granicę ilorazu liczysz, gdy mianownik ma granicę różną od zera. Przy nieoznaczonościach typu $\\infty - \\infty$ przekształć wyrażenie (na przykład wymnóż przez sprzężenie albo sprowadź do wspólnego mianownika).',
        },
        {
          type: 'heading',
          title: 'Szereg geometryczny',
          body: 'Szereg to suma nieskończenie wielu wyrazów ciągu geometrycznego. Suma częściowa $S_n = \\frac{b_1(1 - q^{n})}{1 - q}$; gdy $|q| < 1$, wyraz $q^{n}$ dąży do zera i dostajemy sumę szeregu. Dla $|q| \\geq 1$ szereg jest rozbieżny.',
        },
        {
          type: 'formula',
          title: 'Suma szeregu geometrycznego',
          body: 'Obowiązuje wyłącznie dla $|q| < 1$ — sprawdź warunek, zanim użyjesz wzoru.',
          formula: 'S = \\frac{b_1}{1 - q} \\qquad (|q| < 1)',
        },
        {
          type: 'example',
          title: 'Przykład — szereg',
          body: '$1 + \\frac{1}{3} + \\frac{1}{9} + \\frac{1}{27} + \\ldots$: tutaj $b_1 = 1$, $q = \\frac{1}{3}$. Ponieważ $|q| < 1$, suma istnieje: $S = \\frac{1}{1 - 1/3} = \\frac{3}{2}$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Użycie wzoru $\\frac{b_1}{1-q}$ bez sprawdzenia warunku $|q| < 1$.
• Pomylenie $q$ z $b_1$ w szeregu zapisanym od drugiego wyrazu — przepisz pierwsze dwa wyrazy.
• Deklarowanie granicy skończonej dla ciągów rozbieżnych do nieskończoności.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach o granicach pisz krótkie uzasadnienie: który wzorzec stosujesz i dlaczego warunki są spełnione. Jedno zdanie typu „ponieważ |q| < 1, szereg jest zbieżny” często jest osobnym kryterium punktacji.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $\\frac{a}{n^k} \\to 0$, $q^{n} \\to 0$ dla $|q| < 1$, ułamek równych stopni → stosunek współczynników.
• Stopień licznika większy → ciąg rozbieżny do $\\pm\\infty$.
• Szereg geometryczny zbieżny tylko dla $|q| < 1$: $S = \\frac{b_1}{1 - q}$.`,
        },
      ],
    },
  ],
}
