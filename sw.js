// Seyir service worker
// Uygulama dosyaları: ağ öncelikli (3 sn zaman aşımı), olmazsa önbellek.
// Yazı tipleri ve ikonlar: önbellek öncelikli.
const SURUM = '2.2.0';
const CACHE = 'perde-' + SURUM;
const DOSYALAR = [
  './', './index.html', './manifest.webmanifest?v=' + SURUM, './icon-192.png?v=' + SURUM, './icon-512.png?v=' + SURUM,
  './css/stil.css?v=' + SURUM,
  './fonts/seyir-nota.woff?v=' + SURUM, './fonts/nunito.woff?v=' + SURUM, './fonts/baloo2.woff?v=' + SURUM,
  './js/cekirdek.js?v=' + SURUM, './js/nota.js?v=' + SURUM, './js/perde.js?v=' + SURUM, './js/koma.js?v=' + SURUM, './js/cesni.js?v=' + SURUM, './js/makam.js?v=' + SURUM, './js/gocurme.js?v=' + SURUM,
  './js/bati.js?v=' + SURUM, './js/ogren.js?v=' + SURUM, './js/motor.js?v=' + SURUM, './js/arayuz.js?v=' + SURUM, './js/rehber.js?v=' + SURUM, './js/baslat.js?v=' + SURUM, './qr.png'
];

self.addEventListener('install', function (e) {
  // Bir dosya eksik olsa bile kurulum bozulmasın
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(DOSYALAR.map(function (u) { return c.add(u).catch(function () {}); }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (adlar) {
    return Promise.all(adlar.filter(function (a) { return a.indexOf('perde-') === 0 && a !== CACHE; }).map(function (a) { return caches.delete(a); }));
  }).then(function () { return self.clients.claim(); }));
});

function zamanAsimi(ms) { return new Promise(function (_, red) { setTimeout(function () { red(new Error('zaman aşımı')); }, ms); }); }

self.addEventListener('fetch', function (e) {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== self.location.origin) return;          // sayaç vb. dış istekler önbelleğe alınmaz
  const sabit = /\.(woff2?|png|svg)$/.test(url.pathname);
  if (sabit) {
    e.respondWith(caches.match(r).then(function (v) {
      return v || fetch(r).then(function (y) {
        if (y.ok) { const k = y.clone(); caches.open(CACHE).then(function (c) { c.put(r, k); }); }
        return y;
      });
    }));
    return;
  }
  e.respondWith(
    // cache: 'no-cache' → HTTP önbelleğindeki eski sürümü kullanma
    Promise.race([fetch(r, { cache: 'no-cache' }), zamanAsimi(3000)]).then(function (y) {
      if (y && y.ok) { const k = y.clone(); caches.open(CACHE).then(function (c) { c.put(r, k); }); }
      return y;
    }).catch(function () {
      return caches.match(r, { ignoreSearch: true }).then(function (v) { return v || caches.match('./index.html'); });
    })
  );
});
