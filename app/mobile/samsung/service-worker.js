const CACHE_NAME = 'v11';
const URLS_TO_CACHE = [
    './decide.html',
    './offline.html',
    './round-500.png',
    '/assets/images/logo/white.png',
    '/assets/images/logo/black.png',
    '/assets/images/favicon/000000.png',
    '/assets/images/favicon/ffffff.png'
];

// Install event: cache belangrijke bestanden
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .catch(err => console.error('[SW] Caching fout:', err))
    );
});

// Activate event: oude caches verwijderen
self.addEventListener('activate', event => {
    self.clients.claim();
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
});

// Fetch event: serveer uit cache of network, fallback offline.html
self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            try {
                // Splash.html niet cachen
                if (event.request.url.includes('splash.html')) {
                    return fetch(event.request);
                }

                const response = await fetch(event.request, { cache: 'no-store' });
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, response.clone());
                return response;
            } catch (err) {
                return caches.match(event.request) || caches.match('./offline.html');
            }
        })()
    );
});
