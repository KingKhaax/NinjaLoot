'use strict';

// Service worker de la web: lo estático (scripts, estilos, datos, iconos, fuentes) se sirve al instante desde el equipo y se actualiza por detrás;
// la página principal se pide primero a la red (así una versión nueva se ve enseguida) y solo si falla se usa la copia guardada.
// El nombre de la caché lleva la versión: al publicar una nueva se borra la anterior.
const CACHE = 'nl-__VERSION__';
const cacheable = (res) => res && res.ok && res.type === 'basic';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('nl-') && k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || req.method !== 'GET' || req.headers.has('range') || /\/sw\.js$/.test(url.pathname)) return;
  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isPage) {
      try {
        const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 5000))]);
        if (cacheable(res)) cache.put(req, res.clone());
        return res;
      } catch { return (await cache.match(req)) || (await cache.match(url.pathname)) || fetch(req); }
    }
    const hit = await cache.match(req);
    const net = fetch(req).then((res) => { if (cacheable(res)) cache.put(req, res.clone()); return res; });
    if (hit) { net.catch(() => {}); return hit; }
    return net;
  })());
});
