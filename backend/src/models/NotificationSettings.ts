import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NotificationSettingsAttributes {
  id: number;
  id_usuario: number;
  lembrete_treino_ativo: boolean;
  horarios_treino?: string; // JSON array de horários: ["09:00", "18:00"]
  dias_semana?: string; // JSON array: [0,1,2,3,4,5,6] (0=domingo)
  frequencia_lembrete?: 'diario' | 'alternado' | 'customizado';
  notificacao_completou_treino: boolean;
  notificacao_periodo_sem_treinar: boolean;
  dias_sem_treinar_para_alerta?: number;
  notificacao_dicas_recuperacao: boolean;
  notificacao_meta_alcancada: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationSettingsCreationAttributes extends Optional<NotificationSettingsAttributes, 'id' | 'lembrete_treino_ativo' | 'notificacao_completou_treino' | 'notificacao_periodo_sem_treinar' | 'notificacao_dicas_recuperacao' | 'notificacao_meta_alcancada' | 'createdAt' | 'updatedAt'> {}

class NotificationSettings extends Model<NotificationSettingsAttributes, NotificationSettingsCreationAttributes> implements NotificationSettingsAttributes {
  public id!: number;
  public id_usuario!: number;
  public lembrete_treino_ativo!: boolean;
  public horarios_treino?: string;
  public dias_semana?: string;
  public frequencia_lembrete?: 'diario' | 'alternado' | 'customizado';
  public notificacao_completou_treino!: boolean;
  public notificacao_periodo_sem_treinar!: boolean;
  public dias_sem_treinar_para_alerta?: number;
  public notificacao_dicas_recuperacao!: boolean;
  public notificacao_meta_alcancada!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByUser(userId: number): Promise<NotificationSettings | null> {
    return NotificationSettings.findOne({ 
      where: { id_usuario: userId }
    });
  }

  public static async getOrCreateForUser(userId: number): Promise<NotificationSettings> {
    let settings = await NotificationSettings.findByUser(userId);
    
    if (!settings) {
      settings = await NotificationSettings.create({
        id_usuario: userId,
        lembrete_treino_ativo: true,
        notificacao_completou_treino: true,
        notificacao_periodo_sem_treinar: true,
        notificacao_dicas_recuperacao: true,
        notificacao_meta_alcancada: true,
        dias_sem_treinar_para_alerta: 3,
        frequencia_lembrete: 'diario',
        horarios_treino: JSON.stringify(['09:00', '18:00']),
        dias_semana: JSON.stringify([1, 2, 3, 4, 5]), // Segunda a Sexta
      });
    }
    
    return settings;
  }

  // Helper methods to parse JSON fields
  public getHorariosTreino(): string[] {
    try {
      return this.horarios_treino ? JSON.parse(this.horarios_treino) : [];
    } catch {
      return [];
    }
  }

  public setHorariosTreino(horarios: string[]): void {
    this.horarios_treino = JSON.stringify(horarios);
  }

  public getDiasSemana(): number[] {
    try {
      return this.dias_semana ? JSON.parse(this.dias_semana) : [];
    } catch {
      return [];
    }
  }

  public setDiasSemana(dias: number[]): void {
    this.dias_semana = JSON.stringify(dias);
  }
}

NotificationSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    lembrete_treino_ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    horarios_treino: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dias_semana: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequencia_lembrete: {
      type: DataTypes.ENUM('diario', 'alternado', 'customizado'),
      allowNull: true,
    },
    notificacao_completou_treino: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notificacao_periodo_sem_treinar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    dias_sem_treinar_para_alerta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
    },
    notificacao_dicas_recuperacao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notificacao_meta_alcancada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'NotificationSettings',
    tableName: 'configuracoes_notificacao',
    timestamps: true,
  }
);

export default NotificationSettings;

