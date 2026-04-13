import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
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
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
