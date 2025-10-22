import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { Message, User } from './models';
import { logger } from './utils/logger';

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers: SocketUser[] = [];

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No se proporcionó token de autenticación'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
      ) as { id: string };

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      logger.error('Error de autenticación en socket:', error);
      next(new Error('Token inválido o expirado'));
    }
  });

  // Conexión de socket
  io.on('connection', socket => {
    const user = socket.data.user;
    logger.info(`Usuario conectado: ${user.name} (${user.id})`);

    // Agregar usuario a la lista de conectados
    connectedUsers.push({
      userId: user.id,
      socketId: socket.id,
    });

    // Actualizar estado del usuario a online
    User.update({ status: 'online' }, { where: { id: user.id } });

    // Unirse a la sala de tickets
    socket.on('join_ticket', (ticketId: string) => {
      socket.join(`ticket_${ticketId}`);
      logger.info(`Usuario ${user.name} se unió al ticket ${ticketId}`);
    });

    // Manejar nuevos mensajes
    socket.on(
      'new_message',
      async (data: {
        ticketId: string;
        content: string;
        type?: string;
        fileUrl?: string;
      }) => {
        try {
          const message = await Message.create({
            content: data.content,
            ticketId: data.ticketId,
            senderId: user.id,
            type: data.type || 'text',
            fileUrl: data.fileUrl,
          });

          const messageWithUser = await Message.findByPk(message.id, {
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
          });

          io.to(`ticket_${data.ticketId}`).emit(
            'message_received',
            messageWithUser
          );
        } catch (error) {
          logger.error('Error al crear mensaje:', error);
          socket.emit('error', { message: 'Error al enviar mensaje' });
        }
      }
    );

    // Manejar cambios de estado
    socket.on('status_change', async (status: string) => {
      try {
        // Validar que el status sea uno de los valores permitidos
        const validStatuses = ['online', 'away', 'busy', 'offline'];
        if (validStatuses.includes(status)) {
          await User.update(
            { status: status as 'online' | 'away' | 'busy' | 'offline' },
            { where: { id: user.id } }
          );
          io.emit('user_status_changed', { userId: user.id, status });
        }
      } catch (error) {
        logger.error('Error al cambiar estado:', error);
      }
    });

    // ==================== MANEJADORES DE VIDEOLLAMADAS ====================

    // Iniciar videollamada
    socket.on(
      'call-initiate',
      async (data: { from: string; to: string; ticketId: string }) => {
        logger.info(
          `Videollamada de ${user.name} (${user.id}) a ${data.to}, ticket: ${data.ticketId}`
        );

        const targetUser = connectedUsers.find(u => u.userId === data.to);

        if (targetUser) {
          io.to(targetUser.socketId).emit('call-request', {
            from: user.id,
            fromName: user.name,
            fromEmail: user.email,
            fromAvatar: user.avatar,
            ticketId: data.ticketId,
            callSessionId: `${user.id}-${data.to}-${Date.now()}`,
          });
          logger.info(
            `Notificación de llamada enviada a socket ${targetUser.socketId}`
          );
        } else {
          logger.warn(`Usuario ${data.to} no está conectado`);
          socket.emit('call-failed', {
            reason: 'Usuario no disponible',
            userId: data.to,
          });
        }
      }
    );

    // Intercambio de señales WebRTC (offer, answer, ICE candidates)
    socket.on('signal', (data: { to: string; signal: any }) => {
      logger.info(`Señal WebRTC de ${user.id} a ${data.to}`);

      const targetUser = connectedUsers.find(u => u.userId === data.to);

      if (targetUser) {
        io.to(targetUser.socketId).emit('signal', {
          from: user.id,
          signal: data.signal,
        });
      } else {
        logger.warn(`Usuario ${data.to} no encontrado para señal WebRTC`);
      }
    });

    // ==================== FIN MANEJADORES DE VIDEOLLAMADAS ====================

    // Desconexión
    socket.on('disconnect', async () => {
      logger.info(`Usuario desconectado: ${user.name} (${user.id})`);

      // Remover usuario de la lista de conectados
      const index = connectedUsers.findIndex(u => u.userId === user.id);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
      }

      // Actualizar estado del usuario a offline
      await User.update({ status: 'offline' }, { where: { id: user.id } });
      io.emit('user_status_changed', { userId: user.id, status: 'offline' });
    });
  });
};
