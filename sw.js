// Archivo: sw.js (Service Worker)
// Versión actual de la caché
const CACHE_NAME = 'soltech-cache-v1';

// Recursos a precargar
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/contacto.html',
    '/manifest.json', 
];

// Instalar el Service Worker y cachear los recursos estáticos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Error al cachear:', err);
            })
    );
});

// Interceptar solicitudes y servir desde la caché si es posible
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si encontramos el recurso en caché, lo servimos
                if (response) {
                    return response;
                }
                // Si no está en caché, lo solicitamos a la red
                return fetch(event.request);
            })
    );
});