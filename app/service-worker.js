const CACHE_NAME = 'v1';
const URLS_TO_CACHE = [
    './start-page.html',
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
            .then(cache => {
                return cache.addAll(URLS_TO_CACHE);
            })
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
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(error => console.error('Fout bij ophalen:', error))
    );
});
