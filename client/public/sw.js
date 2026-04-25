// Minimal no-op service worker.
// Required to silence the browser's automatic /sw.js probe on PWA manifest
// sites. Does not intercept any requests or cache any assets — the Next.js
// development server handles all caching concerns.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
