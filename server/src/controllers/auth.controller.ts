import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    const token = generateToken(user.id);

    // Matching Supabase-like structure as per requirement hint
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      session: {
        access_token: token,
        token_type: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(500).json({ message: `Internal server error: ${errorMessage}` });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      session: {
        access_token: token,
        token_type: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(500).json({ message: `Internal server error: ${errorMessage}` });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  // Since JWT is stateless, we just return success.
  // Client should discard the token.
  res.json({ message: "Successfully signed out" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal user existence
      return res.json({ message: "Password reset email sent" });
    }

    // In a real app, generate a reset token and link
    // const resetToken = ...
    // const resetLink = `https://app.com/reset-password?token=${resetToken}`;

    // For now, just send a notification
    await sendEmail(email, "Password Reset", "Please reset your password.");

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
