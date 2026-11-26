import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(public message: string, public statusCode = 500) { super(message); }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  logger.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Routing error' });
}
