import { Request, Response } from 'express';
import { Workout, WorkoutExercise, Exercise, WorkoutHistory } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse, CreateWorkoutRequest } from '../types';

export const createWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const workoutData: CreateWorkoutRequest = req.body;

    // Create workout
    const workout = await Workout.create({
      id_usuario: user.id,
      objetivo: workoutData.objetivo,
      nivel: workoutData.nivel,
      nome: workoutData.nome,
      descricao: workoutData.descricao
    });

    // Add exercises to workout
    for (const exerciseData of workoutData.exercicios) {
      await WorkoutExercise.create({
        id_treino: workout.id,
        id_exercicio: exerciseData.id_exercicio,
        series: exerciseData.series,
        repeticoes: exerciseData.repeticoes,
        tempo_execucao: exerciseData.tempo_execucao,
        descanso: exerciseData.descanso,
        ordem: exerciseData.ordem
      });
    }

    // Calculate estimated duration and calories
    const workoutExercises = await WorkoutExercise.findAll({
      where: { id_treino: workout.id },
      include: [{ model: Exercise, as: 'exercise' }]
    });

    let duracaoEstimada = 0;
    let caloriasEstimadas = 0;

    for (const we of workoutExercises) {
      const exercise = (we as any).exercise;
      if (exercise) {
        duracaoEstimada += (we.series * (we.tempo_execucao || exercise.tempo_estimado)) + (we.descanso || 60) * (we.series - 1);
        caloriasEstimadas += exercise.calorias_estimadas * we.series;
      }
    }

    // Update workout with calculated values
    await workout.update({
      duracao_estimada: Math.round(duracaoEstimada / 60), // Convert to minutes
      calorias_estimadas: caloriasEstimadas
    });

    const response: ApiResponse = {
      success: true,
      message: 'Treino criado com sucesso',
      data: {
        workout: {
          id: workout.id,
          nome: workout.nome,
          descricao: workout.descricao,
          objetivo: workout.objetivo,
          nivel: workout.nivel,
          duracao_estimada: workout.duracao_estimada,
          calorias_estimadas: workout.calorias_estimadas,
          data_criacao: workout.data_criacao
        }
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao criar treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getUserWorkouts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { page = 1, limit = 10 } = req.query;

    const workouts = await Workout.findByUser(user.id);
    const paginatedWorkouts = workouts.slice(
      (Number(page) - 1) * Number(limit),
      Number(page) * Number(limit)
    );

    const response: ApiResponse = {
      success: true,
      message: 'Treinos recuperados com sucesso',
      data: paginatedWorkouts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: workouts.length,
        totalPages: Math.ceil(workouts.length / Number(limit))
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get user workouts error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar treinos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getWorkoutById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const workout = await Workout.findByPk(id, {
      include: [
        {
          model: WorkoutExercise,
          as: 'workoutExercises',
          include: [{ model: Exercise, as: 'exercise' }]
        }
      ]
    });

    if (!workout) {
      const response: ApiResponse = {
        success: false,
        message: 'Treino não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    // Check if user owns the workout
    if (workout.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Treino recuperado com sucesso',
      data: workout
    };

    res.json(response);
  } catch (error) {
    console.error('Get workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const updateWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const updateData = req.body;

    const workout = await Workout.findByPk(id);

    if (!workout) {
      const response: ApiResponse = {
        success: false,
        message: 'Treino não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    // Check if user owns the workout
    if (workout.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    // Update workout
    await workout.update(updateData);

    const response: ApiResponse = {
      success: true,
      message: 'Treino atualizado com sucesso',
      data: workout
    };

    res.json(response);
  } catch (error) {
    console.error('Update workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const deleteWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const workout = await Workout.findByPk(id);

    if (!workout) {
      const response: ApiResponse = {
        success: false,
        message: 'Treino não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    // Check if user owns the workout
    if (workout.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    // Soft delete (set as inactive)
    await workout.update({ ativo: false });

    const response: ApiResponse = {
      success: true,
      message: 'Treino excluído com sucesso'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao excluir treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getRecommendedWorkouts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { objetivo, nivel } = req.query;

    const workouts = await Workout.getRecommendedWorkouts(
      user.id,
      objetivo as string || user.nivel_condicionamento,
      nivel as string || user.nivel_condicionamento
    );

    const response: ApiResponse = {
      success: true,
      message: 'Treinos recomendados recuperados com sucesso',
      data: workouts
    };

    res.json(response);
  } catch (error) {
    console.error('Get recommended workouts error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar treinos recomendados',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const startWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const workout = await Workout.findByPk(id);

    if (!workout) {
      const response: ApiResponse = {
        success: false,
        message: 'Treino não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    // Check if user owns the workout
    if (workout.id_usuario !== user.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Acesso negado'
      };
      res.status(403).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Treino iniciado com sucesso',
      data: {
        workout_id: workout.id,
        start_time: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Start workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao iniciar treino',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};
