import { Response } from 'express';
import { ThematicProgram, UserProgram } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

// Helper function to normalize program data (convert arrays and numbers)
const normalizeProgramData = (program: any): any => {
  const normalized = { ...program };
  
  // Ensure arrays are properly formatted
  if (normalized.exercicios_incluidos && typeof normalized.exercicios_incluidos === 'string') {
    try {
      normalized.exercicios_incluidos = JSON.parse(normalized.exercicios_incluidos);
    } catch (e) {
      normalized.exercicios_incluidos = [];
    }
  }
  
  if (normalized.requisitos && typeof normalized.requisitos === 'string') {
    try {
      normalized.requisitos = JSON.parse(normalized.requisitos);
    } catch (e) {
      normalized.requisitos = [];
    }
  }
  
  if (normalized.beneficios && typeof normalized.beneficios === 'string') {
    try {
      normalized.beneficios = JSON.parse(normalized.beneficios);
    } catch (e) {
      normalized.beneficios = [];
    }
  }
  
  return normalized;
};

// Get all active programs/challenges
export const getPrograms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { categoria, nivel } = req.query;
    
    let programs;
    
    // Build query conditions
    const whereConditions: any = {
      ativo: true
    };
    
    if (categoria) {
      whereConditions.categoria = categoria as string;
    }
    
    if (nivel) {
      whereConditions.nivel_requerido = nivel as string;
    }
    
    // Always use findAll with whereConditions for consistency
    // If no filters, whereConditions will only have { ativo: true }
    programs = await ThematicProgram.findAll({
      where: whereConditions,
      order: [['nome', 'ASC']]
    });
    
    const normalizedPrograms = programs.map(program => {
      const programJson = program.toJSON();
      return normalizeProgramData(programJson);
    });
    
    const response: ApiResponse = {
      success: true,
      message: 'Programas recuperados com sucesso',
      data: normalizedPrograms
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Get programs error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar programas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// Get program by ID
export const getProgramById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const program = await ThematicProgram.findByPk(parseInt(id));
    
    if (!program) {
      const response: ApiResponse = {
        success: false,
        message: 'Programa não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    // Get program stats
    const stats = await UserProgram.getProgramStats(parseInt(id));
    
    const programJson = program.toJSON();
    const normalized = normalizeProgramData(programJson);
    
    const programData = {
      ...normalized,
      stats
    };
    
    const response: ApiResponse = {
      success: true,
      message: 'Programa recuperado com sucesso',
      data: programData
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Get program by id error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar programa',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// Search programs
export const searchPrograms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      const response: ApiResponse = {
        success: false,
        message: 'Termo de busca é obrigatório'
      };
      res.status(400).json(response);
      return;
    }
    
    const programs = await ThematicProgram.searchPrograms(q);
    
    const normalizedPrograms = programs.map(program => {
      const programJson = program.toJSON();
      return normalizeProgramData(programJson);
    });
    
    const response: ApiResponse = {
      success: true,
      message: 'Busca realizada com sucesso',
      data: normalizedPrograms
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Search programs error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar programas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// Get user's programs
export const getUserPrograms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status } = req.query;
    
    let userPrograms;
    
    if (status) {
      if (status === 'ativo') {
        userPrograms = await UserProgram.findActiveByUser(user.id);
      } else if (status === 'concluido') {
        userPrograms = await UserProgram.getCompletedPrograms(user.id);
      } else {
        userPrograms = await UserProgram.findByUser(user.id);
      }
    } else {
      userPrograms = await UserProgram.findByUser(user.id);
    }
    
    // Include program details
    const programsWithDetails = await Promise.all(
      userPrograms.map(async (userProgram) => {
        const program = await ThematicProgram.findByPk(userProgram.id_programa);
        const userProgramJson = userProgram.toJSON();
        const programJson = program ? normalizeProgramData(program.toJSON()) : null;
        
        return {
          ...userProgramJson,
          programa: programJson
        };
      })
    );
    
    const response: ApiResponse = {
      success: true,
      message: 'Programas do usuário recuperados com sucesso',
      data: programsWithDetails
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Get user programs error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar programas do usuário',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// Join a program/challenge
export const joinProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    
    const program = await ThematicProgram.findByPk(parseInt(id));
    
    if (!program) {
      const response: ApiResponse = {
        success: false,
        message: 'Programa não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    if (!program.ativo) {
      const response: ApiResponse = {
        success: false,
        message: 'Programa não está disponível'
      };
      res.status(400).json(response);
      return;
    }
    
    // Check if user already joined
    const existingUserProgram = await UserProgram.findOne({
      where: {
        id_usuario: user.id,
        id_programa: parseInt(id)
      }
    });
    
    if (existingUserProgram) {
      const response: ApiResponse = {
        success: false,
        message: 'Você já está participando deste programa'
      };
      res.status(400).json(response);
      return;
    }
    
    // Create user program
    const userProgram = await UserProgram.create({
      id_usuario: user.id,
      id_programa: parseInt(id),
      progresso: 0,
      status: 'ativo',
      data_inicio: new Date(),
      dias_concluidos: 0
    });
    
    const programJson = program.toJSON();
    const normalized = normalizeProgramData(programJson);
    
    const response: ApiResponse = {
      success: true,
      message: 'Você se inscreveu no programa com sucesso!',
      data: {
        userProgram: userProgram.toJSON(),
        programa: normalized
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Join program error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao se inscrever no programa',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// Update user program progress
export const updateUserProgramProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { progresso, dias_concluidos, notas } = req.body;
    
    const userProgram = await UserProgram.findOne({
      where: {
        id: parseInt(id),
        id_usuario: user.id
      }
    });
    
    if (!userProgram) {
      const response: ApiResponse = {
        success: false,
        message: 'Programa do usuário não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    // Update progress
    if (progresso !== undefined) {
      userProgram.progresso = Math.min(100, Math.max(0, parseFloat(progresso)));
    }
    
    if (dias_concluidos !== undefined) {
      userProgram.dias_concluidos = parseInt(dias_concluidos);
      
      // Update progress based on days completed
      const program = await ThematicProgram.findByPk(userProgram.id_programa);
      if (program) {
        const calculatedProgress = (userProgram.dias_concluidos / program.duracao_dias) * 100;
        userProgram.progresso = Math.min(100, calculatedProgress);
      }
    }
    
    if (notas !== undefined) {
      userProgram.notas = notas;
    }
    
    userProgram.ultima_atividade = new Date();
    
    await userProgram.save();
    
    const response: ApiResponse = {
      success: true,
      message: 'Progresso atualizado com sucesso',
      data: userProgram.toJSON()
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Update user program progress error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar progresso',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// Complete a program
export const completeProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { avaliacao } = req.body;
    
    const userProgram = await UserProgram.findOne({
      where: {
        id: parseInt(id),
        id_usuario: user.id
      }
    });
    
    if (!userProgram) {
      const response: ApiResponse = {
        success: false,
        message: 'Programa do usuário não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    userProgram.status = 'concluido';
    userProgram.progresso = 100;
    userProgram.data_fim = new Date();
    
    if (avaliacao !== undefined) {
      userProgram.avaliacao = Math.min(5, Math.max(1, parseInt(avaliacao)));
    }
    
    await userProgram.save();
    
    const program = await ThematicProgram.findByPk(userProgram.id_programa);
    const programJson = program ? normalizeProgramData(program.toJSON()) : null;
    
    const response: ApiResponse = {
      success: true,
      message: 'Parabéns! Você completou o programa! 🎉',
      data: {
        userProgram: userProgram.toJSON(),
        programa: programJson
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Complete program error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao completar programa',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// Pause/Resume a program
export const toggleProgramStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ativo', 'pausado'].includes(status)) {
      const response: ApiResponse = {
        success: false,
        message: 'Status inválido. Use "ativo" ou "pausado"'
      };
      res.status(400).json(response);
      return;
    }
    
    const userProgram = await UserProgram.findOne({
      where: {
        id: parseInt(id),
        id_usuario: user.id
      }
    });
    
    if (!userProgram) {
      const response: ApiResponse = {
        success: false,
        message: 'Programa do usuário não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    userProgram.status = status as 'ativo' | 'pausado';
    
    if (status === 'ativo') {
      userProgram.ultima_atividade = new Date();
    }
    
    await userProgram.save();
    
    const response: ApiResponse = {
      success: true,
      message: status === 'pausado' ? 'Programa pausado com sucesso' : 'Programa retomado com sucesso',
      data: userProgram.toJSON()
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Toggle program status error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao alterar status do programa'
    };
    res.status(500).json(response);
  }
};

export const leaveProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    
    const userProgram = await UserProgram.findOne({
      where: {
        id: parseInt(id),
        id_usuario: user.id
      }
    });
    
    if (!userProgram) {
      const response: ApiResponse = {
        success: false,
        message: 'Programa do usuário não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    // Delete the user program, which will zero all progress
    await userProgram.destroy();
    
    const response: ApiResponse = {
      success: true,
      message: 'Você desistiu do programa. Todo o progresso foi removido.',
      data: null
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Leave program error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao alterar status do programa',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

