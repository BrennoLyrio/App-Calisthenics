import { Router } from 'express';
import {
  createCustomWorkout,
  getCustomWorkouts,
  getCustomWorkoutById,
  updateCustomWorkout,
  deleteCustomWorkout
} from '../controllers/customWorkoutController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Custom workout management
router.post('/', createCustomWorkout);
router.get('/', getCustomWorkouts);
router.get('/:id', getCustomWorkoutById);
router.put('/:id', updateCustomWorkout);
router.delete('/:id', deleteCustomWorkout);

export default router;


