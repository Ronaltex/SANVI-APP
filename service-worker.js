const CACHE_NAME = "sanvi-app-v3-20260623";
const APP_SHELL = [
  "./",
  "./index.html?v=20260623-3",
  "./manifest.webmanifest?v=20260623-3",
  "./icon-192.png?v=20260623-3",
  "./icon-512.png?v=20260623-3"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
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
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    return res;
  }).catch(() => caches.match(req).then(cached => cached || caches.match("./index.html"))));
});
