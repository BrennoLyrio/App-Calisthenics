import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface WeeklyChallengeAttributes {
  id: number;
  titulo: string;
  descricao?: string;
  data_inicio: Date;
  data_fim: Date;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WeeklyChallengeCreationAttributes extends Optional<WeeklyChallengeAttributes, 'id' | 'ativo' | 'createdAt' | 'updatedAt'> {}

class WeeklyChallenge extends Model<WeeklyChallengeAttributes, WeeklyChallengeCreationAttributes> implements WeeklyChallengeAttributes {
  public id!: number;
  public titulo!: string;
  public descricao?: string;
  public data_inicio!: Date;
  public data_fim!: Date;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async getCurrentChallenge(): Promise<WeeklyChallenge | null> {
    const now = new Date();
    return WeeklyChallenge.findOne({
      where: {
        ativo: true,
        data_inicio: {
          [Op.lte]: now,
        },
        data_fim: {
          [Op.gte]: now,
        },
      },
      order: [['data_inicio', 'DESC']],
    });
  }

  public static async getAllActive(): Promise<WeeklyChallenge[]> {
    return WeeklyChallenge.findAll({
      where: { ativo: true },
      order: [['data_inicio', 'DESC']],
    });
  }
}

WeeklyChallenge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [3, 200],
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'WeeklyChallenge',
    tableName: 'weekly_challenges',
    timestamps: true,
    underscored: true, // Use snake_case for timestamps (created_at, updated_at)
  }
);

export default WeeklyChallenge;

