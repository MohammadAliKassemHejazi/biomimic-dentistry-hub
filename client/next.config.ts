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

const nextConfig: NextConfig = {
  compress: true,
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
        source: '/uploads/:path*',
        destination: `${serverOrigin}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    // Long-cache immutable static assets served by Next.js itself.
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, immutable' },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
