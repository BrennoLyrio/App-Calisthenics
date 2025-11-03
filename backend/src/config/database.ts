import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV
} = process.env;

const sequelize = new Sequelize({
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT || '5432'),
  database: DB_NAME || 'calisthenics_app',
  username: DB_USER || 'postgres',
  password: DB_PASSWORD || 'password',
  dialect: 'postgres',
  timezone: '-03:00', // UTC-3 para Brasília
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

export default sequelize;
