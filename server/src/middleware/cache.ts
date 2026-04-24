import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

/**
 * Redis cache middleware for public GET endpoints.
 *
 * SV-12 (Iter 1) / P-B2 (Iter 2): only cache 2xx responses so we never poison
 * the cache with a 500 payload for `durationInSeconds`.
 */
export const cacheMiddleware = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Do not cache authenticated requests by default (or user-specific cache).
    if (req.user) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        res.json(JSON.parse(cachedResponse));
        return;
      }

      res.setHeader('X-Cache', 'MISS');
      // Intercept res.json to cache the response — but only if it's 2xx.
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis
            .set(key, JSON.stringify(body), 'EX', durationInSeconds)
            .catch((err) => console.error('Redis SET failed:', err));
        }
        return originalJson(body);
      };
      next();
    } catch (error) {
      console.error('Redis cache error:', error);
      next(); // Proceed without cache if Redis fails
    }
  };
};

/**
 * HTTP Cache-Control middleware for public GET endpoints. (Iter 2, P-B3)
 *
 * Architect decision (Iter 2 #5): defaults are `public, max-age=300,
 * s-maxage=600, stale-while-revalidate=86400`. Do NOT stack with
 * `cacheMiddleware` on the same route — pick one or the other per route.
 */
export const publicCacheHeaders = (
  opts: {
    maxAge?: number;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
  } = {}
) => {
  const maxAge = opts.maxAge ?? 300;
  const sMaxAge = opts.sMaxAge ?? 600;
  const swr = opts.staleWhileRevalidate ?? 86400;
  const value = `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`;

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();
    // Do not set a public Cache-Control header on authenticated requests.
    if (req.user) return next();
    res.setHeader('Cache-Control', value);
    next();
  };
};

export const clearCache = async (prefix: string) => {
  try {
    const keys = await redis.keys(`cache:${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
