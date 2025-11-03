import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Exercise from '../models/Exercise';
import { ApiResponse } from '../types';

export const getAllExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, nivel, search, page = 1, limit } = req.query;
    
    let whereClause: any = { ativo: true };
    
    // Handle category filter
    if (categoria) {
      whereClause.categoria = categoria;
    } else {
      // Exclude warmup and cooldown exercises unless specifically requested
      whereClause.categoria = {
        [Op.notIn]: ['aquecimento', 'alongamento']
      };
    }
    
    if (nivel) {
      whereClause.nivel_dificuldade = nivel;
    }

    let exercises;
    
    if (search) {
      exercises = await Exercise.searchExercises(search as string);
    } else {
      const queryOptions: any = {
        where: whereClause,
        order: [['nome', 'ASC']]
      };
      
      // Only apply limit if specified
      if (limit) {
        queryOptions.limit = Number(limit);
        queryOptions.offset = (Number(page) - 1) * Number(limit);
      }
      
      exercises = await Exercise.findAll(queryOptions);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Exercícios recuperados com sucesso',
      data: exercises,
      pagination: limit ? {
        page: Number(page),
        limit: Number(limit),
        total: exercises.length,
        totalPages: Math.ceil(exercises.length / Number(limit))
      } : undefined
    };

    res.json(response);
  } catch (error) {
    console.error('Get exercises error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar exercícios',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getExerciseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      const response: ApiResponse = {
        success: false,
        message: 'Exercício não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Exercício recuperado com sucesso',
      data: exercise
    };

    res.json(response);
  } catch (error) {
    console.error('Get exercise error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar exercício',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getExercisesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria } = req.params;
    
    const exercises = await Exercise.findByCategory(categoria);

    const response: ApiResponse = {
      success: true,
      message: `Exercícios da categoria ${categoria} recuperados com sucesso`,
      data: exercises
    };

    res.json(response);
  } catch (error) {
    console.error('Get exercises by category error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar exercícios por categoria',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getExercisesByDifficulty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nivel } = req.params;
    
    const exercises = await Exercise.findByDifficulty(nivel);

    const response: ApiResponse = {
      success: true,
      message: `Exercícios de nível ${nivel} recuperados com sucesso`,
      data: exercises
    };

    res.json(response);
  } catch (error) {
    console.error('Get exercises by difficulty error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar exercícios por dificuldade',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const searchExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q) {
      const response: ApiResponse = {
        success: false,
        message: 'Termo de busca é obrigatório'
      };
      res.status(400).json(response);
      return;
    }
    
    const exercises = await Exercise.searchExercises(q as string);

    const response: ApiResponse = {
      success: true,
      message: 'Busca realizada com sucesso',
      data: exercises
    };

    res.json(response);
  } catch (error) {
    console.error('Search exercises error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar exercícios',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getExerciseCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = [
      { id: 'superiores', nome: 'Membros Superiores', descricao: 'Exercícios para braços, ombros e peito' },
      { id: 'inferiores', nome: 'Membros Inferiores', descricao: 'Exercícios para pernas e glúteos' },
      { id: 'core', nome: 'Core', descricao: 'Exercícios para abdômen e região central' },
      { id: 'completo', nome: 'Treino Completo', descricao: 'Exercícios que trabalham todo o corpo' }
    ];

    const response: ApiResponse = {
      success: true,
      message: 'Categorias recuperadas com sucesso',
      data: categories
    };

    res.json(response);
  } catch (error) {
    console.error('Get categories error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar categorias',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getDifficultyLevels = async (req: Request, res: Response): Promise<void> => {
  try {
    const levels = [
      { id: 'iniciante', nome: 'Iniciante', descricao: 'Para quem está começando na calistenia' },
      { id: 'intermediario', nome: 'Intermediário', descricao: 'Para quem já tem alguma experiência' },
      { id: 'avancado', nome: 'Avançado', descricao: 'Para praticantes experientes' }
    ];

    const response: ApiResponse = {
      success: true,
      message: 'Níveis de dificuldade recuperados com sucesso',
      data: levels
    };

    res.json(response);
  } catch (error) {
    console.error('Get difficulty levels error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar níveis de dificuldade',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};
