const CACHE_NAME = 'khms-app-v1'
const APP_ROOT = new URL('./', self.registration.scope)
const PRECACHE_ASSETS = '__PRECACHE_ASSETS__'
const APP_SHELL = [
  APP_ROOT.href,
  new URL('manifest.webmanifest', APP_ROOT).href,
  new URL('app-192.png', APP_ROOT).href,
  new URL('app-512.png', APP_ROOT).href,
]
const STATIC_ASSET = /\.(?:css|js|png|jpe?g|svg|webp|woff2?|webmanifest)$/i

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([
        ...APP_SHELL,
        ...PRECACHE_ASSETS.map((asset) => new URL(asset, APP_ROOT).href),
      ]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('khms-app-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      let response
      try {
        response = await fetch(request)
      } catch {
        const cachedPage = await caches.match(request)
        return cachedPage || await caches.match(APP_ROOT.href) || Response.error()
      }

      if (response.ok) {
        try {
          const cache = await caches.open(CACHE_NAME)
          await Promise.all([
            cache.put(request, response.clone()),
            cache.put(APP_ROOT.href, response.clone()),
          ])
        } catch (error) {
          console.error('Unable to cache the app page:', error)
        }
      }

      return response
    })())
    return
  }

  if (STATIC_ASSET.test(url.pathname)) {
    event.respondWith((async () => {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) return cachedResponse

      const response = await fetch(request)
      if (response.ok && response.type === 'basic') {
        try {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(request, response.clone())
        } catch (error) {
          console.error('Unable to cache an app asset:', error)
        }
      }
      return response
    })())
  }
})
