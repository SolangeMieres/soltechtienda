// Archivo: sw.js
// Este Service Worker no hace NADA más que registrarse.
// Esto elimina los errores de precarga y el Type Error que fallaba en la línea 71
self.addEventListener('install', (e) => {
    e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e) => {
    // No interceptamos nada, simplemente dejamos que la red haga su trabajo.
});