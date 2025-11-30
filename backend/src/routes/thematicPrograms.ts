import { Router } from 'express';
import {
  getPrograms,
  getProgramById,
  searchPrograms,
  getUserPrograms,
  joinProgram,
  updateUserProgramProgress,
  completeProgram,
  toggleProgramStatus,
  leaveProgram,
} from '../controllers/thematicProgramController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all programs (with optional filters: categoria, nivel)
router.get('/', getPrograms);

// Search programs (MUST be before /:id route)
router.get('/search', searchPrograms);

// Get user's programs (MUST be before /:id route)
router.get('/user/my-programs', getUserPrograms);

// Get program by id (MUST be last to avoid conflicts)
router.get('/:id', getProgramById);

// Join a program
router.post('/:id/join', joinProgram);

// Update user program progress
router.put('/user/:id/progress', updateUserProgramProgress);

// Complete a program
router.put('/user/:id/complete', completeProgram);

// Pause/Resume a program
router.put('/user/:id/status', toggleProgramStatus);

// Leave program (abandon and reset progress)
router.delete('/user/:id', leaveProgram);

export default router;

