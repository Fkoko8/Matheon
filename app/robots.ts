import type { MetadataRoute } from 'next'

/**
 * Uczniowskie trasy są za loginem, więc indeksujemy tylko ścieżki publiczne.
 * URL produkcyjny ustawiamy przez `NEXT_PUBLIC_SITE_URL` (Vercel) — fallback lokalny.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/reset-password'],
        disallow: [
          '/learn',
          '/tasks',
          '/exams',
          '/review',
          '/mistakes',
          '/plan',
          '/ai',
          '/map',
          '/stats',
          '/profile',
          '/settings',
          '/generator',
          '/onboarding',
          '/api',
          '/auth',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
