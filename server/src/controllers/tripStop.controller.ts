import { Response } from 'express';
import { prisma } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Helper to verify that a trip exists and belongs to the authenticated user.
 * Returns the trip if valid, otherwise throws an error or sends response directly.
 */
const verifyTripOwnership = async (tripId: string, userId: string, res: Response): Promise<any | null> => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId }
  });

  if (!trip || trip.userId !== userId) {
    res.status(404).json({ success: false, message: 'Trip not found' });
    return null;
  }
  return trip;
};

export const TripStopController = {
  /**
   * POST /api/trips/:tripId/stops
   * Creates a new trip stop
   */
  createStop: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;
      const { cityId, arrivalDate, departureDate, order } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Validate cityId
      if (cityId === undefined || cityId === null) {
        res.status(400).json({ success: false, message: 'cityId is required' });
        return;
      }

      const city = await prisma.city.findUnique({
        where: { id: Number(cityId) }
      });

      if (!city) {
        res.status(400).json({ success: false, message: 'Referenced city does not exist' });
        return;
      }

      // Validate order
      if (order === undefined || order === null || typeof order !== 'number') {
        res.status(400).json({ success: false, message: 'Valid order index is required' });
        return;
      }

      // Validate dates
      let start: Date | null = null;
      let end: Date | null = null;

      if (arrivalDate) {
        const parsed = Date.parse(arrivalDate);
        if (isNaN(parsed)) {
          res.status(400).json({ success: false, message: 'Invalid arrivalDate format' });
          return;
        }
        start = new Date(arrivalDate);
      }

      if (departureDate) {
        const parsed = Date.parse(departureDate);
        if (isNaN(parsed)) {
          res.status(400).json({ success: false, message: 'Invalid departureDate format' });
          return;
        }
        end = new Date(departureDate);
      }

      if (start && end && start > end) {
        res.status(400).json({ success: false, message: 'arrivalDate cannot be after departureDate' });
        return;
      }

      // Create trip stop
      const stop = await prisma.tripStop.create({
        data: {
          tripId,
          cityId: Number(cityId),
          arrivalDate: start,
          departureDate: end,
          order
        },
        include: { city: true }
      });

      res.status(201).json({ success: true, stop });
    } catch (error) {
      console.error('[Create Stop Error]:', error);
      res.status(500).json({ success: false, message: 'Server error during trip stop creation' });
    }
  },

  /**
   * GET /api/trips/:tripId/stops
   * Retrieves all stops belonging to the authenticated user's trip
   */
  getStops: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      const stops = await prisma.tripStop.findMany({
        where: { tripId },
        include: { city: true },
        orderBy: { order: 'asc' }
      });

      res.status(200).json(stops);
    } catch (error) {
      console.error('[Get Stops Error]:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving trip stops' });
    }
  },

  /**
   * PUT /api/trips/:tripId/stops/:stopId
   * Updates an existing trip stop
   */
  updateStop: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId, stopId } = req.params;
      const userId = req.user?.id;
      const { cityId, arrivalDate, departureDate, order } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Find trip stop and verify it belongs to the trip
      const stop = await prisma.tripStop.findUnique({
        where: { id: stopId }
      });

      if (!stop || stop.tripId !== tripId) {
        res.status(404).json({ success: false, message: 'Trip stop not found' });
        return;
      }

      const updateData: any = {};

      if (cityId !== undefined && cityId !== null) {
        const city = await prisma.city.findUnique({
          where: { id: Number(cityId) }
        });
        if (!city) {
          res.status(400).json({ success: false, message: 'Referenced city does not exist' });
          return;
        }
        updateData.cityId = Number(cityId);
      }

      if (order !== undefined && order !== null) {
        if (typeof order !== 'number') {
          res.status(400).json({ success: false, message: 'Valid order index must be a number' });
          return;
        }
        updateData.order = order;
      }

      // Validate dates
      const newArrival = arrivalDate !== undefined ? arrivalDate : stop.arrivalDate;
      const newDeparture = departureDate !== undefined ? departureDate : stop.departureDate;

      let start: Date | null = null;
      let end: Date | null = null;

      if (newArrival) {
        const parsed = Date.parse(newArrival.toString());
        if (isNaN(parsed)) {
          res.status(400).json({ success: false, message: 'Invalid arrivalDate format' });
          return;
        }
        start = new Date(newArrival);
      }

      if (newDeparture) {
        const parsed = Date.parse(newDeparture.toString());
        if (isNaN(parsed)) {
          res.status(400).json({ success: false, message: 'Invalid departureDate format' });
          return;
        }
        end = new Date(newDeparture);
      }

      if (start && end && start > end) {
        res.status(400).json({ success: false, message: 'arrivalDate cannot be after departureDate' });
        return;
      }

      if (arrivalDate !== undefined) updateData.arrivalDate = start;
      if (departureDate !== undefined) updateData.departureDate = end;

      // Update stop
      const updatedStop = await prisma.tripStop.update({
        where: { id: stopId },
        data: updateData,
        include: { city: true }
      });

      res.status(200).json({ success: true, stop: updatedStop });
    } catch (error) {
      console.error('[Update Stop Error]:', error);
      res.status(500).json({ success: false, message: 'Server error updating trip stop' });
    }
  },

  /**
   * DELETE /api/trips/:tripId/stops/:stopId
   * Deletes an existing trip stop
   */
  deleteStop: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId, stopId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Find trip stop and verify it belongs to the trip
      const stop = await prisma.tripStop.findUnique({
        where: { id: stopId }
      });

      if (!stop || stop.tripId !== tripId) {
        res.status(404).json({ success: false, message: 'Trip stop not found' });
        return;
      }

      await prisma.tripStop.delete({
        where: { id: stopId }
      });

      res.status(200).json({ success: true, message: 'Trip stop deleted successfully' });
    } catch (error) {
      console.error('[Delete Stop Error]:', error);
      res.status(500).json({ success: false, message: 'Server error deleting trip stop' });
    }
  },

  /**
   * POST /api/trips/:tripId/stops/:stopId/activities
   * Assigns an activity to a trip stop
   */
  addActivity: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId, stopId } = req.params;
      const userId = req.user?.id;
      const { activityId, order, plannedTime, notes } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Check trip stop ownership/relationship
      const stop = await prisma.tripStop.findUnique({
        where: { id: stopId }
      });

      if (!stop || stop.tripId !== tripId) {
        res.status(404).json({ success: false, message: 'Trip stop not found' });
        return;
      }

      // Validate activityId
      if (!activityId) {
        res.status(400).json({ success: false, message: 'activityId is required' });
        return;
      }

      const activity = await prisma.activity.findUnique({
        where: { id: activityId }
      });

      if (!activity) {
        res.status(400).json({ success: false, message: 'Referenced activity does not exist' });
        return;
      }

      // Check if activity belongs to the same city as the trip stop
      if (activity.cityId !== stop.cityId) {
        res.status(400).json({ success: false, message: 'Activity must belong to the same city as the trip stop' });
        return;
      }

      // Check if activity is already assigned to the stop
      const existingAssignment = await prisma.stopActivity.findFirst({
        where: {
          tripStopId: stopId,
          activityId
        }
      });

      if (existingAssignment) {
        res.status(400).json({ success: false, message: 'Activity is already assigned to this stop' });
        return;
      }

      // Validate order
      if (order === undefined || order === null || typeof order !== 'number') {
        res.status(400).json({ success: false, message: 'Valid order index is required' });
        return;
      }

      // Validate plannedTime
      let parsedTime: Date | null = null;
      if (plannedTime) {
        const parsed = Date.parse(plannedTime);
        if (isNaN(parsed)) {
          res.status(400).json({ success: false, message: 'Invalid plannedTime format' });
          return;
        }
        parsedTime = new Date(plannedTime);
      }

      // Create StopActivity association
      const stopActivity = await prisma.stopActivity.create({
        data: {
          tripStopId: stopId,
          activityId,
          order,
          plannedTime: parsedTime,
          notes: notes ? notes.trim() : null
        },
        include: { activity: true }
      });

      res.status(201).json({ success: true, stopActivity });
    } catch (error) {
      console.error('[Add Activity Error]:', error);
      res.status(500).json({ success: false, message: 'Server error during activity assignment' });
    }
  },

  /**
   * GET /api/trips/:tripId/stops/:stopId/activities
   * Retrieves all activities assigned to a stop
   */
  getActivities: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId, stopId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Find trip stop and verify it belongs to the trip
      const stop = await prisma.tripStop.findUnique({
        where: { id: stopId }
      });

      if (!stop || stop.tripId !== tripId) {
        res.status(404).json({ success: false, message: 'Trip stop not found' });
        return;
      }

      const activities = await prisma.stopActivity.findMany({
        where: { tripStopId: stopId },
        include: { activity: true },
        orderBy: { order: 'asc' }
      });

      res.status(200).json(activities);
    } catch (error) {
      console.error('[Get Activities Error]:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving stop activities' });
    }
  },

  /**
   * DELETE /api/trips/:tripId/stops/:stopId/activities/:activityId
   * Removes an assigned activity from a trip stop
   */
  removeActivity: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId, stopId, activityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Find trip stop and verify it belongs to the trip
      const stop = await prisma.tripStop.findUnique({
        where: { id: stopId }
      });

      if (!stop || stop.tripId !== tripId) {
        res.status(404).json({ success: false, message: 'Trip stop not found' });
        return;
      }

      // Check if association exists
      const stopActivity = await prisma.stopActivity.findFirst({
        where: {
          tripStopId: stopId,
          activityId
        }
      });

      if (!stopActivity) {
        res.status(404).json({ success: false, message: 'Assigned activity not found for this stop' });
        return;
      }

      await prisma.stopActivity.delete({
        where: { id: stopActivity.id }
      });

      res.status(200).json({ success: true, message: 'Activity removed from stop successfully' });
    } catch (error) {
      console.error('[Remove Activity Error]:', error);
      res.status(500).json({ success: false, message: 'Server error removing activity from stop' });
    }
  }
};
