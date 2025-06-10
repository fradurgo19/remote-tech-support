import { Request, Response } from 'express';
import { Message, User } from '../models';
import { logger } from '../utils/logger';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const messages = await Message.findAll({
      where: { ticketId },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    logger.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { content, ticketId, type = 'text', fileUrl } = req.body;
    const senderId = (req.user as any).id;

    const message = await Message.create({
      content,
      ticketId,
      senderId,
      type,
      fileUrl
    });

    const messageWithUser = await Message.findByPk(message.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json({
      message: 'Mensaje creado exitosamente',
      data: messageWithUser
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