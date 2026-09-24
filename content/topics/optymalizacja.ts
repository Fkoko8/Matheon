import type { ContentTopic } from '@/content/types'

export const optymalizacja: ContentTopic = {
  slug: 'optymalizacja', title: 'Zadania optymalizacyjne', description: 'Modelujesz wielkości, wyznaczasz optimum za pomocą pochodnej i sprawdzasz wynik.', level: 'extended',
  lessons: [
    { slug: 'optymalizacja-model', title: 'Modelowanie zadania', durationMinutes: 30, difficulty: 4, requirements: ['XII.4'], objectives: ['Zapisujesz zależność jako funkcję jednej zmiennej', 'Ustawiasz dziedzinę'], skills: [{ slug: 'optymalizacja-model', name: 'Modelowanie', description: 'Tworzy model funkcji zależnej od jednej zmiennej.', level: 'extended' }], blocks: [
      { type: 'paragraph', title: 'Jedna zmienna', body: 'W zadaniu optymalizacyjnym często występują dwie wielkości, ale są związane warunkiem. Jedną z nich wyrażasz przez drugą, otrzymując funkcję jednej zmiennej.' },
      { type: 'example', title: 'Model', body: 'Jeśli obwód prostokąta wynosi $20$, a jedna krawędź to $x$, to druga ma długość $10-x$. Pole wynosi $P(x)=x(10-x)$, gdzie $0<x<10$.' },
      { type: 'tip', title: 'Nie zapomnij o dziedzinie', body: 'Warunek zadania ogranicza zmienną. Największe lub najmniejsze wartości sprawdzaj tylko w jej wnętrzu i na końcach, jeśli są dopuszczalne.' },
      { type: 'summary', title: 'Krok 1', body: 'Oznacz zmienną, wyraź drugą wielkość z warunku i zapisz funkcję będącą celem.' },
    ] },
    { slug: 'optymalizacja-pochodna', title: 'Optimum przez pochodną', durationMinutes: 30, difficulty: 5, requirements: ['XII.4'], objectives: ['Wyznaczasz punkty krytyczne', 'Porównujesz wartości funkcji'], skills: [{ slug: 'optymalizacja-pochodna', name: 'Optimum', description: 'Wyznacza maksimum lub minimum funkcji.', level: 'extended' }], blocks: [
      { type: 'example', title: 'Maksymalne pole', body: 'Dla $P(x)=x(10-x)$ mamy $P\'(x)=10-2x$. Warunek $P\'(x)=0$ daje $x=5$, a $P(5)=25$. To największe pole wśród prostokątów o obwodzie $20$.' },
      { type: 'warning', title: 'Punkt krytyczny to za mało', body: 'Sama informacja, że pochodna jest równa zero, nie wystarcza. Porównaj wartości w punkście krytycznym i na końcach przedziału.' },
      { type: 'summary', title: 'Krok 2', body: 'Rozwiąż $f\'(x)=0$, sprawdź znak pochodnej i porównaj wartości funkcji z obszaru domkniętego.' },
    ] },
  ],
}
