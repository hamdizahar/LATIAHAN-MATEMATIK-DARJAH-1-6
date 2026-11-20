// Kancil Matematik: offline service worker.
// Tukar nombor versi ini setiap kali anda mengemas kini fail game,
// supaya telefon pengguna memuat turun versi baharu.
const VERSION = 'kancil-v1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'fonts/baloo2-500.woff2',
  'fonts/baloo2-700.woff2',
  'fonts/baloo2-800.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Halaman utama: cuba rangkaian dahulu (untuk dapat versi baharu), jika tiada internet guna salinan simpanan.
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put('index.html', copy));
        return res;
      }).catch(() => caches.match('index.html'))
    );
    return;
  }
  // Fail lain (fon, ikon): guna simpanan dahulu.
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(req, copy));
    return res;
  })));
});
