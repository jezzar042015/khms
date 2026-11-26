const CACHE_NAME = 'khms-app-v1'
const APP_ROOT = new URL('./', self.registration.scope)
const PRECACHE_ASSETS = ["assets/index-CB7sph0h.js","assets/202610-B6Xd0NXr.js","assets/202610-D5NR9Uy-.js","assets/202611-Ba-KLz8d.js","assets/202611-CewoCZTI.js","assets/202611-DSkpJUnY.js","assets/202611-DgWNjLEk.js","assets/202611-DwEIyLIx.js","assets/202611-onqohlo6.js","assets/202611-zKRr2_hZ.js","assets/202612-A3BjibJj.js","assets/202612-B-mA4-P6.js","assets/202612-BCDLvDZA.js","assets/202612-BYws8jhl.js","assets/202612-Bw3VrFcA.js","assets/202612-MQj5XLIz.js","assets/202612-b1WI-jYu.js","assets/202701-B8VpTlUa.js","assets/202701-BVIGDjFo.js","assets/202701-Cutdffe4.js","assets/202701-CvOoyhxl.js","assets/202701-DFsLpusN.js","assets/202701-DrKa0MSt.js","assets/202702-BZ3BFnWy.js","assets/202702-CT4B57XC.js","assets/202702-Ccg9Jlz6.js","assets/202702-DCzyJ4e4.js","assets/202702-DzK-QY10.js","assets/202702-UuWbfarm.js","assets/202703-C3PrSi3h.js","assets/202703-CXYbrLS9.js","assets/202703-ClchzBHN.js","assets/202703-Cm_oW69F.js","assets/202703-DjYvpbGy.js","assets/202703-j_35l6vV.js","assets/202704-AveNqhG1.js","assets/202704-BdlFfpgh.js","assets/202704-Bplay8Cv.js","assets/202704-CpM1DdlR.js","assets/202704-CvoL_Q2T.js","assets/202704-D8JijpNC.js","assets/index-Bx4sXmCD.css","assets/samples-VWBTBAno.png"]
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
