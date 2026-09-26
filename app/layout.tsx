import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'
import 'katex/dist/katex.min.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MATHEON — Twój system nauki matematyki',
  description: 'Nowoczesna platforma do przygotowania do matury podstawowej i rozszerzonej.',
  generator: 'v0.app',
  applicationName: 'MATHEON',
  openGraph: {
    type: 'website',
    siteName: 'MATHEON',
    locale: 'pl_PL',
    url: siteUrl,
    title: 'MATHEON — Twój system nauki do matury z matematyki',
    description: 'Teoria, zadania, powtórki SM-2, arkusze i AI Tutor — wszystko dopasowane do wymagań CKE (Formuła 2023).',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MATHEON — Twój system nauki do matury z matematyki',
    description: 'Teoria, zadania, powtórki SM-2, arkusze i AI Tutor — dopasowane do wymagań CKE.',
  },
  // Instalacja jako aplikacja: `app/manifest.ts` + ikony generowane `pnpm icons:generate`.
  appleWebApp: { capable: true, title: 'MATHEON', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  // `viewportFit: cover` + `env(safe-area-inset-*)` w shelu: dolna nawigacja nie
  // wchodzi pod pasek gestów iPhone'ów.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl" className="dark">
      <body className="antialiased">
        {children}
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
