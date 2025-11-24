import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

// Will be replaced by Cognito + API Gateway auth
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(401).json({
    success: false,
    error: 'Authentication required'
  });
};
