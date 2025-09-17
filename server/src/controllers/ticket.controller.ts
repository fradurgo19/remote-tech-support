import { Request, Response } from 'express';
import { Category, Message, Ticket, User } from '../models';
import { logger } from '../utils/logger';

export const getTickets = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    let whereClause: any = {};

    // Filtrar tickets según el rol del usuario
    if (user.role === 'customer') {
      // Los clientes solo pueden ver sus propios tickets
      whereClause.customerId = user.id;
    }
    // Los administradores y técnicos pueden ver todos los tickets (no se aplica filtro)

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
      ],
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
    const user = req.user as any;

    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
        {
          model: Message,
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
          ],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Verificar permisos de acceso
    if (user.role === 'customer' && ticket.customerId !== user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para ver este ticket' });
    }
    // Los administradores y técnicos pueden ver todos los tickets

    res.json(ticket);
  } catch (error) {
    logger.error('Error al obtener ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      customerEmail,
      customerName,
    } = req.body;
    const user = req.user as any;
    let customerId: string;

    // Buscar la categoría por nombre para obtener su ID
    const categoryRecord = await Category.findOne({
      where: { name: category },
    });
    if (!categoryRecord) {
      return res.status(400).json({ message: 'Categoría no encontrada' });
    }

    // Determinar el customerId según el rol del usuario
    if (user.role === 'customer') {
      // Los clientes solo pueden crear tickets para sí mismos
      customerId = user.id;
    } else if (user.role === 'admin' || user.role === 'technician') {
      // El personal de soporte puede asignar tickets a clientes
      if (customerEmail) {
        // Buscar cliente existente por email
        let customer = await User.findOne({
          where: { email: customerEmail, role: 'customer' },
        });

        if (!customer) {
          // Si no existe, crear un cliente temporal
          customer = await User.create({
            name: customerName || customerEmail.split('@')[0],
            email: customerEmail,
            password:
              'temp-password-' + Math.random().toString(36).substring(7), // Contraseña temporal
            role: 'customer',
            status: 'offline',
            emailVerified: false,
          });
        }
        customerId = customer.id;
      } else {
        return res
          .status(400)
          .json({
            message: 'Email del cliente es requerido para asignar el ticket',
          });
      }
    } else {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para crear tickets' });
    }

    const ticket = await Ticket.create({
      title,
      description,
      categoryId: categoryRecord.id,
      priority,
      customerId,
      status: 'open',
    });

    // Obtener el ticket con la información del cliente
    const ticketWithCustomer = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket: ticketWithCustomer,
    });
  } catch (error) {
    logger.error('Error al crear ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, technicianId } =
      req.body;
    const user = req.user as any;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Verificar permisos de actualización
    if (user.role === 'customer' && ticket.customerId !== user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para actualizar este ticket' });
    }

    // Los clientes solo pueden actualizar ciertos campos
    const updateData: any = {};
    if (user.role === 'customer') {
      // Los clientes solo pueden actualizar título y descripción
      if (title) updateData.title = title;
      if (description) updateData.description = description;
    } else {
      // Los administradores y técnicos pueden actualizar todos los campos
      updateData.title = title || ticket.title;
      updateData.description = description || ticket.description;
      updateData.status = status || ticket.status;
      updateData.priority = priority || ticket.priority;
      updateData.technicianId = technicianId || ticket.technicianId;
    }

    await ticket.update(updateData);

    res.json({
      message: 'Ticket actualizado exitosamente',
      ticket,
    });
  } catch (error) {
    logger.error('Error al actualizar ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Verificar permisos de eliminación
    if (user.role === 'customer' && ticket.customerId !== user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para eliminar este ticket' });
    }

    await ticket.destroy();
    res.json({ message: 'Ticket eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
