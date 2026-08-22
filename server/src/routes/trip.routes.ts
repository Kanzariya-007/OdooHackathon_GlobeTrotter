import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public route - does not require authentication
router.get('/public/:id', TripController.getPublicById);

// Apply authentication middleware to all other trip endpoints
router.use(authMiddleware as any);

router.post('/', TripController.create);
router.get('/', TripController.getAll);
router.get('/:id', TripController.getById);
router.put('/:id', TripController.update);
router.delete('/:id', TripController.delete);

export default router;
