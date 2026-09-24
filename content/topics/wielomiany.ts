import type { ContentTopic } from '@/content/types'

export const wielomiany: ContentTopic = {
  slug: 'wielomiany', title: 'Wielomiany', description: 'Rozkładasz wielomiany na czynniki, dzielisz wielomiany i stosujesz twierdzenie o reszcie.', level: 'extended',
  lessons: [
    { slug: 'wielomiany-rozklad', title: 'Rozkład na czynniki', durationMinutes: 30, difficulty: 3, requirements: ['II.4'], objectives: ['Rozkładasz wielomian na czynniki', 'Stosujesz wzory na sumę i różnicę'], skills: [{ slug: 'wielomiany-rozkladanie', name: 'Rozkład na czynniki', description: 'Rozkłada wielomiany metodą grupowania i wzorów.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Cel', body: 'Rozkład upraszcza wyrażenia i jest pierwszym krokiem do rozwiązywania równań. Zaczynaj od wyłonienia wspólnego czynnika, a następnie stosuj wzory.' },
      { type: 'formula', title: 'Najczęstsze wzory', body: 'Wzory skracają rachunki i pomagają rozpoznać czynniki.', formula: 'a^2-b^2=(a-b)(a+b), \\quad a^2+2ab+b^2=(a+b)^2' },
      { type: 'example', title: 'Przykład', body: '$x^2-9=(x-3)(x+3)$ oraz $x^2+6x+9=(x+3)^2$. W $4x^2-12x+9$ rozpoznajemy kwadrat: $(2x-3)^2$.' },
      { type: 'warning', title: 'Pułapki', body: 'Nie pomyl wzoru $a^2-b^2$ z sumą kwadratów. Przy grupowaniu sprawdź, że każda grupa ma wspólny czynnik.' },
      { type: 'summary', title: 'Schemat', body: 'Wyłóż wspólny czynnik → rozpoznaj różnicę kwadratów lub kwadrat trójmianu → sprawdź iloczyn.' },
    ] },
    { slug: 'wielomiany-dzielenie', title: 'Dzielenie wielomianów i reszta', durationMinutes: 30, difficulty: 4, requirements: ['II.5'], objectives: ['Dzielisz wielomiany metodą długiego dzielenia', 'Wyznaczasz resztę z dzielenia'], skills: [{ slug: 'wielomiany-dzielenie', name: 'Dzielenie wielomianów', description: 'Wykonuje dzielenie wielomianów i oblicza resztę.', level: 'extended' }, { slug: 'wielomiany-bezout', name: 'Twierdzenie Bézouta', description: 'Bada pierwiastki całkowite i dzielniki.', level: 'extended' }], blocks: [
      { type: 'formula', title: 'Twierdzenie o reszcie', body: 'Reszta z dzielenia przez $x-a$ ma wartość wielomianu w punkcie $a$.', formula: 'P(x)=Q(x)(x-a)+P(a)' },
      { type: 'example', title: 'Reszta bez dzielenia', body: 'Dla $P(x)=x^2+2x-5$ i $a=3$ mamy $P(3)=9+6-5=10$, więc reszta z dzielenia przez $x-3$ wynosi $10$.' },
      { type: 'example', title: 'Długie dzielenie', body: 'Wykonując dzielenie, dopasowujemy najwyższe potęgi, mnożymy iloczyn przez dzielnik i odejmujemy. Rząd reszty jest mniejszy niż rząd dzielnika.' },
      { type: 'tip', title: 'Szybka kontrola', body: 'Po dzieleniu pomnóż iloczyn przez dzielnik i dodaj resztę. Wynik musi odtworzyć wyjściowy wielomian.' },
      { type: 'summary', title: 'Co zapamiętać', body: 'Wielomian dzielony przez $x-a$ ma resztę $P(a)$. Pierwszy wyraz dzielenia musi mieć stopień równy stopniowi dzielnika.' },
    ] },
  ],
}
