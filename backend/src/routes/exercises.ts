import { Router } from 'express';
import {
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByDifficulty,
  searchExercises,
  getExerciseCategories,
  getDifficultyLevels,
  getExerciseAlternatives
} from '../controllers/exerciseController';

const router = Router();

// Public routes
router.get('/', getAllExercises);
router.get('/categories', getExerciseCategories);
router.get('/difficulty-levels', getDifficultyLevels);
router.get('/search', searchExercises);
router.get('/category/:categoria', getExercisesByCategory);
router.get('/difficulty/:nivel', getExercisesByDifficulty);
router.get('/:id/alternatives', getExerciseAlternatives);
router.get('/:id', getExerciseById);

export default router;
