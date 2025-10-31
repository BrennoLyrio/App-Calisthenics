import { Router } from 'express';
import {
  saveWorkoutHistory,
  getUserHistory,
  getWorkoutHistoryById,
  getWorkoutStats,
  deleteWorkoutHistory
} from '../controllers/workoutHistoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Workout history routes
router.post('/', saveWorkoutHistory);
router.get('/', getUserHistory);
router.get('/stats', getWorkoutStats);
router.get('/:id', getWorkoutHistoryById);
router.delete('/:id', deleteWorkoutHistory);

export default router;

