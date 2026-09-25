import type { ContentTopic } from '@/content/types'

export const planimetria: ContentTopic = {
  slug: 'planimetria',
  title: 'Planimetria',
  description: 'Własności i podobieństwo trójkątów, twierdzenie Pitagorasa, twierdzenia sinusów i cosinusów, pola figur oraz geometria okręgu — od kątów wpisanych po okrąg wpisany i opisany.',
  level: 'basic',
  lessons: [
    {
      slug: 'planimetria-trojkaty',
      title: 'Trójkąty: własności i podobieństwo',
      durationMinutes: 25,
      difficulty: 2,
      requirements: ['VII.1'],
      objectives: [
        'Stosujesz sumę kątów trójkąta i własności boków',
        'Rozpoznajesz trójkąty przystające i podobne',
        'Wyznaczasz długości i kąty w trójkątach podobnych',
      ],
      skills: [
        { slug: 'planimetria-wlasnosci', name: 'Własności trójkątów', description: 'Stosuje sumę kątów trójkąta, nierówność trójkąta i zależności między bokami a kątami.', level: 'basic' },
        { slug: 'planimetria-podobnosc', name: 'Podobieństwo trójkątów', description: 'Rozpoznaje i wykorzystuje trójkąty podobne oraz cechy podobieństwa.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Trójkąt to najczęstsza figura w planimetrii. Zanim policzysz pole czy kąt, musisz umieć określić, co trójkąty mają wspólnego. Sumy kątów i proporcje boków to dwa filary, na których stoi większość zadań.',
        },
        {
          type: 'formula',
          title: 'Suma kątów w trójkącie',
          body: 'Kąty dowolnego trójkąta płaskiego sumują się do $180^{\\circ}$:',
          formula: '\\alpha + \\beta + \\gamma = 180^{\\circ}',
        },
        {
          type: 'paragraph',
          title: 'Kąt a przeciwległy bok',
          body: 'Im większy kąt, tym większy leżący naprzeciw niego bok. Ta zależność jest podstawą twierdzeń o sinusach i cosinusach. Nierówność trójkąta daje szybki test: bok nie może być większy niż suma dwóch pozostałych.',
        },
        {
          type: 'example',
          title: 'Przykład — suma kątów',
          body: 'W trójkącie jeden kąt ma miarę $40^{\\circ}$, a drugi jest dwa razy większy od trzeciego. Ile wynosi najmniejszy kąt? Niech trzeci kąt to $x$, wtedy drugi to $2x$. Mamy $40^{\\circ} + 2x + x = 180^{\\circ}$, czyli $3x = 140^{\\circ}$, więc $x \\approx 46{,}67^{\\circ}$. Kąty: $40^{\\circ}$, $93{,}33^{\\circ}$ i $46{,}67^{\\circ}$.',
        },
        {
          type: 'diagram',
          title: 'Trójkąt i oznaczenia kątów',
          body: 'Standardowe oznaczenia: wierzchołki wielkimi literami, kąty greckimi, bok $a$ leży naprzeciw kąta $\\alpha$.',
          figure: {
            caption: 'Suma kątów: $\\alpha + \\beta + \\gamma = 180^{\\circ}$.',
            kind: 'geometry',
            elements: [
              { type: 'polyline', points: [[0, 0], [8, 0], [2.5, 4.5]], closed: true, color: 'violet' },
              { type: 'namedPoint', id: 'A', at: [0, 0] },
              { type: 'namedPoint', id: 'B', at: [8, 0] },
              { type: 'namedPoint', id: 'C', at: [2.5, 4.5] },
              { type: 'angle', vertex: [0, 0], fromDeg: 0, toDeg: 61, r: 1.6, color: 'amber', label: 'α' },
              { type: 'angle', vertex: [8, 0], fromDeg: 119, toDeg: 180, r: 1.6, color: 'amber', label: 'β' },
              { type: 'angle', vertex: [2.5, 4.5], fromDeg: 241, toDeg: 299, r: 1.4, color: 'amber', label: 'γ' },
            ],
            labels: { A: 'A', B: 'B', C: 'C' },
          },
        },
        {
          type: 'heading',
          title: 'Przystawanie i podobieństwo',
          body: 'Trójkąty przystające, gdy mają trzy równe boki (SSS). Podobne są, gdy mają dwa kąty równe (AA) — to najczęściej używana cecha. Trzeci kąt wynika wtedy automatycznie z sumy kątów. Trójkąty podobne mają proporcjonalne boki, a współczynnik podobieństwa jest stały.',
        },
        {
          type: 'formula',
          title: 'Proporcje w trójkątach podobnych',
          body: 'Jeśli $\\triangle ABC \\sim \\triangle DEF$ (odpowiadające wierzchołki w tej samej kolejności), to:',
          formula: '\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF} = k',
        },
        {
          type: 'example',
          title: 'Przykład — trójkąt podobny',
          body: 'Niech $M$ będzie środkiem boku $BC$ w trójkącie $ABC$, a przez $M$ poprowadzono prostą równoległą do $AB$, która przecina $AC$ w punkcie $N$. Wtedy $\\triangle CMN \\sim \\triangle CBA$ — kąty naprzemienne oraz wspólny kąt przy wierzchołku $C$. Stąd $\\frac{CN}{CA} = \\frac{CM}{CB} = \\frac{1}{2}$, więc $AN = \\frac{1}{2} AC$. Schemat jest powtarzalny: środek boku i prosta równoległa do innego boku zawsze dają stosunek $2 : 1$.',
        },
        {
          type: 'diagram',
          title: 'Szkic do przykładu o podobieństwie',
          body: 'Odcinek $MN$ jest równoległy do $AB$ — na rysunku zaznaczono oba trójkąty podobne.',
          figure: {
            caption: '$\\triangle CMN \\sim \\triangle CBA$ — prosta równoległa do boku tworzy trójkąt podobny w skali $1 : 2$.',
            kind: 'geometry',
            elements: [
              { type: 'polyline', points: [[0, 0], [8, 0], [3, 5]], closed: true, color: 'slate' },
              { type: 'segment', a1: [1.5, 2.5], a2: [5.5, 2.5], color: 'violet', width: 2.5 },
              { type: 'namedPoint', id: 'A', at: [0, 0] },
              { type: 'namedPoint', id: 'B', at: [8, 0] },
              { type: 'namedPoint', id: 'C', at: [3, 5] },
              { type: 'namedPoint', id: 'M', at: [1.5, 2.5], color: 'amber' },
              { type: 'namedPoint', id: 'N', at: [5.5, 2.5], color: 'amber' },
            ],
            labels: { A: 'A', B: 'B', C: 'C', M: 'M', N: 'N' },
          },
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Dopasowywanie boków „na oko” — zapisz, które boki leżą naprzeciw równych kątów.
• Umykanie trzeciego kąta: jeśli znasz dwa kąty w trójkątach podobnych, trzeci jest już przesądzony.
• Mylenie „większy kąt — większy bok”: zawsze porównuj kąt z bokiem leżącym naprzeciw.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Gdy w zadaniu są dwa trójkąty i prosta równoległa, zacznij od oznaczenia kątów naprzemiennych — to natychmiast daje parę podobnych trójkątów.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $\\alpha + \\beta + \\gamma = 180^{\\circ}$.
• Podobieństwo: dwa kąty równe (AA) daje proporcję wszystkich trzech boków.
• Większemu kątowi odpowiada dłuższy przeciwległy bok.`,
        },
      ],
    },
    {
      slug: 'planimetria-pola',
      title: 'Twierdzenie Pitagorasa, sinusy, cosinusy i pola',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['VII.2', 'VII.3'],
      objectives: [
        'Stosujesz twierdzenie Pitagorasa i odwrotność',
        'Obliczasz boki i kąty z twierdzeń o sinusach i cosinusach',
        'Obliczasz pola trójkątów i wielokątów',
      ],
      skills: [
        { slug: 'planimetria-pitagoras', name: 'Twierdzenie Pitagorasa', description: 'Stosuje twierdzenie Pitagorasa i jego odwrotność do badania kątów trójkąta.', level: 'basic' },
        { slug: 'planimetria-sinusy-cosinusy', name: 'Twierdzenia o sinusach i cosinusach', description: 'Wyznacza boki i kąty trójkąta z twierdzenia o sinusach i twierdzenia o cosinusach.', level: 'extended' },
        { slug: 'planimetria-pola', name: 'Pola figur', description: 'Oblicza pola trójkątów, równoległoboków, trapezów i wielokątów.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Trzy twierdzenia — Pitagorasa, o sinusach i o cosinusach — pozwalają policzyć w trójkącie wszystko, co jest nieznane, jeśli znasz odpowiednio trzy elementy: dwa boki i kąt między nimi albo trzy boki.',
        },
        {
          type: 'formula',
          title: 'Twierdzenie Pitagorasa',
          body: 'Dla trójkąta prostokątnego o przyprostokątnych $a$ i $b$ oraz przeciwprostokątnej $c$:',
          formula: 'a^{2} + b^{2} = c^{2}',
        },
        {
          type: 'example',
          title: 'Przykład — Pitagoras',
          body: 'Trójkąt prostokątny ma przyprostokątne $9$ i $12$. Przeciwprostokątna: $c = \\sqrt{81 + 144} = \\sqrt{225} = 15$. Odwrotnie: jeśli boki mają długości $8$, $15$ i $17$, to $8^{2} + 15^{2} = 64 + 225 = 289 = 17^{2}$, więc trójkąt jest prostokątny — to najszybszy test na kąt $90^{\\circ}$.',
        },
        {
          type: 'formula',
          title: 'Twierdzenie o cosinusach',
          body: 'Dla dowolnego trójkąta, gdy $c$ leży naprzeciw kąta $\\gamma$ (a $a$, $b$ są bokami przy tym kącie):',
          formula: 'c^{2} = a^{2} + b^{2} - 2ab \\cos \\gamma',
        },
        {
          type: 'formula',
          title: 'Twierdzenie o sinusach',
          body: 'Stosunek długości boku do sinusa przeciwległego kąta jest stały — to „prawo sinusów”:',
          formula: '\\frac{a}{\\sin \\alpha} = \\frac{b}{\\sin \\beta} = \\frac{c}{\\sin \\gamma} = 2R',
        },
        {
          type: 'paragraph',
          title: 'Którą drogę wybrać?',
          body: 'Znając dwa boki i kąt między nimi, wybierz twierdzenie o cosinusach — zawsze działa. Znając dwa boki i kąt naprzeciw jednego z nich, użyj prawa sinusów. Znając trzy boki, jedynie twierdzenie o cosinusach daje kąt.',
        },
        {
          type: 'example',
          title: 'Przykład — cosinusy',
          body: 'Dwa boki mają długość $5$ i $8$, a kąt między nimi $60^{\\circ}$. Trzeci bok: $c^{2} = 25 + 64 - 2 \\cdot 5 \\cdot 8 \\cdot \\cos 60^{\\circ} = 89 - 80 \\cdot \\frac{1}{2} = 49$, więc $c = 7$.',
        },
        {
          type: 'formula',
          title: 'Pola figur płaskich',
          body: 'Najczęściej używane wzory na pole:',
          formula: 'P_{\\text{trójkąt}} = \\frac{1}{2} \\cdot a \\cdot h_a = \\frac{1}{2} ab \\sin \\gamma \\qquad P_{\\text{romb}} = \\frac{d_{1} d_{2}}{2} \\qquad P_{\\text{trap}} = \\frac{(a + b) \\cdot h}{2}',
        },
        {
          type: 'example',
          title: 'Przykład — pole trójkąta',
          body: 'Trójkąt ma dwa boki $6$ i $8$ oraz kąt między nimi $30^{\\circ}$. Pole: $P = \\frac{1}{2} \\cdot 6 \\cdot 8 \\cdot \\sin 30^{\\circ} = 24 \\cdot \\frac{1}{2} = 12$. Zwróć uwagę: to samo pole możesz policzyć z podstawy i wysokości — wynik musi się zgodzić.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Użycie prawa sinusów bez upewnienia się, który kąt leży naprzeciw danego boku.
• Zapomnienie o kącie $90^{\\circ}$: dla niego $\\cos \\gamma = 0$ i twierdzenie o cosinusach staje się Pitagorasem.
• Mylenie wzoru na pole rombu (przekątne) z polem równoległoboku (podstawa · wysokość).`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'W szpitalnym zwrocie „pole trójkąta to połowa iloczynu dwóch boków i sinusa kąta między nimi” — zapisz wzór od razu, wtedy nie pomylisz się o czynnik $\\frac{1}{2}$.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $a^{2} + b^{2} = c^{2}$ — tylko dla kąta prostego; odwrotność daje test na prostokątność.
• $c^{2} = a^{2} + b^{2} - 2ab\\cos \\gamma$ — dwa boki i kąt między nimi.
• $\\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta} = \\frac{c}{\\sin\\gamma}$ — prawo sinusów.
• $P_{\\text{trójkąta}} = \\frac{1}{2} ab \\sin \\gamma$.`,
        },
      ],
    },
    {
      slug: 'planimetria-okrag',
      title: 'Okrąg: kąty, okrąg opisany i wpisany',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['VII.4', 'VII.5'],
      objectives: [
        'Obliczasz kąty wpisane i środkowe na podstawie łuków',
        'Wykorzystujesz własności okręgu opisanego i wpisanego',
        'Rozpoznajesz zastosowania wzoru na promień okręgu opisanego i wpisanego',
      ],
      skills: [
        { slug: 'planimetria-katy-okregu', name: 'Kąty w okręgu', description: 'Oblicza kąty wpisane, środkowe i odcinkowe na podstawie łuków.', level: 'basic' },
        { slug: 'planimetria-okregi', name: 'Okrąg opisany i wpisany', description: 'Wykorzystuje własności okręgu opisanego, wpisanego i promienia okręgu wpisanego w trójkącie.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Okrąg to najbogatszy w zależności obiekt planimetrii. Wszystko opiera się na jednej zasadzie: kąt wpisany powiązany z danym łukiem to połowa kąta środkowego na ten sam łuk.',
        },
        {
          type: 'formula',
          title: 'Kąty wpisane i środkowe',
          body: 'Kąt wpisany oparty na łuku o mierze $\\alpha^{\\circ}$ ma miarę równą połowie kąta środkowego na ten łuk:',
          formula: '\\angle ABC = \\frac{1}{2} \\angle AOC',
        },
        {
          type: 'paragraph',
          title: 'Kąty na tym samym łuku',
          body: 'Kąty wpisane oparte na tym samym łuku są równe. Kąty wpisane oparte na łukach dopełniających (łączna miara łuków $180^{\\circ}$) sumują się do $90^{\\circ}$.',
        },
        {
          type: 'example',
          title: 'Przykład — kąty w okręgu',
          body: 'Dwie cięciwy przecinają się wewnątrz okręgu i tworzą czworokąt wpisany; suma jego kątów przeciwległych wynosi $180^{\\circ}$. Dla kąta $70^{\\circ}$ między cięciwami kąt przeciwległy ma więc $110^{\\circ}$. Z kolei dwa kąty wpisane oparte na tym samym łuku są równe — to najszybsza droga zamiast liczenia łuków po kolei.',
        },
        {
          type: 'heading',
          title: 'Okrąg opisany i wpisany',
          body: 'Okrąg opisany przechodzi przez wszystkie wierzchołki trójkąta — musi więc być trójkąt ostry, aby istniał. Okrąg wpisany dotyka wszystkich boków. Ich środki działają wzdłuż prostych łączących wierzchołek ze środkiem przeciwległej strony.',
        },
        {
          type: 'formula',
          title: 'Wzory na promienie',
          body: 'Dla trójkąta o polu $P$ i obwodzie $2s$, gdzie $a$, $b$, $c$ to długości boków:',
          formula: 'R = \\frac{abc}{4P} \\qquad r = \\frac{P}{s}',
        },
        {
          type: 'example',
          title: 'Przykład — promień okręgu wpisanego',
          body: 'Trójkąt prostokątny o przyprostokątnych $3$ i $4$ ma pole $6$, a obwód $12$, więc $s = 6$. Promień okręgu wpisanego: $r = \\frac{P}{s} = \\frac{6}{6} = 1$. Promień okręgu opisanego to połowa przeciwprostokątnej: $R = \\frac{5}{2} = 2{,}5$.',
        },
        {
          type: 'heading',
          title: 'Styczna do okręgu',
          body: 'Promień prowadzący do punktu styczności jest prostopadły do stycznej. Kąt między dwiema siecznymi wyprowadzonymi z punktu zewnętrznego ma miarę połowy różnicy łuków wyznaczonych przez punkty przecięcia.',
        },
        {
          type: 'example',
          title: 'Przykład — kąt z zewnętrza',
          body: 'Z punktu $S$ leżącego poza okręgiem poprowadzono dwie sieczne przecinające okrąg w punktach $A$, $B$ i $C$, $D$. Kąt między siecznymi ma miarę $40^{\\circ}$, a łuk $AB$ ma miarę $60^{\\circ}$. Kąt zewnętrzny to połowa różnicy łuków: $\\frac{1}{2}(\\overset{\\frown}{CD} - \\overset{\\frown}{AB}) = 40^{\\circ}$, więc łuk $CD$ ma miarę $140^{\\circ}$.',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie połowy kąta środkowego z pełnym kątem — kąt wpisany to zawsze połowa.
• Użycie wzoru na $R$ w trójkącie, który nie ma okręgu opisanego (kąt nieostry).
• Zapominanie, że $s$ to połowa obwodu, a nie cały obwód, we wzorze na $r$.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Rysuj okrąg i zaznaczaj łuki łukami z literami — zadania o kąty na okręgu stają się wtedy czytelne jak zwykłe zdanie.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Kąt wpisany = połowa kąta środkowego na ten sam łuk.
• Kąty na łukach dopełniających sumują się do $90^{\\circ}$.
• $R = \\frac{abc}{4P}$, a $r = \\frac{P}{s}$, gdzie $s$ to półobwód.`,
        },
      ],
    },
  ],
}
