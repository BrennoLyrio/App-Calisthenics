import { Response } from 'express';
import { Goal, WorkoutHistory } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import { Op } from 'sequelize';

// Helper function to safely convert DECIMAL to number - ALWAYS returns a valid number
const toNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return 0;
    return value;
  }
  const parsed = parseFloat(String(value));
  if (isNaN(parsed) || !isFinite(parsed)) return 0;
  return parsed;
};

// Helper function to normalize goal JSON data - ensures all numeric fields are valid numbers
const normalizeGoalData = (goalJson: any): any => {
  const normalized = {
    ...goalJson,
    valor_alvo: toNumber(goalJson?.valor_alvo),
    valor_atual: toNumber(goalJson?.valor_atual),
    meta_semanal: goalJson?.meta_semanal ? toNumber(goalJson.meta_semanal) : null,
  };
  
  // Double-check that values are numbers
  if (typeof normalized.valor_alvo !== 'number' || isNaN(normalized.valor_alvo)) {
    normalized.valor_alvo = 0;
  }
  if (typeof normalized.valor_atual !== 'number' || isNaN(normalized.valor_atual)) {
    normalized.valor_atual = 0;
  }
  
  return normalized;
};

interface CreateGoalRequest {
  descricao: string;
  tipo: 'curto' | 'medio' | 'longo';
  valor_alvo: number;
  data_inicio?: Date;
  data_fim: Date;
  categoria: 'forca' | 'resistencia' | 'flexibilidade' | 'perda_peso' | 'ganho_massa' | 'outro';
  unidade_medida: string;
  meta_semanal?: number;
  observacoes?: string;
}

interface UpdateGoalRequest {
  descricao?: string;
  valor_alvo?: number;
  valor_atual?: number;
  data_fim?: Date;
  status?: 'em_andamento' | 'concluida' | 'pausada';
  meta_semanal?: number;
  observacoes?: string;
}

// Helper function to calculate goal progress from workout history
const calculateGoalProgress = async (userId: number, goal: Goal): Promise<number> => {
  const startDate = goal.data_inicio;
  const endDate = goal.data_fim;
  
  const history = await WorkoutHistory.findAll({
    where: {
      id_usuario: userId,
      data_execucao: {
        [Op.between]: [startDate, endDate]
      }
    }
  });

  let progress = 0;

  switch (goal.categoria) {
    case 'forca':
      // Progress based on workouts completed
      progress = history.length;
      break;
    case 'resistencia':
      // Progress based on total workout duration (in minutes)
      progress = history.reduce((sum, h) => sum + (h.duracao / 60), 0);
      break;
    case 'perda_peso':
    case 'ganho_massa':
      // Progress based on calories burned
      progress = history.reduce((sum, h) => sum + (h.calorias_queimadas || 0), 0);
      break;
    default:
      // Default: count workouts
      progress = history.length;
  }

  return Math.round(progress * 100) / 100; // Round to 2 decimal places
};

export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status } = req.query;

    console.log('🔍 Backend: getGoals called with status filter:', status);

    // First, get all goals to update progress (before filtering)
    let allGoals = await Goal.findByUser(user.id);
    console.log(`📋 Backend: Found ${allGoals.length} total goals for user ${user.id}`);

    // Update valor_atual for each goal based on workout history
    const goalsWithProgress = await Promise.all(
      allGoals.map(async (goal) => {
        const currentProgress = await calculateGoalProgress(user.id, goal);
        goal.valor_atual = currentProgress;
        
        // Check if goal should be marked as completed
        if (goal.valor_atual >= goal.valor_alvo && goal.status === 'em_andamento') {
          goal.status = 'concluida';
          await goal.save();
        }
        
        const goalJson = goal.toJSON();
        return normalizeGoalData(goalJson);
      })
    );

    console.log('📊 Backend: Goals status distribution:', {
      em_andamento: goalsWithProgress.filter(g => g.status === 'em_andamento').length,
      concluida: goalsWithProgress.filter(g => g.status === 'concluida').length,
      pausada: goalsWithProgress.filter(g => g.status === 'pausada').length,
    });

    // Apply status filter AFTER updating progress
    let filteredGoals = goalsWithProgress;
    if (status) {
      // Normalize status to match enum values exactly
      const statusNormalized = String(status).trim();
      filteredGoals = goalsWithProgress.filter(goal => {
        const goalStatus = String(goal.status).trim();
        return goalStatus === statusNormalized;
      });
      console.log(`🔍 Backend: Filter applied - requested: "${statusNormalized}", found ${filteredGoals.length} matching goals`);
      console.log(`📝 Backend: Available statuses:`, [...new Set(goalsWithProgress.map(g => String(g.status).trim()))]);
      if (filteredGoals.length > 0) {
        console.log(`✅ Backend: Filtered goal statuses:`, filteredGoals.map(g => String(g.status).trim()));
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Metas recuperadas com sucesso',
      data: filteredGoals
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get goals error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar metas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getGoalById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const goal = await Goal.findByPk(parseInt(id));

    if (!goal) {
      const response: ApiResponse = {
        success: false,
        message: 'Meta não encontrada'
      };
      res.status(404).json(response);
      return;
    }

    if (goal.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    // Calculate and update progress (same as getGoals)
    const currentProgress = await calculateGoalProgress(user.id, goal);
    goal.valor_atual = currentProgress;
    
    // Check if goal should be marked as completed
    if (goal.valor_atual >= goal.valor_alvo && goal.status === 'em_andamento') {
      goal.status = 'concluida';
      await goal.save();
    }
    
    const goalJson = goal.toJSON();
    const normalized = normalizeGoalData(goalJson);
    
    const goalData = {
      ...normalized,
      progress: currentProgress,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Meta recuperada com sucesso',
      data: goalData
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get goal by id error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar meta',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const goalData: CreateGoalRequest = req.body;

    // Validate dates
    const dataInicio = goalData.data_inicio ? new Date(goalData.data_inicio) : new Date();
    const dataFim = new Date(goalData.data_fim);

    if (dataFim <= dataInicio) {
      const response: ApiResponse = {
        success: false,
        message: 'Data de término deve ser posterior à data de início'
      };
      res.status(400).json(response);
      return;
    }

    // Ensure valor_alvo is a number
    const valorAlvo = typeof goalData.valor_alvo === 'number' 
      ? goalData.valor_alvo 
      : parseFloat(String(goalData.valor_alvo || '0')) || 0;
    
    if (valorAlvo <= 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Valor alvo deve ser maior que zero'
      };
      res.status(400).json(response);
      return;
    }

    const goal = await Goal.create({
      id_usuario: user.id,
      descricao: goalData.descricao,
      tipo: goalData.tipo,
      valor_alvo: valorAlvo,
      valor_atual: 0,
      data_inicio: dataInicio,
      data_fim: dataFim,
      categoria: goalData.categoria,
      unidade_medida: goalData.unidade_medida,
      meta_semanal: goalData.meta_semanal ? parseFloat(String(goalData.meta_semanal)) || undefined : undefined,
      observacoes: goalData.observacoes,
      status: 'em_andamento'
    });

    // Calculate initial progress
    const currentProgress = await calculateGoalProgress(user.id, goal);
    goal.valor_atual = currentProgress;
    await goal.save();

    // Reload goal to ensure we have latest data
    await goal.reload();
    
    const goalJson = goal.toJSON();
    console.log('🔍 Goal JSON after create:', JSON.stringify(goalJson, null, 2));
    console.log('🔍 valor_alvo type:', typeof goalJson.valor_alvo);
    console.log('🔍 valor_alvo value:', goalJson.valor_alvo);
    
    const normalizedGoalData = normalizeGoalData(goalJson);
    console.log('🔍 Goal data after normalization:', JSON.stringify(normalizedGoalData, null, 2));
    console.log('🔍 valor_alvo after normalization:', normalizedGoalData.valor_alvo, typeof normalizedGoalData.valor_alvo);

    const response: ApiResponse = {
      success: true,
      message: 'Meta criada com sucesso',
      data: normalizedGoalData
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create goal error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao criar meta',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const updateData: UpdateGoalRequest = req.body;

    const goal = await Goal.findByPk(parseInt(id));

    if (!goal) {
      const response: ApiResponse = {
        success: false,
        message: 'Meta não encontrada'
      };
      res.status(404).json(response);
      return;
    }

    if (goal.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    // Update fields
    if (updateData.descricao !== undefined) goal.descricao = updateData.descricao;
    if (updateData.valor_alvo !== undefined) goal.valor_alvo = updateData.valor_alvo;
    if (updateData.data_fim !== undefined) goal.data_fim = new Date(updateData.data_fim);
    if (updateData.status !== undefined) goal.status = updateData.status;
    if (updateData.meta_semanal !== undefined) goal.meta_semanal = updateData.meta_semanal;
    if (updateData.observacoes !== undefined) goal.observacoes = updateData.observacoes;

    // If valor_atual is not provided, recalculate from history
    if (updateData.valor_atual !== undefined) {
      goal.valor_atual = updateData.valor_atual;
    } else {
      const currentProgress = await calculateGoalProgress(user.id, goal);
      goal.valor_atual = currentProgress;
    }

    // Check if goal should be marked as completed
    if (goal.valor_atual >= goal.valor_alvo && goal.status === 'em_andamento') {
      goal.status = 'concluida';
    }

    await goal.save();

    const goalJson = goal.toJSON();
    const goalData = normalizeGoalData(goalJson);

    const response: ApiResponse = {
      success: true,
      message: 'Meta atualizada com sucesso',
      data: goalData
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update goal error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar meta',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const goal = await Goal.findByPk(parseInt(id));

    if (!goal) {
      const response: ApiResponse = {
        success: false,
        message: 'Meta não encontrada'
      };
      res.status(404).json(response);
      return;
    }

    if (goal.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    await goal.destroy();

    const response: ApiResponse = {
      success: true,
      message: 'Meta excluída com sucesso'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete goal error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao excluir meta',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const updateGoalProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const goal = await Goal.findByPk(parseInt(id));

    if (!goal) {
      const response: ApiResponse = {
        success: false,
        message: 'Meta não encontrada'
      };
      res.status(404).json(response);
      return;
    }

    if (goal.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    // Recalculate progress from workout history
    const currentProgress = await calculateGoalProgress(user.id, goal);
    goal.valor_atual = currentProgress;

    // Check if goal should be marked as completed
    if (goal.valor_atual >= goal.valor_alvo && goal.status === 'em_andamento') {
      goal.status = 'concluida';
    }

    await goal.save();

    const goalJson = goal.toJSON();
    const goalData = normalizeGoalData(goalJson);

    const response: ApiResponse = {
      success: true,
      message: 'Progresso da meta atualizado com sucesso',
      data: goalData
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update goal progress error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar progresso da meta',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getCompletedGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const limit = parseInt(req.query.limit as string) || 10;

    const goals = await Goal.getCompletedGoals(user.id, limit);

    // Convert DECIMAL values to numbers for all goals
    const goalsWithNumbers = goals.map((goal) => {
      const goalJson = goal.toJSON();
      return normalizeGoalData(goalJson);
    });

    const response: ApiResponse = {
      success: true,
      message: 'Metas concluídas recuperadas com sucesso',
      data: goalsWithNumbers
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get completed goals error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar metas concluídas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

