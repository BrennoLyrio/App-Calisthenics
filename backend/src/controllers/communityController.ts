import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { CommunityPost, WeeklyChallenge, PostLike, PostComment, User } from '../models';
import { uploadVideo, getVideoUrl, deleteVideoFile } from '../config/multer';
import path from 'path';

interface CreatePostRequest {
  tipo: 'rank' | 'help';
  titulo?: string;
  descricao?: string;
  duvida?: string;
  id_desafio_semanal?: number;
}

// Create a new post with video upload
export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const postData: CreatePostRequest = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'Vídeo é obrigatório',
      } as ApiResponse);
      return;
    }

    // Validate required fields based on type
    if (postData.tipo === 'help' && !postData.duvida && !postData.titulo) {
      res.status(400).json({
        success: false,
        message: 'Título ou dúvida é obrigatório para posts de ajuda',
      } as ApiResponse);
      return;
    }

    // Allow rank posts without challenge for now (will be improved)
    // if (postData.tipo === 'rank' && !postData.id_desafio_semanal) {
    //   res.status(400).json({
    //     success: false,
    //     message: 'Desafio semanal é obrigatório para posts de ranking',
    //   } as ApiResponse);
    //   return;
    // }

    // Verify challenge exists if provided
    if (postData.id_desafio_semanal) {
      const challenge = await WeeklyChallenge.findByPk(postData.id_desafio_semanal);
      if (!challenge || !challenge.ativo) {
        res.status(404).json({
          success: false,
          message: 'Desafio semanal não encontrado ou inativo',
        } as ApiResponse);
        return;
      }
    }

    // Get video URL
    const videoUrl = getVideoUrl(file.filename);

    // Create post
    const post = await CommunityPost.create({
      id_usuario: user.id,
      tipo: postData.tipo,
      titulo: postData.titulo,
      descricao: postData.descricao,
      duvida: postData.duvida,
      video_url: videoUrl,
      id_desafio_semanal: postData.id_desafio_semanal || undefined,
      curtidas_count: 0,
      comentarios_count: 0,
      data_postagem: new Date(),
      status: 'ativo',
    });

    // Fetch post with user data
    const postWithUser = await CommunityPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nome', 'foto_perfil'],
        },
        {
          model: WeeklyChallenge,
          as: 'weeklyChallenge',
          required: false,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Post criado com sucesso',
      data: { post: postWithUser },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating post:', error);
    
    // Clean up uploaded file if post creation failed
    if (req.file) {
      deleteVideoFile(req.file.filename);
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

// Get posts with filters
export const getPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { tipo, id_desafio, page = '1', limit = '20' } = req.query || {};
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let posts: CommunityPost[] = [];

    try {
      if (tipo === 'rank' && id_desafio) {
        // Get posts for specific challenge
        const challengeId = parseInt(id_desafio as string, 10);
        if (!isNaN(challengeId)) {
          posts = await CommunityPost.findByChallenge(challengeId, limitNum, offset);
        }
      } else if (tipo === 'rank' || tipo === 'help') {
        // Get posts by type
        posts = await CommunityPost.findByType(tipo as 'rank' | 'help', limitNum, offset);
      } else {
        // Get all active posts
        posts = await CommunityPost.findAll({
          where: { status: 'ativo' },
          order: [['data_postagem', 'DESC']],
          limit: limitNum,
          offset,
        });
      }
    } catch (queryError: any) {
      console.error('Error querying posts:', queryError);
      console.error('Query error details:', {
        tipo,
        id_desafio,
        page: pageNum,
        limit: limitNum,
        offset,
        error: queryError.message,
        stack: queryError.stack,
      });
      // Return empty array if query fails
      posts = [];
    }

    // If no posts found, return empty array
    if (!posts || posts.length === 0) {
      res.status(200).json({
        success: true,
        data: { posts: [], page: pageNum, limit: limitNum },
      } as ApiResponse);
      return;
    }

    // Fetch posts with user and challenge data
    const postsWithData = await Promise.all(
      posts.map(async (post) => {
        try {
          if (!post || !post.id) {
            return null;
          }

          const postData = post.toJSON();
          
          let user = null;
          try {
            if (postData.id_usuario) {
              user = await User.findByPk(postData.id_usuario, {
                attributes: ['id', 'nome', 'foto_perfil'],
              });
            }
          } catch (err: any) {
            console.error(`Error fetching user ${postData.id_usuario} for post ${post.id}:`, err?.message || err);
          }

          let weeklyChallenge = null;
          if (postData.id_desafio_semanal) {
            try {
              weeklyChallenge = await WeeklyChallenge.findByPk(postData.id_desafio_semanal);
            } catch (err: any) {
              console.error(`Error fetching challenge ${postData.id_desafio_semanal} for post ${post.id}:`, err?.message || err);
            }
          }

          // Check if current user liked this post
          let userLiked = false;
          if (req.user && req.user.id) {
            try {
              const like = await PostLike.findByPostAndUser(post.id, req.user.id);
              userLiked = !!like;
            } catch (err: any) {
              console.error(`Error checking like for post ${post.id}:`, err?.message || err);
            }
          }

          return {
            ...postData,
            user: user ? user.toJSON() : null,
            weeklyChallenge: weeklyChallenge ? weeklyChallenge.toJSON() : null,
            userLiked,
          };
        } catch (err: any) {
          console.error(`Error processing post ${post?.id}:`, err?.message || err);
          // Return basic post data if processing fails
          return post.toJSON();
        }
      })
    );

    // Filter out null entries
    const validPosts = postsWithData.filter(post => post !== null);

    res.status(200).json({
      success: true,
      data: { posts: validPosts, page: pageNum, limit: limitNum },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar posts',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    } as ApiResponse);
  }
};

// Get post by ID
export const getPostById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const postId = parseInt(id, 10);

    const post = await CommunityPost.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nome', 'foto_perfil'],
        },
        {
          model: WeeklyChallenge,
          as: 'weeklyChallenge',
          required: false,
        },
      ],
    });

    if (!post || post.status !== 'ativo') {
      res.status(404).json({
        success: false,
        message: 'Post não encontrado',
      } as ApiResponse);
      return;
    }

    // Check if current user liked this post
    let userLiked = false;
    if (req.user) {
      const like = await PostLike.findByPostAndUser(post.id, req.user.id);
      userLiked = !!like;
    }

    res.status(200).json({
      success: true,
      data: { post: { ...post.toJSON(), userLiked } },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

// Delete post (only by owner)
export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const postId = parseInt(id, 10);
    const user = req.user!;

    const post = await CommunityPost.findByPk(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Post não encontrado',
      } as ApiResponse);
      return;
    }

    // Check if user owns the post
    if (post.id_usuario !== user.id) {
      res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este post',
      } as ApiResponse);
      return;
    }

    // Delete video file
    const filename = path.basename(post.video_url);
    deleteVideoFile(filename);

    // Soft delete post
    post.status = 'removido';
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post deletado com sucesso',
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

