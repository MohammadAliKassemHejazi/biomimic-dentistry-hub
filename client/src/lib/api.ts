import Cookies from 'js-cookie';
import { toast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/env';

// ─── Role hierarchy ────────────────────────────────────────────────────────────
// Higher rank = more privileged. Admin (4) satisfies any required role.
const ROLE_RANK: Record<string, number> = {
  user:       1,
  bronze:     1, // same tier as plain user
  silver:     2,
  vip:        2, // vip ≡ silver for access purposes
  gold:       2,
  ambassador: 3,
  admin:      4,
};

/**
 * Resolve the current user's role for client-side pre-flight guards.
 *
 * Priority order:
 *  1. `user_role` cookie — set by AuthContext on every login / profile load.
 *     This is the most reliable source because it is always current.
 *  2. JWT payload `role` claim — set since Iter 8 when the server started
 *     embedding role in the token.  Used as fallback for sessions that
 *     pre-date the cookie or where the cookie is absent.
 *  3. null — no role found; the guard will deny the request.
 *
 * NOTE: this is purely a UX optimization — the server always enforces
 * its own middleware (isAdmin, authenticate).  A client-side spoof here
 * cannot grant real access.
 */
function getClientRole(token: string | undefined): string | null {
  // 1. Role cookie (preferred — always up-to-date)
  const cookieRole = Cookies.get('user_role');
  if (cookieRole && ROLE_RANK[cookieRole] !== undefined) {
    return cookieRole;
  }

  // 2. JWT payload fallback
  if (token) {
    try {
      const payload = token.split('.')[1];
      if (payload) {
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        const parsed: unknown = JSON.parse(json);
        if (
          parsed !== null &&
          typeof parsed === 'object' &&
          'role' in parsed &&
          typeof (parsed as Record<string, unknown>).role === 'string'
        ) {
          return (parsed as Record<string, string>).role;
        }
      }
    } catch {
      // ignore malformed token
    }
  }

  return null;
}

// ─── Retry helpers ─────────────────────────────────────────────────────────────

/**
 * FE-RETRY-01 (Iter 9): Retry configuration for transient network errors.
 *
 * WHY: When the server is still starting up (Docker race condition), the browser
 * gets ERR_CONNECTION_REFUSED which manifests as `TypeError: Failed to fetch`
 * with no HTTP status code.  Retrying with backoff allows the app to recover
 * automatically once the server finishes initializing — without the user having
 * to manually refresh.
 *
 * SAFETY: We ONLY retry on genuine network-level failures (TypeError with no
 * `.status`).  HTTP errors (401, 403, 404, 500 …) have a status code and are
 * NEVER retried — they are real errors that should surface to the UI immediately.
 */
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1_000; // 1 s → 2 s → 4 s (doubles each attempt)

/** Returns true for transient network errors that are safe to retry. */
function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    !(error as any).status // no HTTP status = not a real HTTP response
  );
}

/** Exponential back-off: 1 s on attempt 0, 2 s on 1, 4 s on 2 … */
const retryDelay = (attempt: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, BASE_RETRY_DELAY_MS * 2 ** attempt));

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * `requiredRole` — if set, the API call is blocked client-side before any
 * network request is made when the current user's role does not meet the
 * minimum privilege level.  This prevents unnecessary 403 round-trips and
 * exposes clear "Access Denied" feedback immediately.
 *
 * Role hierarchy (lowest → highest):  user = bronze < silver = vip = gold < ambassador < admin
 */
interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  skipErrorHandling?: boolean;
  requiresAuth?: boolean;
  requiredRole?: 'user' | 'vip' | 'ambassador' | 'admin';
}

export const api = {
  get: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    return fetchWithAuth<T>(endpoint, { ...options, method: 'GET' });
  },
  post: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
    const isFormData = body instanceof FormData;
    return fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  put: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
    const isFormData = body instanceof FormData;
    return fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  patch: async <T>(endpoint: string, body: any, options: FetchOptions = {}): Promise<T> => {
    const isFormData = body instanceof FormData;
    return fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  delete: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
    return fetchWithAuth<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

/**
 * Shared error-shape helper for toasts. Falls back through the common error
 * shapes our backend + fetch layer produce.
 */
export const describeError = (err: unknown): string => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as { message?: unknown; statusText?: unknown };
    if (typeof anyErr.message === 'string') return anyErr.message;
    if (typeof anyErr.statusText === 'string') return anyErr.statusText;
  }
  return 'Unexpected error';
};

async function fetchWithAuth<T>(endpoint: string, options: FetchOptions): Promise<T> {
  const token = Cookies.get('token');
  const requiresAuth = options.requiresAuth !== false;

  if (requiresAuth && !token) {
    const error = new Error('Authorization header missing') as any;
    error.status = 401;
    throw error;
  }

  // ── Client-side role guard ──────────────────────────────────────────────────
  // If the caller declared a requiredRole, resolve the current role and compare
  // against the hierarchy.  Block the request before it hits the wire so the
  // user sees instant feedback instead of a 403 round-trip.
  // NOTE: role guard rejections are NOT network errors — they must never be retried.
  if (options.requiredRole) {
    const clientRole = getClientRole(token);
    const userRank = clientRole !== null ? (ROLE_RANK[clientRole] ?? 0) : 0;
    const requiredRank = ROLE_RANK[options.requiredRole] ?? 0;

    if (userRank < requiredRank) {
      const err = new Error(
        `Insufficient permissions — ${options.requiredRole} role required`
      ) as any;
      err.status = 403;

      if (!options.skipErrorHandling) {
        toast({
          title: 'Access Denied',
          description: `You need ${options.requiredRole} privileges to perform this action.`,
          variant: 'destructive',
        });
      }

      console.warn(
        `[api] Blocked ${options.method} ${endpoint}: ` +
        `user rank ${userRank} (${clientRole ?? 'unauthenticated'}) < required rank ${requiredRank} (${options.requiredRole})`
      );
      throw err;
    }
  }

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Strip non-fetch keys before passing to fetch()
  const { skipErrorHandling, requiredRole, requiresAuth: _ra, ...fetchOptions } = options;

  const config = {
    ...fetchOptions,
    headers,
  };

  // ── FE-RETRY-01 (Iter 9): Retry loop for transient network errors ──────────
  //
  // Only `TypeError: Failed to fetch` (ERR_CONNECTION_REFUSED, DNS failure, etc.)
  // is retried.  Any error with a `.status` property is a real HTTP response
  // and is surfaced to the caller immediately without retrying.
  //
  // Retry schedule: attempt 0 → wait 1 s → attempt 1 → wait 2 s → attempt 2
  //                 → wait 4 s → attempt 3 (final) → throw.
  // Toast is suppressed during retry; only shown if all attempts fail.
  // ─────────────────────────────────────────────────────────────────────────────
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);

      if (!response.ok) {
        // Parse error message if available
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText;
        }

        const error = new Error(errorMessage) as any;
        error.status = response.status;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error: unknown) {
      lastError = error;

      // Only retry genuine network errors (no status code).
      if (isNetworkError(error) && attempt < MAX_RETRIES) {
        const delayMs = BASE_RETRY_DELAY_MS * 2 ** attempt;
        console.warn(
          `[api] Network error on ${options.method} ${endpoint} — ` +
          `retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        await retryDelay(attempt);
        continue; // next attempt
      }

      // Not a network error, OR we've exhausted retries — fall through to error handling.
      break;
    }
  }

  // ── Error handling after all retries exhausted ─────────────────────────────
  const error = lastError as any;
  console.error(`API Error [${options.method} ${endpoint}]:`, error);

  // Skip showing toast if unauthenticated access is generally expected to fail (401/403) unless overridden
  const isAuthError = error?.status === 401 || error?.status === 403;

  if (!skipErrorHandling && !isAuthError) {
    toast({
      title: 'Request failed',
      description: describeError(error),
      variant: 'destructive',
    });
  }

  throw error;
}
