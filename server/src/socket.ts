import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { CallSession, Message, User } from './models';
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
    User.update({ isActive: true, lastLogin: new Date() }, { where: { id: user.id } });

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
        await User.update({ status }, { where: { id: user.id } });
        io.emit('user_status_changed', { userId: user.id, status });
      } catch (error) {
        logger.error('Error al cambiar estado:', error);
      }
    });

    // Manejar iniciación de videollamada
    socket.on(
      'call-initiate',
      async (data: { to: string; ticketId: string }) => {
        try {
          const { to: recipientId, ticketId } = data;

          logger.info(`=== INICIANDO LLAMADA ===`);
          logger.info(`De: ${user.name} (${user.id})`);
          logger.info(`Para: ${recipientId}`);
          logger.info(`Ticket: ${ticketId}`);
          logger.info(`Usuarios conectados: ${connectedUsers.length}`);
          logger.info(
            `Conectados: ${connectedUsers
              .map(u => `${u.userId}(${u.socketId})`)
              .join(', ')}`
          );

          // Crear sesión de llamada
          const callSession = await CallSession.create({
            ticketId,
            initiatorId: user.id,
            participantIds: [user.id, recipientId],
            status: 'initiated',
          });

          logger.info(`Sesión de llamada creada: ${callSession.id}`);

          // Encontrar TODOS los sockets del destinatario
          const recipientSockets = connectedUsers.filter(
            u => u.userId === recipientId
          );

          logger.info(
            `Sockets del destinatario encontrados: ${recipientSockets.length}`
          );
          if (recipientSockets.length > 0) {
            logger.info(
              `Socket IDs del destinatario: ${recipientSockets
                .map(s => s.socketId)
                .join(', ')}`
            );
          }

          if (recipientSockets.length > 0) {
            // Enviar solicitud de llamada a TODOS los sockets del destinatario
            const callRequestData = {
              from: user.id,
              fromName: user.name,
              fromEmail: user.email,
              fromAvatar: user.avatar,
              ticketId,
              callSessionId: callSession.id,
            };

            recipientSockets.forEach(recipientSocket => {
              logger.info(
                `Enviando call-request a ${recipientSocket.socketId}:`,
                callRequestData
              );
              io.to(recipientSocket.socketId).emit(
                'call-request',
                callRequestData
              );
            });

            logger.info(
              `Llamada iniciada de ${user.name} a ${recipientId} en ticket ${ticketId}`
            );
          } else {
            // Destinatario no está conectado
            logger.warn(`Destinatario ${recipientId} no está conectado`);
            await callSession.update({ status: 'missed' });
            socket.emit('call-error', {
              message: 'El destinatario no está disponible',
            });
          }
        } catch (error) {
          logger.error('Error al iniciar llamada:', error);
          socket.emit('call-error', { message: 'Error al iniciar la llamada' });
        }
      }
    );

    // Manejar aceptación de videollamada
    socket.on('call-accept', async (data: { callSessionId: string }) => {
      try {
        const { callSessionId } = data;

        const callSession = await CallSession.findByPk(callSessionId);
        if (!callSession) {
          socket.emit('call-error', {
            message: 'Sesión de llamada no encontrada',
          });
          return;
        }

        // Actualizar estado de la llamada
        await callSession.update({
          status: 'active',
          startedAt: new Date(),
        });

        // Notificar al iniciador que la llamada fue aceptada
        const initiatorSocket = connectedUsers.find(
          u => u.userId === callSession.initiatorId
        );
        if (initiatorSocket) {
          io.to(initiatorSocket.socketId).emit('call-accepted', {
            callSessionId,
            participantId: user.id,
          });
        }

        logger.info(`Llamada ${callSessionId} aceptada por ${user.name}`);
      } catch (error) {
        logger.error('Error al aceptar llamada:', error);
        socket.emit('call-error', { message: 'Error al aceptar la llamada' });
      }
    });

    // Manejar rechazo de videollamada
    socket.on('call-decline', async (data: { callSessionId: string }) => {
      try {
        const { callSessionId } = data;

        const callSession = await CallSession.findByPk(callSessionId);
        if (!callSession) {
          socket.emit('call-error', {
            message: 'Sesión de llamada no encontrada',
          });
          return;
        }

        // Actualizar estado de la llamada
        await callSession.update({
          status: 'declined',
          endedAt: new Date(),
        });

        // Notificar al iniciador que la llamada fue rechazada
        const initiatorSocket = connectedUsers.find(
          u => u.userId === callSession.initiatorId
        );
        if (initiatorSocket) {
          io.to(initiatorSocket.socketId).emit('call-declined', {
            callSessionId,
            participantId: user.id,
          });
        }

        logger.info(`Llamada ${callSessionId} rechazada por ${user.name}`);
      } catch (error) {
        logger.error('Error al rechazar llamada:', error);
        socket.emit('call-error', { message: 'Error al rechazar la llamada' });
      }
    });

    // Manejar finalización de videollamada
    socket.on('call-end', async (data: { callSessionId: string }) => {
      try {
        const { callSessionId } = data;

        const callSession = await CallSession.findByPk(callSessionId);
        if (!callSession) {
          socket.emit('call-error', {
            message: 'Sesión de llamada no encontrada',
          });
          return;
        }

        // Calcular duración si la llamada estaba activa
        let duration = 0;
        if (callSession.status === 'active' && callSession.startedAt) {
          duration = Math.floor(
            (new Date().getTime() - callSession.startedAt.getTime()) / 1000
          );
        }

        // Actualizar estado de la llamada
        await callSession.update({
          status: 'ended',
          endedAt: new Date(),
          duration,
        });

        // Notificar a todos los participantes
        callSession.participantIds.forEach(participantId => {
          const participantSocket = connectedUsers.find(
            u => u.userId === participantId
          );
          if (participantSocket) {
            io.to(participantSocket.socketId).emit('call-ended', {
              callSessionId,
              duration,
            });
          }
        });

        logger.info(
          `Llamada ${callSessionId} finalizada por ${user.name}, duración: ${duration}s`
        );
      } catch (error) {
        logger.error('Error al finalizar llamada:', error);
        socket.emit('call-error', { message: 'Error al finalizar la llamada' });
      }
    });

    // Manejar señalización WebRTC
    socket.on(
      'signal',
      (data: {
        to: string;
        signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
      }) => {
        try {
          const { to: recipientId, signal } = data;

          logger.info(`=== SEÑAL WEBRTC RECIBIDA ===`);
          logger.info(`De: ${user.name} (${user.id})`);
          logger.info(`Para: ${recipientId}`);
          logger.info(`Tipo: ${signal.type || 'unknown'}`);
          logger.info(`Usuarios conectados: ${connectedUsers.length}`);
          logger.info(
            `Conectados: ${connectedUsers
              .map(u => `${u.userId}(${u.socketId})`)
              .join(', ')}`
          );

          // Encontrar TODOS los sockets del destinatario
          const recipientSockets = connectedUsers.filter(
            u => u.userId === recipientId
          );

          if (recipientSockets.length > 0) {
            // Reenviar la señal a TODOS los sockets del destinatario
            recipientSockets.forEach(recipientSocket => {
              io.to(recipientSocket.socketId).emit('signal', {
                from: user.id,
                signal,
              });

              logger.info(
                `✅ Señal WebRTC enviada de ${user.name} a ${recipientId} (${recipientSocket.socketId})`
              );
            });
          } else {
            logger.warn(
              `❌ Destinatario ${recipientId} no encontrado para señal WebRTC`
            );
          }
        } catch (error) {
          logger.error('Error al manejar señal WebRTC:', error);
        }
      }
    );

    // Desconexión
    socket.on('disconnect', async () => {
      logger.info(`Usuario desconectado: ${user.name} (${user.id})`);

      // Remover usuario de la lista de conectados
      const index = connectedUsers.findIndex(u => u.userId === user.id);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
      }

      // Actualizar estado del usuario a offline
      await User.update({ isActive: false }, { where: { id: user.id } });
      io.emit('user_status_changed', { userId: user.id, status: 'offline' });
    });
  });
};
