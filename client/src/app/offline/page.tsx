import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import RetryButton from './RetryButton';

export const metadata: Metadata = {
  title: 'You are offline',
  description: 'No internet connection detected. Please check your network and try again.',
  robots: { index: false, follow: false },
};

/**
 * Offline fallback page — served by the service worker when the user is
 * offline and the requested page is not in the cache.
 *
 * Must be:
 *  - Completely static (no API calls, no auth context)
 *  - Precached by the service worker at install time
 *  - Lightweight — loads from cache even on very slow connections
 *
 * The retry button is extracted to RetryButton.tsx (a "use client" component)
 * because event handlers cannot live in Server Components, and this page must
 * remain a Server Component to export `metadata`.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Biomimetic Dentistry Club"
          width={80}
          height={80}
          priority
          className="rounded-2xl shadow-md mx-auto"
        />
      </div>

      {/* Icon */}
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.5 8.5A5.5 5.5 0 0115.5 15.5M1 1a20.9 20.9 0 0122 22" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 2.5a10 10 0 017 17M2.5 8.5a10 10 0 0113 13" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        You&apos;re offline
      </h1>

      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        It looks like your internet connection is unavailable. Check your Wi-Fi or
        mobile data, then try again.
      </p>

      {/* RetryButton is a "use client" island — event handlers require it */}
      <RetryButton />

      <Link
        href="/"
        className="text-sm text-primary hover:underline underline-offset-4"
      >
        Go to Home
      </Link>

      {/* Footer note */}
      <p className="mt-12 text-xs text-muted-foreground">
        Biomimetic Dentistry Club · Making Dentistry More Human and Accessible
      </p>
    </div>
  );
}
