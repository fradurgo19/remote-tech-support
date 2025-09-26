import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';

// Cargar variables de entorno desde el archivo .env en el directorio server
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'remote_support',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
