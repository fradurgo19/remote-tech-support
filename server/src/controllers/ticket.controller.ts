import { Request, Response } from 'express';
import { Ticket, User, Message } from '../models';
import { logger } from '../utils/logger';

export const getTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name', 'email'] }
      ]
    });
    res.json(tickets);
  } catch (error) {
    logger.error('Error al obtener tickets:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
        { model: Message, include: [{ model: User, attributes: ['id', 'name', 'email'] }] }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json(ticket);
  } catch (error) {
    logger.error('Error al obtener ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority } = req.body;
    const customerId = (req.user as any).id;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      customerId,
      status: 'open'
    });

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket
    });
  } catch (error) {
    logger.error('Error al crear ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, technicianId } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    await ticket.update({
      title: title || ticket.title,
      description: description || ticket.description,
      status: status || ticket.status,
      priority: priority || ticket.priority,
      category: category || ticket.category,
      technicianId: technicianId || ticket.technicianId
    });

    res.json({
      message: 'Ticket actualizado exitosamente',
      ticket
    });
  } catch (error) {
    logger.error('Error al actualizar ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    await ticket.destroy();
    res.json({ message: 'Ticket eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 