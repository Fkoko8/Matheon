/**
 * MATHEON — service worker (offline shell).
 *
 * Zasady, których pilnuje:
 * - nawigacje są network-first: online zawsze dostajesz świeżą aplikację,
 *   offline wracasz do ostatniej zapisanej strony lub ekranu /offline,
 * - cache-first dotyczy wyłącznie statycznych zasobów Next.js i obrazów,
 * - żadne żądanie do /api/, Supabase ani AI nie jest cache'owane — dane ucznia
 *   nie mogą pochodzić z cache service workera.
 */
const CACHE = 'matheon-shell-v1'
const OFFLINE_URL = '/offline'
const PRECACHE = [OFFLINE_URL, '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/icon.svg']

const STATIC_PATTERN = /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf)$/

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // Pojedynczy brakujący plik nie może wywalić całej instalacji.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

async function networkFirst(request) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    const offline = await cache.match(OFFLINE_URL)
    if (offline) return offline
    return new Response('MATHEON jest chwilowo niedostępny offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) cache.put(request, response.clone())
    return response
  } catch (error) {
    if (cached) return cached
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  if (url.pathname.startsWith('/_next/static/') || STATIC_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirst(request))
  }
  // Pozostałe żądania (RSC, dane sesji) obsługuje przeglądarka — bez cache SW.
})
