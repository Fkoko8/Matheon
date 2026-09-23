/**
 * Tablice matematyczne dostępne w trybie egzaminu.
 *
 * Na maturze uczeń dostaje od CKE zestaw „Wybrane wzory matematyczne” — ten panel
 * odtwarza jego rolę: wszystko, czego na egzaminie nie trzeba pamiętać, jest pod ręką,
 * a mimo to nie podpowiada treści zadania ani wyniku.
 */
export interface FormulaItem {
  label: string
  latex: string
}

export interface FormulaSection {
  id: string
  title: string
  items: FormulaItem[]
}

export const formulaSheet: FormulaSection[] = [
  {
    id: 'podstawy',
    title: 'Wartość bezwzględna, potęgi, logarytmy',
    items: [
      { label: 'Definicja wartości bezwzględnej', latex: '|x|=\\begin{cases}x & \\text{dla } x\\geq 0\\\\ -x & \\text{dla } x<0\\end{cases}' },
      { label: 'Wartość bezwzględna, gdy a > 0', latex: '|x|<a \\iff -a<x<a,\\qquad |x|>a \\iff x<-a \\ \\text{ lub } \\ x>a' },
      { label: 'Nierówność między średnimi', latex: '\\frac{a+b}{2}\\geq\\sqrt{ab}\\quad (a,b\\geq 0)' },
      { label: 'Działania na potęgach', latex: 'a^{m}\\cdot a^{n}=a^{m+n},\\quad \\frac{a^{m}}{a^{n}}=a^{m-n},\\quad (a^{m})^{n}=a^{mn},\\quad (ab)^{n}=a^{n}b^{n}' },
      { label: 'Potęgi o wykładniku wymiernym', latex: 'a^{-n}=\\frac{1}{a^{n}},\\qquad a^{\\frac{m}{n}}=\\sqrt[n]{a^{m}}' },
      { label: 'Pierwiastki', latex: '\\sqrt[n]{a^{m}}=a^{\\frac{m}{n}},\\qquad \\sqrt{ab}=\\sqrt{a}\\,\\sqrt{b},\\qquad \\sqrt{\\frac{a}{b}}=\\frac{\\sqrt{a}}{\\sqrt{b}}' },
      { label: 'Definicja logarytmu', latex: '\\log_{a}b=c \\iff a^{c}=b\\quad (a>0,\\ a\\neq 1,\\ b>0)' },
      { label: 'Działania na logarytmach', latex: '\\log_{a}(x y)=\\log_{a}x+\\log_{a}y,\\quad \\log_{a}\\frac{x}{y}=\\log_{a}x-\\log_{a}y,\\quad \\log_{a}x^{r}=r\\log_{a}x' },
      { label: 'Zmiana podstawy logarytmu', latex: '\\log_{a}b=\\frac{\\log_{c}b}{\\log_{c}a}' },
      { label: 'Procent składany', latex: 'K_{n}=K_{0}\\left(1+\\frac{p}{100}\\right)^{n}' },
    ],
  },
  {
    id: 'algebra',
    title: 'Wzory skróconego mnożenia',
    items: [
      { label: 'Kwadrat sumy i różnicy', latex: '(a+b)^{2}=a^{2}+2ab+b^{2},\\qquad (a-b)^{2}=a^{2}-2ab+b^{2}' },
      { label: 'Różnica kwadratów', latex: 'a^{2}-b^{2}=(a-b)(a+b)' },
      { label: 'Sześcian sumy i różnicy', latex: '(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3},\\qquad (a-b)^{3}=a^{3}-3a^{2}b+3ab^{2}-b^{3}' },
      { label: 'Suma i różnica sześcianów', latex: 'a^{3}+b^{3}=(a+b)(a^{2}-ab+b^{2}),\\qquad a^{3}-b^{3}=(a-b)(a^{2}+ab+b^{2})' },
    ],
  },
  {
    id: 'kwadratowa',
    title: 'Funkcja kwadratowa',
    items: [
      { label: 'Postacie trójmianu', latex: 'y=ax^{2}+bx+c=a(x-p)^{2}+q=a(x-x_{1})(x-x_{2})' },
      { label: 'Wyróżnik i pierwiastki', latex: '\\Delta=b^{2}-4ac,\\qquad x_{1,2}=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}\\ \\ (\\Delta\\geq 0)' },
      { label: 'Współrzędne wierzchołka', latex: 'p=\\frac{-b}{2a},\\qquad q=\\frac{-\\Delta}{4a}' },
      { label: 'Wzory Viète’a', latex: 'x_{1}+x_{2}=\\frac{-b}{a},\\qquad x_{1}\\cdot x_{2}=\\frac{c}{a}' },
      { label: 'Postać iloczynowa, gdy Δ > 0', latex: 'y=a(x-x_{1})(x-x_{2})' },
    ],
  },
  {
    id: 'ciagi',
    title: 'Ciągi',
    items: [
      { label: 'Ciąg arytmetyczny — n-ty wyraz', latex: 'a_{n}=a_{1}+(n-1)r' },
      { label: 'Ciąg arytmetyczny — suma', latex: 'S_{n}=\\frac{a_{1}+a_{n}}{2}\\cdot n' },
      { label: 'Ciąg geometryczny — n-ty wyraz', latex: 'a_{n}=a_{1}q^{\\,n-1}' },
      { label: 'Ciąg geometryczny — suma', latex: 'S_{n}=a_{1}\\cdot\\frac{1-q^{n}}{1-q}\\quad (q\\neq 1)' },
      { label: 'Szereg geometryczny', latex: 'S=\\frac{a_{1}}{1-q}\\quad (|q|<1)' },
      { label: 'Granica ciągu geometrycznego', latex: 'q^{n}\\to 0\\ \\text{dla}\\ |q|<1,\\qquad q^{n}\\to\\infty\\ \\text{dla}\\ q>1' },
    ],
  },
  {
    id: 'trygonometria',
    title: 'Trygonometria',
    items: [
      { label: 'Jedynka trygonometryczna', latex: '\\sin^{2}\\alpha+\\cos^{2}\\alpha=1' },
      { label: 'Tangens i cotangens', latex: '\\operatorname{tg}\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha},\\qquad \\operatorname{ctg}\\alpha=\\frac{\\cos\\alpha}{\\sin\\alpha}' },
      { label: 'Sinus i cosinus sumy i różnicy', latex: '\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta,\\qquad \\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta' },
      { label: 'Podwojony kąt', latex: '\\sin 2\\alpha=2\\sin\\alpha\\cos\\alpha,\\qquad \\cos 2\\alpha=\\cos^{2}\\alpha-\\sin^{2}\\alpha' },
      { label: 'Wartości dla kątów 30°, 45°, 60°', latex: '\\sin 30^{\\circ}=\\tfrac{1}{2},\\ \\sin 45^{\\circ}=\\tfrac{\\sqrt{2}}{2},\\ \\sin 60^{\\circ}=\\tfrac{\\sqrt{3}}{2}' },
      { label: 'Twierdzenie sinusów', latex: '\\frac{a}{\\sin\\alpha}=\\frac{b}{\\sin\\beta}=\\frac{c}{\\sin\\gamma}=2R' },
      { label: 'Twierdzenie cosinusów', latex: 'c^{2}=a^{2}+b^{2}-2ab\\cos\\gamma' },
    ],
  },
  {
    id: 'planimetria',
    title: 'Planimetria',
    items: [
      { label: 'Pole trójkąta', latex: 'P=\\tfrac{1}{2}ah=\\tfrac{1}{2}ab\\sin\\gamma=\\sqrt{p(p-a)(p-b)(p-c)}' },
      { label: 'Pole trójkąta równobocznego', latex: 'P=\\frac{a^{2}\\sqrt{3}}{4},\\qquad h=\\frac{a\\sqrt{3}}{2}' },
      { label: 'Pola czworokątów', latex: 'P_{\\text{równoległobok}}=ah,\\qquad P_{\\text{romb}}=\\tfrac{1}{2}d_{1}d_{2},\\qquad P_{\\text{trapez}}=\\tfrac{1}{2}(a+b)h' },
      { label: 'Kąty w okręgu', latex: '\\alpha_{\\text{środkowy}}=2\\alpha_{\\text{wpisany}}' },
      { label: 'Długość okręgu i pole koła', latex: 'L=2\\pi r,\\qquad P=\\pi r^{2}' },
      { label: 'Wycinek koła', latex: 'P=\\frac{\\alpha}{360^{\\circ}}\\pi r^{2},\\qquad L=\\frac{\\alpha}{360^{\\circ}}\\cdot 2\\pi r' },
    ],
  },
  {
    id: 'stereometria',
    title: 'Stereometria',
    items: [
      { label: 'Graniastosłup i ostrosłup', latex: 'V=P_{p}\\cdot H,\\qquad V=\\tfrac{1}{3}P_{p}\\cdot H' },
      { label: 'Walec', latex: 'V=\\pi r^{2}H,\\qquad P_{c}=2\\pi r^{2}+2\\pi rH' },
      { label: 'Stożek', latex: 'V=\\tfrac{1}{3}\\pi r^{2}H,\\qquad P_{c}=\\pi r^{2}+\\pi rl' },
      { label: 'Kula', latex: 'V=\\tfrac{4}{3}\\pi r^{3},\\qquad P=4\\pi r^{2}' },
      { label: 'Przekątna prostopadłościanu', latex: 'd=\\sqrt{a^{2}+b^{2}+c^{2}}' },
    ],
  },
  {
    id: 'analityczna',
    title: 'Geometria analityczna',
    items: [
      { label: 'Odległość punktów', latex: '|AB|=\\sqrt{(x_{B}-x_{A})^{2}+(y_{B}-y_{A})^{2}}' },
      { label: 'Środek odcinka', latex: 'S=\\left(\\frac{x_{A}+x_{B}}{2},\\ \\frac{y_{A}+y_{B}}{2}\\right)' },
      { label: 'Równanie okręgu', latex: '(x-a)^{2}+(y-b)^{2}=r^{2}' },
      { label: 'Odległość punktu od prostej', latex: 'd=\\frac{|Ax_{0}+By_{0}+C|}{\\sqrt{A^{2}+B^{2}}}' },
      { label: 'Proste prostopadłe', latex: 'y=a_{1}x+b_{1}\\ \\perp\\ y=a_{2}x+b_{2} \\iff a_{1}a_{2}=-1' },
      { label: 'Pole trójkąta z wierzchołków', latex: 'P=\\tfrac{1}{2}\\left|(x_{B}-x_{A})(y_{C}-y_{A})-(y_{B}-y_{A})(x_{C}-x_{A})\\right|' },
    ],
  },
  {
    id: 'kombinatoryka',
    title: 'Kombinatoryka i prawdopodobieństwo',
    items: [
      { label: 'Podstawowa zasada kombinatoryki', latex: '|A\\times B|=|A|\\cdot|B|' },
      { label: 'Permutacje, kombinacje', latex: 'P_{n}=n!,\\qquad \\binom{n}{k}=\\frac{n!}{k!(n-k)!}' },
      { label: 'Prawdopodobieństwo klasyczne', latex: 'P(A)=\\frac{|A|}{|\\Omega|}' },
      { label: 'Prawdopodobieństwo warunkowe', latex: 'P(A|B)=\\frac{P(A\\cap B)}{P(B)}\\quad (P(B)>0)' },
      { label: 'Prawdopodobieństwo całkowite', latex: 'P(A)=P(A|B_{1})P(B_{1})+P(A|B_{2})P(B_{2})+\\ldots' },
      { label: 'Niezależność zdarzeń', latex: 'P(A\\cap B)=P(A)\\cdot P(B)' },
    ],
  },
  {
    id: 'statystyka',
    title: 'Statystyka',
    items: [
      { label: 'Średnia arytmetyczna', latex: '\\bar{x}=\\frac{x_{1}+x_{2}+\\ldots+x_{n}}{n}' },
      { label: 'Średnia ważona', latex: '\\bar{x}=\\frac{w_{1}x_{1}+w_{2}x_{2}+\\ldots+w_{n}x_{n}}{w_{1}+w_{2}+\\ldots+w_{n}}' },
      { label: 'Wariancja i odchylenie standardowe', latex: '\\sigma^{2}=\\frac{(x_{1}-\\bar{x})^{2}+\\ldots+(x_{n}-\\bar{x})^{2}}{n},\\qquad \\sigma=\\sqrt{\\sigma^{2}}' },
      { label: 'Mediana', latex: '\\text{dla parzystego } n:\\ \\ m=\\frac{x_{\\frac{n}{2}}+x_{\\frac{n}{2}+1}}{2}' },
    ],
  },
  {
    id: 'obliczenia',
    title: 'Przydatne przy rachunkach',
    items: [
      { label: 'Wzory na ruch i pracę', latex: 'v=\\frac{s}{t},\\qquad \\text{wydajność}=\\frac{\\text{praca}}{\\text{czas}}' },
      { label: 'Zamiana jednostek', latex: '1\\ \\text{km}=1000\\ \\text{m},\\qquad 1\\ \\text{ha}=10\\,000\\ \\text{m}^{2},\\qquad 1\\ \\text{m}^{3}=1000\\ \\text{l}' },
      { label: 'Twierdzenie o reszcie', latex: 'W(x)=(x-a)Q(x)+W(a)' },
      { label: 'Składnia logarytmu naturalnego', latex: 'e\\approx 2{,}718,\\qquad \\ln x=\\log_{e}x' },
    ],
  },
]

export const formulaSheetSectionCount = formulaSheet.length
export const formulaSheetItemCount = formulaSheet.reduce((sum, section) => sum + section.items.length, 0)
