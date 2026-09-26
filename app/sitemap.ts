import type { MetadataRoute } from 'next'

/**
 * Mapa strony: cała aplikacja ucznia jest za loginem, więc indeksujemy
 * wyłącznie trasy publiczne. Uzupełnić, gdy powstanie landing marketingowy.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1, lastModified },
    { url: `${siteUrl}/login`, changeFrequency: 'yearly', priority: 0.5, lastModified },
    { url: `${siteUrl}/reset-password`, changeFrequency: 'yearly', priority: 0.1, lastModified },
  ]
}
