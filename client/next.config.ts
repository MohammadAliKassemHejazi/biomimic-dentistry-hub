import type { NextConfig } from "next";

// Derive an optional production hostname from NEXT_PUBLIC_SITE_URL so the
// image allow-list can include the app's own origin without a wildcard.
const siteHost = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_SITE_URL;
    if (!raw) return null;
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

// Derive the API host for the same reason (for externally-hosted logos that
// are served via /uploads but may be referenced with absolute URLs).
const apiHost = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_API_URL;
    if (!raw) return null;
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

// In development, Turbopack uses path-based (non-content-hashed) chunk names.
// Marking those chunks as immutable causes the browser to serve a stale chunk
// after any hot-replacement, which produces "module factory not available"
// errors. In production, Next.js always produces content-hashed chunk filenames
// so `immutable` is correct and safe there.
const isDev = process.env.NODE_ENV === "development";

// ─── FE-PERF-01 (Iter 10): Security headers ────────────────────────────────────
// Applied to all routes (source: '/:path*').
// These headers improve security score, trust signals, and Google ranking.
//
// NOT included (intentionally deferred):
//   Content-Security-Policy — requires a full source audit across all pages
//   before enabling, or it will break the site.
//
// HSTS only in production — localhost has no TLS certificate.
const securityHeaders = [
  // Prevent the site from being embedded in iframes (clickjacking protection)
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  // Stop browsers guessing MIME types (prevents XSS via MIME sniffing)
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Legacy XSS filter — still useful for older browsers
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  // Limit referrer data to the origin on cross-origin requests
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Opt out of camera, microphone, geolocation by default
  {
    key:   'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
  // Enable DNS prefetching for faster subsequent navigations
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  // HSTS: enforce HTTPS for 2 years in production. Never set in dev (localhost breaks).
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
  ),
];

const nextConfig: NextConfig = {
  compress:        true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Reduce client bundle size by tree-shaking these heavy packages per-symbol.
  // No new deps added — just configuration.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
      'recharts',
      '@radix-ui/react-icons',
    ],
  },
  async rewrites() {
    // Proxy /uploads/* to the Express server.
    // Inside Docker the service is reachable as "server:5000".
    // Outside Docker (plain npm run dev) it falls back to localhost:5000.
    const serverOrigin = process.env.SERVER_INTERNAL_URL || 'http://localhost:5000';
    return [
      {
        source:      '/uploads/:path*',
        destination: `${serverOrigin}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      // ── FE-PERF-01: Security headers on all routes ──────────────────────────
      {
        source:  '/:path*',
        headers: securityHeaders,
      },
      // ── Static chunks: cache-immutable in prod, no-cache in dev ────────────
      {
        // In dev: force revalidation so Turbopack chunk replacements are always
        // picked up by the browser immediately (no stale-module errors).
        // In prod: chunks are content-hashed — safe to cache immutably for 1 year.
        source: '/_next/static/:path*',
        headers: [
          {
            key:   'Cache-Control',
            value: isDev
              ? 'no-cache, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ── Uploads: aggressive caching (content-addressed filenames) ───────────
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
      // ── PWA assets: long-lived cache ────────────────────────────────────────
      {
        source: '/sw.js',
        headers: [
          // Service worker must NOT be cached — browser checks for a new version
          // on every navigation.  A cached SW would prevent updates from landing.
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' }, // 1 day
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ];
  },
  images: {
    formats:         ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes:     [640, 750, 828, 1080, 1200, 1920],
    imageSizes:      [16, 32, 48, 64, 96, 128, 256, 384],
    // Architect decision (Iter 2 #6): explicit allow-list only. No `**`.
    remotePatterns: [
      // Dev
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      // The app's own production origin (when set)
      ...(siteHost ? [{ protocol: 'https' as const, hostname: siteHost }] : []),
      // The API origin (for backend-served uploads when referenced absolutely)
      ...(apiHost && apiHost !== siteHost
        ? [{ protocol: 'https' as const, hostname: apiHost }]
        : []),
      // Known third-party hosts used by leadership/partner profile images
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
