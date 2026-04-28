"use client";

/**
 * RetryButton — client island for the /offline page.
 *
 * Extracted from page.tsx because Server Components cannot contain event
 * handlers. This component is intentionally scoped to the offline page and
 * should not be promoted to /components/ui/.
 */
export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 transition-all mb-4"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Try again
    </button>
  );
}
