import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { uploadVideo } from '../config/multer';
import * as communityController from '../controllers/communityController';
import * as postCommentController from '../controllers/postCommentController';
import * as postLikeController from '../controllers/postLikeController';
import * as weeklyChallengeController from '../controllers/weeklyChallengeController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Weekly Challenge routes
router.get('/challenges/current', weeklyChallengeController.getCurrentChallenge);
router.get('/challenges/ranking', weeklyChallengeController.getRanking);
router.get('/challenges', weeklyChallengeController.getAllChallenges);
router.post('/challenges', weeklyChallengeController.createChallenge);

// Community Post routes
router.post('/posts', (req, res, next) => {
  uploadVideo(req, res, (err: any) => {
    if (err) {
      console.error('❌ Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            message: 'Arquivo muito grande. Tamanho máximo: 50MB',
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: err.message || 'Erro ao fazer upload do arquivo',
        });
        return;
      }
      if (err.message) {
        res.status(400).json({
          success: false,
          message: err.message,
        });
        return;
      }
      // Fallback para outros erros
      res.status(400).json({
        success: false,
        message: 'Erro ao fazer upload do arquivo',
      });
      return;
    }
    next();
  });
}, communityController.createPost);
router.get('/posts', communityController.getPosts);
router.get('/posts/:id', communityController.getPostById);
router.delete('/posts/:id', communityController.deletePost);

// Post Like routes
router.post('/posts/:id/like', postLikeController.toggleLike);
router.get('/posts/:id/likes', postLikeController.getLikes);

// Post Comment routes
router.post('/posts/:id/comments', postCommentController.createComment);
router.get('/posts/:id/comments', postCommentController.getComments);
router.delete('/comments/:id', postCommentController.deleteComment);

export default router;

