import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CommunityPostAttributes {
  id: number;
  id_usuario: number;
  tipo: 'rank' | 'help';
  titulo?: string;
  descricao?: string;
  duvida?: string;
  video_url: string;
  id_desafio_semanal?: number;
  curtidas_count: number;
  comentarios_count: number;
  data_postagem: Date;
  status: 'ativo' | 'removido';
  created_at?: Date;
  updated_at?: Date;
}

interface CommunityPostCreationAttributes extends Optional<CommunityPostAttributes, 'id' | 'curtidas_count' | 'comentarios_count' | 'status' | 'data_postagem' | 'created_at' | 'updated_at'> {}

class CommunityPost extends Model<CommunityPostAttributes, CommunityPostCreationAttributes> implements CommunityPostAttributes {
  public id!: number;
  public id_usuario!: number;
  public tipo!: 'rank' | 'help';
  public titulo?: string;
  public descricao?: string;
  public duvida?: string;
  public video_url!: string;
  public id_desafio_semanal?: number;
  public curtidas_count!: number;
  public comentarios_count!: number;
  public data_postagem!: Date;
  public status!: 'ativo' | 'removido';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Static methods
  public static async findByType(tipo: 'rank' | 'help', limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    return CommunityPost.findAll({
      where: {
        tipo,
        status: 'ativo',
      },
      order: [['data_postagem', 'DESC']],
      limit,
      offset,
    });
  }

  public static async findByChallenge(challengeId: number, limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    return CommunityPost.findAll({
      where: {
        id_desafio_semanal: challengeId,
        tipo: 'rank',
        status: 'ativo',
      },
      order: [['curtidas_count', 'DESC'], ['data_postagem', 'DESC']],
      limit,
      offset,
    });
  }

  public static async findByUser(userId: number, limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    return CommunityPost.findAll({
      where: {
        id_usuario: userId,
        status: 'ativo',
      },
      order: [['data_postagem', 'DESC']],
      limit,
      offset,
    });
  }

  public static async incrementLikes(postId: number): Promise<void> {
    await CommunityPost.increment('curtidas_count', {
      where: { id: postId },
    });
  }

  public static async decrementLikes(postId: number): Promise<void> {
    await CommunityPost.decrement('curtidas_count', {
      where: { id: postId },
    });
  }

  public static async incrementComments(postId: number): Promise<void> {
    await CommunityPost.increment('comentarios_count', {
      where: { id: postId },
    });
  }

  public static async decrementComments(postId: number): Promise<void> {
    await CommunityPost.decrement('comentarios_count', {
      where: { id: postId },
    });
  }
}

CommunityPost.init(
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
    tipo: {
      type: DataTypes.ENUM('rank', 'help'),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: [0, 200],
      },
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duvida: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    id_desafio_semanal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'weekly_challenges',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    curtidas_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    comentarios_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    data_postagem: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('ativo', 'removido'),
      allowNull: false,
      defaultValue: 'ativo',
    },
  },
  {
    sequelize,
    modelName: 'CommunityPost',
    tableName: 'community_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true, // Usar snake_case para manter consistência com o banco
  }
);

export default CommunityPost;

