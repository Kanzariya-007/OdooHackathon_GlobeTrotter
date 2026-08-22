import { Response, Request } from 'express';
import { prisma } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Helper to map database Trip to output structure including both title and name
 */
const mapTripResponse = (trip: any) => {
  if (!trip) return null;

  // Map PostgreSQL relational tables to frontend expectations
  const destinations = trip.tripStops 
    ? trip.tripStops.map((ts: any) => ({
        id: ts.id,
        city: ts.city.name,
        country: ts.city.country,
        region: ts.city.region || 'Europe',
        costIndex: 3,
        image: '',
        description: ''
      })) 
    : [];

  const tripStops = trip.tripStops 
    ? trip.tripStops.map((ts: any) => ({
        id: ts.id,
        city: ts.city.name,
        country: ts.city.country,
        startDate: ts.arrivalDate ? ts.arrivalDate.toISOString().split('T')[0] : '',
        endDate: ts.departureDate ? ts.departureDate.toISOString().split('T')[0] : '',
        order: ts.order
      })) 
    : [];

  const activities = trip.tripStops 
    ? trip.tripStops.flatMap((ts: any) => 
        ts.stopActivities 
          ? ts.stopActivities.map((sa: any) => ({
              id: sa.activity.id,
              name: sa.activity.name,
              category: sa.activity.category || 'Activities',
              duration: sa.activity.duration ? `${sa.activity.duration} mins` : undefined,
              cost: Number(sa.activity.cost) || 0,
              description: sa.activity.description || undefined,
              startTime: sa.plannedTime ? sa.plannedTime.toISOString().split('T')[1].substring(0, 5) : undefined,
              endTime: undefined,
              date: sa.plannedTime ? sa.plannedTime.toISOString().split('T')[0] : undefined,
              location: sa.activity.location || undefined,
              tripStopId: ts.id,
              order: sa.order
            })) 
          : []
      ) 
    : [];

  const budget = {
    totalBudget: 50000,
    transport: activities.filter((a: any) => a.category === 'Transport').reduce((sum: number, a: any) => sum + a.cost, 0),
    accommodation: activities.filter((a: any) => a.category === 'Accommodation').reduce((sum: number, a: any) => sum + a.cost, 0),
    activities: activities.filter((a: any) => a.category === 'Activities').reduce((sum: number, a: any) => sum + a.cost, 0),
    food: activities.filter((a: any) => a.category === 'Food').reduce((sum: number, a: any) => sum + a.cost, 0),
    other: activities.filter((a: any) => a.category === 'Other').reduce((sum: number, a: any) => sum + a.cost, 0),
  };

  return {
    id: trip.id,
    title: trip.title,
    name: trip.title, // For frontend compatibility (expects name)
    description: trip.description,
    startDate: trip.startDate.toISOString().split('T')[0],
    endDate: trip.endDate.toISOString().split('T')[0],
    userId: trip.userId,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
    destinations,
    tripStops,
    activities,
    budget
  };
};

export const TripController = {
  /**
   * POST /api/trips
   * Creates a new trip for the authenticated user
   */
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, name, description, startDate, endDate } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Title/name extraction and validation
      const tripTitle = (title || name || '').trim();
      if (!tripTitle) {
        res.status(400).json({ success: false, message: 'Trip title is required' });
        return;
      }

      // Date validation
      if (!startDate || !endDate) {
        res.status(400).json({ success: false, message: 'Start date and end date are required' });
        return;
      }

      const parsedStart = Date.parse(startDate);
      const parsedEnd = Date.parse(endDate);

      if (isNaN(parsedStart) || isNaN(parsedEnd)) {
        res.status(400).json({ success: false, message: 'Invalid date formats provided' });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
        return;
      }

      // Create trip
      const trip = await prisma.trip.create({
        data: {
          title: tripTitle,
          description: description ? description.trim() : null,
          startDate: start,
          endDate: end,
          userId
        }
      });

      res.status(201).json({
        success: true,
        trip: mapTripResponse(trip)
      });
    } catch (error) {
      console.error('[Create Trip Error]:', error);
      res.status(500).json({ success: false, message: 'Server error during trip creation' });
    }
  },

  /**
   * GET /api/trips
   * Retrieves all trips for the authenticated user
   */
  getAll: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const trips = await prisma.trip.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(trips.map(mapTripResponse));
    } catch (error) {
      console.error('[Get Trips Error]:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving trips' });
    }
  },

  /**
   * GET /api/trips/:id
   * Retrieves a single trip by ID if it belongs to the authenticated user
   */
  getById: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
          tripStops: {
            include: {
              city: true,
              stopActivities: {
                include: {
                  activity: true
                }
              }
            }
          }
        }
      });

      // Secure handling: Return 404 if trip does not exist OR belongs to another user
      if (!trip || trip.userId !== userId) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      res.status(200).json(mapTripResponse(trip));
    } catch (error) {
      console.error('[Get Trip Error]:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving trip details' });
    }
  },

  /**
   * PUT /api/trips/:id
   * Updates an existing trip owned by the authenticated user
   */
  update: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { title, name, description, startDate, endDate } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const trip = await prisma.trip.findUnique({
        where: { id }
      });

      if (!trip || trip.userId !== userId) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      const updateData: any = {};

      // Handle name/title mapping
      const tripTitle = (title || name);
      if (tripTitle !== undefined) {
        if (tripTitle.trim() === '') {
          res.status(400).json({ success: false, message: 'Trip title cannot be empty' });
          return;
        }
        updateData.title = tripTitle.trim();
      }

      if (description !== undefined) {
        updateData.description = description ? description.trim() : null;
      }

      // Handle dates if provided
      if (startDate !== undefined || endDate !== undefined) {
        const checkStart = startDate !== undefined ? startDate : trip.startDate;
        const checkEnd = endDate !== undefined ? endDate : trip.endDate;

        const parsedStart = Date.parse(checkStart);
        const parsedEnd = Date.parse(checkEnd);

        if (isNaN(parsedStart) || isNaN(parsedEnd)) {
          res.status(400).json({ success: false, message: 'Invalid date formats provided' });
          return;
        }

        const start = new Date(checkStart);
        const end = new Date(checkEnd);

        if (start > end) {
          res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
          return;
        }

        if (startDate !== undefined) updateData.startDate = start;
        if (endDate !== undefined) updateData.endDate = end;
      }

      const updatedTrip = await prisma.trip.update({
        where: { id },
        data: updateData
      });

      res.status(200).json({
        success: true,
        trip: mapTripResponse(updatedTrip)
      });
    } catch (error) {
      console.error('[Update Trip Error]:', error);
      res.status(500).json({ success: false, message: 'Server error updating trip details' });
    }
  },

  /**
   * DELETE /api/trips/:id
   * Deletes an existing trip owned by the authenticated user
   */
  delete: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const trip = await prisma.trip.findUnique({
        where: { id }
      });

      if (!trip || trip.userId !== userId) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      await prisma.trip.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Trip deleted successfully'
      });
    } catch (error) {
      console.error('[Delete Trip Error]:', error);
      res.status(500).json({ success: false, message: 'Server error deleting trip' });
    }
  },

  /**
   * GET /api/trips/public/:id
   * Retrieves a single public trip by ID (unauthenticated)
   */
  getPublicById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
          tripStops: {
            include: {
              city: true,
              stopActivities: {
                include: {
                  activity: true
                }
              }
            }
          }
        }
      });

      if (!trip) {
        res.status(404).json({ success: false, message: 'Trip not found' });
        return;
      }

      res.status(200).json(mapTripResponse(trip));
    } catch (error) {
      console.error('[Get Public Trip Error]:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving public trip details' });
    }
  }
};
