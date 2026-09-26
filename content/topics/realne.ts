import type { ContentTopic } from '@/content/types'

export const realne: ContentTopic = {
  slug: 'realne',
  title: 'Liczby rzeczywiste',
  level: 'basic',
  description: 'Zbiory liczbowe, potęgi, pierwiastki, wartość bezwzględna i przedziały — fundament każdego zadania maturalnego.',
  lessons: [
    {
      slug: 'realne-fundamenty',
      title: 'Liczby rzeczywiste — fundamenty',
      durationMinutes: 20,
      difficulty: 1,
      requirements: ['I.1', 'I.2', 'I.6'],
      objectives: [
        'Rozpoznasz, do którego zbioru liczbowego należy dana liczba',
        'Odróżnisz liczbę wymierną od niewymiernej na podstawie rozwinięcia dziesiętnego',
        'Zaznaczysz i połączysz przedziały na osi liczbowej',
      ],
      skills: [
        { slug: 'realne-zbiory-liczbowe', name: 'Zbiory liczbowe', description: 'Klasyfikuje liczby jako naturalne, całkowite, wymierne i niewymierne.', level: 'basic' },
        { slug: 'realne-liczby-wymierne', name: 'Postacie liczb wymiernych', description: 'Zamienia ułamki zwykłe na dziesiętne i rozpoznaje rozwinięcia okresowe.', level: 'basic' },
        { slug: 'realne-przedzialy', name: 'Przedziały liczbowe', description: 'Zapisuje zbiory w postaci przedziałów i wykonuje na nich działania.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Na maturze prawie każde zadanie zaczyna się od liczb. W tej lekcji porządkujemy wiedzę o zbiorach liczbowych, nauczysz się rozpoznawać liczby wymierne i niewymierne oraz zapisywać odpowiedzi w postaci przedziałów.',
        },
        {
          type: 'heading',
          title: 'Zbiory liczbowe',
          body: 'Kolejne zbiory liczbowe są coraz szersze — każdy następny zawiera poprzedni:',
        },
        {
          type: 'formula',
          title: 'Zawieranie zbiorów',
          body: 'Zapamiętaj ten łańcuch — na jego podstawie klasyfikujesz każdą liczbę.',
          formula: '\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}',
        },
        {
          type: 'paragraph',
          title: 'Co zawiera każdy zbiór',
          body: '$\\mathbb{N}$ — liczby naturalne: $0, 1, 2, 3, \\ldots$\n$\\mathbb{Z}$ — liczby całkowite: naturalne i liczby do nich przeciwne, np. $-3, -1, 0, 5$\n$\\mathbb{Q}$ — liczby wymierne: takie, które można zapisać jako ułamek $\\frac{p}{q}$, gdzie $p, q$ są całkowite i $q \\neq 0$\n$\\mathbb{R}$ — liczby rzeczywiste: wszystkie liczby wymierne oraz niewymierne, np. $\\sqrt{2}$, $\\pi$, $-\\frac{7}{3}$',
        },
        {
          type: 'example',
          title: 'Przykład — klasyfikacja liczb',
          body: 'Do jakich zbiorów należy liczba $\\sqrt{4}$?\nPonieważ $\\sqrt{4} = 2$, liczba ta należy do $\\mathbb{N}$, $\\mathbb{Z}$, $\\mathbb{Q}$ i $\\mathbb{R}$. Pierwiastek nie oznacza automatycznie liczby niewymiernej!\n\nA liczba $0{,}(3)$? To rozwinięcie dziesiętne okresowe, a $0{,}(3) = \\frac{1}{3}$, więc jest liczbą wymierną.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: '• $\\sqrt{4}$, $\\sqrt{9}$, $\\sqrt{0{,}25}$ są liczbami wymiernymi — pierwiastek liczby kwadratowej jest wymierny.\n• Każde skończone lub okresowe rozwinięcie dziesiętne opisuje liczbę wymierną.\n• $\\pi$ oraz $\\sqrt{2}$, $\\sqrt{3}$, $\\sqrt{5}$ są niewymierne.',
        },
        {
          type: 'heading',
          title: 'Przedziały',
          body: 'Przedział to zwarty zapis zbioru liczb z osi. Nawias okrągły oznacza, że liczba nie należy do przedziału, kwadratowy — że należy.',
        },
        {
          type: 'paragraph',
          title: 'Działania na przedziałach',
          body: 'Suma $A \\cup B$ to wszystkie elementy obu przedziałów, część wspólna $A \\cap B$ to elementy należące do obu, a różnica $A \\setminus B$ to elementy $A$, których nie ma w $B$. Najbezpieczniej zaznaczyć oba przedziały na jednej osi i odczytać wynik.',
        },
        {
          type: 'example',
          title: 'Przykład — część wspólna',
          figure: {
            kind: 'numberline',
            min: -3,
            max: 6,
            step: 1,
            caption: 'A = (−2, 3] i B = [1, 5), więc część wspólna to [1, 3] — od 1 włącznie do 3 włącznie.',
            points: [
              { value: -2, label: 'A: −2 otwarte', color: 'amber', hollow: true },
              { value: 5, label: 'B: 5 otwarte', color: 'blue', hollow: true },
              { value: 1, label: '1', color: 'emerald' },
              { value: 3, label: '3', color: 'emerald' },
            ],
            intervals: [{ from: 1, to: 3, color: 'violet', label: 'A ∩ B = [1, 3]' }],
          },
          body: '$A = (-2, 3]$ oraz $B = [1, 5)$. Na osi widzimy, że wspólny fragment to liczby od $1$ (włącznie) do $3$ (włącznie), czyli $A \\cap B = [1, 3]$.',
        },
        {
          type: 'interactive_question',
          title: 'Sprawdź się',
          body: 'Czy liczba $0{,}121212\\ldots$ (okres $12$) jest wymierna? Odpowiedz i uzasadnij jednym zdaniem.',
        },
        {
          type: 'summary',
          title: 'Podsumowanie',
          body: 'Znasz łańcuch $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$, umiesz klasyfikować liczby (także te zapisane pierwiastkiem) i wykonujesz działania na przedziałach. Następny krok: potęgi, pierwiastki i wartość bezwzględna.',
        },
      ],
    },
    {
      slug: 'realne-zadania',
      title: 'Liczby rzeczywiste — zadania standardowe',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['I.3', 'I.4', 'I.5', 'I.7'],
      objectives: [
        'Stosujesz prawa działań na potęgach, także o wykładniku ujemnym i wymiernym',
        'Upraszczasz wyrażenia z pierwiastkami i usuwasz niewymierność z mianownika',
        'Rozwiązujesz proste równania i nierówności z wartością bezwzględną',
      ],
      skills: [
        { slug: 'realne-potegi', name: 'Potęgi', description: 'Stosuje prawa działań na potęgach o wykładniku całkowitym i wymiernym.', level: 'basic' },
        { slug: 'realne-pierwiastki', name: 'Pierwiastki', description: 'Upraszcza wyrażenia z pierwiastkami i usuwa niewymierność z mianownika.', level: 'basic' },
        { slug: 'realne-wartosc-bezwzgledna', name: 'Wartość bezwzględna', description: 'Interpretuje i wykorzystuje wartość bezwzględną w równaniach i nierównościach.', level: 'basic' },
        { slug: 'realne-procenty', name: 'Procenty', description: 'Oblicza procent liczby, punkt procentowy i stosuje podwyżki oraz obniżki w zadaniach tekstowych.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'To najczęściej punktowane umiejętności w pierwszych zadaniach arkusza: sprawne działania na potęgach i pierwiastkach oraz praca z wartością bezwzględną.',
        },
        {
          type: 'formula',
          title: 'Prawa działań na potęgach',
          body: 'Dotyczy $a > 0$; dla wykładnika całkowitego dopuszczamy też $a < 0$.',
          formula: 'a^{m}\\cdot a^{n}=a^{m+n},\\quad \\frac{a^{m}}{a^{n}}=a^{m-n},\\quad (a^{m})^{n}=a^{mn},\\quad a^{-n}=\\frac{1}{a^{n}},\\quad a^{\\frac{1}{n}}=\\sqrt[n]{a}',
        },
        {
          type: 'example',
          title: 'Przykład — potęgi',
          body: 'Oblicz $\\dfrac{2^{3}\\cdot 2^{-5}}{2^{-4}}$. W liczniku dodajemy wykładniki: $2^{3+(-5)} = 2^{-2}$. Dzielenie to odejmowanie wykładników: $2^{-2-(-4)} = 2^{2} = 4$.',
        },
        {
          type: 'warning',
          title: 'Znak przy potędze',
          body: '$-2^{2} = -4$, ale $(-2)^{2} = 4$. Nawias zmienia wszystko — to najczęstsza pomyłka w zadaniach zamkniętych.',
        },
        {
          type: 'formula',
          title: 'Pierwiastki',
          body: 'Pierwiastek iloczynu rozkładamy na iloczyn pierwiastków — dzięki temu wyłączamy czynnik przed pierwiastek.',
          formula: '\\sqrt{a\\cdot b}=\\sqrt{a}\\cdot\\sqrt{b},\\quad \\sqrt{\\frac{a}{b}}=\\frac{\\sqrt{a}}{\\sqrt{b}},\\quad \\frac{1}{\\sqrt{a}}=\\frac{\\sqrt{a}}{a}',
        },
        {
          type: 'example',
          title: 'Przykład — usuwanie niewymierności',
          body: 'Usuń niewymierność z mianownika: $\\dfrac{6}{\\sqrt{3}}$. Mnożymy licznik i mianownik przez $\\sqrt{3}$: $\\dfrac{6\\sqrt{3}}{3} = 2\\sqrt{3}$.',
        },
        {
          type: 'example',
          title: 'Przykład — pierwiastek z mianownikiem',
          body: 'Uprość $\\sqrt{50} - \\sqrt{18}$. Wyłączamy kwadraty: $5\\sqrt{2} - 3\\sqrt{2} = 2\\sqrt{2}$. Mnożąc przez $\\sqrt{2}$ otrzymujemy $2\\sqrt{2}\\cdot\\sqrt{2} = 4$.',
        },
        {
          type: 'formula',
          title: 'Wartość bezwzględna',
          body: 'Wartość bezwzględna to odległość liczby od zera na osi liczbowej — dlatego nigdy nie jest ujemna.',
          formula: '|x|=\\begin{cases} x & \\text{gdy } x \\geq 0 \\\\ -x & \\text{gdy } x < 0 \\end{cases}',
        },
        {
          type: 'example',
          title: 'Przykład — równanie z modułem',
          body: 'Rozwiąż $|x-3| = 5$. Odległość $x$ od $3$ wynosi $5$, więc $x = 3+5 = 8$ lub $x = 3-5 = -2$. Zbiór rozwiązań: $x \\in \\{-2, 8\\}$.',
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W nierównościach typu $|x - a| \\leq b$ (dla $b \\geq 0$) odpowiedzią jest przedział $[a-b, a+b]$. Przy znaku $<$ przedział jest otwarty.',
        },
        {
          type: 'interactive_question',
          title: 'Sprawdź się',
          body: 'Oblicz $\\left(\\frac{1}{3}\\right)^{-2}$. Zapisz wynik jako liczbę całkowitą.',
        },
        {
          type: 'summary',
          title: 'Podsumowanie',
          body: 'Potrafisz dodawać i odejmować wykładniki, wyłączać czynnik przed pierwiastek, usuwać niewymierność z mianownika i pracować z modułem. To wystarcza do większości zadań zamkniętych z tego działu.',
        },
      ],
    },
    {
      slug: 'realne-matura',
      title: 'Liczby rzeczywiste — zadania maturalne',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['I.3', 'I.5', 'I.8', 'D.3'],
      objectives: [
        'Rozwiązujesz zadania egzaminacyjne z potęgami i pierwiastkami bez kalkulatora',
        'Przeprowadzasz krótki dowód nierówności metodą przekształceń równoważnych',
        'Zapisujesz wynik w formie wymaganej przez egzaminatora',
      ],
      skills: [
        { slug: 'realne-dowodzenie-nierownosci', name: 'Dowód nierówności', description: 'Dowodzi nierówności przez sprowadzenie do sumy kwadratów.', level: 'basic' },
        { slug: 'realne-oszacowanie', name: 'Szacowanie i notacja', description: 'Szacuje wartości i porównuje liczby bez kalkulatora.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Zadania maturalne z tego działu sprawdzają nie tylko rachunki, ale też sposób zapisu. Poniżej typowe schematy, które warto rozpoznawać od pierwszego czytania.',
        },
        {
          type: 'tip',
          title: 'Jak zapisywać odpowiedź',
          body: 'W zadaniach otwartych wynik podawaj w najprostszej postaci: ułamek skrócony, pierwiastek z wyłączonym czynnikiem, mianownik bez niewymierności. Brak uproszczenia może kosztować punkt.',
        },
        {
          type: 'heading',
          title: 'Schemat: dowód nierówności',
          body: 'Gdy masz wykazać, że wyrażenie jest zawsze dodatnie, doprowadź je do sumy kwadratu i liczby dodatniej.',
        },
        {
          type: 'formula',
          title: 'Kluczowe przekształcenie',
          body: 'Uzupełnianie do pełnego kwadratu pozwala natychmiast odczytać znak wyrażenia.',
          formula: 'x^{2}+4x+5=(x+2)^{2}+1>0',
        },
        {
          type: 'example',
          title: 'Przykład — pełny dowód',
          body: 'Wykaż, że dla każdej liczby rzeczywistej $x$ zachodzi $x^{2}+4x+5 > 0$.\nPrzekształcamy: $x^{2}+4x+5 = (x+2)^{2}+1$. Kwadrat jest nieujemny, więc $(x+2)^{2} \\geq 0$, a po dodaniu $1$ całość jest większa od zera. Co należało wykazać.',
        },
        {
          type: 'example',
          title: 'Przykład — potęgi bez kalkulatora',
          body: 'Oblicz $(\\sqrt{2}+\\sqrt{8})^{2}$. Najpierw upraszczamy: $\\sqrt{8} = 2\\sqrt{2}$, więc suma to $3\\sqrt{2}$. Podnosząc do kwadratu: $(3\\sqrt{2})^{2} = 9 \\cdot 2 = 18$.',
        },
        {
          type: 'warning',
          title: 'Pułapki egzaminacyjne',
          body: '• Nie zgub znaku minus przed nawiasem przy redukcji.\n• Sprawdź, czy wynik nie da się jeszcze uprościć (np. $\\sqrt{8} = 2\\sqrt{2}$).\n• W nierównościach z modułem liczba po prawej stronie nie może być ujemna — jeśli jest, nierówność jest sprzeczna lub zawsze prawdziwa.',
        },
        {
          type: 'summary',
          title: 'Podsumowanie',
          body: 'Umiesz rozwiązać typowe zadanie maturalne z tego działu i uzasadnić odpowiedź. Kolejny krok to trening na pełnym zestawie zadań — polecamy sekcję „Zadania”.',
        },
      ],
    },
    {
      slug: 'realne-dowody',
      title: 'Dowody własności liczb',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['I.9'],
      objectives: [
        'Dowodzisz nierówności metodą równoważnych przekształceń i uzupełniania do kwadratu',
        'Rozumiesz schemat dowodu nie wprost i uzasadniasz, kiedy jest potrzebny',
        'Odróżniasz dowód od sprawdzenia na przykładach i umiesz podać kontrprzykład',
      ],
      skills: [
        { slug: 'realne-dowody-liczb', name: 'Dowody własności liczb', description: 'Dowodzi nierówności i własności liczb metodą przekształceń równoważnych oraz nie wprost.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Czym różni się dowód od sprawdzenia',
          body: 'Sprawdzenie na kilku przykładach nie jest dowodem — to tylko wskazówka. Dowód musi działać dla **każdej** liczby z podanego zakresu. W tym dziale pojawia się też rozumowanie nie wprost: zamiast dowodzić tezy, dowodzimy, że jej zaprzeczenie prowadzi do sprzeczności.',
        },
        {
          type: 'formula',
          title: 'Fundament: kwadrat jest nieujemny',
          body: 'Nierówności najczęściej sprowadzasz do sumy kwadratów i liczby dodatniej. To jedno spostrzeżenie rozwiązuje większość zadań.',
          formula: 'a^{2} \\geq 0 \\quad \\text{dla każdego } a \\in \\mathbb{R}, \\qquad a^{2} + b^{2} = 0 \\iff a = b = 0',
        },
        {
          type: 'table',
          title: 'Trzy schematy dowodu',
          body: `| Metoda | Kiedy używać | Kluczowy ruch |
|---|---|---|
| równoważne przekształcenia | nierówności algebraiczne | doprowadź do oczywistej nierówności (np. $x^{2} \\geq 0$) |
| nie wprost | gdy teza jest negacją („nie istnieje”, „jest niewymierna”) | załóż przeciwieństwo i szukaj sprzeczności |
| kontrprzykład | aby **obalić** twierdzenie | podaj jeden przykład, dla którego teza nie działa |`,
        },
        {
          type: 'example',
          title: 'Przykład — nierówność przez pełny kwadrat',
          body: `Wykaż, że dla każdego $x \\in \\mathbb{R}$ zachodzi $x^{2} - 2x + 3 > 0$.

Uzupełnijmy do kwadratu: $x^{2} - 2x + 3 = (x-1)^{2} + 2$. Kwadrat jest nieujemny, więc $(x-1)^{2} + 2 \\geq 2 > 0$. To kończy dowód. (Alternatywnie: $\\Delta = 4 - 12 = -8 < 0$ i $a = 1 > 0$.)`,
        },
        {
          type: 'example',
          title: 'Przykład — dowód nie wprost',
          body: `Wykaż, że suma liczby wymiernej $w$ i liczby niewymiernej $n$ jest niewymierna.

Przypuśćmy przeciwnie, że $w + n$ jest wymierna i równa $r$. Wtedy $n = r - w$ jest różnicą dwóch liczb wymiernych, czyli liczbą wymierną — sprzeczność z założeniem, że $n$ jest niewymierna. Zatem suma musi być niewymierna.`,
        },
        {
          type: 'example',
          title: 'Przykład — kontrprzykład',
          body: 'Twierdzenie „jeśli $x^{2} > x$, to $x > 1$” jest fałszywe. Dla $x = -1$ mamy $x^{2} = 1 > -1 = x$, ale $x = -1$ nie jest większe od $1$. Jeden kontrprzykład wystarcza, aby obalić twierdzenie.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• **Przykład zamiast dowodu:** sprawdzenie $x = 1, 2, 3$ nie dowodzi własności „dla każdego $x$”.
• **Mnożenie nierówności przez wyrażenie ze zmienną** bez analizy jego znaku — to potrafi odwrócić kierunek nierówności.
• **Zaprzeczenie tezy:** negacją „$a > b$” jest „$a \\leq b$”, a nie „$a < b$”.
• Uzupełnianie do kwadratu z błędem: $x^{2} + 6x = (x+3)^{2} - 9$, a nie $+9$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniu „wykaż, że” zacznij od zdania „Przekształcam równoważnie:”. Za samą formę dowodu (jawne kroki, powołanie na nieujemność kwadratu) dostajesz punkty, nawet jeśli rachunek jest krótki. W dowodzie nie wprost wyraźnie zapisz założenie przeciwieństwa — to ono jest punktowane.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $a^{2} \\geq 0$ to najczęstszy argument w dowodach nierówności.
• Nierówność dowodzisz równoważnymi przekształceniami, kończąc na zdaniu oczywistym.
• „Nie istnieje” i „jest niewymierna” — dowód nie wprost.
• Jedna sprzeczność obala twierdzenie; jeden kontrprzykład obala zdanie „dla każdego”.`,
        },
      ],
    },
    {
      slug: 'realne-modul-nierownosci',
      title: 'Nierówności z wartością bezwzględną',
      durationMinutes: 28,
      difficulty: 4,
      requirements: ['I.10'],
      objectives: [
        'Rozwiązujesz nierówności typu $|x - a| < b$ i $|x - a| > b$',
        'Interpretujesz rozwiązanie jako odległość na osi liczbowej',
        'Rozbijasz nierówność z modułem na przypadki, gdy po prawej stronie jest zmienna',
      ],
      skills: [
        { slug: 'realne-nierownosci-modul', name: 'Nierówności z modułem', description: 'Rozwiązuje nierówności z wartością bezwzględną i zapisuje zbiór rozwiązań przedziałami.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Moduł to odległość',
          body: '$|x - a|$ to odległość liczby $x$ od punktu $a$ na osi liczbowej. Dlatego nierówność z modułem najłatwiej zrozumieć geometrycznie: $|x - a| < b$ oznacza „$x$ jest bliżej niż $b$ od $a$”, czyli cały przedział wokół $a$.',
        },
        {
          type: 'formula',
          title: 'Dwie podstawowe równoważności',
          body: 'Dla $b > 0$ poniższe reguły zamieniają nierówność z modułem na zwykłą nierówność lub ich układ.',
          formula: '|x - a| < b \\iff -b < x - a < b \\iff x \\in (a-b, a+b)\n\n|x - a| > b \\iff x - a < -b \\ \\text{lub} \\ x - a > b \\iff x < a-b \\ \\text{lub} \\ x > a+b',
        },
        {
          type: 'diagram',
          title: 'Interpretacja na osi',
          body: 'Rozwiążmy $|x - 2| \\leq 3$: liczby, których odległość od $2$ nie przekracza $3$. To przedział od $2-3 = -1$ do $2+3 = 5$.',
          figure: {
            caption: 'Warunek $|x - 2| \\leq 3$ oznacza punkty osi leżące najdalej o $3$ od liczby $2$: zbiór rozwiązań to przedział $[-1, 5]$.',
            kind: 'numberline',
            min: -4,
            max: 8,
            step: 1,
            points: [
              { value: 2, label: 'środek: 2', color: 'amber' },
              { value: -1, label: '−1', color: 'emerald' },
              { value: 5, label: '5', color: 'emerald' },
            ],
            intervals: [{ from: -1, to: 5, color: 'violet', label: '[-1, 5]' }],
          },
        },
        {
          type: 'example',
          title: 'Przykład — nierówność „mniejsza”',
          body: `Rozwiąż $|2x - 6| < 4$.

$|2x - 6| < 4 \\iff -4 < 2x - 6 < 4$. Dodajemy $6$: $2 < 2x < 10$. Dzielimy przez $2$: $1 < x < 5$, czyli $x \\in (1, 5)$.

Geometrycznie: $|2x-6| = 2|x-3|$, więc pytamy o punkty bliżej niż $2$ od $3$ — istotnie $(1, 5)$.`,
        },
        {
          type: 'example',
          title: 'Przykład — nierówność „większa”',
          body: `Rozwiąż $|x + 1| \\geq 2$.

$|x + 1| \\geq 2 \\iff x + 1 \\leq -2 \\ \\text{lub} \\ x + 1 \\geq 2$, więc $x \\leq -3$ lub $x \\geq 1$. Zbiór rozwiązań: $(-\\infty, -3] \\cup [1, +\\infty)$. To liczby odległe od $-1$ o co najmniej $2$.`,
        },
        {
          type: 'table',
          title: 'Kiedy używasz którego schematu',
          body: `| Nierówność | Schemat | Zbiór rozwiązań |
|---|---|---|
| $|x - a| < b$, $b > 0$ | podwójna nierówność | przedział $(a-b, a+b)$ |
| $|x - a| \\leq b$, $b > 0$ | podwójna, domknięta | przedział $[a-b, a+b]$ |
| $|x - a| > b$, $b > 0$ | alternatywa („lub”) | suma dwóch półprostych |
| $|x - a| < b$, $b < 0$ | brak rozwiązań | zbiór pusty |
| $|x - a| > b$, $b < 0$ | zawsze prawdziwa | $\\mathbb{R}$ |`,
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• **Nierówność ujemna:** $|x - a| < -3$ nie ma rozwiązań — moduł nigdy nie jest ujemny. Odwrotnie $|x - a| > -3$ jest prawdziwe dla każdego $x$.
• **Kierunek:** przy $<$ rozwiązanie leży **między** punktami (część wspólna), a przy $>$ — **na zewnątrz** (suma).
• **Dzielenie przez liczbę ujemną** w podwójnej nierówności — odwraca oba znaki.
• Po prawej stronie ze zmienną (np. $|x| < x$) nie wolno stosować wzoru z $b$ — trzeba rozbić na przypadki $x \\geq 0$ i $x < 0$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Prawie każde zadanie z modułem da się rozwiązać geometrycznie, wyznaczając środek $a$ i promień $b$. Zapisuj odpowiedź przedziałami, a w nierówności nieostrej ($\\leq$, $\\geq$) pamiętaj o domkniętych nawiasach — to najczęściej tracony punkt.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $|x - a| < b \\iff x \\in (a-b, a+b)$ (dla $b > 0$).
• $|x - a| > b \\iff x < a-b$ lub $x > a+b$.
• Moduł to odległość od $a$ — pomaga sprawdzić wynik.
• Gdy po prawej stronie stoi zmienna, rozbijaj nierówność na przypadki.`,
        },
      ],
    },
  ],
}
