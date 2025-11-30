import { Router } from 'express';
import { 
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getCompletedGoals
} from '../controllers/goalController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get completed goals (MUST be before /:id route)
router.get('/completed', getCompletedGoals);

// Get all goals (with optional status filter)
router.get('/', getGoals);

// Get goal by id (MUST be last to avoid conflicts)
router.get('/:id', getGoalById);

// Create new goal
router.post('/', createGoal);

// Update goal
router.put('/:id', updateGoal);

// Update goal progress (recalculate from history)
router.patch('/:id/progress', updateGoalProgress);

// Delete goal
router.delete('/:id', deleteGoal);

export default router;

