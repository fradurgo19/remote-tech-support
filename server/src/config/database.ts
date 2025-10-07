import dotenv from 'dotenv';
import path from 'path';
import { Sequelize } from 'sequelize';

// Cargar variables de entorno desde el archivo .env en el directorio server
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configuración de Sequelize
// Soporta DATABASE_URL (Supabase, Neon, Railway, Heroku) o variables individuales
const databaseUrl = process.env.DATABASE_URL;

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl:
          process.env.NODE_ENV === 'production'
            ? {
                require: true,
                rejectUnauthorized: false, // Necesario para Supabase/Neon
              }
            : false,
        connectTimeout: 60000, // 60 segundos para conexión inicial
      },
      logging: false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '1'), // 1 conexión en Render para evitar problemas
        min: 0,
        acquire: 60000, // Timeout más largo para conexiones remotas
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
        max: 2,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
    });
