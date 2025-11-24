import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // Default error
  let error: ErrorResponse = {
    error: 'Server Error',
    statusCode: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      error: 'Invalid input data',
      statusCode: 400
    };
  }

  // Handle database errors
  if (err.message.includes('duplicate key')) {
    error = {
      error: 'Resource already exists',
      statusCode: 409
    };
  }

  res.status(error.statusCode).json(error);
};
