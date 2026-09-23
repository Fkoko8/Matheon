import type { CkeRequirement } from '@/content/types'

/**
 * Mapa wymagań egzaminacyjnych (Formuła 2023) pogrupowana po działach podstawy programowej.
 *
 * Uwaga: to mapa robocza MATHEON. Kody (np. 'I.3') są wewnętrznym identyfikatorem działu
 * i kolejności wymagania — przed publikacją treści należy je zweryfikować z dokumentem
 * „Wymagania egzaminacyjne” CKE. Pole `status` pokazuje realny postęp pokrycia materiału:
 * planned → mapped (przypisane do umiejętności) → lesson_ready → assessed → published.
 */
export const ckeRequirements: CkeRequirement[] = [
  // I. Liczby rzeczywiste
  { code: 'I.1', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Zbiory liczbowe', description: 'Rozróżnia liczby naturalne, całkowite, wymierne i niewymierne oraz podaje przykłady każdej z tych liczb.', skillSlug: 'realne-zbiory-liczbowe' },
  { code: 'I.2', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Postacie liczb wymiernych', description: 'Przedstawia liczbę wymierną w postaci ułamka zwykłego i dziesiętnego, rozpoznaje rozwinięcie dziesiętne okresowe.', skillSlug: 'realne-liczby-wymierne' },
  { code: 'I.3', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Potęgi', description: 'Oblicza potęgi o wykładniku całkowitym i wymiernym oraz stosuje prawa działań na potęgach.', skillSlug: 'realne-potegi' },
  { code: 'I.4', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Pierwiastki', description: 'Stosuje prawa działań na pierwiastkach i usuwa niewymierność z mianownika.', skillSlug: 'realne-pierwiastki' },
  { code: 'I.5', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Wartość bezwzględna', description: 'Interpretuje wartość bezwzględną jako odległość na osi liczbowej; rozwiązuje proste równania i nierówności z wartością bezwzględną.', skillSlug: 'realne-wartosc-bezwzgledna' },
  { code: 'I.6', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Przedziały', description: 'Zaznacza przedziały na osi liczbowej i wykonuje działania na przedziałach (suma, część wspólna, różnica).', skillSlug: 'realne-przedzialy' },
  { code: 'I.7', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Procenty', description: 'Stosuje pojęcie procentu i punktu procentowego, wykonuje obliczenia procentowe oraz stosuje procent składany.', skillSlug: 'realne-procenty' },
  { code: 'I.8', level: 'basic', topicSlug: 'realne', status: 'lesson_ready', title: 'Szacowanie i notacja', description: 'Szacuje wartości, zaokrągla wyniki i posługuje się notacją wykładniczą.', skillSlug: 'realne-oszacowanie' },
  { code: 'I.9', level: 'extended', topicSlug: 'realne', status: 'planned', title: 'Dowody własności liczb', description: 'Dowodzi nierówności i własności liczb rzeczywistych (podstawy dowodu nie wprost).' },
  { code: 'I.10', level: 'extended', topicSlug: 'realne', status: 'planned', title: 'Nierówności z wartością bezwzględną', description: 'Rozwiązuje nierówności z wartością bezwzględną i interpretuje wynik na osi.' },

  // II. Wyrażenia algebraiczne
  { code: 'II.1', level: 'basic', topicSlug: 'algebra', status: 'lesson_ready', title: 'Działania na wyrażeniach', description: 'Wykonuje działania na wyrażeniach algebraicznych i redukuje wyrazy podobne.', skillSlug: 'algebra-redukcja-wyrazen' },
  { code: 'II.2', level: 'basic', topicSlug: 'algebra', status: 'lesson_ready', title: 'Wzory skróconego mnożenia', description: 'Stosuje wzory na kwadrat sumy i różnicy oraz różnicę kwadratów.', skillSlug: 'algebra-wzory-skroconego-mnozenia' },
  { code: 'II.3', level: 'basic', topicSlug: 'algebra', status: 'lesson_ready', title: 'Procenty w praktyce', description: 'Stosuje przekształcenia wyrażeń i obliczenia procentowe w zadaniach tekstowych.', skillSlug: 'algebra-procenty-w-praktyce' },
  { code: 'II.4', level: 'basic', topicSlug: 'wielomiany', status: 'mapped', title: 'Rozkład na czynniki', description: 'Rozkłada wielomiany na czynniki, stosuje twierdzenie Bézouta.', skillSlug: 'algebra-rozkladanie-na-czynniki' },
  { code: 'II.5', level: 'extended', topicSlug: 'wielomiany', status: 'planned', title: 'Dzielenie wielomianów', description: 'Dzieli wielomiany i stosuje twierdzenie o reszcie.' },
  { code: 'II.6', level: 'extended', topicSlug: 'algebra', status: 'lesson_ready', title: 'Wzory dla sześcianów', description: 'Stosuje wzory skróconego mnożenia dla trzecich potęg.', skillSlug: 'algebra-wzory-skroconego-mnozenia' },
  { code: 'II.7', level: 'extended', topicSlug: 'dowody', status: 'planned', title: 'Tożsamości algebraiczne', description: 'Dowodzi tożsamości i nierówności algebraicznych.' },

  // III. Równania i nierówności
  { code: 'III.1', level: 'basic', topicSlug: 'rownania', status: 'lesson_ready', title: 'Równania liniowe', description: 'Rozwiązuje równania i nierówności liniowe i zaznacza zbiór rozwiązań na osi.', skillSlug: 'rownania-liniowe' },
  { code: 'III.2', level: 'basic', topicSlug: 'rownania', status: 'lesson_ready', title: 'Układy równań', description: 'Rozwiązuje układy równań liniowych metodą podstawiania i przeciwnych współczynników.', skillSlug: 'rownania-uklady' },
  { code: 'III.3', level: 'basic', topicSlug: 'kwadratowa', status: 'planned', title: 'Równania kwadratowe', description: 'Rozwiązuje równania i nierówności kwadratowe, wykorzystuje postać iloczynową i deltę.' },
  { code: 'III.4', level: 'basic', topicSlug: 'rownania', status: 'lesson_ready', title: 'Równania wymierne i z modułem', description: 'Rozwiązuje proste równania wymierne oraz równania z wartością bezwzględną.', skillSlug: 'rownania-wymierne' },
  { code: 'III.5', level: 'extended', topicSlug: 'parametry', status: 'planned', title: 'Parametr w równaniach', description: 'Rozwiązuje równania z parametrem i bada liczbę rozwiązań.' },
  { code: 'III.6', level: 'extended', topicSlug: 'rownania', status: 'lesson_ready', title: 'Nierówności wielomianowe', description: 'Rozwiązuje nierówności wielomianowe i wymierne z wykorzystaniem siatki znaków.', skillSlug: 'rownania-nierownosci-wielomianowe' },
  { code: 'III.7', level: 'extended', topicSlug: 'kwadratowa', status: 'planned', title: 'Wzory Viète’a', description: 'Stosuje związki między pierwiastkami a współczynnikami trójmianu kwadratowego.' },

  // IV. Funkcje
  { code: 'IV.1', level: 'basic', topicSlug: 'funkcje', status: 'planned', title: 'Własności z wykresu', description: 'Odczytuje z wykresu dziedzinę, zbiór wartości, miejsca zerowe i monotoniczność.' },
  { code: 'IV.2', level: 'basic', topicSlug: 'funkcje', status: 'planned', title: 'Dziedzina i miejsca zerowe', description: 'Wyznacza dziedzinę i miejsca zerowe funkcji zadanej wzorem.' },
  { code: 'IV.3', level: 'basic', topicSlug: 'funkcje', status: 'planned', title: 'Funkcja liniowa', description: 'Interpretuje współczynniki funkcji liniowej i wykorzystuje ją w zadaniach.' },
  { code: 'IV.4', level: 'basic', topicSlug: 'kwadratowa', status: 'planned', title: 'Funkcja kwadratowa', description: 'Posługuje się wszystkimi postaciami funkcji kwadratowej, wyznacza wierzchołek i miejsca zerowe.' },
  { code: 'IV.5', level: 'basic', topicSlug: 'zastosowania', status: 'planned', title: 'Zastosowania funkcji kwadratowej', description: 'Stosuje funkcję kwadratową do rozwiązywania zadań praktycznych i optymalizacyjnych.' },
  { code: 'IV.6', level: 'basic', topicSlug: 'funkcje', status: 'planned', title: 'Logarytmy i funkcja wykładnicza', description: 'Posługuje się pojęciem logarytmu i jego własnościami oraz funkcją wykładniczą.' },
  { code: 'IV.7', level: 'extended', topicSlug: 'wymierne', status: 'planned', title: 'Funkcja wymierna', description: 'Bada funkcję wymierną, wyznacza asymptoty i miejsca zerowe.' },
  { code: 'IV.8', level: 'extended', topicSlug: 'funkcje', status: 'planned', title: 'Przekształcenia wykresów', description: 'Stosuje przesunięcia, symetrie i powinowactwo do szkicowania wykresów.' },
  { code: 'IV.9', level: 'extended', topicSlug: 'funkcje', status: 'planned', title: 'Funkcja odwrotna', description: 'Wyznacza funkcję odwrotną i składa funkcje.' },

  // V. Ciągi
  { code: 'V.1', level: 'basic', topicSlug: 'ciagi', status: 'planned', title: 'Pojęcie ciągu', description: 'Wyznacza wyrazy ciągu i wzór ogólny na podstawie opisu.' },
  { code: 'V.2', level: 'basic', topicSlug: 'ciagi', status: 'planned', title: 'Ciąg arytmetyczny', description: 'Stosuje wzór na n-ty wyraz i sumę n początkowych wyrazów ciągu arytmetycznego.' },
  { code: 'V.3', level: 'basic', topicSlug: 'ciagi', status: 'planned', title: 'Ciąg geometryczny', description: 'Stosuje wzór na n-ty wyraz i sumę ciągu geometrycznego.' },
  { code: 'V.4', level: 'basic', topicSlug: 'zastosowania', status: 'planned', title: 'Procent składany', description: 'Wykorzystuje ciągi geometryczne do obliczeń lokat i kredytów.' },
  { code: 'V.5', level: 'extended', topicSlug: 'ciagi', status: 'planned', title: 'Granica ciągu', description: 'Bada monotoniczność ciągu i wyznacza jego granicę.' },
  { code: 'V.6', level: 'extended', topicSlug: 'ciagi', status: 'planned', title: 'Szereg geometryczny', description: 'Stosuje warunek zbieżności szeregu geometrycznego.' },

  // VI. Trygonometria
  { code: 'VI.1', level: 'basic', topicSlug: 'trygonometria', status: 'planned', title: 'Funkcje w trójkącie', description: 'Stosuje definicje sinusa, cosinusa i tangensa w trójkącie prostokątnym.' },
  { code: 'VI.2', level: 'basic', topicSlug: 'trygonometria', status: 'planned', title: 'Kąty 30°, 45°, 60°', description: 'Posługuje się wartościami funkcji trygonometrycznych dla kątów 30°, 45°, 60°.' },
  { code: 'VI.3', level: 'basic', topicSlug: 'trygonometria', status: 'planned', title: 'Miara łukowa i jedynka', description: 'Posługuje się miarą łukową kąta i stosuje jedynkę trygonometryczną.' },
  { code: 'VI.4', level: 'extended', topicSlug: 'trygonometria', status: 'planned', title: 'Tożsamości trygonometryczne', description: 'Stosuje wzory na sumy, różnice i kąty podwojone.' },
  { code: 'VI.5', level: 'extended', topicSlug: 'trygonometria', status: 'planned', title: 'Równania trygonometryczne', description: 'Rozwiązuje równania i nierówności trygonometryczne.' },

  // VII. Planimetria
  { code: 'VII.1', level: 'basic', topicSlug: 'planimetria', status: 'planned', title: 'Trójkąty', description: 'Stosuje własności trójkątów, przystawanie i podobieństwo.' },
  { code: 'VII.2', level: 'basic', topicSlug: 'planimetria', status: 'planned', title: 'Twierdzenia o trójkącie', description: 'Stosuje twierdzenie Pitagorasa, sinusów i cosinusów.' },
  { code: 'VII.3', level: 'basic', topicSlug: 'planimetria', status: 'planned', title: 'Pola i obwody', description: 'Oblicza pola i obwody wielokątów, koła i wycinka.' },
  { code: 'VII.4', level: 'basic', topicSlug: 'planimetria', status: 'planned', title: 'Okrąg i kąty', description: 'Stosuje własności kątów wpisanych i środkowych.' },
  { code: 'VII.5', level: 'extended', topicSlug: 'planimetria', status: 'planned', title: 'Okrąg opisany i wpisany', description: 'Wykorzystuje własności okręgu opisanego i wpisanego oraz stycznych.' },
  { code: 'VII.6', level: 'extended', topicSlug: 'dowody', status: 'planned', title: 'Dowody geometryczne', description: 'Przeprowadza dowody twierdzeń geometrycznych.' },

  // VIII. Geometria analityczna
  { code: 'VIII.1', level: 'basic', topicSlug: 'geometria', status: 'planned', title: 'Równanie prostej', description: 'Wyznacza równanie prostej przechodzącej przez dwa punkty.' },
  { code: 'VIII.2', level: 'basic', topicSlug: 'geometria', status: 'planned', title: 'Równoległość i prostopadłość', description: 'Bada wzajemne położenie prostych na płaszczyźnie.' },
  { code: 'VIII.3', level: 'basic', topicSlug: 'geometria', status: 'planned', title: 'Odległość i środek', description: 'Oblicza odległość punktów, wyznacza środek odcinka.' },
  { code: 'VIII.4', level: 'basic', topicSlug: 'geometria', status: 'planned', title: 'Równanie okręgu', description: 'Zapisuje i interpretuje równanie okręgu.' },
  { code: 'VIII.5', level: 'extended', topicSlug: 'geometria', status: 'planned', title: 'Odległość punktu od prostej', description: 'Oblicza odległość punktu od prostej i wyznacza styczną do okręgu.' },
  { code: 'VIII.6', level: 'extended', topicSlug: 'geometria', status: 'planned', title: 'Okrąg i prosta', description: 'Rozwiązuje zadania o przecięciu prostej z okręgiem.' },

  // IX. Stereometria
  { code: 'IX.1', level: 'basic', topicSlug: 'stereometria', status: 'planned', title: 'Bryły i objętości', description: 'Oblicza objętość i pole powierzchni graniastosłupów, ostrosłupów i brył obrotowych.' },
  { code: 'IX.2', level: 'basic', topicSlug: 'stereometria', status: 'planned', title: 'Kąty i odległości', description: 'Wyznacza kąty i odległości w bryłach z użyciem twierdzenia Pitagorasa.' },
  { code: 'IX.3', level: 'extended', topicSlug: 'stereometria', status: 'planned', title: 'Przekroje brył', description: 'Wyznacza przekroje brył oraz kąty między ścianami i krawędziami.' },

  // X. Kombinatoryka
  { code: 'X.1', level: 'basic', topicSlug: 'kombinatoryka', status: 'planned', title: 'Reguła mnożenia', description: 'Stosuje regułę mnożenia i dodawania przy zliczaniu możliwości.' },
  { code: 'X.2', level: 'basic', topicSlug: 'kombinatoryka', status: 'planned', title: 'Permutacje i kombinacje', description: 'Oblicza liczbę permutacji, wariacji i kombinacji.' },
  { code: 'X.3', level: 'extended', topicSlug: 'kombinatoryka', status: 'planned', title: 'Zadania z ograniczeniami', description: 'Rozwiązuje zadania kombinatoryczne z dodatkowymi warunkami.' },

  // XI. Rachunek prawdopodobieństwa i statystyka
  { code: 'XI.1', level: 'basic', topicSlug: 'prawdopodobienstwo', status: 'planned', title: 'Prawdopodobieństwo klasyczne', description: 'Oblicza prawdopodobieństwo, posługuje się drzewkami i własnościami zbiorów.' },
  { code: 'XI.2', level: 'basic', topicSlug: 'statystyka', status: 'planned', title: 'Statystyka opisowa', description: 'Oblicza i interpretuje średnią, medianę, dominantę i odchylenie standardowe.' },
  { code: 'XI.3', level: 'extended', topicSlug: 'prawdopodobienstwo', status: 'planned', title: 'Prawdopodobieństwo warunkowe', description: 'Stosuje prawdopodobieństwo warunkowe i całkowite.' },
  { code: 'XI.4', level: 'extended', topicSlug: 'prawdopodobienstwo', status: 'planned', title: 'Schemat Bernoulliego', description: 'Stosuje schemat Bernoulliego i rozkład dwumianowy.' },
  { code: 'XI.5', level: 'extended', topicSlug: 'prawdopodobienstwo', status: 'planned', title: 'Prawdopodobieństwo w zadaniach', description: 'Wykorzystuje prawdopodobieństwo w zadaniach z geometrią i kombinatoryką.' },

  // XII. Granica i pochodna funkcji (zakres rozszerzony)
  { code: 'XII.1', level: 'extended', topicSlug: 'granice', status: 'planned', title: 'Granica i ciągłość', description: 'Oblicza granice funkcji i bada ciągłość.' },
  { code: 'XII.2', level: 'extended', topicSlug: 'pochodne', status: 'planned', title: 'Pochodna funkcji', description: 'Oblicza pochodną z definicji i z reguł różniczkowania.' },
  { code: 'XII.3', level: 'extended', topicSlug: 'pochodne', status: 'planned', title: 'Monotoniczność i ekstrema', description: 'Bada monotoniczność i wyznacza ekstrema funkcji.' },
  { code: 'XII.4', level: 'extended', topicSlug: 'optymalizacja', status: 'planned', title: 'Zadania optymalizacyjne', description: 'Rozwiązuje zadania optymalizacyjne z użyciem pochodnej.' },
  { code: 'XII.5', level: 'extended', topicSlug: 'parametry', status: 'planned', title: 'Pochodna z parametrem', description: 'Wykorzystuje pochodną w zadaniach z parametrem.' },
  { code: 'XII.6', level: 'extended', topicSlug: 'pochodne', status: 'planned', title: 'Styczna do wykresu', description: 'Interpretuje pochodną geometrycznie i wyznacza styczną.' },

  // Dowodzenie i matematyka stosowana
  { code: 'D.1', level: 'extended', topicSlug: 'dowody', status: 'planned', title: 'Indukcja matematyczna', description: 'Stosuje zasadę indukcji matematycznej do dowodzenia twierdzeń.' },
  { code: 'D.2', level: 'extended', topicSlug: 'dowody', status: 'planned', title: 'Dowody nierówności', description: 'Dowodzi nierówności metodą równoważnych przekształceń.' },
  { code: 'D.3', level: 'basic', topicSlug: 'dowody', status: 'planned', title: 'Uzasadnianie w zadaniach', description: 'Prowadzi proste rozumowanie i uzasadnia odpowiedź w zadaniach maturalnych.' },
  { code: 'Z.1', level: 'basic', topicSlug: 'zastosowania', status: 'planned', title: 'Matematyka w kontekście', description: 'Rozwiązuje zadania osadzone w kontekście praktycznym i interpretuje wynik.' },
  { code: 'Z.2', level: 'basic', topicSlug: 'zastosowania', status: 'planned', title: 'Rozumowanie złożone', description: 'Łączy kilka dziedzin matematyki w jednym zadaniu.' },
]
