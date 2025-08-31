const CACHE_NAME = 'quiz-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/style.css',
    '/manifest.json',
    '/No_Traducido/index.json',
    '/No_Traducido_casos/index.json'
];

// Instalación del Service Worker
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Activación y limpieza de versiones antiguas
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
});

// Interceptar requests
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => response || fetch(e.request))
    );
});