import type { ContentTopic } from '@/content/types'

export const dowody: ContentTopic = {
  slug: 'dowody',
  title: 'Dowody i uzasadnianie',
  description: 'Prowadzisz przejrzysty dowód algebraiczny, geometryczny i indukcyjny oraz uzasadniasz odpowiedź.',
  level: 'extended',
  lessons: [
    {
      slug: 'dowody-algebraiczne',
      title: 'Tożsamości i dowody algebraiczne',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['II.7', 'D.2'],
      objectives: [
        'Dowodzisz tożsamość przez równoważne przekształcenia',
        'Dowodzisz nierówności przez uzupełnianie do kwadratu',
        'Zapisujesz dowód w formie wymaganej przez egzaminatora',
      ],
      skills: [
        { slug: 'dowody-algebraiczne', name: 'Dowody algebraiczne', description: 'Dowodzi tożsamości i nierówności algebraicznych.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Czym jest poprawny dowód',
          body: 'Dowód to ciąg uzasadnionych zdań prowadzących od założeń do tezy. Każde przejście musi być jawne i odwracalne (albo jednostronnie uzasadnione). Nie wolno „udowadniać” tezy, zakładając ją po cichu — to najczęstszy błąd początkujących.',
        },
        {
          type: 'formula',
          title: 'Dwa filary dowodów algebraicznych',
          body: 'Tożsamości dowodzisz, przekształcając jedną stronę do drugiej; nierówności — sprowadzając wyrażenie do sumy kwadratów.',
          formula: 'a^2 \\geq 0, \\qquad a^2+b^2=0 \\iff a=b=0, \\qquad (a \\pm b)^2 = a^2 \\pm 2ab + b^2',
        },
        {
          type: 'example',
          title: 'Przykład — tożsamość',
          body: 'Udowodnij $(a-b)^{2} = a^{2} - 2ab + b^{2}$. Rozwijamy lewą stronę z definicji iloczynu: $(a-b)(a-b) = a^{2} - ab - ab + b^{2} = a^{2} - 2ab + b^{2}$. Otrzymaliśmy prawą stronę, co kończy dowód.',
        },
        {
          type: 'example',
          title: 'Przykład — nierówność przez pełny kwadrat',
          body: `Wykaż, że dla każdego $x$ zachodzi $x^{2} - 4x + 4 \\geq 0$.

Przekształcamy: $x^{2} - 4x + 4 = (x-2)^{2}$. Kwadrat liczby rzeczywistej jest nieujemny, więc $(x-2)^{2} \\geq 0$. To kończy dowód — i od razu widać, że równość zachodzi tylko dla $x = 2$.`,
        },
        {
          type: 'table',
          title: 'Strategie dowodowe',
          body: `| Cel | Metoda | Kluczowy ruch |\n|---|---|---|\n| tożsamość | przekształcenia jednej strony | doprowadź L do P |\n| nierówność | uzupełnienie do kwadratu | zapisz jako $\\text{kwadrat} + \\text{liczba}$ |\n| obalenie zdania | kontrprzykład | podaj jeden przykład |`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Przekształcanie obu stron naraz bez zachowania równoważności.\n• Założenie tezy w dowodzie („skoro $x^{2}+1>0$, to…”) — tak nie wolno.\n• Błąd w uzupełnianiu do kwadratu: $x^{2}+6x = (x+3)^{2}-9$.\n• Brak zdania zamykającego („co należało wykazać”) — formalnie dowód jest niedokończony.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zacznij od zdania „Przekształcam równoważnie lewą stronę:” i pokazuj każdy krok w osobnej linii. Za metodę i poprawność przekształceń są osobne punkty — nawet jeśli drobiazg rachunkowy się wymknie, część punktów zostaje.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Tożsamość: przekształcaj jedną stronę do drugiej, krok po kroku.\n• Nierówność: sprowadź do sumy kwadratów i liczby dodatniej.\n• $a^{2} \\geq 0$ dla każdego rzeczywistego $a$.\n• Zakończ dowód jawnym wnioskiem.`,
        },
      ],
    },
    {
      slug: 'dowody-indukcja',
      title: 'Indukcja matematyczna i uzasadnianie',
      durationMinutes: 30,
      difficulty: 5,
      requirements: ['D.1', 'D.3'],
      objectives: [
        'Stosujesz zasadę indukcji matematycznej',
        'Prowadzisz krok indukcyjny z wykorzystaniem założenia',
        'Uzasadniasz odpowiedź w zadaniach maturalnych',
      ],
      skills: [
        { slug: 'dowody-indukcja', name: 'Indukcja', description: 'Dowodzi wzorów indukcyjnych.', level: 'extended' },
        { slug: 'dowody-uzasadnianie', name: 'Uzasadnianie', description: 'Formułuje logiczne uzasadnienie odpowiedzi.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Idea indukcji',
          body: 'Indukcja to dowód „domina”: jeśli zdanie jest prawdziwe dla pierwszego przypadku i każde prawdziwe zdanie pociąga następne, to jest prawdziwe dla wszystkich. Dwa kroki — baza i krok indukcyjny — plus założenie indukcyjne to cały schemat.',
        },
        {
          type: 'formula',
          title: 'Zasada indukcji matematycznej',
          body: 'Warunek 1 to baza, warunek 2 to krok indukcyjny — korzysta on z założenia, że teza zachodzi dla $n$.',
          formula: '\\text{(1) } T(1) \\text{ prawdziwe}, \\qquad \\text{(2) } T(n) \\Rightarrow T(n+1), \\qquad \\Longrightarrow T(n)\\ \\text{dla każdego } n \\geq 1',
        },
        {
          type: 'example',
          title: 'Przykład — suma kolejnych liczb',
          body: `Udowodnij $1 + 2 + \\ldots + n = \\frac{n(n+1)}{2}$.

**Baza ($n=1$):** $1 = \\frac{1 \\cdot 2}{2}$ — prawda.

**Założenie:** $1 + \\ldots + n = \\frac{n(n+1)}{2}$.

**Krok ($n \\to n+1$):** dodajemy $n+1$ do obu stron:
$$\\frac{n(n+1)}{2} + (n+1) = \\frac{n(n+1) + 2(n+1)}{2} = \\frac{(n+1)(n+2)}{2},$$
co jest tezą dla $n+1$. To kończy dowód.`,
        },
        {
          type: 'example',
          title: 'Przykład — nierówność indukcyjna',
          body: 'Udowodnij, że $2^{n} \\geq n + 1$ dla $n \\geq 1$. Baza: $2^{1} = 2 \\geq 2$. Załóżmy $2^{n} \\geq n+1$. Wtedy $2^{n+1} = 2 \\cdot 2^{n} \\geq 2(n+1) = 2n+2 \\geq n+2$, bo $n \\geq 0$. Krok zachodzi, więc zdanie jest prawdziwe.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Pominięcie bazy — wtedy „dowód” może „pokazać” fałszywe zdanie.\n• Brak wykorzystania założenia indukcyjnego w kroku — to znak, że nie jest to poprawna indukcja.\n• Użycie tezy dla $n+1$ jako założenia — błędne koło.\n• Zapis „dla $n$ i $n+1$” bez słowa, co jest założeniem, a co tezą.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zawsze wyraźnie zatytułuj trzy części: „Baza”, „Założenie indukcyjne”, „Krok indukcyjny”. Egzaminator szuka tych trzech elementów osobno — brak bazy lub nieużyte założenie kosztuje punkty nawet przy poprawnym rachunku.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Schemat: baza → założenie → krok $n \\to n+1$.\n• W kroku musisz skorzystać z założenia.\n• Baza jest obowiązkowa.\n• Uzasadniając odpowiedź, powołuj się na twierdzenie lub wzór, nie na „widać”.`,
        },
      ],
    },
    {
      slug: 'dowody-geometryczne',
      title: 'Dowody geometryczne',
      durationMinutes: 25,
      difficulty: 4,
      requirements: ['VII.6'],
      objectives: [
        'Uzasadniasz twierdzenia geometryczne',
        'Wykorzystujesz własności figur i kryteria podobieństwa',
        'Piszesz dowód z jawnym powołaniem na twierdzenie',
      ],
      skills: [
        { slug: 'dowody-geometryczne', name: 'Dowody geometryczne', description: 'Prowadzi dowody z użyciem własności geometrycznych.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Język dowodu geometrycznego',
          body: 'W geometrii dowód to nie rysunek, lecz zdania. Najpierw wypisujesz, co wiesz (dane i oznaczenia), potem wybierasz twierdzenie, a na końcu zapisujesz wniosek. Odwołania typu „widać na rysunku” nie są dowodem, jeśli nie podasz własności.',
        },
        {
          type: 'formula',
          title: 'Najczęściej używane twierdzenia',
          body: 'Te trzy narzędzia rozwiązują większość zadań dowodowych z geometrii.',
          formula: '\\text{suma kątów trójkąta} = 180^\\circ, \\qquad \\text{AA} \\Rightarrow \\text{podobieństwo}, \\qquad \\text{kąty przy podstawie trójkąta równoramiennego są równe}',
        },
        {
          type: 'example',
          title: 'Przykład — suma kątów trójkąta',
          body: 'Udowodnij, że suma kątów w trójkącie wynosi $180^{\\circ}$. Przez wierzchołek $A$ poprowadź prostą równoległą do podstawy $BC$. Kąty przy $A$ odpowiadają kątom $B$ i $C$ (kąty naprzemianległe), a razem tworzą kąt półpełny wzdłuż prostej — czyli $180^{\\circ}$.',
        },
        {
          type: 'example',
          title: 'Przykład — trójkąt równoramienny',
          body: 'Udowodnij, że kąty przy podstawie trójkąta równoramiennego są równe. Niech $AB = AC$. Kąty $\\angle ABC$ i $\\angle BCA$ są przeciwległe odpowiednio do boków $AC$ i $AB$, a te boki są równe. Z twierdzenia o kątach przeciwległych równym bokom kąty te są równe.',
        },
        {
          type: 'table',
          title: 'Kryteria podobieństwa trójkątów',
          body: `| Kryterium | Warunek |\n|---|---|\n| AA | dwa kąty odpowiednio równe |\n| BKB | dwa boki proporcjonalne i kąt między nimi równy |\n| BBB | trzy boki proporcjonalne |`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Powoływanie się na rysunek bez twierdzenia.\n• Pomylenie kryterium podobieństwa z przystawaniem (podobieństwo dopuszcza skalę).\n• Zgubienie założenia o równości boków lub kątów.\n• Brak wniosku — dowód urywa się po obliczeniach.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zdefiniuj oznaczenia („niech $AB = AC$”), wypisz dane i cel, a każde przejście opatrz nazwą twierdzenia. Wniosek zapisz jawnie: „Zatem kąty przy podstawie są równe, co należało wykazać”. To gwarantuje punkty za strukturę dowodu.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Dane → twierdzenie → wniosek; każde przejście z uzasadnieniem.\n• Suma kątów trójkąta: $180^{\\circ}$.\n• Podobieństwo: AA, BKB, BBB.\n• Równym bokom odpowiadają równe kąty (i odwrotnie).`,
        },
      ],
    },
  ],
}
