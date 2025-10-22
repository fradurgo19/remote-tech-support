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
import ticketRoutes from './routes/ticket.routes';
import userRoutes from './routes/user.routes';
import { setupSocketHandlers } from './socket';
import { logger } from './utils/logger';

// Cargar variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  })
);
app.use(express.json());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint para Fly.io
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

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

    // Resetear contraseñas solo en desarrollo (comentado para producción)
    // await resetAllPasswords();

    // Iniciar servidor HTTP - Escuchar en 0.0.0.0 para Fly.io
    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on 0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
