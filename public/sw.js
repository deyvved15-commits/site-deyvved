self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler required for PWA install prompt
  event.respondWith(fetch(event.request));
});
