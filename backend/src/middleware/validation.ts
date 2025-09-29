import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        error: error.details[0].message
      });
      return;
    }
    
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).max(255).required(),
  idade: Joi.number().integer().min(13).max(120).required(),
  peso: Joi.number().min(20).max(300).required(),
  altura: Joi.number().min(100).max(250).required(),
  nivel_condicionamento: Joi.string().valid('iniciante', 'intermediario', 'avancado').required(),
  foco_treino: Joi.string().valid('superiores', 'inferiores', 'core', 'completo').required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  nome: Joi.string().min(2).max(100),
  idade: Joi.number().integer().min(13).max(120),
  peso: Joi.number().min(20).max(300),
  altura: Joi.number().min(100).max(250),
  nivel_condicionamento: Joi.string().valid('iniciante', 'intermediario', 'avancado'),
  foco_treino: Joi.string().valid('superiores', 'inferiores', 'core', 'completo')
});

export const createWorkoutSchema = Joi.object({
  objetivo: Joi.string().valid('forca', 'resistencia', 'hipertrofia', 'perda_peso').required(),
  nivel: Joi.string().valid('iniciante', 'intermediario', 'avancado').required(),
  nome: Joi.string().min(2).max(100),
  descricao: Joi.string().max(1000),
  exercicios: Joi.array().items(
    Joi.object({
      id_exercicio: Joi.number().integer().positive().required(),
      series: Joi.number().integer().min(1).max(20).required(),
      repeticoes: Joi.number().integer().min(1).max(1000).required(),
      tempo_execucao: Joi.number().integer().min(5).max(3600),
      descanso: Joi.number().integer().min(0).max(600),
      ordem: Joi.number().integer().min(1).max(50).required()
    })
  ).min(1).required()
});

export const createGoalSchema = Joi.object({
  descricao: Joi.string().min(5).max(200).required(),
  tipo: Joi.string().valid('curto', 'medio', 'longo').required(),
  valor_alvo: Joi.number().min(0.01).required(),
  data_fim: Joi.date().greater('now').required(),
  categoria: Joi.string().valid('forca', 'resistencia', 'flexibilidade', 'perda_peso', 'ganho_massa', 'outro').required(),
  unidade_medida: Joi.string().min(1).max(20).required(),
  meta_semanal: Joi.number().min(0),
  observacoes: Joi.string().max(500)
});

export const updateGoalSchema = Joi.object({
  descricao: Joi.string().min(5).max(200),
  valor_alvo: Joi.number().min(0.01),
  data_fim: Joi.date().greater('now'),
  meta_semanal: Joi.number().min(0),
  observacoes: Joi.string().max(500),
  status: Joi.string().valid('em_andamento', 'concluida', 'pausada')
});

export const workoutHistorySchema = Joi.object({
  id_treino: Joi.number().integer().positive().required(),
  duracao: Joi.number().integer().min(1).max(7200).required(),
  series_realizadas: Joi.number().integer().min(0).max(100).required(),
  repeticoes_realizadas: Joi.number().integer().min(0).max(10000).required(),
  notas: Joi.string().max(1000),
  avaliacao_dificuldade: Joi.number().integer().min(1).max(10),
  calorias_queimadas: Joi.number().integer().min(0).max(2000),
  batimentos_medio: Joi.number().integer().min(40).max(220),
  satisfacao: Joi.number().integer().min(1).max(5)
});

export const updateGoalProgressSchema = Joi.object({
  valor_atual: Joi.number().min(0).required(),
  observacoes: Joi.string().max(500)
});
