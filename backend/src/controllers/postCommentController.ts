import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { PostComment, CommunityPost, User } from '../models';

interface CreateCommentRequest {
  texto: string;
}

// Create a new comment
export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params; // post id
    const postId = parseInt(id, 10);
    const commentData: CreateCommentRequest = req.body;

    // Validate input
    if (!commentData.texto || commentData.texto.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Texto do comentário é obrigatório',
      } as ApiResponse);
      return;
    }

    if (commentData.texto.length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Comentário não pode ter mais de 1000 caracteres',
      } as ApiResponse);
      return;
    }

    // Verify post exists
    const post = await CommunityPost.findByPk(postId);
    if (!post || post.status !== 'ativo') {
      res.status(404).json({
        success: false,
        message: 'Post não encontrado',
      } as ApiResponse);
      return;
    }

    // Create comment
    const comment = await PostComment.create({
      id_post: postId,
      id_usuario: user.id,
      texto: commentData.texto.trim(),
    });

    // Increment comment count
    await CommunityPost.incrementComments(postId);

    // Fetch comment with user data
    const commentWithUser = await PostComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nome', 'foto_perfil'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Comentário criado com sucesso',
      data: { comment: commentWithUser },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar comentário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

// Get comments for a post
export const getComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // post id
    const postId = parseInt(id, 10);
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Verify post exists
    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post não encontrado',
      } as ApiResponse);
      return;
    }

    // Get comments
    const comments = await PostComment.findByPost(postId, limitNum, offset);

    // Fetch comments with user data
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const commentData = comment.toJSON();
        const user = await User.findByPk(comment.id_usuario, {
          attributes: ['id', 'nome', 'foto_perfil'],
        });

        return {
          ...commentData,
          user,
        };
      })
    );

    const totalComments = await PostComment.countByPost(postId);

    res.status(200).json({
      success: true,
      data: {
        comments: commentsWithUsers,
        total: totalComments,
        page: pageNum,
        limit: limitNum,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar comentários',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

// Delete comment (only by owner)
export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // comment id
    const commentId = parseInt(id, 10);
    const user = req.user!;

    const comment = await PostComment.findByPk(commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comentário não encontrado',
      } as ApiResponse);
      return;
    }

    // Check if user owns the comment
    if (comment.id_usuario !== user.id) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este comentário',
      } as ApiResponse);
      return;
    }

    const postId = comment.id_post;

    // Delete comment
    await PostComment.destroy({
      where: { id: commentId },
    });

    // Decrement comment count
    await CommunityPost.decrementComments(postId);

    res.status(200).json({
      success: true,
      message: 'Comentário deletado com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar comentário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

