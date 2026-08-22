import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Controller to handle authentication APIs
 */
export const AuthController = {
  /**
   * POST /api/auth/register
   * Registers a new user
   */
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // 1. Validation
      if (!name || typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Name is required'
        });
        return;
      }

      if (!email || typeof email !== 'string' || email.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      // Valid email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email address format'
        });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password is required and must be at least 6 characters long'
        });
        return;
      }

      // 2. Check if email is unique
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
        return;
      }

      // 3. Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 4. Create user in database
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword
        }
      });

      // 5. Generate token
      const token = generateToken(user.id);

      // 6. Return response
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('[Register Error]:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during user registration'
      });
    }
  },

  /**
   * POST /api/auth/login
   * Authenticats a user and returns a token
   */
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // 1. Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // 2. Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // 3. Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // 4. Generate token
      const token = generateToken(user.id);

      // 5. Return response (excluding password)
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('[Login Error]:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  },

  /**
   * GET /api/auth/me
   * Retrieves current authenticated user
   */
  me: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authorized'
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('[Me Error]:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving user context'
      });
    }
  }
};
