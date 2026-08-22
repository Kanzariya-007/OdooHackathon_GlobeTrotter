import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all expense endpoints
router.use(authMiddleware as any);

router.post('/:tripId/expenses', ExpenseController.create);
router.get('/:tripId/expenses', ExpenseController.getAll);
router.put('/:tripId/expenses/:expenseId', ExpenseController.update);
router.delete('/:tripId/expenses/:expenseId', ExpenseController.delete);

router.get('/:tripId/summary', ExpenseController.getSummary);

export default router;
