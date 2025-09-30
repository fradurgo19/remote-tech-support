import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { Message, User } from '../models';
import { logger } from '../utils/logger';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    logger.info(`Obteniendo mensajes para ticket: ${ticketId}`);

    // Primero intentar obtener mensajes sin include para ver si el problema es la asociación
    const messages = await Message.findAll({
      where: { ticketId },
      order: [['id', 'ASC']],
    });

    logger.info(`Encontrados ${messages.length} mensajes`);

    // Si hay mensajes, obtener los usuarios por separado
    if (messages.length > 0) {
      const userIds = [...new Set(messages.map(m => m.senderId))];
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'name', 'email', 'avatar'],
      });

      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, { id: string; name: string; email: string; avatar: string }>);

      const messagesWithUsers = messages.map(message => ({
        ...message.toJSON(),
        sender: userMap[message.senderId],
      }));

      res.json(messagesWithUsers);
    } else {
      res.json([]);
    }
  } catch (error) {
    logger.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { content, ticketId, type = 'text' } = req.body;
    const senderId = (req.user as { id: string }).id;

    logger.info(
      `Creando mensaje para ticket ${ticketId} por usuario ${senderId}`
    );

    const message = await Message.create({
      content,
      ticketId,
      senderId,
      type,
    });

    logger.info(`Mensaje creado con ID: ${message.id}`);

    // Obtener el usuario por separado para evitar problemas de asociación
    const user = await User.findByPk(senderId, {
      attributes: ['id', 'name', 'email', 'avatar'],
    });

    const messageWithUser = {
      ...message.toJSON(),
      sender: user,
    };

    res.status(201).json({
      message: 'Mensaje creado exitosamente',
      data: messageWithUser,
    });
  } catch (error) {
    logger.error('Error al crear mensaje:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    await message.destroy();
    res.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar mensaje:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/messages');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Permitir todos los tipos de archivo
    cb(null, true);
  },
});

export const uploadFile = upload.single('file');

export const sendFileMessage = async (req: Request, res: Response) => {
  try {
    const { ticketId, type = 'file' } = req.body;
    const senderId = (req.user as { id: string }).id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No se proporcionó archivo' });
    }

    const fileUrl = `/uploads/messages/${file.filename}`;

    logger.info(
      `Enviando archivo ${file.originalname} para ticket ${ticketId}`
    );

    const message = await Message.create({
      content: file.originalname,
      ticketId,
      senderId,
      type,
      metadata: {
        fileUrl,
        attachment: {
          name: file.originalname,
          url: fileUrl,
          type: file.mimetype,
          size: file.size,
        },
      },
    });

    logger.info(`Archivo enviado con ID: ${message.id}`);

    // Obtener el usuario por separado
    const user = await User.findByPk(senderId, {
      attributes: ['id', 'name', 'email', 'avatar'],
    });

    const messageWithUser = {
      ...message.toJSON(),
      sender: user,
    };

    res.status(201).json({
      message: 'Archivo enviado exitosamente',
      data: messageWithUser,
    });
  } catch (error) {
    logger.error('Error al enviar archivo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
