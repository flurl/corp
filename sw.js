const cacheName = 'corp-v3';
const contentToCache = [
    'index.html',
    'app.js',
    'style.css',
    'favicon.ico',
    'images/icon-512.png',
    'images/success.svg'
];


self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        console.log('[Service Worker] Caching all: app shell and content');
        await cache.addAll(contentToCache);
    })());
});


self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        const cache = await caches.open(cacheName);
        const r = await cache.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) { return r; }
        const response = await fetch(e.request);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
    })());
});