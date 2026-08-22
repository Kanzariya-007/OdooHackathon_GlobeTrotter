import { Response } from 'express';
import { prisma } from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Prisma } from '@prisma/client';

/**
 * Helper to verify that a trip exists and belongs to the authenticated user.
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

/**
 * Helper to format Expense output JSON correctly mapping Decimal to Number
 */
const mapExpenseResponse = (expense: any) => {
  if (!expense) return null;
  return {
    id: expense.id,
    tripId: expense.tripId,
    title: expense.title,
    amount: Number(expense.amount),
    currency: expense.currency,
    category: expense.category,
    date: expense.date.toISOString().split('T')[0],
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt
  };
};

export const ExpenseController = {
  /**
   * POST /api/trips/:tripId/expenses
   * Adds an expense to the user's trip
   */
  create: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;
      const { title, amount, currency, category, date } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Verify trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Validate title
      if (!title || typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({ success: false, message: 'Title is required' });
        return;
      }

      // Validate amount
      const numAmount = Number(amount);
      if (amount === undefined || amount === null || isNaN(numAmount) || numAmount <= 0) {
        res.status(400).json({ success: false, message: 'Amount must be a valid positive number' });
        return;
      }

      // Validate currency
      if (!currency || typeof currency !== 'string' || currency.trim() === '') {
        res.status(400).json({ success: false, message: 'Currency is required' });
        return;
      }

      // Validate category
      if (!category || typeof category !== 'string' || category.trim() === '') {
        res.status(400).json({ success: false, message: 'Category is required' });
        return;
      }

      // Validate date
      if (!date || isNaN(Date.parse(date))) {
        res.status(400).json({ success: false, message: 'Valid date is required' });
        return;
      }

      // Create Expense record
      const expense = await prisma.expense.create({
        data: {
          tripId,
          title: title.trim(),
          amount: new Prisma.Decimal(numAmount),
          currency: currency.trim(),
          category: category.trim(),
          date: new Date(date)
        }
      });

      res.status(201).json({
        success: true,
        expense: mapExpenseResponse(expense)
      });
    } catch (error) {
      console.error('[Create Expense Error]:', error);
      res.status(500).json({ success: false, message: 'Server error creating expense' });
    }
  },

  /**
   * GET /api/trips/:tripId/expenses
   * Retrieves all expenses for the authenticated user's trip
   */
  getAll: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Verify trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      const expenses = await prisma.expense.findMany({
        where: { tripId },
        orderBy: { date: 'desc' }
      });

      res.status(200).json(expenses.map(mapExpenseResponse));
    } catch (error) {
      console.error('[Get Expenses Error]:', error);
      res.status(500).json({ success: false, message: 'Server error retrieving expenses' });
    }
  },

  /**
   * PUT /api/trips/:tripId/expenses/:expenseId
   * Updates an existing expense
   */
  update: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId, expenseId } = req.params;
      const userId = req.user?.id;
      const { title, amount, currency, category, date } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Verify trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Verify expense exists and belongs to the trip
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId }
      });

      if (!expense || expense.tripId !== tripId) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }

      const updateData: any = {};

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          res.status(400).json({ success: false, message: 'Title cannot be empty' });
          return;
        }
        updateData.title = title.trim();
      }

      if (amount !== undefined) {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          res.status(400).json({ success: false, message: 'Amount must be a valid positive number' });
          return;
        }
        updateData.amount = new Prisma.Decimal(numAmount);
      }

      if (currency !== undefined) {
        if (typeof currency !== 'string' || currency.trim() === '') {
          res.status(400).json({ success: false, message: 'Currency cannot be empty' });
          return;
        }
        updateData.currency = currency.trim();
      }

      if (category !== undefined) {
        if (typeof category !== 'string' || category.trim() === '') {
          res.status(400).json({ success: false, message: 'Category cannot be empty' });
          return;
        }
        updateData.category = category.trim();
      }

      if (date !== undefined) {
        if (isNaN(Date.parse(date))) {
          res.status(400).json({ success: false, message: 'Invalid date format' });
          return;
        }
        updateData.date = new Date(date);
      }

      const updatedExpense = await prisma.expense.update({
        where: { id: expenseId },
        data: updateData
      });

      res.status(200).json({
        success: true,
        expense: mapExpenseResponse(updatedExpense)
      });
    } catch (error) {
      console.error('[Update Expense Error]:', error);
      res.status(500).json({ success: false, message: 'Server error updating expense' });
    }
  },

  /**
   * DELETE /api/trips/:tripId/expenses/:expenseId
   * Deletes an existing expense
   */
  delete: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId, expenseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Verify trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Verify expense exists and belongs to the trip
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId }
      });

      if (!expense || expense.tripId !== tripId) {
        res.status(404).json({ success: false, message: 'Expense not found' });
        return;
      }

      await prisma.expense.delete({
        where: { id: expenseId }
      });

      res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('[Delete Expense Error]:', error);
      res.status(500).json({ success: false, message: 'Server error deleting expense' });
    }
  },

  /**
   * GET /api/trips/:tripId/summary
   * Aggregates stats and expense category groups for a trip summary report
   */
  getSummary: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { tripId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Verify trip ownership
      const trip = await verifyTripOwnership(tripId, userId, res);
      if (!trip) return;

      // Count stops
      const totalStops = await prisma.tripStop.count({
        where: { tripId }
      });

      // Count assigned activities across all stops of the trip
      const totalActivities = await prisma.stopActivity.count({
        where: {
          tripStop: { tripId }
        }
      });

      // Fetch expenses to perform programmatic aggregation safely
      const expenses = await prisma.expense.findMany({
        where: { tripId }
      });

      let totalExpenses = 0;
      const expensesByCategory: Record<string, number> = {};

      for (const exp of expenses) {
        const val = Number(exp.amount);
        totalExpenses += val;
        
        const cat = (exp.category || 'other').trim().toLowerCase();
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + val;
      }

      res.status(200).json({
        success: true,
        data: {
          trip: {
            id: trip.id,
            title: trip.title,
            startDate: trip.startDate.toISOString().split('T')[0],
            endDate: trip.endDate.toISOString().split('T')[0]
          },
          statistics: {
            totalStops,
            totalActivities,
            totalExpenses,
            expenseCount: expenses.length
          },
          expensesByCategory
        }
      });
    } catch (error) {
      console.error('[Get Summary Error]:', error);
      res.status(500).json({ success: false, message: 'Server error generating trip summary' });
    }
  }
};
