const CACHE_NAME = 'yofre-v4';

self.addEventListener('install', (event) => {
    // Skip waiting to ensure the new service worker activates immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim clients and clean up old caches
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Limpiar caches viejos
            caches.keys().then(keys =>
                Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
            )
        ])
    );
});

self.addEventListener('fetch', (event) => {
    // NO interceptar solicitudes de navegación (abrir URLs)
    // Esto evita problemas con Safari/iOS y el in-app browser de WhatsApp
    if (event.request.mode === 'navigate') {
        return; // Dejar que el navegador maneje la navegación normalmente
    }

    // Para otros recursos (imágenes, scripts, etc.), pass-through normal
    event.respondWith(fetch(event.request));
});
