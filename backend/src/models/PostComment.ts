import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PostCommentAttributes {
  id: number;
  id_post: number;
  id_usuario: number;
  texto: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCommentCreationAttributes extends Optional<PostCommentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PostComment extends Model<PostCommentAttributes, PostCommentCreationAttributes> implements PostCommentAttributes {
  public id!: number;
  public id_post!: number;
  public id_usuario!: number;
  public texto!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static methods
  public static async findByPost(postId: number, limit: number = 50, offset: number = 0): Promise<PostComment[]> {
    return PostComment.findAll({
      where: { id_post: postId },
      order: [['createdAt', 'ASC']],
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
  }
);

export default PostComment;

