import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';

// SV-15: never load the password hash into req.user. Any controller that accidentally
// serializes the full user would otherwise leak the hash.
const SAFE_USER_ATTRIBUTES = { 
  exclude: ['password'] ,
  include: []   // Required by Sequelize type definitions
};

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

    // Check if user exists in DB
    const user = await User.findByPk(decoded.userId, { 
      attributes: SAFE_USER_ATTRIBUTES 
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

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
      const user = await User.findByPk(decoded.userId, { 
        attributes: SAFE_USER_ATTRIBUTES 
      });
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Treat invalid token as guest
    next();
  }
};