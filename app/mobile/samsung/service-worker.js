let CACHE_NAME = 'v10';
const URLS_TO_CACHE = [
    './round-500.png',
    '/assets/images/logo/white.png',
    '/assets/images/logo/black.png',
    '/assets/images/favicon/000000.png',
    '/assets/images/favicon/ffffff.png',
    './offline.html'
];

// Install event: cache statische bestanden
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

// Fetch event: serveer uit cache of network, fallback naar offline.html
self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            try {
                const response = await fetch(event.request, { cache: "no-store" });
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, response.clone());
                return response;
            } catch (err) {
                return caches.match(event.request) || caches.match('./offline.html');
            }
        })()
    );
});

// Dynamisch bijwerken van alle gecachte bestanden
async function updateAllCachedFiles() {
    console.log('[SW] Controleren en updaten van gecachte bestanden...');
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

    // Oude cache verwijderen
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
    try {
        const text1 = await res1.clone().text();
        const text2 = await res2.clone().text();
        return text1 === text2;
    } catch {
        return false;
    }
}
