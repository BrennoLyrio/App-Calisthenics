import { DataTypes, Model, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface ThematicProgramAttributes {
  id: number;
  nome: string;
  descricao: string;
  duracao_dias: number;
  certificado_url?: string;
  nivel_requerido: 'iniciante' | 'intermediario' | 'avancado';
  ativo: boolean;
  categoria: 'desafio' | 'programa' | 'curso';
  objetivo_principal: string;
  exercicios_incluidos: number[];
  requisitos: string[];
  beneficios: string[];
  dificuldade_inicial: number;
  dificuldade_final: number;
  calorias_estimadas_total: number;
  tempo_estimado_diario: number;
  imagem_url?: string;
  video_apresentacao?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ThematicProgramCreationAttributes extends Optional<ThematicProgramAttributes, 'id' | 'certificado_url' | 'ativo' | 'imagem_url' | 'video_apresentacao' | 'createdAt' | 'updatedAt'> {}

class ThematicProgram extends Model<ThematicProgramAttributes, ThematicProgramCreationAttributes> implements ThematicProgramAttributes {
  public id!: number;
  public nome!: string;
  public descricao!: string;
  public duracao_dias!: number;
  public certificado_url?: string;
  public nivel_requerido!: 'iniciante' | 'intermediario' | 'avancado';
  public ativo!: boolean;
  public categoria!: 'desafio' | 'programa' | 'curso';
  public objetivo_principal!: string;
  public exercicios_incluidos!: number[];
  public requisitos!: string[];
  public beneficios!: string[];
  public dificuldade_inicial!: number;
  public dificuldade_final!: number;
  public calorias_estimadas_total!: number;
  public tempo_estimado_diario!: number;
  public imagem_url?: string;
  public video_apresentacao?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findActive(): Promise<ThematicProgram[]> {
    return ThematicProgram.findAll({ 
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });
  }

  public static async findByLevel(nivel: string): Promise<ThematicProgram[]> {
    return ThematicProgram.findAll({ 
      where: { 
        nivel_requerido: nivel,
        ativo: true 
      },
      order: [['nome', 'ASC']]
    });
  }

  public static async findByCategory(categoria: string): Promise<ThematicProgram[]> {
    return ThematicProgram.findAll({ 
      where: { 
        categoria,
        ativo: true 
      },
      order: [['nome', 'ASC']]
    });
  }

  public static async searchPrograms(searchTerm: string): Promise<ThematicProgram[]> {
    return ThematicProgram.findAll({
      where: {
        ativo: true,
        [Op.or]: [
          { nome: { [Op.iLike]: `%${searchTerm}%` } },
          { descricao: { [Op.iLike]: `%${searchTerm}%` } },
          { objetivo_principal: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      order: [['nome', 'ASC']]
    });
  }

  public static async getPopularPrograms(limit: number = 10): Promise<ThematicProgram[]> {
    return ThematicProgram.findAll({
      where: { ativo: true },
      order: [['createdAt', 'DESC']],
      limit
    });
  }
}

ThematicProgram.init(
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
        len: [5, 100],
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [20, 2000],
      },
    },
    duracao_dias: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 365,
      },
    },
    certificado_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    nivel_requerido: {
      type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    categoria: {
      type: DataTypes.ENUM('desafio', 'programa', 'curso'),
      allowNull: false,
    },
    objetivo_principal: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 200],
      },
    },
    exercicios_incluidos: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      defaultValue: [],
    },
    requisitos: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    beneficios: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    dificuldade_inicial: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    dificuldade_final: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    calorias_estimadas_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 50000,
      },
    },
    tempo_estimado_diario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 5,
        max: 180,
      },
    },
    imagem_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    video_apresentacao: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
  },
  {
    sequelize,
    modelName: 'ThematicProgram',
    tableName: 'programas_tematicos',
    timestamps: true,
  }
);

export default ThematicProgram;
