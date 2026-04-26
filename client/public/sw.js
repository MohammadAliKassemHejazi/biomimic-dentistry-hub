/**
 * Biomimetic Dentistry Club — Production Service Worker
 *
 * ─── CACHING STRATEGY ────────────────────────────────────────────────────────
 *
 *  /_next/static/*   → Cache-First (content-hashed by Next.js — immutable)
 *  /logo.png etc.    → Cache-First (static branding assets)
 *  HTML pages        → Network-First + offline fallback (SSR freshness critical)
 *  /api/*            → Network-Only  (never cache auth / dynamic data)
 *  Everything else   → Stale-While-Revalidate
 *
 * Bump CACHE_VERSION to force all clients to clear their caches on next visit.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CACHE_VERSION = 'v4';
const STATIC_CACHE  = `bdc-static-${CACHE_VERSION}`;
const PAGE_CACHE    = `bdc-pages-${CACHE_VERSION}`;
const OFFLINE_URL   = '/offline';

/**
 * Assets precached at install time.
 * The offline page MUST be here so it's available when the network is down.
 */
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/logo.png',
  '/favicon.ico',
  '/site.webmanifest',
];

// ─── Never cache these paths ───────────────────────────────────────────────────
const SKIP_PATTERNS = [
  /^\/api\//,          // API — always fresh, may be authed
  /^\/dashboard/,      // authenticated routes — never cache
  /^\/admin/,          // admin routes — never cache
  /^\/sw\.js$/,        // the SW file itself — browser handles versioning
];

function shouldSkip(url) {
  const { pathname } = new URL(url);
  return SKIP_PATTERNS.some(p => p.test(pathname));
}

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // activate immediately, don't wait for old SW to die
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim()) // take control of all pages immediately
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests from our own origin
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (shouldSkip(request.url)) return;

  const url = new URL(request.url);

  // ── 1. Cache-First: Next.js static chunks (content-hashed → immutable) ──────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 2. Cache-First: Static branding files ────────────────────────────────────
  if (['/logo.png', '/favicon.ico', '/site.webmanifest'].includes(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 3. Network-First + offline fallback: HTML page navigation ────────────────
  const acceptHeader = request.headers.get('Accept') || '';
  if (acceptHeader.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // ── 4. Stale-While-Revalidate: everything else (fonts, images, etc.) ─────────
  event.respondWith(staleWhileRevalidate(request, PAGE_CACHE));
});

// ─── Strategy helpers ─────────────────────────────────────────────────────────

/** Cache-First: serve from cache if available, otherwise fetch and store. */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network-First with offline fallback.
 * Tries the network; on failure returns a cached copy or the offline page.
 */
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // 1. Try the cached version of the same page
    const cached = await caches.match(request);
    if (cached) return cached;

    // 2. Fall back to the offline page
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    // 3. Last resort: empty offline response
    return new Response(
      '<html><body><h1>You are offline</h1></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Stale-While-Revalidate: serve from cache immediately, then update in background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      caches.open(cacheName).then((cache) => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached || new Response('Network error', { status: 503 }));

  return cached || fetchPromise;
}
