import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';

// Cargar variables de entorno desde el archivo .env en el directorio server
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configuración de Sequelize
// Soporta DATABASE_URL (Neon, Railway, Heroku) o variables individuales
const databaseUrl = process.env.DATABASE_URL;

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' 
          ? {
              require: true,
              rejectUnauthorized: false, // Necesario para Neon
            }
          : false,
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'remote_support',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
