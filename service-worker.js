const CACHE_NAME = "sanvi-app-v4-20260626";
const APP_SHELL = [
  "./",
  "./index.html?v=20260626-4",
  "./manifest.webmanifest?v=20260626-4",
  "./icon-192.png?v=20260626-4",
  "./icon-512.png?v=20260626-4"
];
const EXTERNAL_SHELL = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await cache.addAll(APP_SHELL);
    await Promise.allSettled(EXTERNAL_SHELL.map(async url => {
      const response = await fetch(url);
      if (response.ok) await cache.put(url, response);
    }));
  }).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", event => {
  if (!event.data || event.data.type !== "CLEAR_CACHE") return;
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))));
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const cacheableExternal = url.hostname === "unpkg.com" || url.hostname === "tile.openstreetmap.org";
  if (url.origin !== self.location.origin && !cacheableExternal) return;
  event.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    return res;
  }).catch(() => caches.match(req).then(cached => cached || caches.match("./index.html"))));
});
