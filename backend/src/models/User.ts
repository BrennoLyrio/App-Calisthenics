import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  idade: number;
  peso: number;
  altura: number;
  nivel_condicionamento: 'iniciante' | 'intermediario' | 'avancado';
  foco_treino: 'superiores' | 'inferiores' | 'core' | 'completo';
  data_criacao: Date;
  data_ultima_sinc: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'data_criacao' | 'data_ultima_sinc' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public nome!: string;
  public email!: string;
  public senha_hash!: string;
  public idade!: number;
  public peso!: number;
  public altura!: number;
  public nivel_condicionamento!: 'iniciante' | 'intermediario' | 'avancado';
  public foco_treino!: 'superiores' | 'inferiores' | 'core' | 'completo';
  public data_criacao!: Date;
  public data_ultima_sinc!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.senha_hash);
  }

  public async hashPassword(): Promise<void> {
    this.senha_hash = await bcrypt.hash(this.senha_hash, 12);
  }

  // Static methods
  public static async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  public static async createUser(userData: UserCreationAttributes): Promise<User> {
    const user = User.build(userData);
    await user.hashPassword();
    return user.save();
  }
}

User.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255],
      },
    },
    idade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 13,
        max: 120,
      },
    },
    peso: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 20,
        max: 300,
      },
    },
    altura: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 100,
        max: 250,
      },
    },
    nivel_condicionamento: {
      type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
      allowNull: false,
      defaultValue: 'iniciante',
    },
    foco_treino: {
      type: DataTypes.ENUM('superiores', 'inferiores', 'core', 'completo'),
      allowNull: false,
      defaultValue: 'completo',
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    data_ultima_sinc: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
      beforeUpdate: async (user: User) => {
        if (user.changed('senha_hash')) {
          await user.hashPassword();
        }
      },
    },
  }
);

export default User;
