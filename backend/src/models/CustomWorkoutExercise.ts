import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CustomWorkoutExerciseAttributes {
  id: number;
  id_rotina: number;
  id_exercicio: number;
  series: number;
  repeticoes?: number;
  tempo_execucao?: number;
  descanso?: number;
  ordem: number;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomWorkoutExerciseCreationAttributes extends Optional<CustomWorkoutExerciseAttributes, 'id' | 'repeticoes' | 'tempo_execucao' | 'descanso' | 'observacoes' | 'createdAt' | 'updatedAt'> {}

class CustomWorkoutExercise extends Model<CustomWorkoutExerciseAttributes, CustomWorkoutExerciseCreationAttributes> implements CustomWorkoutExerciseAttributes {
  public id!: number;
  public id_rotina!: number;
  public id_exercicio!: number;
  public series!: number;
  public repeticoes?: number;
  public tempo_execucao?: number;
  public descanso?: number;
  public ordem!: number;
  public observacoes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByWorkout(workoutId: number): Promise<CustomWorkoutExercise[]> {
    return CustomWorkoutExercise.findAll({ 
      where: { id_rotina: workoutId },
      order: [['ordem', 'ASC']]
    });
  }
}

CustomWorkoutExercise.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_rotina: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rotinas_personalizadas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    id_exercicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exercicios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
      allowNull: true,
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
    modelName: 'CustomWorkoutExercise',
    tableName: 'rotina_exercicios',
    timestamps: true,
  }
);

export default CustomWorkoutExercise;


