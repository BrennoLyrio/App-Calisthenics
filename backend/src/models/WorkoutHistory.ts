import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface WorkoutHistoryAttributes {
  id: number;
  id_usuario: number;
  id_treino: number;
  data_execucao: Date;
  duracao: number;
  series_realizadas: number;
  repeticoes_realizadas: number;
  notas?: string;
  avaliacao_dificuldade?: number;
  calorias_queimadas?: number;
  batimentos_medio?: number;
  satisfacao?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkoutHistoryCreationAttributes extends Optional<WorkoutHistoryAttributes, 'id' | 'notas' | 'avaliacao_dificuldade' | 'calorias_queimadas' | 'batimentos_medio' | 'satisfacao' | 'createdAt' | 'updatedAt'> {}

class WorkoutHistory extends Model<WorkoutHistoryAttributes, WorkoutHistoryCreationAttributes> implements WorkoutHistoryAttributes {
  public id!: number;
  public id_usuario!: number;
  public id_treino!: number;
  public data_execucao!: Date;
  public duracao!: number;
  public series_realizadas!: number;
  public repeticoes_realizadas!: number;
  public notas?: string;
  public avaliacao_dificuldade?: number;
  public calorias_queimadas?: number;
  public batimentos_medio?: number;
  public satisfacao?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByUser(userId: number, limit?: number): Promise<WorkoutHistory[]> {
    return WorkoutHistory.findAll({ 
      where: { id_usuario: userId },
      order: [['data_execucao', 'DESC']],
      limit: limit || 50
    });
  }

  public static async findByWorkout(workoutId: number): Promise<WorkoutHistory[]> {
    return WorkoutHistory.findAll({ 
      where: { id_treino: workoutId },
      order: [['data_execucao', 'DESC']]
    });
  }

  public static async getProgressStats(userId: number, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await WorkoutHistory.findAll({
      where: {
        id_usuario: userId,
        data_execucao: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_workouts'],
        [sequelize.fn('AVG', sequelize.col('duracao')), 'avg_duration'],
        [sequelize.fn('SUM', sequelize.col('calorias_queimadas')), 'total_calories'],
        [sequelize.fn('AVG', sequelize.col('avaliacao_dificuldade')), 'avg_difficulty'],
        [sequelize.fn('AVG', sequelize.col('satisfacao')), 'avg_satisfaction']
      ],
      raw: true
    });

    return stats[0] || {};
  }

  public static async getWeeklyProgress(userId: number, weeks: number = 12): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeks * 7));

    return WorkoutHistory.findAll({
      where: {
        id_usuario: userId,
        data_execucao: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('data_execucao')), 'week'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'workouts_count'],
        [sequelize.fn('AVG', sequelize.col('duracao')), 'avg_duration'],
        [sequelize.fn('SUM', sequelize.col('calorias_queimadas')), 'total_calories']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('data_execucao'))],
      order: [[sequelize.fn('DATE_TRUNC', 'week', sequelize.col('data_execucao')), 'ASC']],
      raw: true
    });
  }
}

WorkoutHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    id_treino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'treinos',
        key: 'id',
      },
    },
    data_execucao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    duracao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 7200, // 2 hours max
      },
    },
    series_realizadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    repeticoes_realizadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 10000,
      },
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
    avaliacao_dificuldade: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    calorias_queimadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 2000,
      },
    },
    batimentos_medio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 40,
        max: 220,
      },
    },
    satisfacao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    modelName: 'WorkoutHistory',
    tableName: 'historico_treinos',
    timestamps: true,
  }
);

export default WorkoutHistory;
