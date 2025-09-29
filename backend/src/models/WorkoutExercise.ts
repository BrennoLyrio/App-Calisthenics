import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WorkoutExerciseAttributes {
  id: number;
  id_treino: number;
  id_exercicio: number;
  series: number;
  repeticoes: number;
  tempo_execucao?: number;
  descanso?: number;
  ordem: number;
  peso?: number;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkoutExerciseCreationAttributes extends Optional<WorkoutExerciseAttributes, 'id' | 'tempo_execucao' | 'descanso' | 'peso' | 'observacoes' | 'createdAt' | 'updatedAt'> {}

class WorkoutExercise extends Model<WorkoutExerciseAttributes, WorkoutExerciseCreationAttributes> implements WorkoutExerciseAttributes {
  public id!: number;
  public id_treino!: number;
  public id_exercicio!: number;
  public series!: number;
  public repeticoes!: number;
  public tempo_execucao?: number;
  public descanso?: number;
  public ordem!: number;
  public peso?: number;
  public observacoes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByWorkout(workoutId: number): Promise<WorkoutExercise[]> {
    return WorkoutExercise.findAll({ 
      where: { id_treino: workoutId },
      order: [['ordem', 'ASC']]
    });
  }

  public static async findByExercise(exerciseId: number): Promise<WorkoutExercise[]> {
    return WorkoutExercise.findAll({ 
      where: { id_exercicio: exerciseId },
      order: [['id_treino', 'ASC']]
    });
  }
}

WorkoutExercise.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_treino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'treinos',
        key: 'id',
      },
    },
    id_exercicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exercicios',
        key: 'id',
      },
    },
    series: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 20,
      },
    },
    repeticoes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 1000,
      },
    },
    tempo_execucao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 5,
        max: 3600,
      },
    },
    descanso: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 60,
      validate: {
        min: 0,
        max: 600,
      },
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 50,
      },
    },
    peso: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 500,
      },
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
  },
  {
    sequelize,
    modelName: 'WorkoutExercise',
    tableName: 'treino_exercicios',
    timestamps: true,
  }
);

export default WorkoutExercise;
