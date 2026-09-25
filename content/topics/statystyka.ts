import type { ContentTopic } from '@/content/types'

export const statystyka: ContentTopic = {
  slug: 'statystyka',
  title: 'Statystyka opisowa',
  description: 'Odczytujesz dane, obliczasz miary tendencji centralnej i zmienności oraz interpretujesz wyniki.',
  level: 'basic',
  lessons: [
    {
      slug: 'statystyka-miary-centralne',
      title: 'Średnia, mediana i dominanta',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['XI.2'],
      objectives: ['Obliczasz średnią arytmetyczną i ważoną', 'Wyznaczasz medianę oraz dominantę', 'Porównujesz miary tendencji centralnej'],
      skills: [
        { slug: 'statystyka-srednia', name: 'Średnia arytmetyczna', description: 'Oblicza średnią arytmetyczną danych liczbowych.', level: 'basic' },
        { slug: 'statystyka-mediana', name: 'Mediana i dominanta', description: 'Wyznacza medianę oraz dominantę zestawu danych.', level: 'basic' },
      ],
      blocks: [
        { type: 'paragraph', title: 'Od czego zacząć', body: 'W statystyce opisowej najpierw porządkujemy dane i sprawdzamy, co dokładnie zostało zmierzone. Średnia jest miara tendencji centralnej, ale przy danych skrajnych lepszy obraz daje mediana.' },
        { type: 'formula', title: 'Średnia arytmetyczna', body: 'Dla $n$ wyników $x_1, \\ldots, x_n$ średnia jest sumą wyników podzieloną przez liczbę wyników.', formula: '\\bar{x} = \\frac{x_1 + x_2 + \\cdots + x_n}{n}' },
        { type: 'example', title: 'Przykład — średnia', body: 'Dla wyników $2, 4, 4, 6$ mamy $\\bar{x} = \\frac{2+4+4+6}{4} = \\frac{16}{4} = 4$. Wartość $4$ występuje dwa razy, jest więc również dominantą; uporządkowany zestaw ma $4$ elementy, więc medianą jest średnia drugiego i trzeciego elementu, czyli $4$.' },
        { type: 'heading', title: 'Mediana', body: 'Medianą nazywamy środkowy element po uporządkowaniu danych. Przy nieparzystej liczbie elementów jest to element środkowy, przy parzystej — średnia dwóch elementów środkowych.' },
        { type: 'example', title: 'Przykład — mediana i dominanta', body: 'Dla $2, 5, 5, 8, 9$ mediana to $5$, a dominanta to $5$. Jeśli wartość skrajna bardzo podniesie średnią, mediany nie zmienia, dlatego często podajemy obie miary.' },
        {
          type: 'diagram',
          title: 'Dane na osi liczbowej',
          body: 'Dane $2, 5, 5, 8, 9$ z zaznaczoną medianą — warto uporządkować dane na osi, by od razu widzieć środek i rozstrzał.',
          figure: {
            caption: 'Mediana dzieli uporządkowany zestaw na dwie równe połowy.',
            kind: 'numberline',
            min: 0,
            max: 12,
            step: 1,
            points: [
              { value: 2, label: '2', color: 'violet' },
              { value: 5, label: '5', color: 'violet' },
              { value: 5.35, label: '5', color: 'violet' },
              { value: 8, label: '8', color: 'violet' },
              { value: 9, label: '9', color: 'violet' },
              { value: 5.17, label: 'Me = 5', color: 'amber' },
            ],
          },
        },
        { type: 'warning', title: 'Najczęstsze pomyłki', body: '• Nie dzielimy sumy przez wartość największą — dzielimy przez liczbę danych.\n• Nie nazywamy medianą elementu przed uporządkowaniem.\n• W średniej ważonej mnożymy wartość przez wagę, a nie tylko sumujemy wartości.' },
        { type: 'summary', title: 'Co zapamiętać', body: 'Średnia mówi o centrum danych, mediana o pozycji środkowej, a dominanta o najczęstszej wartości. Zawsze podawaj liczbę obserwacji i sprawdzaj, czy wynik ma sens.' },
      ],
    },
    {
      slug: 'statystyka-zmiennosc',
      title: 'Rozstęp, wariancja i odchylenie standardowe',
      durationMinutes: 25,
      difficulty: 3,
      requirements: ['XI.2'],
      objectives: ['Obliczasz rozstęp i wariancję', 'Obliczasz odchylenie standardowe', 'Interpretujesz wynik miary zmienności'],
      skills: [
        { slug: 'statystyka-zmiennosc', name: 'Miary zmienności', description: 'Oblicza i interpretuje miary rozproszenia danych liczbowych.', level: 'basic' },
      ],
      blocks: [
        { type: 'paragraph', title: 'Rozproszenie danych', body: 'Dwie serie mogą mieć identyczną średnią, ale jedna może być bardziej zróżnicowana. Do oceny rozproszenia używamy przede wszystkim wariancji i odchylenia standardowego.' },
        { type: 'formula', title: 'Wariancja i odchylenie', body: 'Odchylenie standardowe jest pierwiastkiem z wariancji; ma tę samą jednostkę co dane, co ułatwia interpretację.', formula: 's^2 = \\frac{1}{n}\\sum_{i=1}^{n}(x_i-\\bar{x})^2, \\qquad s = \\sqrt{s^2}' },
        { type: 'example', title: 'Przykład', body: 'Dla danych $2, 4, 6$ średnia wynosi $4$. Odchylenia od średniej to $-2, 0, 2$, więc wariancja próbki z dzielnikiem $n$ to $\\frac{4+0+4}{3} = \\frac{8}{3}$, a odchylenie to $\\sqrt{\\frac{8}{3}}$.' },
        { type: 'heading', title: 'Rozstęp', body: 'Rozstęp to różnica między największą i najmniejszą wartością: $R = x_{max} - x_{min}$. Jest prosty, ale uwzględnia tylko dwa skrajne wyniki.' },
        { type: 'tip', title: 'Wskazówka maturalna', body: 'Jeśli w zadaniu podano wzór na wariancję z dzielnikiem $n$, stosuj go dokładnie; w statystyce opisowej szkolnej czasem spotkasz też dzielnik $n-1$.' },
        { type: 'summary', title: 'Co zapamiętać', body: 'Wariancja ma jednostkę kwadratową, odchylenie standardową — jednostkę danych. Duże odchylenie oznacza większe rozproszenie obserwacji wokół średniej.' },
      ],
    },
  ],
}
