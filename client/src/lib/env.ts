/**
 * Centralized, fail-fast runtime env helper.
 *
 * Architect decision (Iter 2 #1, #6): throws at module-import time on the
 * client bundle if the required NEXT_PUBLIC_* vars are missing. Next.js inlines
 * these at build time, so a missing value would otherwise ship as literal
 * `undefined` and silently point at `http://localhost:5000`.
 *
 * Do not add localhost fallbacks here.
 */

const readRequired = (key: string, fallback?: string): string => {
  const v = process.env[key];
  if (v && v.trim().length > 0) return v;
  if (fallback !== undefined) return fallback;
  // We throw lazily: importers that evaluate this module in a server/build
  // context where the env is legitimately absent will crash loudly — which
  // is the architect-mandated behavior.
  throw new Error(
    `[env] Missing required environment variable: ${key}. ` +
      `Set it in .env.local (dev) or render.yaml / host env (prod) before building.`
  );
};

/** API base URL, e.g. "https://api.example.com/api". No trailing slash. */
export const API_URL: string = readRequired('NEXT_PUBLIC_API_URL').replace(/\/$/, '');

/** Server origin without the /api suffix — used for rewriting upload URLs. */
export const SERVER_ORIGIN: string = API_URL.replace(/\/api$/, '');

/**
 * Public canonical site origin, e.g. "https://biomimeticdentistry.org".
 * Falls back to the production literal if the env var is not set, because
 * metadata / sitemap must resolve even during a pre-deploy build.
 */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://biomimeticdentistry.org';

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
