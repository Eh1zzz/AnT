import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { env }       from '../config/env';
import { AppError }  from '../middleware/errorHandler';

function signToken(id: number, email: string, role: string) {
  return jwt.sign({ id, email, role }, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as jwt.SignOptions);
}

export const authController = {
  /** POST /api/auth/register */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { first_name, last_name, email, password, phone_number } = req.body;
      if (!first_name || !last_name || !email || !password)
        throw new AppError('first_name, last_name, email and password are required', 400);
      if (password.length < 8) throw new AppError('Password must be at least 8 characters', 400);

      const exists = await UserModel.findByEmail(email);
      if (exists) throw new AppError('Email already registered', 409);

      const password_hash = await bcrypt.hash(password, 12);
      const id = await UserModel.create({ first_name, last_name, email, password_hash, phone_number });
      const user = await UserModel.findById(id);
      const token = signToken(id, email, 'customer');

      res.status(201).json({ success: true, token, user: UserModel.toPublic(user!) });
    } catch (err) { next(err); }
  },

  /** POST /api/auth/login */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw new AppError('Email and password required', 400);

      const user = await UserModel.findByEmail(email);
      if (!user) throw new AppError('Invalid credentials', 401);

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) throw new AppError('Invalid credentials', 401);

      const token = signToken(user.id, user.email, user.role);
      res.json({ success: true, token, user: UserModel.toPublic(user) });
    } catch (err) { next(err); }
  },

  /** GET /api/auth/me */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserModel.findById(req.user!.id);
      if (!user) throw new AppError('User not found', 404);
      res.json({ success: true, user: UserModel.toPublic(user) });
    } catch (err) { next(err); }
  },
};
