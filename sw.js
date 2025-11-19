// Service Worker for Script Library Manager PWA
const CACHE_NAME = 'script-library-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/db.js',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Cache installation failed:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch((error) => {
                    console.error('[Service Worker] Fetch failed:', error);
                    // Return a custom offline page if available
                    return caches.match('/index.html');
                });
            })
    );
});

// Background sync for future enhancements
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    if (event.tag === 'sync-scripts') {
        event.waitUntil(syncScripts());
    }
});

async function syncScripts() {
    // Placeholder for future cloud sync functionality
    console.log('[Service Worker] Syncing scripts...');
}

// Push notification support for future enhancements
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        tag: 'script-library-notification'
    };

    event.waitUntil(
        self.registration.showNotification('Script Library Manager', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
