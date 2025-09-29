import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface WorkoutAttributes {
  id: number;
  id_usuario: number;
  objetivo: 'forca' | 'resistencia' | 'hipertrofia' | 'perda_peso';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  data_criacao: Date;
  ativo: boolean;
  nome?: string;
  descricao?: string;
  duracao_estimada?: number;
  calorias_estimadas?: number;
  dificuldade_media?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WorkoutCreationAttributes extends Optional<WorkoutAttributes, 'id' | 'data_criacao' | 'ativo' | 'duracao_estimada' | 'calorias_estimadas' | 'dificuldade_media' | 'createdAt' | 'updatedAt'> {}

class Workout extends Model<WorkoutAttributes, WorkoutCreationAttributes> implements WorkoutAttributes {
  public id!: number;
  public id_usuario!: number;
  public objetivo!: 'forca' | 'resistencia' | 'hipertrofia' | 'perda_peso';
  public nivel!: 'iniciante' | 'intermediario' | 'avancado';
  public data_criacao!: Date;
  public ativo!: boolean;
  public nome?: string;
  public descricao?: string;
  public duracao_estimada?: number;
  public calorias_estimadas?: number;
  public dificuldade_media?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByUser(userId: number): Promise<Workout[]> {
    return Workout.findAll({ 
      where: { id_usuario: userId, ativo: true },
      order: [['data_criacao', 'DESC']]
    });
  }

  public static async findByObjective(objetivo: string): Promise<Workout[]> {
    return Workout.findAll({ 
      where: { objetivo, ativo: true },
      order: [['nivel', 'ASC']]
    });
  }

  public static async findByLevel(nivel: string): Promise<Workout[]> {
    return Workout.findAll({ 
      where: { nivel, ativo: true },
      order: [['nome', 'ASC']]
    });
  }

  public static async getRecommendedWorkouts(userId: number, objetivo: string, nivel: string): Promise<Workout[]> {
    return Workout.findAll({
      where: {
        ativo: true,
        [Op.or]: [
          { id_usuario: userId },
          { objetivo, nivel }
        ]
      },
      order: [['data_criacao', 'DESC']]
    });
  }
}

Workout.init(
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
    objetivo: {
      type: DataTypes.ENUM('forca', 'resistencia', 'hipertrofia', 'perda_peso'),
      allowNull: false,
    },
    nivel: {
      type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
      allowNull: false,
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [2, 100],
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [10, 1000],
      },
    },
    duracao_estimada: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 5,
        max: 180,
      },
    },
    calorias_estimadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 10,
        max: 1000,
      },
    },
    dificuldade_media: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
  },
  {
    sequelize,
    modelName: 'Workout',
    tableName: 'treinos',
    timestamps: true,
  }
);

export default Workout;
