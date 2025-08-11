let CACHE_NAME = 'v9';
const URLS_TO_CACHE = [
    '/app/start-page.html',
    '/app/round-500.png',
    '/assets/images/logo/white.png',
    '/assets/images/logo/black.png',
    '/assets/images/favicon/000000.png',
    '/assets/images/favicon/ffffff.png',
    '/app/offline.html'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .catch(err => console.error('Caching fout:', err))
    );
});

self.addEventListener('activate', event => {
    self.clients.claim();
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }).then(() => {
            if (navigator.onLine) {
                return updateAllCachedFiles();
            }
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            if (navigator.onLine) {
                try {
                    const response = await fetch(event.request, { cache: "no-store" });
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, response.clone());
                    return response;
                } catch (err) {
                    return caches.match(event.request) || caches.match('/app/offline.html');
                }
            } else {
                return caches.match(event.request) || caches.match('/app/offline.html');
            }
        })()
    );
});

// Check alle bestanden in URLS_TO_CACHE en update indien verschillend
async function updateAllCachedFiles() {
    console.log('[SW] Check alle gecachte bestanden...');
    const newCacheName = 'v' + Date.now();
    const newCache = await caches.open(newCacheName);

    for (const url of URLS_TO_CACHE) {
        try {
            const networkResponse = await fetch(url, { cache: "no-store" });
            const oldCache = await caches.open(CACHE_NAME);
            const oldResponse = await oldCache.match(url);

            if (!oldResponse || !(await responsesAreEqual(oldResponse, networkResponse))) {
                console.log('[SW] Bestand vernieuwd:', url);
            }
            await newCache.put(url, networkResponse.clone());
        } catch (err) {
            console.warn('[SW] Kan bestand niet ophalen:', url, err);
        }
    }

    // Oude cache verwijderen en nieuwe naam instellen
    await caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== newCacheName) caches.delete(key);
        });
    });
    CACHE_NAME = newCacheName;
    console.log('[SW] Cache bijgewerkt naar', CACHE_NAME);
}

// Vergelijk inhoud van 2 responses
async function responsesAreEqual(res1, res2) {
    const text1 = await res1.clone().text();
    const text2 = await res2.clone().text();
    return text1 === text2;
}
