import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../utils/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Middleware to protect routes and verify the JWT authorization token.
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
      return;
    }

    // Find user in database, omitting the password field for safety
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
      return;
    }

    // Attach user information to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication middleware'
    });
  }
};
