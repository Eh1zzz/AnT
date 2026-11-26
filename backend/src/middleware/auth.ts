import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload { id: number; email: string; role: 'customer' | 'admin'; }

declare global {
  namespace Express { interface Request { user?: JWTPayload; } }
}

export function protect(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }
  try {
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
}
