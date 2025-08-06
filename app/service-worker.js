const CACHE_NAME = 'v5';
const URLS_TO_CACHE = [
    '/app/start-page.html',
    '/app/round-500.png',
    '/assets/images/logo/white.png',
    '/assets/images/logo/black.png',
    '/assets/templates/offline.html',
    '/assets/images/favicon/000000.png',
    '/assets/images/favicon/ffffff.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .catch(error => console.error('Caching fout:', error))
    );
});

self.addEventListener('activate', event => {
    self.clients.claim();
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('/assets/templates/offline.html'))
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});
