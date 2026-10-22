const CACHE = 'perde-v1';
const DOSYALAR = ['./', './index.html', './fonts/Bravura.woff',
                  './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DOSYALAR); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (adlar) {
      return Promise.all(adlar.filter(function (a) { return a !== CACHE; })
                              .map(function (a) { return caches.delete(a); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      const kopya = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, kopya); });
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
