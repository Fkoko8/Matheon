import type { MetadataRoute } from 'next'

/**
 * Manifest PWA — instalowalna aplikacja na telefonie.
 *
 * Ikony są generowane skryptem `pnpm icons:generate` (rastrowe 192/512 px wymagane
 * przez przeglądarki + osobna wersja `maskable` z pełnym tłem i mniejszym znakiem).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MATHEON — system nauki do matury z matematyki',
    short_name: 'MATHEON',
    description: 'Plan nauki, bank zadań, powtórki SM-2 i arkusze maturalne w jednym miejscu.',
    lang: 'pl',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#08080d',
    theme_color: '#08080d',
    categories: ['education', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcuts: [
      { name: 'Trening z banku zadań', short_name: 'Trening', url: '/tasks' },
      { name: 'Powtórki na dziś', short_name: 'Powtórki', url: '/review' },
      { name: 'Arkusze maturalne', short_name: 'Arkusze', url: '/exams' },
      { name: 'Statystyki', short_name: 'Statystyki', url: '/stats' },
    ],
  }
}
