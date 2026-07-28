// Reform by Energym service worker.
// - /api is NEVER cached (live availability and private data stay live)
// - hashed build assets: cache-first
// - navigations: network-first with cached-shell fallback so the installed
//   app opens during temporary connection loss
// - web push + notification click handling
const CACHE = 'reform-v3'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return
  const url = new URL(request.url)

  // live data + private uploads: network only
  if (url.pathname.startsWith('/api/')) return

  // navigations: network first, fall back to the cached app shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  // static assets: cache first, then network
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
      }
      return response
    }).catch(() => hit)),
  )
})

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Reform by Energym', body: event.data?.text() || '' } }
  event.waitUntil(self.registration.showNotification(data.title || 'Reform by Energym', {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { link: data.link || '/' },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) { client.navigate(link); return client.focus() }
      }
      return self.clients.openWindow(link)
    }),
  )
})
