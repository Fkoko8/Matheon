import type { ContentTopic } from '@/content/types'

export const kombinatoryka: ContentTopic = {
  slug: 'kombinatoryka',
  title: 'Kombinatoryka',
  description: 'Zliczanie możliwości regułą mnożenia i dodawania, permutacje, kombinacje i wariacje oraz zadania z dodatkowymi ograniczeniami.',
  level: 'basic',
  lessons: [
    {
      slug: 'kombinatoryka-mnozenie',
      title: 'Reguła mnożenia i dodawania',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['X.1'],
      objectives: [
        'Stosujesz regułę mnożenia przy zliczaniu ciągów wyborów',
        'Stosujesz regułę dodawania dla rozłącznych przypadków',
        'Rozpoznajesz w zadaniu właściwą regułę',
      ],
      skills: [
        { slug: 'kombinatoryka-mnozenie', name: 'Reguła mnożenia i dodawania', description: 'Stosuje regułę mnożenia i dodawania do zliczania możliwości.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Zanim poznasz wzory na kombinacje i permutacje, naucz się liczyć prosto. Znaczna część zadań maturalnych rozwiązuje się samą regułą mnożenia — bez żadnych wzorów.',
        },
        {
          type: 'paragraph',
          title: 'Reguła mnożenia',
          body: 'Jeśli wybierasz kolejno kilka elementów i liczba możliwości na każdym kroku jest niezależna od poprzednich, liczbę wyników mnożysz. Np. do bluzka jest 5 opcji, do spodni 4, do butów 3: $5 \\cdot 4 \\cdot 3 = 60$ kompletów.',
        },
        {
          type: 'paragraph',
          title: 'Reguła dodawania',
          body: 'Gdy rozpatrujesz rozłączne przypadki, wyniki dodajesz. Np. jedno trafienie w loterii: albo wygrasz na jednym losowaniu, albo na drugim, albo na trzecim — to $3$ możliwości, nie iloczyn.',
        },
        {
          type: 'example',
          title: 'Przykład — włókna i guziki',
          body: 'Na płaszczu jest $4$ kieszenie i $3$ guziki. Dla każdej kieszeni wybieramy $2$ guziki z $3$: mamy więc odpowiednio $\\binom{3}{2} = 3$ możliwości na kieszeń. Łącznie, dzięki regule mnożenia: $3 \\cdot 3 \\cdot 3 \\cdot 3 = 81$ zestawów guzików.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie reguł: mnożenie dla kolejnych, niezależnych wyborów; dodawanie dla rozłącznych przypadków („albo–albo”).
• Liczenie „na oko” przy większych liczbach — zapisuj obliczenia krok po kroku.
• Zapominanie o ograniczeniach z treści (np. że cyfry nie mogą się powtarzać).`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Zadaj sobie pytanie: „czy wybieram kolejno coś po czymś” (mnożenie), czy „czy to jeden z kilku wariantów” (dodawanie)? Odpowiedź wskazuje regułę.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Kolejne niezależne wybory → mnożenie liczb możliwości.
• Rozłączne przypadki typu „albo” → dodawanie.
• Warto zawsze sprawdzić, czy w zadaniu są ograniczenia.`,
        },
      ],
    },
    {
      slug: 'kombinatoryka-wzory',
      title: 'Permutacje, kombinacje i wariacje',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['X.2', 'X.3'],
      objectives: [
        'Obliczasz liczbę permutacji, kombinacji i wariacji',
        'Rozróżniasz zadania z powtórzeniami i bez powtórzeń',
        'Rozwiązujesz zadania zliczania z dodatkowymi warunkami',
      ],
      skills: [
        { slug: 'kombinatoryka-wzory', name: 'Permutacje i kombinacje', description: 'Stosuje wzory na permutacje, kombinacje i wariacje.', level: 'basic' },
        { slug: 'kombinatoryka-ograniczenia', name: 'Zliczanie z ograniczeniami', description: 'Rozwiązuje zadania kombinatoryczne z dodatkowymi warunkami (metoda włączeń i wyłączeń).', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Trzy wzory, trzy różne sytuacje. Kluczowe jest pytanie: czy kolejność ma znaczenie? Czy wybieram, czy ustawiam? Odpowiedź na te pytania wskazuje wzór.',
        },
        {
          type: 'formula',
          title: 'Trzy wzory',
          body: 'Wzory, w zależności od tego, czy kolejność ma znaczenie:',
          formula: 'P(n) = n! \\quad \\text{(permutacje)} \\qquad V_{n}^{k} = \\frac{n!}{(n - k)!} \\quad \\text{(wariacje)} \\qquad C_{n}^{k} = \\frac{n!}{k!(n - k)!} \\quad \\text{(kombinacje)}',
        },
        {
          type: 'paragraph',
          title: 'Kiedy który wzór',
          body: 'Permutacja — ustawiam wszystkie elementy, kolejność ma znaczenie. Wariacja — wybieram $k$ elementów z $n$ i kolejność ma znaczenie (np. pierwsze trzy miejsca w zawodach). Kombinacja — wybieram $k$ elementów z $n$, a kolejność nie ma znaczenia (np. wybór składu drużyny).',
        },
        {
          type: 'example',
          title: 'Przykład — rozróżnienie sytuacji',
          body: 'Uporządkowanie 8 zawodników w finale to permutacja: $8!$. Wybór składu 11-osobowej drużyny z 16 zawodników to kombinacja: $C_{16}^{11} = C_{16}^{5}$. Trzy pierwsze miejsca w biegu to wariacja: $V_{16}^{3}$.',
        },
        {
          type: 'paragraph',
          title: 'Zadania z ograniczeniami',
          body: 'Gdy nie każdy wybór jest dozwolony, liczysz wszystkie możliwości i odejmujesz te niedozwolone. Ta metoda nazywa się włączeniami i wyłączeniami i jest podstawą trudniejszych zadań.',
        },
        {
          type: 'example',
          title: 'Przykład — wyłączenia',
          body: 'Ile ciągów trzycyfrowych z różnych cyfr nie zawiera cyfry $0$? Wszystkich ciągów z różnych cyfr jest $9 \\cdot 9 \\cdot 8 = 648$. Niedozwolone: te z zerem na początku — $1 \\cdot 9 \\cdot 8 = 72$. Poprawne: $648 - 72 = 576$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie wariacji z kombinacjami — sprawdź, czy kolejność ma znaczenie.
• Użycie $C_{n}^{k}$ tam, gdzie powinno być $V_{n}^{k}$ (np. honorowanie kolejności miejsc).
• Zliczanie ciągów „na czuja” zamiast systematycznych wyłączeń.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Gdy w zadaniu jest duża liczba możliwości i niedozwolone pozycje, zacznij od odpowiedzi na pytanie: „ile jest wszystkich, a ile jest zakazanych?” To niemal zawsze najkrótsza droga.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $P(n) = n!$, $V_{n}^{k} = \\frac{n!}{(n - k)!}$, $C_{n}^{k} = \\frac{n!}{k!(n - k)!}$.
• Kolejność ma znaczenie? → wariacja. Nie ma? → kombinacja.
• Z ograniczeniami: licz wszystko, odejmij zakazane.`,
        },
      ],
    },
  ],
}
