// Archivo: sw.js
const CACHE_NAME = 'soltech-cache-v4'; // Versión actualizada

// SOLO precargamos archivos de la raíz para evitar errores 404
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/contacto.html',
    '/manifest.json' 
];

// 1. INSTALACIÓN y CACHEO
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cache Abierta, precargando recursos...');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                // Captura el error de cacheo (debe estar vacío si las rutas de arriba son correctas)
                console.error('Error al cachear recursos:', err);
            })
    );
});

// 2. ACTIVACIÓN y LIMPIEZA DE CACHÉS VIEJAS
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Eliminamos cualquier caché que no sea la versión actual (v4)
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('SW: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. INTERCEPTAR SOLICITUDES
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