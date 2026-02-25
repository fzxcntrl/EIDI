const CACHE_NAME = 'eidi-collection-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/wall.html',
    '/css/styles.css',
    '/js/main.js',
    '/js/payment.js',
    '/js/wall.js',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
