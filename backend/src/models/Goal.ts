import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface GoalAttributes {
  id: number;
  id_usuario: number;
  descricao: string;
  tipo: 'curto' | 'medio' | 'longo';
  valor_alvo: number;
  valor_atual: number;
  data_inicio: Date;
  data_fim: Date;
  status: 'em_andamento' | 'concluida' | 'pausada';
  categoria: 'forca' | 'resistencia' | 'flexibilidade' | 'perda_peso' | 'ganho_massa' | 'outro';
  unidade_medida: string;
  meta_semanal?: number;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GoalCreationAttributes extends Optional<GoalAttributes, 'id' | 'valor_atual' | 'status' | 'meta_semanal' | 'observacoes' | 'createdAt' | 'updatedAt'> {}

class Goal extends Model<GoalAttributes, GoalCreationAttributes> implements GoalAttributes {
  public id!: number;
  public id_usuario!: number;
  public descricao!: string;
  public tipo!: 'curto' | 'medio' | 'longo';
  public valor_alvo!: number;
  public valor_atual!: number;
  public data_inicio!: Date;
  public data_fim!: Date;
  public status!: 'em_andamento' | 'concluida' | 'pausada';
  public categoria!: 'forca' | 'resistencia' | 'flexibilidade' | 'perda_peso' | 'ganho_massa' | 'outro';
  public unidade_medida!: string;
  public meta_semanal?: number;
  public observacoes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getProgress(): number {
    return Math.round((this.valor_atual / this.valor_alvo) * 100);
  }

  public getDaysRemaining(): number {
    const today = new Date();
    const diffTime = this.data_fim.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isOverdue(): boolean {
    return new Date() > this.data_fim && this.status !== 'concluida';
  }

  public isCompleted(): boolean {
    return this.valor_atual >= this.valor_alvo;
  }

  // Static methods
  public static async findByUser(userId: number): Promise<Goal[]> {
    return Goal.findAll({ 
      where: { id_usuario: userId },
      order: [['data_fim', 'ASC']]
    });
  }

  public static async findActiveByUser(userId: number): Promise<Goal[]> {
    return Goal.findAll({ 
      where: { 
        id_usuario: userId,
        status: 'em_andamento'
      },
      order: [['data_fim', 'ASC']]
    });
  }

  public static async findByCategory(categoria: string): Promise<Goal[]> {
    return Goal.findAll({ 
      where: { categoria },
      order: [['data_fim', 'ASC']]
    });
  }

  public static async getOverdueGoals(): Promise<Goal[]> {
    return Goal.findAll({
      where: {
        status: 'em_andamento',
        data_fim: {
          [Op.lt]: new Date()
        }
      },
      order: [['data_fim', 'ASC']]
    });
  }

  public static async getCompletedGoals(userId: number, limit: number = 10): Promise<Goal[]> {
    return Goal.findAll({
      where: {
        id_usuario: userId,
        status: 'concluida'
      },
      order: [['data_fim', 'DESC']],
      limit
    });
  }
}

Goal.init(
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
    descricao: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 200],
      },
    },
    tipo: {
      type: DataTypes.ENUM('curto', 'medio', 'longo'),
      allowNull: false,
    },
    valor_alvo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    valor_atual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfter: new Date().toISOString(),
      },
    },
    status: {
      type: DataTypes.ENUM('em_andamento', 'concluida', 'pausada'),
      allowNull: false,
      defaultValue: 'em_andamento',
    },
    categoria: {
      type: DataTypes.ENUM('forca', 'resistencia', 'flexibilidade', 'perda_peso', 'ganho_massa', 'outro'),
      allowNull: false,
    },
    unidade_medida: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 20],
      },
    },
    meta_semanal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
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
    modelName: 'Goal',
    tableName: 'metas',
    timestamps: true,
    hooks: {
      beforeUpdate: (goal: Goal) => {
        if (goal.valor_atual >= goal.valor_alvo && goal.status === 'em_andamento') {
          goal.status = 'concluida';
        }
      },
    },
  }
);

export default Goal;
