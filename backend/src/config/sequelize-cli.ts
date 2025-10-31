import dotenv from 'dotenv';

dotenv.config();

const username = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'password';
const database = process.env.DB_NAME || 'calisthenics_app';
const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432', 10);

// CommonJS export required by sequelize-cli when using a config file
export = {
  development: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    logging: false,
  },
  test: {
    username,
    password,
    database: `${database}_test`,
    host,
    port,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username,
    password,
    database,
    host,
    port,
    dialect: 'postgres',
    logging: false,
  },
};


