const CACHE_NAME = 'v11';
const URLS_TO_CACHE = [
    '/app/mobile/samsung/decide.html',
    '/app/mobile/samsung/offline.html',
    '/app/mobile/samsung/round-500.png',
    '/assets/images/logo/white.png',
    '/assets/images/logo/black.png',
    '/assets/images/favicon/000000.png',
    '/assets/images/favicon/ffffff.png'
];

// Install: cache decide & offline
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .catch(err => console.error('[SW] Caching fout:', err))
    );
});

// Activate: oude caches verwijderen
self.addEventListener('activate', event => {
    self.clients.claim();
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
        )
    );
});

// Fetch: serveer cached decide/offline, splash altijd network
self.addEventListener('fetch', event => {
    const reqURL = new URL(event.request.url);

    if (reqURL.pathname.includes('splash.html')) {
        return event.respondWith(fetch(event.request)); // splash nooit cache
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).catch(() => caches.match('/app/mobile/samsung/offline.html'));
        })
    );
});
