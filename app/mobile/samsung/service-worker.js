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

// Install
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
    );
});

// Activate
self.addEventListener('activate', event => {
    self.clients.claim();
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
        ))
    );
});

// Fetch
self.addEventListener('fetch', event => {
    // Als request splash.html, fetch network direct, geen caching
    if (event.request.url.includes('splash.html')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Anders: probeer cache first, fallback offline
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request)
                .then(resp => {
                    // async cache, blokkeer response niet
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, resp.clone()));
                    return resp;
                })
                .catch(() => caches.match('/app/mobile/samsung/offline.html'));
        })
    );
});
