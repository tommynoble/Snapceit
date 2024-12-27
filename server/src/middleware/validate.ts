import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
          statusCode: 400
        } as ErrorResponse);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
