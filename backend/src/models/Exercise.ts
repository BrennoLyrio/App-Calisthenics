import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

export type ExerciseType = 'timer' | 'reps';

export const EXERCISE_TYPES = {
  TIMER: 'timer' as ExerciseType,
  REPS: 'reps' as ExerciseType
};

interface ExerciseAttributes {
  id: number;
  nome: string;
  categoria: 'superiores' | 'inferiores' | 'core' | 'completo';
  tipo: ExerciseType; // 'timer' ou 'reps'
  descricao_textual: string;
  nivel_dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  musculos_trabalhados: string[];
  video_url?: string;
  imagem_url?: string;
  instrucoes: string[];
  dicas: string[];
  variacoes: string[];
  equipamentos_necessarios: string[];
  tempo_estimado?: number; // Apenas para exercícios do tipo 'timer'
  repeticoes_estimadas?: number; // Apenas para exercícios do tipo 'reps'
  calorias_estimadas: number;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExerciseCreationAttributes extends Optional<ExerciseAttributes, 'id' | 'video_url' | 'imagem_url' | 'tempo_estimado' | 'repeticoes_estimadas' | 'ativo' | 'createdAt' | 'updatedAt'> {}

class Exercise extends Model<ExerciseAttributes, ExerciseCreationAttributes> implements ExerciseAttributes {
  public id!: number;
  public nome!: string;
  public categoria!: 'superiores' | 'inferiores' | 'core' | 'completo';
  public descricao_textual!: string;
  public nivel_dificuldade!: 'iniciante' | 'intermediario' | 'avancado';
  public musculos_trabalhados!: string[];
  public video_url?: string;
  public imagem_url?: string;
  public instrucoes!: string[];
  public dicas!: string[];
  public variacoes!: string[];
  public equipamentos_necessarios!: string[];
  public tipo!: ExerciseType;
  public tempo_estimado?: number;
  public repeticoes_estimadas?: number;
  public calorias_estimadas!: number;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByCategory(categoria: string): Promise<Exercise[]> {
    return Exercise.findAll({ 
      where: { categoria, ativo: true },
      order: [['nivel_dificuldade', 'ASC']]
    });
  }

  public static async findByDifficulty(nivel: string): Promise<Exercise[]> {
    return Exercise.findAll({ 
      where: { nivel_dificuldade: nivel, ativo: true },
      order: [['nome', 'ASC']]
    });
  }

  public static async searchExercises(searchTerm: string): Promise<Exercise[]> {
    return Exercise.findAll({
      where: {
        ativo: true,
        [Op.or]: [
          { nome: { [Op.iLike]: `%${searchTerm}%` } },
          { descricao_textual: { [Op.iLike]: `%${searchTerm}%` } },
          { musculos_trabalhados: { [Op.contains]: [searchTerm] } }
        ]
      },
      order: [['nome', 'ASC']]
    });
  }
}

Exercise.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    categoria: {
      type: DataTypes.ENUM('superiores', 'inferiores', 'core', 'completo'),
      allowNull: false,
    },
    descricao_textual: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 2000],
      },
    },
    nivel_dificuldade: {
      type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
      allowNull: false,
    },
    musculos_trabalhados: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    imagem_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    instrucoes: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    dicas: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    variacoes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    equipamentos_necessarios: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    tipo: {
      type: DataTypes.ENUM('timer', 'reps'),
      allowNull: false,
      defaultValue: 'reps'
    },
    tempo_estimado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    repeticoes_estimadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    calorias_estimadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 100,
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
    modelName: 'Exercise',
    tableName: 'exercicios',
    timestamps: true,
  }
);

export default Exercise;
