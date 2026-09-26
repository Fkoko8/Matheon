import type { ContentTopic } from '@/content/types'

export const zastosowania: ContentTopic = {
  slug: 'zastosowania',
  title: 'Zastosowania matematyki',
  level: 'basic',
  description: 'Zadania tekstowe, obliczenia finansowe i zadania łączące kilka działów — od treści zadania do poprawnej odpowiedzi.',
  lessons: [
    {
      slug: 'zastosowania-modelowanie',
      title: 'Od treści zadania do modelu',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['Z.1', 'Z.2'],
      objectives: [
        'Zamieniasz opis słowny na równanie albo funkcję',
        'Wyznaczasz wielkość szukaną i sprawdzasz wynik z warunkami zadania',
        'Odrzucasz odpowiedzi sprzeczne z kontekstem (np. ujemną długość)',
      ],
      skills: [
        { slug: 'zastosowania-model', name: 'Modelowanie', description: 'Zapisuje sytuację z zadania jako równanie lub funkcję jednej zmiennej.', level: 'basic' },
        { slug: 'zastosowania-interpretacja', name: 'Interpretacja wyniku', description: 'Sprawdza wynik w kontekście zadania i zapisuje odpowiedź z jednostką.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Zadania tekstowe wyglądają różnie, ale rozwiązuje się je zawsze według tego samego schematu. Najważniejszy jest pierwszy krok: zamiast szukać gotowego wzoru, nazwij wielkości i zapisz zależności między nimi.',
        },
        {
          type: 'heading',
          title: 'Cztery kroki, które działają zawsze',
          body: 'Ten schemat stosujesz do każdego zadania z kontekstem: od zadania o cenach po zadanie o prędkości.',
        },
        {
          type: 'paragraph',
          title: 'Schemat',
          body: '1. **Nazwij** — ustal, czego szukasz, i oznacz to literą, np. $x$.\n2. **Zapisz zależności** — każdy warunek z treści zamień na równanie lub nierówność.\n3. **Policz** — rozwiąż układ równań albo wyznacz wartość funkcji.\n4. **Sprawdź** — wróć do treści zadania i oceń, czy wynik ma sens (znak, jednostka, wielkość).',
        },
        {
          type: 'formula',
          title: 'Model liniowy',
          body: 'Gdy wielkość rośnie o stałą wartość w każdym kroku, opisuje ją funkcja liniowa. Współczynnik $a$ to zmiana na jednostkę, a $b$ — wartość początkowa.',
          formula: 'y = ax + b',
        },
        {
          type: 'example',
          title: 'Przykład — koszt usługi',
          figure: {
            kind: 'plot',
            xMin: 0,
            xMax: 10,
            yMin: 0,
            yMax: 32,
            xLabel: 'liczba godzin',
            yLabel: 'koszt [zł]',
            caption: 'Koszt usługi: opłata stała 5 zł plus 2 zł za każdą godzinę pracy. Dla 3 godzin koszt wynosi 11 zł.',
            curves: [{ expr: '2x+5', label: 'y = 2x + 5', color: 'violet' }],
            points: [{ x: 3, y: 11, label: '(3, 11)', color: 'amber' }],
          },
          body: 'Za wypożyczenie sprzętu płacisz $5$ zł opłaty stałej i $2$ zł za każdą godzinę. Koszt po $x$ godzinach opisuje $y = 2x + 5$. Pytanie „ile zapłacisz za $3$ godziny?” to podstawienie: $y = 2 \\cdot 3 + 5 = 11$ zł.',
        },
        {
          type: 'example',
          title: 'Przykład — gdy szukaną jest liczba kroków',
          body: 'Ile godzin można pracować, mając $25$ zł? Tym razem szukamy $x$: rozwiązujemy $2x + 5 = 25$, czyli $2x = 20$, więc $x = 10$ godzin. Dziesięć godzin to pełna liczba godzin, więc odpowiedź nie wymaga zaokrąglenia — ale przy $26$ zł trzeba pamiętać, że nie da się pracować „pół godziny więcej” bez sprawdzenia warunków wypożyczenia.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: '• Oznaczenie dwóch różnych wielkości tą samą literą $x$ — wtedy równania przestają mieć sens.\n• Pominięcie warunku, np. że długość boku jest dodatnia.\n• Zaokrąglenie wyniku i zapomnienie, że liczba osób czy przedmiotów musi być całkowita.\n• Odpowiedź bez jednostki albo z niepoprawną jednostką (minuty zamiast godzin).',
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zanim policzysz, zapisz w brudnopisie, co jest daną, a co szukaną. Jeśli w zadaniu pojawia się „o $20\\%$ mniej” albo „dwa razy więcej”, natychmiast przelicz to na działanie na liczbach — to najczęstsze miejsce utraty punktów.',
        },
        {
          type: 'table',
          title: 'Jak zapisywać warunki słowne',
          body: '| Sformułowanie w treści | Zapis algebraiczny |\n| --- | --- |\n| liczba o $3$ większa od $x$ | $x + 3$ |\n| o $20\\%$ mniej niż $x$ | $0{,}8x$ |\n| suma dwóch liczb wynosi $10$ | $x + y = 10$ |\n| pole prostokąta o bokach $x$ i $x+2$ | $x(x+2)$ |',
        },
        {
          type: 'interactive_question',
          title: 'Sprawdź się',
          body: 'Bilet kosztuje $12$ zł, a bilet ulgowy stanowi $50\\%$ jego ceny. Ile zapłacisz za $3$ bilety normalne i $2$ ulgowe? Zapisz obliczenie i odpowiedź z jednostką.',
        },
        {
          type: 'summary',
          title: 'Bierz to na maturę',
          body: 'Nazwij wielkości → zapisz warunki jako równania → rozwiąż → sprawdź wynik z kontekstem. W zadaniu tekstowym punktują nie tylko obliczenia, ale też poprawny model matematyczny.',
        },
      ],
    },
    {
      slug: 'zastosowania-finansowe',
      title: 'Procent składany w praktyce',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['Z.1'],
      objectives: [
        'Stosujesz wzór na procent składany do lokat i kredytów',
        'Rozróżniasz procent i punkt procentowy',
        'Porównujesz oferty na podstawie kapitału końcowego',
      ],
      skills: [
        { slug: 'zastosowania-finansowe', name: 'Obliczenia finansowe', description: 'Oblicza kapitał końcowy i porównuje oferty bankowe.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Oprocentowanie, inflacja i raty to najczęstszy kontekst w zadaniach praktycznych. Kluczowa różnica jest jedna: procent prosty liczymy od tej samej podstawy, a składany — od kapitału powiększonego o odsetki.',
        },
        {
          type: 'formula',
          title: 'Wzór na procent składany',
          body: 'Kapitał po $n$ okresach, gdy odsetki dopisuje się raz w okresie i nie wypłaca się ich.',
          formula: 'K_n = K_0 \\cdot \\left(1 + \\frac{p}{100}\\right)^n',
        },
        {
          type: 'table',
          title: 'Kapitał 1 000 zł przy 5% w skali roku',
          body: '| Okres | Procent prosty | Procent składany |\n| --- | --- | --- |\n| 1 rok | $1\\,050$ zł | $1\\,050$ zł |\n| 2 lata | $1\\,100$ zł | $1\\,102{,}50$ zł |\n| 3 lata | $1\\,150$ zł | $1\\,157{,}63$ zł |',
        },
        {
          type: 'example',
          title: 'Przykład — lokata dwuletnia',
          body: 'Kwota $2\\,000$ zł na $4\\%$ rocznie, kapitalizacja raz w roku. $K_2 = 2000 \\cdot 1{,}04^2 = 2000 \\cdot 1{,}0816 = 2\\,163{,}20$ zł. Odsetki wynoszą $163{,}20$ zł — więcej niż w procencie prostym ($160$ zł), bo drugi rok naliczane są od większej kwoty.',
        },
        {
          type: 'example',
          title: 'Przykład — o ile wzrosła cena',
          body: 'Cena wzrosła z $80$ zł do $92$ zł. Wzrost to $12$ zł, a $\\frac{12}{80} = 0{,}15$, czyli $15\\%$. Jeżeli gazeta napisałaby, że „oprocentowanie wzrosło $z$ $4\\%$ do $6\\%$, czyli o $2$ punkty procentowe”, to jest wzrost o $50\\%$ w ujęciu względnym.',
        },
        {
          type: 'warning',
          title: 'Procent to nie punkt procentowy',
          body: 'Zmiana o $2$ punkty procentowe $z$ $4\\%$ do $6\\%$ to wzrost o $50\\%$ wartości, ale tylko o $2$ punkty procentowe. W zadaniu przeczytaj uważnie, o co pytają — odpowiedź $2$ i odpowiedź $50\\%$ opisują to samo zjawisko inaczej.',
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Gdy kapitalizacja jest inna niż roczna, do wzoru wstaw liczbę okresów $n$ oraz stawkę za jeden okres. Przy kapitelizacji kwartalnej $z$ $8\\%$ rocznie stawka okresowa to $2\\%$, a $n$ liczy kwartały.',
        },
        {
          type: 'interactive_question',
          title: 'Sprawdź się',
          body: 'Kwota $1\\,000$ zł leży na lokacie $z$ $10\\%$ rocznie przez dwa lata. O ile więcej odsetek daje procent składany w porównaniu z prostym? Zapisz oba wyniki.',
        },
        {
          type: 'summary',
          title: 'Bierz to na maturę',
          body: 'Procent składany: $K_n = K_0 (1 + p/100)^n$ — pamiętaj o potędze i o tym, że odsetki naliczane są od powiększonego kapitału. Rozróżniaj procent od punktu procentowego.',
        },
      ],
    },
    {
      slug: 'zastosowania-synteza',
      title: 'Zadania łączące kilka działów',
      durationMinutes: 35,
      difficulty: 4,
      requirements: ['Z.1', 'Z.2'],
      objectives: [
        'Rozpoznajesz, które działy matematyki są potrzebne w jednym zadaniu',
        'Łączysz geometrię z funkcją kwadratową w zadaniu optymalizacyjnym',
        'Redagujesz odpowiedź zgodnie z poleceniem i liczbą punktów',
      ],
      skills: [
        { slug: 'zastosowania-synteza', name: 'Rozumowanie złożone', description: 'Łączy kilka działów matematyki w jednym zadaniu i uzasadnia wynik.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Zadania złożone nie wymagają nowej wiedzy — wymagają rozłożenia problemu na kroki i świadomego sięgania po wzory z różnych działów. Nauczysz się rozpoznawać, które narzędzie pasuje do którego etapu.',
        },
        {
          type: 'heading',
          title: 'Jak rozłożyć zadanie złożone',
          body: 'Zawsze szukaj w zadaniu trzech warstw: opisu geometrycznego lub praktycznego, zależności algebraicznej i celu (maksimum, minimum, konkretna wartość).',
        },
        {
          type: 'example',
          title: 'Przykład — geometria i funkcja kwadratowa',
          body: 'Masz $20$ m siatki i chcesz ogrodzić prostokąt o największym polu. Boki to $x$ i $20 - x$, więc pole $P(x) = x(20 - x) = -x^2 + 20x$. Wierzchołek paraboli wypada w $x = 10$, a $P(10) = 100$ m². Największe pole daje kwadrat o boku $10$ m.\n\nUwaga: tu nie trzeba pochodnej — wystarczy wzór na wierzchołek $p = \\frac{-b}{2a}$.',
        },
        {
          type: 'example',
          title: 'Przykład — ciągi i procenty',
          body: 'Liczba ludności w mieście rośnie o $2\\%$ rocznie i wynosi obecnie $50\\,000$. Po $n$ latach jest to $50\\,000 \\cdot 1{,}02^n$ osób — to ciąg geometryczny o ilorazie $q = 1{,}02$. Po $10$ latach otrzymujemy $50\\,000 \\cdot 1{,}02^{10} \\approx 60\\,950$ mieszkańców.',
        },
        {
          type: 'example',
          title: 'Przykład — prawdopodobieństwo i kombinatoryka',
          body: 'Z klasy $15$ uczniów wybieramy dwie osoby. Liczba możliwych par to $\\binom{15}{2} = 105$. Prawdopodobieństwo wyboru konkretnej pary to $\\frac{1}{105}$, a wyboru dwóch osób z jednej grupy liczącej $5$ uczniów to $\\frac{\\binom{5}{2}}{105} = \\frac{10}{105}$. Zadanie łączy wzór kombinatoryczny z definicją prawdopodobieństwa klasycznego.',
        },
        {
          type: 'warning',
          title: 'Utrata punktów na łączeniu działów',
          body: 'Błąd w jednym kroku przenosi się na cały wynik, nawet jeśli kolejne rachunki są poprawne. Dlatego po każdym etapie zapisuj, co wyznaczyłeś, i sprawdzaj jednostkę — najczęściej gubi się punkty za brak wniosku końcowego, a nie za rachunki.',
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W zadaniach wieloetapowych przyznawane są punkty za kolejne kroki. Zapisuj każde przejście osobną linijką — nawet jeśli nie dojdziesz do końca, za poprawny model i częściowe obliczenia dostaniesz część punktów.',
        },
        {
          type: 'interactive_question',
          title: 'Sprawdź się',
          body: 'Prostokąt ma obwód $40$ cm. Zapisz jego pole jako funkcję długości jednego boku i wskaż wymiary prostokąta o największym polu.',
        },
        {
          type: 'summary',
          title: 'Bierz to na maturę',
          body: 'Zadania złożone rozwiązujesz etapami: model praktyczny → zależność algebraiczna → rozwiązanie → interpretacja. Sprawdź, czy nie da się użyć prostszego narzędzia (np. wierzchołka paraboli zamiast pochodnej).',
        },
      ],
    },
  ],
}
