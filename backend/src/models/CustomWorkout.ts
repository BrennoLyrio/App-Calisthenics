import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CustomWorkoutAttributes {
  id: number;
  id_usuario: number;
  nome: string;
  descricao?: string;
  duracao_estimada?: number;
  calorias_estimadas?: number;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomWorkoutCreationAttributes extends Optional<CustomWorkoutAttributes, 'id' | 'ativo' | 'duracao_estimada' | 'calorias_estimadas' | 'createdAt' | 'updatedAt'> {}

class CustomWorkout extends Model<CustomWorkoutAttributes, CustomWorkoutCreationAttributes> implements CustomWorkoutAttributes {
  public id!: number;
  public id_usuario!: number;
  public nome!: string;
  public descricao?: string;
  public duracao_estimada?: number;
  public calorias_estimadas?: number;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByUser(userId: number): Promise<CustomWorkout[]> {
    return CustomWorkout.findAll({ 
      where: { id_usuario: userId, ativo: true },
      order: [['createdAt', 'DESC']]
    });
  }

  public static async findByIdAndUser(workoutId: number, userId: number): Promise<CustomWorkout | null> {
    return CustomWorkout.findOne({ 
      where: { id: workoutId, id_usuario: userId, ativo: true }
    });
  }
}

CustomWorkout.init(
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
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
    duracao_estimada: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 180,
      },
    },
    calorias_estimadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 1000,
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'CustomWorkout',
    tableName: 'rotinas_personalizadas',
    timestamps: true,
  }
);

export default CustomWorkout;


