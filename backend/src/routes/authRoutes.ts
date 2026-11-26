import { Router } from 'express';
import { authController } from '../controllers/authController';
import { protect }        from '../middleware/auth';
const r = Router();
r.post('/register', authController.register);
r.post('/login',    authController.login);
r.get ('/me',       protect, authController.me);
export default r;
