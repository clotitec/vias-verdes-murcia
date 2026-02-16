// ==================== SERVICE WORKER - VÍAS VERDES DE MURCIA ====================
const CACHE_NAME = 'vv-murcia-v4';
const TILE_CACHE = 'vv-murcia-tiles-v1';

// Recursos estaticos para pre-cachear durante la instalacion
const STATIC_ASSETS = [
    './',
    './index.html',
    './data.js',
    './pois.js',
    './weather.js',
    './transport.js',
    './manifest.json',
    './assets/images/logo principal vias verdes_1.webp',
    './assets/images/logo principal vias verdes de murcia_1.webp',
    './assets/images/hero/vv1-campo-catagena_1.webp',
    './assets/images/hero/vv3-almedricos_1.webp',
    './assets/images/hero/vv4-noroeste_1.webp',
    './assets/images/hero/vv5-aguilas_1.webp',
    './assets/images/hero/vv6-chicharra-yecla_1.webp',
    './assets/images/hero/vv7-chicharrra-cieza_1.webp',
    './assets/images/hero/vv8-floracion-cieza_1.webp',
    './gpx/Via_Verde_Campo_de_Cartagena.gpx',
    './gpx/Via_Verde_Mazarron.gpx',
    './gpx/Via-Verde-del-Noroeste.gpx',
    './gpx/Via_Verde_Almendricos.gpx',
    './gpx/Via_Verde_Chicharra_Cieza.gpx',
    './gpx/Via_Verde_Chicharra_Yecla.gpx',
    './gpx/Via_Verde_Embarcadero_del_Hornillo.gpx',
    './gpx/Via_Verde_Floracion_Cieza.gpx'
];

// Dominios de tiles de mapa para cachear
const TILE_DOMAINS = [
    'basemaps.cartocdn.com',
    'server.arcgisonline.com'
];

// Dominios de CDN para cachear
const CDN_DOMAINS = [
    'unpkg.com',
    'cdn.jsdelivr.net',
    'cdn.tailwindcss.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];

// ==================== INSTALACION ====================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-cacheando recursos estaticos');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// ==================== ACTIVACION ====================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== TILE_CACHE)
                    .map((name) => {
                        console.log('[SW] Eliminando cache antiguo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// ==================== FETCH ====================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Tiles de mapa: cache-first con limite de tamaño
    if (TILE_DOMAINS.some(d => url.hostname.includes(d))) {
        event.respondWith(
            caches.open(TILE_CACHE).then((cache) => {
                return cache.match(event.request).then((cached) => {
                    if (cached) return cached;
                    return fetch(event.request).then((response) => {
                        if (response.ok) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    }).catch(() => {
                        // Sin conexion: devolver respuesta vacia para tiles
                        return new Response('', { status: 404 });
                    });
                });
            })
        );
        return;
    }

    // CDN (librerias): cache-first
    if (CDN_DOMAINS.some(d => url.hostname.includes(d))) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // API calls (nominatim): network-first con fallback a cache
    if (url.hostname.includes('nominatim')) {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                return caches.match(event.request).then((cached) => {
                    return cached || new Response('{}', {
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            })
        );
        return;
    }

    // Recursos estaticos locales: cache-first con actualizacion en segundo plano
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request).then((response) => {
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => null);

            return cached || fetchPromise;
        })
    );
});
