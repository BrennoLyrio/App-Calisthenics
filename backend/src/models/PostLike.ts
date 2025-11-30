import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PostLikeAttributes {
  id: number;
  id_post: number;
  id_usuario: number;
  createdAt?: Date;
}

interface PostLikeCreationAttributes extends Optional<PostLikeAttributes, 'id' | 'createdAt'> {}

class PostLike extends Model<PostLikeAttributes, PostLikeCreationAttributes> implements PostLikeAttributes {
  public id!: number;
  public id_post!: number;
  public id_usuario!: number;
  public readonly createdAt!: Date;

  // Static methods
  public static async findByPostAndUser(postId: number, userId: number): Promise<PostLike | null> {
    return PostLike.findOne({
      where: {
        id_post: postId,
        id_usuario: userId,
      },
    });
  }

  public static async countByPost(postId: number): Promise<number> {
    return PostLike.count({
      where: { id_post: postId },
    });
  }

  // Note: toggleLike logic is implemented in postLikeController.ts to avoid circular dependency
}

PostLike.init(
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
  },
  {
    sequelize,
    modelName: 'PostLike',
    tableName: 'post_likes',
    timestamps: true,
    updatedAt: false, // Only createdAt, no updatedAt
    indexes: [
      {
        unique: true,
        fields: ['id_post', 'id_usuario'],
        name: 'post_likes_unique_user_post',
      },
    ],
  }
);

export default PostLike;

