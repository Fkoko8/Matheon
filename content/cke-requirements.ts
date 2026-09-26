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
  { code: 'I.9', level: 'extended', topicSlug: 'realne', status: 'lesson_ready', title: 'Dowody własności liczb', description: 'Dowodzi nierówności i własności liczb rzeczywistych (podstawy dowodu nie wprost).', skillSlug: 'realne-dowody-liczb' },
  { code: 'I.10', level: 'extended', topicSlug: 'realne', status: 'lesson_ready', title: 'Nierówności z wartością bezwzględną', description: 'Rozwiązuje nierówności z wartością bezwzględną i interpretuje wynik na osi.', skillSlug: 'realne-nierownosci-modul' },

  // II. Wyrażenia algebraiczne
  { code: 'II.1', level: 'basic', topicSlug: 'algebra', status: 'lesson_ready', title: 'Działania na wyrażeniach', description: 'Wykonuje działania na wyrażeniach algebraicznych i redukuje wyrazy podobne.', skillSlug: 'algebra-redukcja-wyrazen' },
  { code: 'II.2', level: 'basic', topicSlug: 'algebra', status: 'lesson_ready', title: 'Wzory skróconego mnożenia', description: 'Stosuje wzory na kwadrat sumy i różnicy oraz różnicę kwadratów.', skillSlug: 'algebra-wzory-skroconego-mnozenia' },
  { code: 'II.3', level: 'basic', topicSlug: 'algebra', status: 'lesson_ready', title: 'Procenty w praktyce', description: 'Stosuje przekształcenia wyrażeń i obliczenia procentowe w zadaniach tekstowych.', skillSlug: 'algebra-procenty-w-praktyce' },
  { code: 'II.4', level: 'basic', topicSlug: 'wielomiany', status: 'lesson_ready', title: 'Rozkład na czynniki', description: 'Rozkłada wielomiany na czynniki, stosuje twierdzenie Bézouta.', skillSlug: 'wielomiany-rozkladanie' },
  { code: 'II.5', level: 'extended', topicSlug: 'wielomiany', status: 'lesson_ready', title: 'Dzielenie wielomianów', description: 'Dzieli wielomiany i stosuje twierdzenie o reszcie.', skillSlug: 'wielomiany-dzielenie' },
  { code: 'II.6', level: 'extended', topicSlug: 'algebra', status: 'lesson_ready', title: 'Wzory dla sześcianów', description: 'Stosuje wzory skróconego mnożenia dla trzecich potęg.', skillSlug: 'algebra-wzory-skroconego-mnozenia' },
  { code: 'II.7', level: 'extended', topicSlug: 'dowody', status: 'lesson_ready', title: 'Tożsamości algebraiczne', description: 'Dowodzi tożsamości i nierówności algebraicznych.', skillSlug: 'dowody-algebraiczne' },

  // III. Równania i nierówności
  { code: 'III.1', level: 'basic', topicSlug: 'rownania', status: 'lesson_ready', title: 'Równania liniowe', description: 'Rozwiązuje równania i nierówności liniowe i zaznacza zbiór rozwiązań na osi.', skillSlug: 'rownania-liniowe' },
  { code: 'III.2', level: 'basic', topicSlug: 'rownania', status: 'lesson_ready', title: 'Układy równań', description: 'Rozwiązuje układy równań liniowych metodą podstawiania i przeciwnych współczynników.', skillSlug: 'rownania-uklady' },
  { code: 'III.3', level: 'basic', topicSlug: 'kwadratowa', status: 'lesson_ready', title: 'Równania kwadratowe', description: 'Rozwiązuje równania i nierówności kwadratowe, wykorzystuje postać iloczynową i deltę.', skillSlug: 'kwadratowa-delta' },
  { code: 'III.4', level: 'basic', topicSlug: 'rownania', status: 'lesson_ready', title: 'Równania wymierne i z modułem', description: 'Rozwiązuje proste równania wymierne oraz równania z wartością bezwzględną.', skillSlug: 'rownania-wymierne' },
  { code: 'III.5', level: 'extended', topicSlug: 'parametry', status: 'lesson_ready', title: 'Parametr w równaniach', description: 'Rozwiązuje równania z parametrem i bada liczbę rozwiązań.', skillSlug: 'parametry-rownania' },
  { code: 'III.6', level: 'extended', topicSlug: 'rownania', status: 'lesson_ready', title: 'Nierówności wielomianowe', description: 'Rozwiązuje nierówności wielomianowe i wymierne z wykorzystaniem siatki znaków.', skillSlug: 'rownania-nierownosci-wielomianowe' },
  { code: 'III.7', level: 'extended', topicSlug: 'kwadratowa', status: 'lesson_ready', title: 'Wzory Viète’a', description: 'Stosuje związki między pierwiastkami a współczynnikami trójmianu kwadratowego.', skillSlug: 'kwadratowa-viete' },

  // IV. Funkcje
  { code: 'IV.1', level: 'basic', topicSlug: 'funkcje', status: 'lesson_ready', title: 'Własności z wykresu', description: 'Odczytuje z wykresu dziedzinę, zbiór wartości, miejsca zerowe i monotoniczność.', skillSlug: 'funkcje-odczyt-wykresu' },
  { code: 'IV.2', level: 'basic', topicSlug: 'funkcje', status: 'lesson_ready', title: 'Dziedzina i miejsca zerowe', description: 'Wyznacza dziedzinę i miejsca zerowe funkcji zadanej wzorem.', skillSlug: 'funkcje-dziedzina-wzor' },
  { code: 'IV.3', level: 'basic', topicSlug: 'funkcje', status: 'lesson_ready', title: 'Funkcja liniowa', description: 'Interpretuje współczynniki funkcji liniowej i wykorzystuje ją w zadaniach.', skillSlug: 'funkcje-liniowa' },
  { code: 'IV.4', level: 'basic', topicSlug: 'kwadratowa', status: 'lesson_ready', title: 'Funkcja kwadratowa', description: 'Posługuje się wszystkimi postaciami funkcji kwadratowej, wyznacza wierzchołek i miejsca zerowe.', skillSlug: 'kwadratowa-postacie' },
  { code: 'IV.5', level: 'basic', topicSlug: 'kwadratowa', status: 'lesson_ready', title: 'Zastosowania funkcji kwadratowej', description: 'Stosuje funkcję kwadratową do rozwiązywania zadań praktycznych i optymalizacyjnych.', skillSlug: 'kwadratowa-optymalizacja' },
  { code: 'IV.6', level: 'basic', topicSlug: 'funkcje', status: 'lesson_ready', title: 'Logarytmy i funkcja wykładnicza', description: 'Posługuje się pojęciem logarytmu i jego własnościami oraz funkcją wykładniczą.', skillSlug: 'funkcje-logarytmy' },
  { code: 'IV.7', level: 'extended', topicSlug: 'wymierne', status: 'lesson_ready', title: 'Funkcja wymierna', description: 'Bada funkcję wymierną, wyznacza asymptoty i miejsca zerowe.', skillSlug: 'wymierne-dziedzina' },
  { code: 'IV.8', level: 'extended', topicSlug: 'funkcje', status: 'lesson_ready', title: 'Przekształcenia wykresów', description: 'Stosuje przesunięcia, symetrie i powinowactwo do szkicowania wykresów.', skillSlug: 'funkcje-przeksztalcenia' },
  { code: 'IV.9', level: 'extended', topicSlug: 'funkcje', status: 'lesson_ready', title: 'Funkcja odwrotna', description: 'Wyznacza funkcję odwrotną i składa funkcje.', skillSlug: 'funkcje-odwrotna' },

  // V. Ciągi
  { code: 'V.1', level: 'basic', topicSlug: 'ciagi', status: 'lesson_ready', title: 'Pojęcie ciągu', description: 'Wyznacza wyrazy ciągu i wzór ogólny na podstawie opisu.', skillSlug: 'ciagi-pojecie' },
  { code: 'V.2', level: 'basic', topicSlug: 'ciagi', status: 'lesson_ready', title: 'Ciąg arytmetyczny', description: 'Stosuje wzór na n-ty wyraz i sumę n początkowych wyrazów ciągu arytmetycznego.', skillSlug: 'ciagi-arytmetyczny' },
  { code: 'V.3', level: 'basic', topicSlug: 'ciagi', status: 'lesson_ready', title: 'Ciąg geometryczny', description: 'Stosuje wzór na n-ty wyraz i sumę ciągu geometrycznego.', skillSlug: 'ciagi-geometryczny' },
  { code: 'V.4', level: 'basic', topicSlug: 'ciagi', status: 'lesson_ready', title: 'Procent składany', description: 'Wykorzystuje ciągi geometryczne do obliczeń lokat i kredytów.', skillSlug: 'ciagi-procent-skladany' },
  { code: 'V.5', level: 'extended', topicSlug: 'ciagi', status: 'lesson_ready', title: 'Granica ciągu', description: 'Bada monotoniczność ciągu i wyznacza jego granicę.', skillSlug: 'ciagi-granica' },
  { code: 'V.6', level: 'extended', topicSlug: 'ciagi', status: 'lesson_ready', title: 'Szereg geometryczny', description: 'Stosuje warunek zbieżności szeregu geometrycznego.', skillSlug: 'ciagi-szereg' },

  // VI. Trygonometria
  { code: 'VI.1', level: 'basic', topicSlug: 'trygonometria', status: 'lesson_ready', title: 'Funkcje w trójkącie', description: 'Stosuje definicje sinusa, cosinusa i tangensa w trójkącie prostokątnym.', skillSlug: 'trygonometria-trojkat' },
  { code: 'VI.2', level: 'basic', topicSlug: 'trygonometria', status: 'lesson_ready', title: 'Kąty 30°, 45°, 60°', description: 'Posługuje się wartościami funkcji trygonometrycznych dla kątów 30°, 45°, 60°.', skillSlug: 'trygonometria-katy-specjalne' },
  { code: 'VI.3', level: 'basic', topicSlug: 'trygonometria', status: 'lesson_ready', title: 'Miara łukowa i jedynka', description: 'Posługuje się miarą łukową kąta i stosuje jedynkę trygonometryczną.', skillSlug: 'trygonometria-jedynka' },
  { code: 'VI.4', level: 'extended', topicSlug: 'trygonometria', status: 'lesson_ready', title: 'Tożsamości trygonometryczne', description: 'Stosuje wzory na sumy, różnice i kąty podwojone.', skillSlug: 'trygonometria-tozsamosci' },
  { code: 'VI.5', level: 'extended', topicSlug: 'trygonometria', status: 'lesson_ready', title: 'Równania trygonometryczne', description: 'Rozwiązuje równania i nierówności trygonometryczne.', skillSlug: 'trygonometria-rownania' },

  // VII. Planimetria
  { code: 'VII.1', level: 'basic', topicSlug: 'planimetria', status: 'lesson_ready', title: 'Trójkąty', description: 'Stosuje własności trójkątów, przystawanie i podobieństwo.', skillSlug: 'planimetria-wlasnosci' },
  { code: 'VII.2', level: 'basic', topicSlug: 'planimetria', status: 'lesson_ready', title: 'Twierdzenia o trójkącie', description: 'Stosuje twierdzenie Pitagorasa, sinusów i cosinusów.', skillSlug: 'planimetria-pitagoras' },
  { code: 'VII.3', level: 'basic', topicSlug: 'planimetria', status: 'lesson_ready', title: 'Pola i obwody', description: 'Oblicza pola i obwody wielokątów, koła i wycinka.', skillSlug: 'planimetria-pola' },
  { code: 'VII.4', level: 'basic', topicSlug: 'planimetria', status: 'lesson_ready', title: 'Okrąg i kąty', description: 'Stosuje własności kątów wpisanych i środkowych.', skillSlug: 'planimetria-katy-okregu' },
  { code: 'VII.5', level: 'extended', topicSlug: 'planimetria', status: 'lesson_ready', title: 'Okrąg opisany i wpisany', description: 'Wykorzystuje własności okręgu opisanego i wpisanego oraz stycznych.', skillSlug: 'planimetria-okregi' },
  { code: 'VII.6', level: 'extended', topicSlug: 'dowody', status: 'lesson_ready', title: 'Dowody geometryczne', description: 'Przeprowadza dowody twierdzeń geometrycznych.', skillSlug: 'dowody-geometryczne' },

  // VIII. Geometria analityczna
  { code: 'VIII.1', level: 'basic', topicSlug: 'geometria', status: 'lesson_ready', title: 'Równanie prostej', description: 'Wyznacza równanie prostej przechodzącej przez dwa punkty.', skillSlug: 'geometria-prosta' },
  { code: 'VIII.2', level: 'basic', topicSlug: 'geometria', status: 'lesson_ready', title: 'Równoległość i prostopadłość', description: 'Bada wzajemne położenie prostych na płaszczyźnie.', skillSlug: 'geometria-prosta' },
  { code: 'VIII.3', level: 'basic', topicSlug: 'geometria', status: 'lesson_ready', title: 'Odległość i środek', description: 'Oblicza odległość punktów, wyznacza środek odcinka.', skillSlug: 'geometria-odleglosc' },
  { code: 'VIII.4', level: 'basic', topicSlug: 'geometria', status: 'lesson_ready', title: 'Równanie okręgu', description: 'Zapisuje i interpretuje równanie okręgu.', skillSlug: 'geometria-okrag' },
  { code: 'VIII.5', level: 'extended', topicSlug: 'geometria', status: 'lesson_ready', title: 'Odległość punktu od prostej', description: 'Oblicza odległość punktu od prostej i wyznacza styczną do okręgu.', skillSlug: 'geometria-odleglosc' },
  { code: 'VIII.6', level: 'extended', topicSlug: 'geometria', status: 'lesson_ready', title: 'Okrąg i prosta', description: 'Rozwiązuje zadania o przecięciu prostej z okręgiem.', skillSlug: 'geometria-przeciecia' },

  // IX. Stereometria
  { code: 'IX.1', level: 'basic', topicSlug: 'stereometria', status: 'lesson_ready', title: 'Bryły i objętości', description: 'Oblicza objętość i pole powierzchni graniastosłupów, ostrosłupów i brył obrotowych.', skillSlug: 'stereometria-objetosci' },
  { code: 'IX.2', level: 'basic', topicSlug: 'stereometria', status: 'lesson_ready', title: 'Kąty i odległości', description: 'Wyznacza kąty i odległości w bryłach z użyciem twierdzenia Pitagorasa.', skillSlug: 'stereometria-katy' },
  { code: 'IX.3', level: 'extended', topicSlug: 'stereometria', status: 'lesson_ready', title: 'Przekroje brył', description: 'Wyznacza przekroje brył oraz kąty między ścianami i krawędziami.', skillSlug: 'stereometria-przekroje' },

  // X. Kombinatoryka
  { code: 'X.1', level: 'basic', topicSlug: 'kombinatoryka', status: 'lesson_ready', title: 'Reguła mnożenia', description: 'Stosuje regułę mnożenia i dodawania przy zliczaniu możliwości.', skillSlug: 'kombinatoryka-mnozenie' },
  { code: 'X.2', level: 'basic', topicSlug: 'kombinatoryka', status: 'lesson_ready', title: 'Permutacje i kombinacje', description: 'Oblicza liczbę permutacji, wariacji i kombinacji.', skillSlug: 'kombinatoryka-wzory' },
  { code: 'X.3', level: 'extended', topicSlug: 'kombinatoryka', status: 'lesson_ready', title: 'Zadania z ograniczeniami', description: 'Rozwiązuje zadania kombinatoryczne z dodatkowymi warunkami.', skillSlug: 'kombinatoryka-ograniczenia' },

  // XI. Rachunek prawdopodobieństwa i statystyka
  { code: 'XI.1', level: 'basic', topicSlug: 'prawdopodobienstwo', status: 'lesson_ready', title: 'Prawdopodobieństwo klasyczne', description: 'Oblicza prawdopodobieństwo, posługuje się drzewkami i własnościami zbiorów.', skillSlug: 'prawdopodobienstwo-klasyczne' },
  { code: 'XI.2', level: 'basic', topicSlug: 'statystyka', status: 'lesson_ready', title: 'Statystyka opisowa', description: 'Oblicza i interpretuje średnią, medianę, dominantę i odchylenie standardowe.', skillSlug: 'statystyka-srednia' },
  { code: 'XI.3', level: 'extended', topicSlug: 'prawdopodobienstwo', status: 'lesson_ready', title: 'Prawdopodobieństwo warunkowe', description: 'Stosuje prawdopodobieństwo warunkowe i całkowite.', skillSlug: 'prawdopodobienstwo-warunkowe' },
  { code: 'XI.4', level: 'extended', topicSlug: 'prawdopodobienstwo', status: 'lesson_ready', title: 'Schemat Bernoulliego', description: 'Stosuje schemat Bernoulliego i rozkład dwumianowy.', skillSlug: 'prawdopodobienstwo-bernoulli' },
  { code: 'XI.5', level: 'extended', topicSlug: 'prawdopodobienstwo', status: 'lesson_ready', title: 'Prawdopodobieństwo w zadaniach', description: 'Wykorzystuje prawdopodobieństwo w zadaniach z geometrią i kombinatoryką.', skillSlug: 'prawdopodobienstwo-warunkowe' },

  // XII. Granica i pochodna funkcji (zakres rozszerzony)
  { code: 'XII.1', level: 'extended', topicSlug: 'granice', status: 'lesson_ready', title: 'Granica i ciągłość', description: 'Oblicza granice funkcji i bada ciągłość.', skillSlug: 'granice-obliczanie' },
  { code: 'XII.2', level: 'extended', topicSlug: 'pochodne', status: 'lesson_ready', title: 'Pochodna funkcji', description: 'Oblicza pochodną z definicji i z reguł różniczkowania.', skillSlug: 'pochodne-obliczanie' },
  { code: 'XII.3', level: 'extended', topicSlug: 'pochodne', status: 'lesson_ready', title: 'Monotoniczność i ekstrema', description: 'Bada monotoniczność i wyznacza ekstrema funkcji.', skillSlug: 'pochodne-monotonicznosc' },
  { code: 'XII.4', level: 'extended', topicSlug: 'optymalizacja', status: 'lesson_ready', title: 'Zadania optymalizacyjne', description: 'Rozwiązuje zadania optymalizacyjne z użyciem pochodnej.', skillSlug: 'optymalizacja-pochodna' },
  { code: 'XII.5', level: 'extended', topicSlug: 'parametry', status: 'lesson_ready', title: 'Pochodna z parametrem', description: 'Wykorzystuje pochodną w zadaniach z parametrem.', skillSlug: 'parametry-pochodna' },
  { code: 'XII.6', level: 'extended', topicSlug: 'pochodne', status: 'lesson_ready', title: 'Styczna do wykresu', description: 'Interpretuje pochodną geometrycznie i wyznacza styczną.', skillSlug: 'pochodne-styczna' },

  // Dowodzenie i matematyka stosowana
  { code: 'D.1', level: 'extended', topicSlug: 'dowody', status: 'lesson_ready', title: 'Indukcja matematyczna', description: 'Stosuje zasadę indukcji matematycznej do dowodzenia twierdzeń.', skillSlug: 'dowody-indukcja' },
  { code: 'D.2', level: 'extended', topicSlug: 'dowody', status: 'lesson_ready', title: 'Dowody nierówności', description: 'Dowodzi nierówności metodą równoważnych przekształceń.', skillSlug: 'dowody-algebraiczne' },
  { code: 'D.3', level: 'basic', topicSlug: 'dowody', status: 'lesson_ready', title: 'Uzasadnianie w zadaniach', description: 'Prowadzi proste rozumowanie i uzasadnia odpowiedź w zadaniach maturalnych.', skillSlug: 'dowody-uzasadnianie' },
  { code: 'Z.1', level: 'basic', topicSlug: 'zastosowania', status: 'lesson_ready', title: 'Matematyka w kontekście', description: 'Rozwiązuje zadania osadzone w kontekście praktycznym i interpretuje wynik.', skillSlug: 'zastosowania-model' },
  { code: 'Z.2', level: 'basic', topicSlug: 'zastosowania', status: 'lesson_ready', title: 'Rozumowanie złożone', description: 'Łączy kilka dziedzin matematyki w jednym zadaniu.', skillSlug: 'zastosowania-synteza' },
]
