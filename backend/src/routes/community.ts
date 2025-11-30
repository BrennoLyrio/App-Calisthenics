import express from 'express';
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
router.post('/posts', uploadVideo, communityController.createPost);
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

