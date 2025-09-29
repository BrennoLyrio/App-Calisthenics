import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface UserProgramAttributes {
  id: number;
  id_usuario: number;
  id_programa: number;
  progresso: number;
  status: 'ativo' | 'concluido' | 'pausado';
  data_inicio: Date;
  data_fim?: Date;
  dias_concluidos: number;
  ultima_atividade?: Date;
  notas?: string;
  avaliacao?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserProgramCreationAttributes extends Optional<UserProgramAttributes, 'id' | 'progresso' | 'status' | 'data_fim' | 'dias_concluidos' | 'ultima_atividade' | 'notas' | 'avaliacao' | 'createdAt' | 'updatedAt'> {}

class UserProgram extends Model<UserProgramAttributes, UserProgramCreationAttributes> implements UserProgramAttributes {
  public id!: number;
  public id_usuario!: number;
  public id_programa!: number;
  public progresso!: number;
  public status!: 'ativo' | 'concluido' | 'pausado';
  public data_inicio!: Date;
  public data_fim?: Date;
  public dias_concluidos!: number;
  public ultima_atividade?: Date;
  public notas?: string;
  public avaliacao?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getDaysRemaining(): number {
    const today = new Date();
    const programEnd = new Date(this.data_inicio);
    programEnd.setDate(programEnd.getDate() + this.dias_concluidos);
    
    const diffTime = programEnd.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  public isCompleted(): boolean {
    return this.progresso >= 100;
  }

  public isOverdue(): boolean {
    const today = new Date();
    const expectedEnd = new Date(this.data_inicio);
    expectedEnd.setDate(expectedEnd.getDate() + this.dias_concluidos);
    
    return today > expectedEnd && this.status !== 'concluido';
  }

  // Static methods
  public static async findByUser(userId: number): Promise<UserProgram[]> {
    return UserProgram.findAll({ 
      where: { id_usuario: userId },
      order: [['data_inicio', 'DESC']]
    });
  }

  public static async findActiveByUser(userId: number): Promise<UserProgram[]> {
    return UserProgram.findAll({ 
      where: { 
        id_usuario: userId,
        status: 'ativo'
      },
      order: [['data_inicio', 'DESC']]
    });
  }

  public static async findByProgram(programId: number): Promise<UserProgram[]> {
    return UserProgram.findAll({ 
      where: { id_programa: programId },
      order: [['data_inicio', 'DESC']]
    });
  }

  public static async getCompletedPrograms(userId: number): Promise<UserProgram[]> {
    return UserProgram.findAll({
      where: {
        id_usuario: userId,
        status: 'concluido'
      },
      order: [['data_fim', 'DESC']]
    });
  }

  public static async getOverduePrograms(): Promise<UserProgram[]> {
    return UserProgram.findAll({
      where: {
        status: 'ativo',
        ultima_atividade: {
          [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      },
      order: [['ultima_atividade', 'ASC']]
    });
  }

  public static async getProgramStats(programId: number): Promise<any> {
    const stats = await UserProgram.findAll({
      where: { id_programa: programId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_participants'],
        [sequelize.fn('AVG', sequelize.col('progresso')), 'avg_progress'],
        [sequelize.fn('AVG', sequelize.col('avaliacao')), 'avg_rating'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'concluido\' THEN 1 END')), 'completed_count']
      ],
      raw: true
    });

    return stats[0] || {};
  }
}

UserProgram.init(
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
    id_programa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programas_tematicos',
        key: 'id',
      },
    },
    progresso: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM('ativo', 'concluido', 'pausado'),
      allowNull: false,
      defaultValue: 'ativo',
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dias_concluidos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    ultima_atividade: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
    avaliacao: {
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
    modelName: 'UserProgram',
    tableName: 'usuario_programas',
    timestamps: true,
    hooks: {
      beforeUpdate: (userProgram: UserProgram) => {
        if (userProgram.progresso >= 100 && userProgram.status === 'ativo') {
          userProgram.status = 'concluido';
          userProgram.data_fim = new Date();
        }
      },
    },
  }
);

export default UserProgram;
