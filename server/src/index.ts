import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { sequelize } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import messageRoutes from './routes/message.routes';
import reportRoutes from './routes/report.routes';
import testRoutes from './routes/test';
import ticketRoutes from './routes/ticket.routes';
import userRoutes from './routes/user.routes';
import { resetAllPasswords } from './scripts/resetPasswords';
import { setupSocketHandlers } from './socket';
import { logger } from './utils/logger';

// Cargar variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);
// Configurar CORS origins
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Middleware condicional para JSON - NO aplicar a rutas de upload
app.use((req, res, next) => {
  // Excluir rutas de upload de multipart/form-data
  if (req.path.includes('/avatar') || req.path.includes('/upload')) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/test', testRoutes);

// Manejador de errores
app.use(errorHandler);

// Configurar Socket.IO
setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Sincronizar modelos con la base de datos
    await sequelize.sync();
    logger.info('Database models synchronized successfully.');

    // Resetear contraseñas de todos los usuarios a 'admin123' (SOLO EN DESARROLLO)
    if (process.env.NODE_ENV !== 'production') {
      await resetAllPasswords();
    } else {
      logger.info('Production mode: skipping password reset');
    }

    // Iniciar servidor HTTP
    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
