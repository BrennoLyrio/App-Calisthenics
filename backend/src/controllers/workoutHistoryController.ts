import { Request, Response } from 'express';
import { WorkoutHistory } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { Op } from 'sequelize';

interface SaveWorkoutHistoryRequest {
  id_treino?: number;
  nome_treino?: string;
  duracao: number;
  series_realizadas: number;
  repeticoes_realizadas: number;
  notas?: string;
  avaliacao_dificuldade?: number;
  calorias_queimadas?: number;
  batimentos_medio?: number;
  satisfacao?: number;
}

export const saveWorkoutHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const historyData: SaveWorkoutHistoryRequest = req.body;

    const workoutHistory = await WorkoutHistory.create({
      id_usuario: user.id,
      id_treino: historyData.id_treino,
      nome_treino: historyData.nome_treino,
      data_execucao: new Date(),
      duracao: historyData.duracao,
      series_realizadas: historyData.series_realizadas,
      repeticoes_realizadas: historyData.repeticoes_realizadas,
      notas: historyData.notas,
      avaliacao_dificuldade: historyData.avaliacao_dificuldade,
      calorias_queimadas: historyData.calorias_queimadas,
      batimentos_medio: historyData.batimentos_medio,
      satisfacao: historyData.satisfacao
    });

    const response: ApiResponse = {
      success: true,
      message: 'Histórico de treino salvo com sucesso',
      data: workoutHistory
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Save workout history error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao salvar histórico de treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getUserHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, days } = req.query;

    let whereClause: any = { id_usuario: user.id };

    // Filter by days if provided
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));
      whereClause.data_execucao = {
        [Op.gte]: startDate
      };
    }

    const workoutHistories = await WorkoutHistory.findAll({
      where: whereClause,
      order: [['data_execucao', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    const total = await WorkoutHistory.count({ where: whereClause });

    const response: ApiResponse = {
      success: true,
      message: 'Histórico de treinos recuperado com sucesso',
      data: workoutHistories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get user history error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar histórico de treinos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getWorkoutHistoryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const workoutHistory = await WorkoutHistory.findOne({
      where: {
        id,
        id_usuario: user.id
      }
    });

    if (!workoutHistory) {
      const response: ApiResponse = {
        success: false,
        message: 'Histórico de treino não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Histórico de treino recuperado com sucesso',
      data: workoutHistory
    };

    res.json(response);
  } catch (error) {
    console.error('Get workout history by id error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar histórico de treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getWorkoutStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { days = 30, weeks = 12 } = req.query;

    // Get general stats
    const stats = await WorkoutHistory.getProgressStats(user.id, Number(days));

    // Get weekly progress
    const weeklyProgress = await WorkoutHistory.getWeeklyProgress(user.id, Number(weeks));

    const response: ApiResponse = {
      success: true,
      message: 'Estatísticas recuperadas com sucesso',
      data: {
        generalStats: stats,
        weeklyProgress
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get workout stats error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar estatísticas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const deleteWorkoutHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const workoutHistory = await WorkoutHistory.findOne({
      where: {
        id,
        id_usuario: user.id
      }
    });

    if (!workoutHistory) {
      const response: ApiResponse = {
        success: false,
        message: 'Histórico de treino não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    await workoutHistory.destroy();

    const response: ApiResponse = {
      success: true,
      message: 'Histórico de treino excluído com sucesso'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete workout history error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao excluir histórico de treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

