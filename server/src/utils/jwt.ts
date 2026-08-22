import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface TokenPayload {
  userId: string;
}

/**
 * Generates a signed JWT token for a given user ID
 * @param userId - Unique user identifier
 * @returns signed JWT string
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verifies a JWT token and returns its decoded payload
 * @param token - JWT token string
 * @returns Decoded TokenPayload or throws an error if verification fails
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
