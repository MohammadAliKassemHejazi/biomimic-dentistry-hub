/**
 * Centralized env helper for public client-side variables.
 *
 * IMPORTANT — Next.js / Turbopack bundler rule:
 *   NEXT_PUBLIC_* vars are only inlined into the browser bundle when accessed
 *   with STATIC dot-notation at the exact call site:
 *       process.env.NEXT_PUBLIC_FOO   ✓  (inlined)
 *       process.env[someVar]          ✗  (undefined in browser)
 *
 *   Every variable is therefore read inline below and passed to `requireVar`
 *   which only handles the error message — it does NOT call process.env itself.
 */

/**
 * Validate a pre-read env value and return it, or throw / return fallback.
 * `name` is only used in the error message.
 */
const requireVar = (name: string, value: string | undefined, fallback?: string): string => {
  if (value && value.trim().length > 0) return value.trim();
  if (fallback !== undefined) return fallback;
  throw new Error(
    `[env] Missing required environment variable: ${name}. ` +
      `Set it in .env.local (dev) or the host environment (prod) before building.`
  );
};

// ─── Exported constants ───────────────────────────────────────────────────────

/** API base URL, e.g. "http://localhost:5000/api". No trailing slash. */
export const API_URL: string = requireVar(
  'NEXT_PUBLIC_API_URL',
  process.env.NEXT_PUBLIC_API_URL        // static — inlined by bundler
).replace(/\/$/, '');

/** Server origin without the /api suffix — used for rewriting upload URLs. */
export const SERVER_ORIGIN: string = API_URL.replace(/\/api$/, '');

/**
 * Public canonical site origin, e.g. "https://biomimeticdentistry.org".
 * Falls back to the production literal so metadata / sitemap resolves
 * even during a pre-deploy build where NEXT_PUBLIC_SITE_URL may not be set.
 */
export const SITE_URL: string = requireVar(
  'NEXT_PUBLIC_SITE_URL',
  process.env.NEXT_PUBLIC_SITE_URL,      // static — inlined by bundler
  'https://biomimeticdentistry.org'
).replace(/\/$/, '');

/** Build an absolute URL relative to SITE_URL. */
export const absoluteUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/** Resolve an upload path served by the Express backend. */
export const resolveUploadUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
};
