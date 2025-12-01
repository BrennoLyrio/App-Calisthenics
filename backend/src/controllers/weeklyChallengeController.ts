import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { WeeklyChallenge, CommunityPost, User } from '../models';

interface CreateChallengeRequest {
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
}

// Get current active challenge
export const getCurrentChallenge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const challenge = await WeeklyChallenge.getCurrentChallenge();

    if (!challenge) {
      // Return null instead of 404 to allow posts without challenge
      res.status(200).json({
        success: true,
        data: { challenge: null },
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: { challenge: challenge.toJSON() },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching current challenge:', error);
    // Return null instead of error to allow app to continue
    res.status(200).json({
      success: true,
      data: { challenge: null },
    } as ApiResponse);
  }
};

// Get ranking for current challenge
export const getRanking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const challenge = await WeeklyChallenge.getCurrentChallenge();

    let posts: any[] = [];
    
    if (challenge) {
      // Get top posts for this challenge
      posts = await CommunityPost.findByChallenge(challenge.id, 20, 0);
    } else {
      // Get all rank posts if no challenge
      posts = await CommunityPost.findByType('rank', 20, 0);
    }

    // Fetch posts with user data
    const ranking = await Promise.all(
      posts.map(async (post, index) => {
        const postData = post.toJSON();
        const user = await User.findByPk(post.id_usuario, {
          attributes: ['id', 'nome'],
        });

        return {
          position: index + 1,
          postId: post.id,
          videoUrl: post.video_url,
          likesCount: post.curtidas_count,
          user,
          createdAt: post.data_postagem,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        challenge: challenge ? challenge.toJSON() : null,
        ranking,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ranking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

// Get all active challenges (admin function - optional)
export const getAllChallenges = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const challenges = await WeeklyChallenge.getAllActive();

    res.status(200).json({
      success: true,
      data: { challenges },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar desafios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

// Create a new challenge (admin function - optional)
export const createChallenge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const challengeData: CreateChallengeRequest = req.body;

    // Validate dates
    const dataInicio = new Date(challengeData.data_inicio);
    const dataFim = new Date(challengeData.data_fim);

    if (dataFim <= dataInicio) {
      res.status(400).json({
        success: false,
        message: 'Data de término deve ser posterior à data de início',
      } as ApiResponse);
      return;
    }

    const challenge = await WeeklyChallenge.create({
      titulo: challengeData.titulo,
      descricao: challengeData.descricao,
      data_inicio: dataInicio,
      data_fim: dataFim,
      ativo: true,
    });

    res.status(201).json({
      success: true,
      message: 'Desafio criado com sucesso',
      data: { challenge },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar desafio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    } as ApiResponse);
  }
};

