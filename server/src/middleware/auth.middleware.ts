import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';

// SV-15: never load the password hash into req.user. Any controller that accidentally
// serializes the full user would otherwise leak the hash.
const SAFE_USER_ATTRIBUTES = {
  exclude: ['password'],
  include: [],   // Required by Sequelize type definitions
};

// ─── SV-14 (Iter 3): Per-request in-process user cache ───────────────────────
// Eliminates a DB round-trip on every authenticated request.
// TTL is short (30s) so role changes propagate quickly.
// IMPORTANT: always call clearUserCache(userId) after updating a user's role or
// profile so the stale entry is evicted immediately (done in webhook.controller.ts
// and subscription.controller.ts).
const USER_CACHE_TTL_MS = 30_000; // 30 seconds

interface CachedUser {
  user: User;
  expires: number;
}

const userCache = new Map<string, CachedUser>();

/** Invalidate a cached user entry immediately (call after role/profile update). */
export function clearUserCache(userId: string): void {
  userCache.delete(userId);
}

// ─────────────────────────────────────────────────────────────────────────────

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header missing' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Token missing' });
    return;
  }

  try {
    const decoded: any = verifyToken(token);

    if (!decoded || !decoded.userId) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    // SV-14: check in-process cache before hitting the DB
    const cached = userCache.get(decoded.userId as string);
    if (cached && cached.expires > Date.now()) {
      req.user = cached.user;
      return next();
    }

    // Cache miss — load from DB
    const user = await User.findByPk(decoded.userId, {
      attributes: SAFE_USER_ATTRIBUTES,
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Populate cache
    userCache.set(decoded.userId as string, {
      user,
      expires: Date.now() + USER_CACHE_TTL_MS,
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const authenticateOptional = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded: any = verifyToken(token);

    if (decoded && decoded.userId) {
      // SV-14: check cache first
      const cached = userCache.get(decoded.userId as string);
      if (cached && cached.expires > Date.now()) {
        req.user = cached.user;
        return next();
      }

      const user = await User.findByPk(decoded.userId, {
        attributes: SAFE_USER_ATTRIBUTES,
      });
      if (user) {
        userCache.set(decoded.userId as string, {
          user,
          expires: Date.now() + USER_CACHE_TTL_MS,
        });
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Treat invalid token as guest
    next();
  }
};
