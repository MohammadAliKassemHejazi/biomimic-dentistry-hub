import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

export const cacheMiddleware = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Do not cache authenticated requests by default (or user specific cache)
    // To simplify, if there's a user attached, skip cache or cache by user ID
    if (req.user) {
        return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        res.json(JSON.parse(cachedResponse));
        return;
      } else {
        // Intercept res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
          redis.set(key, JSON.stringify(body), 'EX', durationInSeconds);
          return originalJson(body);
        };
        next();
      }
    } catch (error) {
      console.error('Redis cache error:', error);
      next(); // Proceed without cache if Redis fails
    }
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
}
