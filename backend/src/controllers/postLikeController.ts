import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { PostLike, CommunityPost } from '../models';

// Toggle like on a post
export const toggleLike = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params; // post id
    const postId = parseInt(id, 10);

    // Verify post exists
    const post = await CommunityPost.findByPk(postId);
    if (!post || post.status !== 'ativo') {
      res.status(404).json({
        success: false,
        message: 'Post não encontrado',
      } as ApiResponse);
      return;
    }

    // Check if user already liked this post
    const existingLike = await PostLike.findByPostAndUser(postId, user.id);

    let liked: boolean;
    if (existingLike) {
      // Unlike - remove like
      await PostLike.destroy({
        where: {
          id_post: postId,
          id_usuario: user.id,
        },
      });
      await CommunityPost.decrementLikes(postId);
      liked = false;
    } else {
      // Like - add like
      await PostLike.create({
        id_post: postId,
        id_usuario: user.id,
      });
      await CommunityPost.incrementLikes(postId);
      liked = true;
    }

    // Fetch updated post
    const updatedPost = await CommunityPost.findByPk(postId);

    res.status(200).json({
      success: true,
      message: liked ? 'Post curtido com sucesso' : 'Post descurtido com sucesso',
      data: {
        liked,
        likesCount: updatedPost?.curtidas_count || 0,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao curtir/descurtir post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

// Get likes for a post
export const getLikes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // post id
    const postId = parseInt(id, 10);

    // Verify post exists
    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post não encontrado',
      } as ApiResponse);
      return;
    }

    const likesCount = await PostLike.countByPost(postId);
    const userLiked = req.user
      ? !!(await PostLike.findByPostAndUser(postId, req.user.id))
      : false;

    res.status(200).json({
      success: true,
      data: {
        likesCount,
        userLiked,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching likes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar curtidas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

