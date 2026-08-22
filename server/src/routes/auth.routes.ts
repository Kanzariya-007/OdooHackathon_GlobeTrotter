import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Route mapping
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authMiddleware as any, AuthController.me);

export default router;
