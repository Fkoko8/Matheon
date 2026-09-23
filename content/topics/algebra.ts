import type { ContentTopic } from '@/content/types'

export const algebra: ContentTopic = {
  slug: 'algebra',
  title: 'Wyrażenia algebraiczne',
  description: 'Wzory skróconego mnożenia, redukcja wyrażeń, rozkład na czynniki i wyrażenia wymierne — warsztat, którym rozwiązujesz większość zadań otwartych.',
  level: 'basic',
  lessons: [
    {
      slug: 'algebra-wzory',
      title: 'Wzory skróconego mnożenia',
      durationMinutes: 20,
      difficulty: 2,
      requirements: ['II.1', 'II.2'],
      objectives: [
        'Stosujesz wzory na kwadrat sumy i różnicy w obie strony',
        'Rozpoznajesz różnicę kwadratów i używasz jej do szybkich rachunków',
        'Redukujesz wyrazy podobne bez gubienia znaków',
      ],
      skills: [
        { slug: 'algebra-wzory-skroconego-mnozenia', name: 'Wzory skróconego mnożenia', description: 'Stosuje wzory na kwadrat sumy i różnicy oraz różnicę kwadratów w obu kierunkach.', level: 'basic' },
        { slug: 'algebra-redukcja-wyrazen', name: 'Redukcja wyrażeń', description: 'Wykonuje działania na wyrażeniach algebraicznych i redukuje wyrazy podobne.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Wzory skróconego mnożenia to najczęściej używane narzędzie na maturze. Pojawiają się w zadaniach z wyrażeń, w dowodach, przy rozkładzie na czynniki, a nawet w geometrii analitycznej. Znając je w obie strony — od iloczynu do sumy i odwrotnie — oszczędzasz czas i unikasz błędów rachunkowych.',
        },
        {
          type: 'formula',
          title: 'Trzy podstawowe wzory',
          body: 'Naucz się ich na pamięć razem z kolejnością wyrazów — kolejność nie wpływa na wynik, ale pomaga w zapisie.',
          formula: '(a+b)^{2}=a^{2}+2ab+b^{2},\\quad (a-b)^{2}=a^{2}-2ab+b^{2},\\quad a^{2}-b^{2}=(a-b)(a+b)',
        },
        {
          type: 'paragraph',
          title: 'Jak je czytać w obie strony',
          body: 'W lewo (rozwijanie): z $(a+b)^{2}$ dostajesz sumę trzech wyrazów. W prawo (zwijanie): gdy widzisz $a^{2}-b^{2}$, zamieniasz to na iloczyn. Na maturze zdecydowanie częściej przydaje się zwijanie — to ono pozwala skracać ułamki i liczyć w pamięci.',
        },
        {
          type: 'example',
          title: 'Przykład — szybkie liczenie w pamięci',
          body: 'Oblicz $101^{2} - 99^{2}$. Zamiast podnosić duże liczby, użyj różnicy kwadratów: $101^{2}-99^{2} = (101-99)(101+99) = 2 \\cdot 200 = 400$.',
        },
        {
          type: 'example',
          title: 'Przykład — różnica kwadratów z pierwiastkami',
          body: 'Oblicz $(2\\sqrt{5}-3)(2\\sqrt{5}+3)$. To różnica kwadratów: $(2\\sqrt{5})^{2} - 3^{2} = 4 \\cdot 5 - 9 = 20 - 9 = 11$. Pierwiastki znikają — dlatego ten wzór tak często służy do usuwania niewymierności.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• $(a+b)^{2} \\neq a^{2}+b^{2}$ — brakuje podwojonego iloczynu $2ab$.
• $(a-b)^{2}$ ma minus tylko przy $2ab$; ostatni wyraz jest zawsze dodatni.
• Przy odejmowaniu wyrażenia w nawiasie zmieniasz znaki wszystkich jego wyrazów: $-(x^{2}-3x) = -x^{2}+3x$.`,
        },
        {
          type: 'heading',
          title: 'Redukcja wyrazów podobnych',
          body: 'Wyrazy podobne mają identyczną część literową. Redukujesz tylko współczynniki — potęgi pozostają bez zmian.',
        },
        {
          type: 'example',
          title: 'Przykład — redukcja',
          body: 'Uprość $3x^{2} - 5x + 2x^{2} + 7x - 4$. Wyrazy z $x^{2}$: $3x^{2}+2x^{2} = 5x^{2}$. Wyrazy z $x$: $-5x+7x = 2x$. Wyraz wolny: $-4$. Wynik: $5x^{2}+2x-4$.',
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Gdy w zadaniu jest „doprowadź do najprostszej postaci”, egzaminator oczekuje wielomianu uporządkowanego malejąco i bez nawiasów. Nie skracaj też niczego „na skróty” — każdy pominięty krok to ryzyko utraty punktu.',
        },
        {
          type: 'interactive_question',
          title: 'Sprawdź się',
          body: 'Oblicz $(2x+1)^{2}$ dla $x = 2$. Podaj wynik jako liczbę.',
        },
        {
          type: 'summary',
          title: 'Podsumowanie',
          body: 'Znasz kwadrat sumy, kwadrat różnicy i różnicę kwadratów w obie strony oraz umiesz redukować wyrazy podobne. Następny krok: rozkładanie wyrażeń na czynniki i wyrażenia wymierne.',
        },
      ],
    },
    {
      slug: 'algebra-przeksztalcenia',
      title: 'Rozkład na czynniki i wyrażenia wymierne',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['II.1', 'II.2', 'I.6'],
      objectives: [
        'Rozkładasz wyrażenie na czynniki metodą wyłączania wspólnego czynnika i grupowania',
        'Skracasz wyrażenia wymierne, pamiętając o założeniach',
        'Wyznaczasz dziedzinę wyrażenia wymiernego',
      ],
      skills: [
        { slug: 'algebra-rozkladanie-na-czynniki', name: 'Rozkład na czynniki', description: 'Rozkłada wyrażenia algebraiczne przez wspólny czynnik, grupowanie i wzory skróconego mnożenia.', level: 'basic' },
        { slug: 'algebra-dziedzina-wyrazenia-wymiernego', name: 'Dziedzina wyrażenia wymiernego', description: 'Wyznacza dziedzinę wyrażenia wymiernego i skraca je z zachowaniem założeń.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Rozkład na czynniki to klucz do skracania ułamków algebraicznych, rozwiązywania równań wielomianowych i dowodzenia podzielności. Na maturze niemal zawsze jest to pierwszy krok zadania otwartego.',
        },
        {
          type: 'heading',
          title: 'Kolejność, która zawsze działa',
          body: 'Zawsze próbuj w tej kolejności — od najprostszej metody do najbardziej złożonej.',
        },
        {
          type: 'paragraph',
          title: 'Plan działania',
          body: `1. Wyłącz wspólny czynnik przed nawias.
2. Sprawdź, czy w nawiasie jest wzór skróconego mnożenia.
3. Jeśli nie — spróbuj grupowania wyrazów.
4. Na końcu sprawdź, czy każdy czynnik da się rozłożyć dalej.`,
        },
        {
          type: 'example',
          title: 'Przykład — wspólny czynnik',
          body: 'Rozłóż $6x^{3} - 9x^{2}$. Wspólny czynnik to $3x^{2}$, więc $6x^{3}-9x^{2} = 3x^{2}(2x-3)$.',
        },
        {
          type: 'example',
          title: 'Przykład — różnica kwadratów',
          body: 'Rozłóż $x^{4} - 16$. Traktujemy to jako różnicę kwadratów: $x^{4}-16 = (x^{2}-4)(x^{2}+4)$. Pierwszy czynnik rozkłada się dalej: $(x-2)(x+2)(x^{2}+4)$.',
        },
        {
          type: 'example',
          title: 'Przykład — grupowanie',
          body: 'Rozłóż $x^{3}+2x^{2}-3x-6$. Grupujemy: $x^{2}(x+2) - 3(x+2) = (x+2)(x^{2}-3)$.',
        },
        {
          type: 'heading',
          title: 'Wyrażenia wymierne',
          body: 'Ułamek algebraiczny wolno skracać tylko przez cały czynnik, nigdy przez pojedynczy składnik sumy.',
        },
        {
          type: 'formula',
          title: 'Dziedzina wyrażenia wymiernego',
          body: 'Mianownik nie może być zerem — założenia zapisujesz przed skróceniem ułamka.',
          formula: '\\frac{W(x)}{P(x)}\\ \\text{ma sens, gdy } P(x)\\neq 0',
        },
        {
          type: 'example',
          title: 'Przykład — skracanie z założeniem',
          body: 'Uprość $\\dfrac{x^{2}-9}{x-3}$. Licznik to różnica kwadratów: $(x-3)(x+3)$. Założenie: $x \\neq 3$. Po skróceniu zostaje $x+3$.',
        },
        {
          type: 'warning',
          title: 'Błąd, który kosztuje punkt',
          body: 'Nie wolno skracać składników sumy: $\\dfrac{x+3}{x}$ to NIE $3$. Skracasz wyłącznie czynniki, dlatego najpierw rozkładasz licznik i mianownik na czynniki.',
        },
        {
          type: 'interactive_question',
          title: 'Sprawdź się',
          body: 'Dla jakiej liczby $x$ wyrażenie $\\dfrac{5}{x-2}$ nie ma sensu? Podaj liczbę.',
        },
        {
          type: 'summary',
          title: 'Podsumowanie',
          body: 'Rozkładasz wyrażenia przez wspólny czynnik, grupowanie i wzory, a wyrażenia wymierne skracasz z zapisanym założeniem. To bezpośrednie przygotowanie do równań wielomianowych i wymiernych.',
        },
      ],
    },
    {
      slug: 'algebra-matura',
      title: 'Wyrażenia algebraiczne — zadania maturalne',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['II.2', 'II.3', 'II.6', 'I.7'],
      objectives: [
        'Dowodzisz nierówności algebraicznych metodą sprowadzenia do kwadratu',
        'Stosujesz wzory skróconego mnożenia do zadań z treścią i procentów',
        'Zapisujesz dowód tak, żeby egzaminator nie miał wątpliwości',
      ],
      skills: [
        { slug: 'algebra-dowod-nierownosci-algebraicznej', name: 'Dowód nierówności algebraicznej', description: 'Dowodzi nierówności algebraicznych przez przekształcenia równoważne i sumy kwadratów.', level: 'basic' },
        { slug: 'algebra-procenty-w-praktyce', name: 'Procenty w zadaniach tekstowych', description: 'Rozwiązuje zadania o podwyżkach, obniżkach i zmianach procentowych.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Zadania otwarte z tego działu sprawdzają dwie rzeczy: czy umiesz przekształcać wyrażenia i czy potrafisz to zapisać w formie dowodu lub rozwiązania zadania z treścią.',
        },
        {
          type: 'heading',
          title: 'Schemat dowodu nierówności',
          body: 'Najczęstszy schemat maturalny: przenieś wszystko na jedną stronę, przekształć wyrażenie do sumy kwadratów i liczby dodatniej, zakończ wnioskiem.',
        },
        {
          type: 'formula',
          title: 'Kluczowa nierówność',
          body: 'Dla dowolnych liczb rzeczywistych $a$ i $b$ prawdziwa jest nierówność, z której korzysta wiele zadań dowodowych.',
          formula: '(a-b)^{2}\\geq 0 \\implies a^{2}+b^{2}\\geq 2ab',
        },
        {
          type: 'example',
          title: 'Przykład — pełny dowód',
          body: 'Wykaż, że dla dowolnych liczb rzeczywistych $a$ i $b$ zachodzi $(a+b)^{2} \\geq 4ab$.\\nPrzekształcamy lewą stronę: $(a+b)^{2} = a^{2}+2ab+b^{2}$. Nierówność przyjmuje postać $a^{2}+2ab+b^{2} \\geq 4ab$, czyli $a^{2}-2ab+b^{2} \\geq 0$. To $(a-b)^{2} \\geq 0$, co jest prawdą dla wszystkich liczb rzeczywistych. Co należało wykazać.',
        },
        {
          type: 'tip',
          title: 'Jak zapisać dowód',
          body: 'Zacznij od wyrażenia, które przekształcasz, a nie od tezy. Zakończ zdaniem „co należało wykazać”. Każde przejście powinno być równoważne — albo napisz, w którą stronę wnioskujesz.',
        },
        {
          type: 'heading',
          title: 'Procenty w zadaniach tekstowych',
          body: 'Podwyżka o $p\\%$ to mnożenie przez $1 + \\frac{p}{100}$, obniżka przez $1 - \\frac{p}{100}$. Dwie zmiany pod rząd to iloczyn tych współczynników.',
        },
        {
          type: 'formula',
          title: 'Procent składany',
          body: 'Po $n$ zmianach o ten sam procent wynik opisuje wzór:',
          formula: 'K_{n}=K_{0}\\cdot\\left(1\\pm\\frac{p}{100}\\right)^{n}',
        },
        {
          type: 'example',
          title: 'Przykład — cena przed podwyżką',
          body: 'Po podwyżce o $20\\%$ cena wynosi $156$ zł. Ile kosztował towar przed podwyżką? Zapisujemy $1{,}2x = 156$, więc $x = 130$ zł.',
        },
        {
          type: 'example',
          title: 'Przykład — dwie obniżki',
          body: 'Cena $240$ zł spadła dwukrotnie o $10\\%$. Po pierwszej: $240 \\cdot 0{,}9 = 216$. Po drugiej: $216 \\cdot 0{,}9 = 194{,}40$ zł. Uwaga: to nie to samo co jedna obniżka o $20\\%$ (wtedy byłoby $192$ zł).',
        },
        {
          type: 'warning',
          title: 'Pułapki egzaminacyjne',
          body: `• Podwojenie liczby to wzrost o $100\\%$, nie o $200\\%$.
• Punkt procentowy to nie to samo co procent: wzrost z $40\\%$ do $45\\%$ to $5$ punktów procentowych, ale wzrost względny o $12{,}5\\%$.
• W dowodach nie wystarczy sprawdzić kilka przykładów liczbowych.`,
        },
        {
          type: 'summary',
          title: 'Podsumowanie',
          body: 'Umiesz przeprowadzić dowód nierówności ze sprowadzeniem do kwadratu i rozwiązać zadanie tekstowe z procentami. To dwa typy zadań, które pojawiają się niemal w każdym arkuszu.',
        },
      ],
    },
  ],
}
