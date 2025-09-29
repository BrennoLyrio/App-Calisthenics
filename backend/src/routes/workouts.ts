import { Router } from 'express';
import {
  createWorkout,
  getUserWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getRecommendedWorkouts,
  startWorkout
} from '../controllers/workoutController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, createWorkoutSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Workout management
router.post('/', validateRequest(createWorkoutSchema), createWorkout);
router.get('/', getUserWorkouts);
router.get('/recommended', getRecommendedWorkouts);
router.get('/:id', getWorkoutById);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);
router.post('/:id/start', startWorkout);

export default router;
