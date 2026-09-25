import type { ContentTopic } from '@/content/types'

export const stereometria: ContentTopic = {
  slug: 'stereometria',
  title: 'Stereometria',
  description: 'Objętości i pola powierzchni graniastosłupów, ostrosłupów i brył obrotowych oraz kąty między krawędziami i ścianami, przekroje brył i odległości w przestrzeni.',
  level: 'basic',
  lessons: [
    {
      slug: 'stereometria-objetosci',
      title: 'Objętości i pola powierzchni brył',
      durationMinutes: 30,
      difficulty: 3,
      requirements: ['IX.1'],
      objectives: [
        'Obliczasz objętość graniastosłupa, ostrosłupa i stożka',
        'Obliczasz objętość walca i kuli',
        'Obliczasz pole powierzchni całkowitej brył',
      ],
      skills: [
        { slug: 'stereometria-objetosci', name: 'Objętości brył', description: 'Oblicza objętość graniastosłupów, ostrosłupów i brył obrotowych.', level: 'basic' },
        { slug: 'stereometria-pola-bryly', name: 'Pola powierzchni brył', description: 'Oblicza i rozkłada pole powierzchni całkowitej brył na elementy.', level: 'basic' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Stereometria to geometria w trzech wymiarach. Wzory są nieliczne, ale wymagają konsekwencji: najpierw znajdź w podstawie to, czego szukasz, i dopiero potem licz objętość.',
        },
        {
          type: 'formula',
          title: 'Objętości brył',
          figure: {
            kind: 'geometry',
            caption: 'Prostopadłościan o krawędziach a, b, c: V = a · b · c, czyli V = Pp · h dla graniastosłupa.',
            elements: [
              { type: 'polyline', points: [[0, 0], [4, 0], [4, 2.5], [0, 2.5]], closed: true, color: 'violet' },
              { type: 'polyline', points: [[1.4, 1], [5.4, 1], [5.4, 3.5], [1.4, 3.5]], closed: true, color: 'slate', dashed: true },
              { type: 'segment', a1: [0, 0], a2: [1.4, 1], color: 'slate' },
              { type: 'segment', a1: [4, 0], a2: [5.4, 1], color: 'slate' },
              { type: 'segment', a1: [4, 2.5], a2: [5.4, 3.5], color: 'slate' },
              { type: 'segment', a1: [0, 2.5], a2: [1.4, 3.5], color: 'slate' },
              { type: 'namedPoint', id: 'A', at: [0, 0] },
              { type: 'namedPoint', id: 'B', at: [4, 0] },
              { type: 'namedPoint', id: 'C', at: [4, 2.5] },
              { type: 'namedPoint', id: 'D', at: [0, 2.5] },
              { type: 'namedPoint', id: 'A1', at: [1.4, 1] },
              { type: 'namedPoint', id: 'B1', at: [5.4, 1] },
              { type: 'namedPoint', id: 'C1', at: [5.4, 3.5] },
              { type: 'namedPoint', id: 'D1', at: [1.4, 3.5] },
            ],
            labels: { A: 'A', B: 'B', C: 'C', D: 'D', A1: "A'", B1: "B'", C1: "C'", D1: "D'" },
          },
          body: 'Najczęściej używane wzory na objętość:',
          formula: 'V_{\\text{graniastosłup}} = P_{p} \\cdot h \\qquad V_{\\text{ostrosłup}} = \\frac{1}{3} P_{p} \\cdot h \\qquad V_{\\text{walec}} = \\pi r^{2} h \\qquad V_{\\text{stożek}} = \\frac{1}{3} \\pi r^{2} h \\qquad V_{\\text{kula}} = \\frac{4}{3} \\pi r^{3}',
        },
        {
          type: 'paragraph',
          title: 'Różnica między walcem a ostrosłupem',
          body: 'Ostrosłup to „trzecia część” odpowiedniego graniastosłupa, stąd czynnik $\\frac{1}{3}$. Ten sam czynnik dzieli objętość stożka względem walca o tej samej podstawie i wysokości. Warto zapamiętać to jako proporcję, nie jako osobne wzory.',
        },
        {
          type: 'example',
          title: 'Przykład — ostrosłup',
          body: 'Podstawą ostrosłupa jest kwadrat o boku $6$ cm, a wysokość ma długość $10$ cm. Pole podstawy $P_{p} = 36$ cm², więc $V = \\frac{1}{3} \\cdot 36 \\cdot 10 = 120$ cm³. Gdyby to był graniastosłup, objętość byłaby trzykrotnie większa: $360$ cm³.',
        },
        {
          type: 'formula',
          title: 'Pole powierzchni całkowitej',
          body: 'Pole powierzchni to suma pól podstaw i wszystkich ścian bocznych:',
          formula: 'P_{\\text{całk}} = 2P_{p} + P_{b} \\quad \\text{(walec, graniastosłup)} \\qquad P_{\\text{całk}} = P_{p} + P_{b} \\quad \\text{(stożek, ostrosłup)} \\qquad P_{\\text{całk}} = 4\\pi r^{2} \\quad \\text{(kula)}',
        },
        {
          type: 'example',
          title: 'Przykład — pole powierzchni walca',
          body: 'Walec o promieniu $3$ cm i wysokości $8$ cm: pole całkowite to dwie podstawy i obwód podstawy razy wysokość, czyli $2 \\cdot \\pi \\cdot 3^{2} + 2 \\cdot \\pi \\cdot 3 \\cdot 8 = 18\\pi + 48\\pi = 66\\pi$ cm².',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Użycie wzoru na walec zamiast na ostrosłup — brakuje czynnika $\\frac{1}{3}$.
• Pomylenie pola powierzchni całkowitej z polem podstawy.
• Zapomnienie, że wysokość ostrosłupa to odcinek prostopadły do podstawy, a nie krawędź boczna.`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Jeśli podstawą jest wielokąt, którego nie umiesz liczyć „na wlość”, rozłóż go na trójkąty i zsumuj pola — to technika, która rozwiązuje wiele zadań.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• $V_{\\text{graniastosłup}} = P_{p} h$, a $V_{\\text{ostrosłup}} = \\frac{1}{3} P_{p} h$.
• $V_{\\text{walec}} = \\pi r^{2} h$, $V_{\\text{stożek}} = \\frac{1}{3} \\pi r^{2} h$, $V_{\\text{kula}} = \\frac{4}{3} \\pi r^{3}$.
• $P_{\\text{całk}}$ to podstawy plus wszystkie ściany boczne.`,
        },
      ],
    },
    {
      slug: 'stereometria-katy-odleglosci',
      title: 'Kąty w bryłach, przekroje i odległości',
      durationMinutes: 30,
      difficulty: 4,
      requirements: ['IX.2', 'IX.3'],
      objectives: [
        'Wyznaczasz kąty między krawędziami i ścianami',
        'Rozpoznajesz przekroje brył i rysujesz je',
        'Obliczasz odległości punktów w przestrzeni',
      ],
      skills: [
        { slug: 'stereometria-katy', name: 'Kąty w bryłach', description: 'Wyznacza kąty między krawędziami, ścianami i krawędzią podstawy.', level: 'basic' },
        { slug: 'stereometria-przekroje', name: 'Przekroje brył', description: 'Rozpoznaje i rysuje przekroje brył oraz wyznacza kąty między płaszczyznami.', level: 'extended' },
      ],
      blocks: [
        {
          type: 'paragraph',
          title: 'Cel lekcji',
          body: 'Trójwymiarowe kąty wyglądają groźnie, ale prawie zawsze sprowadzają się do trójkąta w płaszczyźnie przekroju. Twoim zadaniem jest znaleźć właściwy przekrój, a potem obliczyć kąt zwykłym twierdzeniem o trójkącie.',
        },
        {
          type: 'formula',
          title: 'Kąt między prostą a płaszczyzną',
          body: 'Kąt między prostą a płaszczyzną to kąt między prostą a jej rzutem na tę płaszczyznę. Aby go wyznaczyć, wykonaj rzut prostopadły:',
          formula: '\\sin \\varphi = \\frac{h_{\\text{rzut prostopadły}}}{d_{\\text{prosta}}}',
        },
        {
          type: 'example',
          title: 'Przykład — kąt nachylenia krawędzi',
          body: 'W ostrosłupie prawidłowym czworokątnym wszystkie krawędzie boczne mają długość $13$ cm, a podstawa to kwadrat o boku $10$ cm. Wysokość ostrosłupa przechodzi przez środek podstawy, więc rzutem krawędzi bocznej jest odcinek od środka podstawy do wierzchołka podstawy: jego długość to $\\frac{10}{2} \\cdot \\sqrt{2} = 5\\sqrt{2}$. Z twierdzenia o sinusach: wysokość $h = \\sqrt{13^{2} - (5\\sqrt{2})^{2}} = \\sqrt{169 - 50} = \\sqrt{119}$.',
        },
        {
          type: 'heading',
          title: 'Przekroje brył',
          body: 'Przekrój bryły płaszczyzną jest figurą płaską. Najczęstsze typy przekrojów w zadaniach maturalnych: przekrój osiowy (przez wysokość), przekrój podstawowy oraz przekrój zawierający krawędź podstawy i prostopadły do podstawy. Zawsze rysuj bryłę i zaznaczaj ściany, które wchodzą w przekrój.',
        },
        {
          type: 'example',
          title: 'Przykład — przekrój ostrosłupa',
          body: 'Przekrój ostrosłupa czworokątnego zawierający krawędź podstawy $AB$ i prostopadły do podstawy to trójkąt $ABW$, gdzie $W$ to punkt przeciwległej krawędzi podstawy lub jej przedłużenia. Jego pole daje Ci od razu odległość od podstawy do punktu $W$.',
        },
        {
          type: 'formula',
          title: 'Odległość punktu od płaszczyzny',
          body: 'Odległość od płaszczyzny podstawy to wysokość bryły. W przekroju pionowym jest to po prostu odległość od punktu do prostej podstawy — zwykły wzór z geometrii analitycznej lub trójkąta prostokątnego:',
          formula: 'h = \\sqrt{a^{2} - r^{2}} \\quad \\text{(stożek, ostrosłup okrągły)}',
        },
        {
          type: 'warning',
          title: 'Najczęstsze pomyłki',
          body: `• Mylenie krawędzi bocznej z wysokością — wysokość jest prostopadła do podstawy.
• Liczenie kąta między ścianami jako kąta między krawędziami.
• Zapominanie o istnieniu przekrojów, które „wychodzą” poza bryłę (przedłużenie podstawy).`,
        },
        {
          type: 'tip',
          title: 'Wskazówka maturalna',
          body: 'Szukając kąta, najpierw narysuj przekrój zawierający szukany kąt — wtedy problem trójwymiarowy zamienia się w zwykły problem z trójkąta.',
        },
        {
          type: 'summary',
          title: 'Co zapamiętać',
          body: `• Kąt między prostą a płaszczyzną liczy się w odpowiednim przekroju.
• Wysokość ostrosłupa jest prostopadła do podstawy, ale nie musi być krawędzią.
• $h = \\sqrt{a^{2} - r^{2}}$ dla stożka i ostrosłupa okrągłego.`,
        },
      ],
    },
  ],
}
