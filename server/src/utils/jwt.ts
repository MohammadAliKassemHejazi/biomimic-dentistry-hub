import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

const JWT_EXPIRES_IN = '7d';

/**
 * Generate a signed JWT containing both `userId` and `role`.
 *
 * The `role` claim is read client-side by api.ts to apply pre-flight
 * role guards without a network round-trip.  The server always re-reads
 * the role from the DB (or the 30 s in-process cache) — it never trusts
 * the JWT role claim for server-side authorization.
 */
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  return jwt.verify(token, JWT_SECRET);
};
