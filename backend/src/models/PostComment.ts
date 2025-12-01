import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PostCommentAttributes {
  id: number;
  id_post: number;
  id_usuario: number;
  texto: string;
  created_at?: Date;
  updated_at?: Date;
}

interface PostCommentCreationAttributes extends Optional<PostCommentAttributes, 'id' | 'created_at' | 'updated_at'> {}

class PostComment extends Model<PostCommentAttributes, PostCommentCreationAttributes> implements PostCommentAttributes {
  public id!: number;
  public id_post!: number;
  public id_usuario!: number;
  public texto!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Static methods
  public static async findByPost(postId: number, limit: number = 50, offset: number = 0): Promise<PostComment[]> {
    return PostComment.findAll({
      where: { id_post: postId },
      order: [['created_at', 'ASC']],
      limit,
      offset,
    });
  }

  public static async countByPost(postId: number): Promise<number> {
    return PostComment.count({
      where: { id_post: postId },
    });
  }
}

PostComment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_post: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'community_posts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    texto: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
      },
    },
  },
  {
    sequelize,
    modelName: 'PostComment',
    tableName: 'post_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

export default PostComment;

