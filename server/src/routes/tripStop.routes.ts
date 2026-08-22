import { Router } from 'express';
import { TripStopController } from '../controllers/tripStop.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all trip stop & activity endpoints
router.use(authMiddleware as any);

router.post('/:tripId/stops', TripStopController.createStop);
router.get('/:tripId/stops', TripStopController.getStops);
router.put('/:tripId/stops/:stopId', TripStopController.updateStop);
router.delete('/:tripId/stops/:stopId', TripStopController.deleteStop);

router.post('/:tripId/stops/:stopId/activities', TripStopController.addActivity);
router.get('/:tripId/stops/:stopId/activities', TripStopController.getActivities);
router.delete('/:tripId/stops/:stopId/activities/:activityId', TripStopController.removeActivity);

export default router;
