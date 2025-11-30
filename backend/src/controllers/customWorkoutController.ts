import { Request, Response } from 'express';
import { CustomWorkout, CustomWorkoutExercise, Exercise } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

interface CreateCustomWorkoutRequest {
  nome: string;
  descricao?: string;
  exercicios: {
    id_exercicio: number;
    series: number;
    repeticoes?: number;
    tempo_execucao?: number;
    descanso?: number;
    ordem: number;
    observacoes?: string;
  }[];
}

interface UpdateCustomWorkoutRequest {
  nome?: string;
  descricao?: string;
  exercicios?: {
    id_exercicio: number;
    series: number;
    repeticoes?: number;
    tempo_execucao?: number;
    descanso?: number;
    ordem: number;
    observacoes?: string;
  }[];
}

export const createCustomWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const workoutData: CreateCustomWorkoutRequest = req.body;

    // Create custom workout
    const customWorkout = await CustomWorkout.create({
      id_usuario: user.id,
      nome: workoutData.nome,
      descricao: workoutData.descricao
    });

    // Add exercises to workout
    for (const exerciseData of workoutData.exercicios) {
      await CustomWorkoutExercise.create({
        id_rotina: customWorkout.id,
        id_exercicio: exerciseData.id_exercicio,
        series: exerciseData.series,
        repeticoes: exerciseData.repeticoes,
        tempo_execucao: exerciseData.tempo_execucao,
        descanso: exerciseData.descanso || 60,
        ordem: exerciseData.ordem,
        observacoes: exerciseData.observacoes
      });
    }

    // Calculate estimated duration and calories
    const workoutExercises = await CustomWorkoutExercise.findAll({
      where: { id_rotina: customWorkout.id },
      include: [{ model: Exercise, as: 'exercise' }]
    });

    let duracaoEstimada = 0;
    let caloriasEstimadas = 0;

    for (const we of workoutExercises) {
      const exercise = (we as any).exercise;
      if (exercise) {
        const tempoPorSerie = we.tempo_execucao || exercise.tempo_estimado || 60;
        const tempoDescanso = we.descanso || 60;
        duracaoEstimada += (we.series * tempoPorSerie) + (tempoDescanso * (we.series - 1));
        caloriasEstimadas += (exercise.calorias_estimadas || 0) * we.series;
      }
    }

    // Update workout with calculated values
    await customWorkout.update({
      duracao_estimada: Math.round(duracaoEstimada / 60), // Convert to minutes
      calorias_estimadas: Math.round(caloriasEstimadas)
    });

    // Fetch complete workout with exercises
    const completeWorkout = await CustomWorkout.findByPk(customWorkout.id, {
      include: [{
        model: CustomWorkoutExercise,
        as: 'exercises',
        include: [{
          model: Exercise,
          as: 'exercise'
        }]
      }]
    });

    const response: ApiResponse = {
      success: true,
      message: 'Rotina personalizada criada com sucesso',
      data: completeWorkout
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create custom workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao criar rotina personalizada',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getCustomWorkouts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    const customWorkouts = await CustomWorkout.findByUser(user.id);

    // Load exercises for each workout
    const workoutsWithExercises = await Promise.all(
      customWorkouts.map(async (workout) => {
        const exercises = await CustomWorkoutExercise.findByWorkout(workout.id);
        const exercisesWithDetails = await Promise.all(
          exercises.map(async (we) => {
            const exercise = await Exercise.findByPk(we.id_exercicio);
            return {
              ...we.toJSON(),
              exercise: exercise?.toJSON()
            };
          })
        );
        return {
          ...workout.toJSON(),
          exercises: exercisesWithDetails
        };
      })
    );

    const response: ApiResponse = {
      success: true,
      message: 'Rotinas personalizadas recuperadas com sucesso',
      data: workoutsWithExercises
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get custom workouts error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar rotinas personalizadas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getCustomWorkoutById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const customWorkout = await CustomWorkout.findByIdAndUser(Number(id), user.id);

    if (!customWorkout) {
      const response: ApiResponse = {
        success: false,
        message: 'Rotina personalizada não encontrada'
      };
      res.status(404).json(response);
      return;
    }

    // Load exercises
    const exercises = await CustomWorkoutExercise.findByWorkout(customWorkout.id);
    const exercisesWithDetails = await Promise.all(
      exercises.map(async (we) => {
        const exercise = await Exercise.findByPk(we.id_exercicio);
        return {
          ...we.toJSON(),
          exercise: exercise?.toJSON()
        };
      })
    );

    const response: ApiResponse = {
      success: true,
      message: 'Rotina personalizada recuperada com sucesso',
      data: {
        ...customWorkout.toJSON(),
        exercises: exercisesWithDetails
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get custom workout by id error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar rotina personalizada',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const updateCustomWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const workoutData: UpdateCustomWorkoutRequest = req.body;

    const customWorkout = await CustomWorkout.findByIdAndUser(Number(id), user.id);

    if (!customWorkout) {
      const response: ApiResponse = {
        success: false,
        message: 'Rotina personalizada não encontrada'
      };
      res.status(404).json(response);
      return;
    }

    // Update basic info
    if (workoutData.nome !== undefined) {
      customWorkout.nome = workoutData.nome;
    }
    if (workoutData.descricao !== undefined) {
      customWorkout.descricao = workoutData.descricao;
    }

    // Update exercises if provided
    if (workoutData.exercicios) {
      // Delete existing exercises
      await CustomWorkoutExercise.destroy({
        where: { id_rotina: customWorkout.id }
      });

      // Create new exercises
      for (const exerciseData of workoutData.exercicios) {
        await CustomWorkoutExercise.create({
          id_rotina: customWorkout.id,
          id_exercicio: exerciseData.id_exercicio,
          series: exerciseData.series,
          repeticoes: exerciseData.repeticoes,
          tempo_execucao: exerciseData.tempo_execucao,
          descanso: exerciseData.descanso || 60,
          ordem: exerciseData.ordem,
          observacoes: exerciseData.observacoes
        });
      }
    }

    await customWorkout.save();

    // Recalculate duration and calories
    const workoutExercises = await CustomWorkoutExercise.findAll({
      where: { id_rotina: customWorkout.id },
      include: [{ model: Exercise, as: 'exercise' }]
    });

    let duracaoEstimada = 0;
    let caloriasEstimadas = 0;

    for (const we of workoutExercises) {
      const exercise = (we as any).exercise;
      if (exercise) {
        const tempoPorSerie = we.tempo_execucao || exercise.tempo_estimado || 60;
        const tempoDescanso = we.descanso || 60;
        duracaoEstimada += (we.series * tempoPorSerie) + (tempoDescanso * (we.series - 1));
        caloriasEstimadas += (exercise.calorias_estimadas || 0) * we.series;
      }
    }

    await customWorkout.update({
      duracao_estimada: Math.round(duracaoEstimada / 60),
      calorias_estimadas: Math.round(caloriasEstimadas)
    });

    // Fetch complete workout with exercises
    const exercises = await CustomWorkoutExercise.findByWorkout(customWorkout.id);
    const exercisesWithDetails = await Promise.all(
      exercises.map(async (we) => {
        const exercise = await Exercise.findByPk(we.id_exercicio);
        return {
          ...we.toJSON(),
          exercise: exercise?.toJSON()
        };
      })
    );

    const response: ApiResponse = {
      success: true,
      message: 'Rotina personalizada atualizada com sucesso',
      data: {
        ...customWorkout.toJSON(),
        exercises: exercisesWithDetails
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update custom workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar rotina personalizada',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const deleteCustomWorkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const customWorkout = await CustomWorkout.findByIdAndUser(Number(id), user.id);

    if (!customWorkout) {
      const response: ApiResponse = {
        success: false,
        message: 'Rotina personalizada não encontrada'
      };
      res.status(404).json(response);
      return;
    }

    // Soft delete (set ativo = false)
    await customWorkout.update({ ativo: false });

    const response: ApiResponse = {
      success: true,
      message: 'Rotina personalizada excluída com sucesso'
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete custom workout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao excluir rotina personalizada',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};


