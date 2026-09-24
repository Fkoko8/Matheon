import type { ContentTopic } from '@/content/types'

export const dowody: ContentTopic = {
  slug: 'dowody', title: 'Dowody i uzasadnianie', description: 'Prowadzisz przejrzysty dowód algebraiczny, geometryczny i indukcyjny oraz uzasadniasz odpowiedź.', level: 'extended',
  lessons: [
    { slug: 'dowody-algebraiczne', title: 'Tożsamości i dowody algebraiczne', durationMinutes: 30, difficulty: 4, requirements: ['II.7'], objectives: ['Dowodzisz tożsamość przez przekształcenia', 'Uzasadniasz nierówność'], skills: [{ slug: 'dowody-algebraiczne', name: 'Dowody algebraiczne', description: 'Dowodzi tożsamości i nierówności algebraicznych.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Co to jest dowód', body: 'Dowód to ciąg uzasadnionych zdań prowadzących od założeń do wniosku. Zapisuj równania w taki sposób, aby każda transformacja była jawna.' },
      { type: 'example', title: 'Tożsamość', body: 'Udowodnij $2(x+3)=2x+6$: mnożymy obie strony przez $2$, otrzymując kolejno $2(x+3)=2x+6$ i $2x+6=2x+6$.' },
      { type: 'formula', title: 'Nierówność', body: 'Kwadrat liczby jest nieujemny.', formula: 'a^2\\geq0' },
      { type: 'warning', title: 'Kierunek przekształceń', body: 'W dowodzie nierówności zapisuj wyrażenie jako sumę kwadratów lub iloczyn czynników o znanej wartości.' },
      { type: 'summary', title: 'Schemat', body: 'Zacznij od lewej strony, stosuj równoważne przekształcenia i zakończ prawą stroną.' },
    ] },
    { slug: 'dowody-indukcja', title: 'Indukcja matematyczna i uzasadnianie', durationMinutes: 30, difficulty: 5, requirements: ['D.1', 'D.3'], objectives: ['Stosujesz indukcję matematyczną', 'Uzasadniasz poprawność strategii'], skills: [{ slug: 'dowody-indukcja', name: 'Indukcja', description: 'Dowodzi wzorów indukcyjnych.', level: 'extended' }, { slug: 'dowody-uzasadnianie', name: 'Uzasadnianie', description: 'Formułuje logiczne uzasadnienie odpowiedzi.', level: 'basic' }], blocks: [
      { type: 'paragraph', title: 'Dwa kroki', body: 'Dowód indukcyjny ma dwa elementy: sprawdzenie zdania dla pierwszego indeksu oraz przejście z przypadku $n$ na przypadek $n+1$.' },
      { type: 'formula', title: 'Schemat', body: 'Załóż, że zdanie jest prawdziwe dla $n$, i wykorzystaj to założenie w wyrażeniu dla $n+1$.' },
      { type: 'example', title: 'Przykład', body: 'Aby udowodnić $1+2+\\cdots+n=\\frac{n(n+1)}2$, sprawdź $n=1$, a z założenia dla $n$ dodaj $n+1$ do obu stron.' },
      { type: 'summary', title: 'Co zapamiętać', body: 'Nie przeskakuj z „tyle” do „zawsze”. Każdy wniosek musi wynikać z założenia lub z wcześniej udowodnionego faktu.' },
    ] },
    { slug: 'dowody-geometryczne', title: 'Dowody geometryczne', durationMinutes: 25, difficulty: 4, requirements: ['VII.6'], objectives: ['Uzasadniasz twierdzenie geometryczne', 'Korzystasz z własności figur'], skills: [{ slug: 'dowody-geometryczne', name: 'Dowody geometryczne', description: 'Prowadzi dowody z użyciem własności geometrycznych.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Język dowodu', body: 'Najpierw wypisz, co wiesz, potem wybierz twierdzenie i napisz, co z niego wynika. Unikaj odwołań typu „widać”, jeśli nie podaś własności.' },
      { type: 'example', title: 'Przykład', body: 'Jeśli dwa trójkąty mają dwa kąty odpowiednie równe i przeciwległe boki proporcjonalne, są podobne zgodnie z kryterium podobieństwa AA.' },
      { type: 'summary', title: 'Schemat', body: 'Zdefiniuj oznaczenia, wypisz dane i cel, zastosuj twierdzenie i zapisz wniosek.' },
    ] },
  ],
}
