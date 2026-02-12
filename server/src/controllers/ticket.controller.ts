import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { Category, Message, Ticket, User } from '../models';
import type { TicketAttributes } from '../models/Ticket';
import {
  emailService,
  type TicketEmailData,
} from '../services/email.service';
import { logger } from '../utils/logger';

/** Ticket con asociaciones customer/technician cargadas por include */
type TicketWithRelations = Ticket & {
  customer?: User;
  technician?: User;
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; role: string };
    const whereClause: { customerId?: string } = {};

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
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM "Messages" 
              WHERE "Messages"."ticketId" = "Ticket"."id"
            )`),
            'messageCount',
          ],
        ],
      },
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
    const user = req.user as { id: string; role: string };

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

/** Crear ticket desde formulario público (sin autenticación) */
export const createTicketPublic = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      customerName,
      customerEmail,
      phone,
      nit,
      asesorRepuestos,
      tipoMaquina,
      marca,
      modeloEquipo,
    } = req.body;

    if (!customerEmail || !customerName || !title || !description) {
      return res.status(400).json({
        message:
          'Nombre del cliente, email, título y descripción son obligatorios',
      });
    }

    logger.info('Creando ticket público:', {
      title,
      customerEmail,
      customerName,
    });

    const categoryRecord = await Category.findOne({
      where: { name: category || 'Soporte Remoto' },
    });
    if (!categoryRecord) {
      return res
        .status(400)
        .json({ message: 'Categoría no encontrada. Use "Soporte Remoto".' });
    }

    let customer = await User.findOne({
      where: { email: customerEmail, role: 'customer' },
    });
    if (!customer) {
      customer = await User.create({
        name: customerName,
        email: customerEmail,
        password:
          'temp-password-' + Math.random().toString(36).substring(7),
        role: 'customer',
        emailVerified: false,
        phone: phone ?? undefined,
      });
    } else if (phone) {
      await customer.update({ name: customerName, phone });
    } else {
      await customer.update({ name: customerName });
    }

    const ticket = await Ticket.create({
      title,
      description,
      categoryId: categoryRecord.id,
      priority: priority || 'medium',
      customerId: customer.id,
      status: 'open',
      nit: nit || null,
      asesorRepuestos: asesorRepuestos || null,
      tipoMaquina: tipoMaquina || null,
      marca: marca || null,
      modeloEquipo: modeloEquipo || null,
    });

    const ticketWithCustomer = (await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
      ],
    })) as TicketWithRelations | null;

    if (ticketWithCustomer?.customer) {
      try {
        const payload: TicketEmailData = {
          ticket: ticketWithCustomer,
          customer: ticketWithCustomer.customer,
          technician: ticketWithCustomer.technician,
        };
        const emailSent =
          await emailService.sendTicketCreatedNotification(payload);
        if (emailSent) {
          logger.info(`Email notification sent for public ticket ${ticket.id}`);
        }
      } catch (emailError) {
        logger.error('Error sending email for public ticket:', emailError);
      }
    }

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket: ticketWithCustomer,
    });
  } catch (error) {
    logger.error('Error al crear ticket público:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

type ResolveCustomerResult =
  | { ok: true; customerId: string }
  | { ok: false; status: number; message: string };

async function resolveCustomerIdForTicket(
  user: { id: string; role: string },
  body: {
    customerId?: string;
    customerEmail?: string;
    customerName?: string;
  }
): Promise<ResolveCustomerResult> {
  if (user.role === 'customer') {
    return { ok: true, customerId: user.id };
  }
  if (user.role !== 'admin' && user.role !== 'technician') {
    return { ok: false, status: 403, message: 'No tienes permisos para crear tickets' };
  }
  if (body.customerId) {
    return { ok: true, customerId: body.customerId };
  }
  if (!body.customerEmail) {
    return {
      ok: false,
      status: 400,
      message: 'Email del cliente es requerido para asignar el ticket',
    };
  }
  let customer = await User.findOne({
    where: { email: body.customerEmail, role: 'customer' },
  });
  if (!customer) {
    customer = await User.create({
      name: body.customerName ?? body.customerEmail.split('@')[0],
      email: body.customerEmail,
      password: 'temp-password-' + Math.random().toString(36).substring(7),
      role: 'customer',
      emailVerified: false,
    });
  }
  return { ok: true, customerId: customer.id };
}

export const createTicket = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      customerEmail,
      customerName,
      customerId: providedCustomerId,
      marca,
      modeloEquipo,
    } = req.body;
    const user = req.user as { id: string; role: string; email: string };

    logger.info('🎫 Creando ticket - Datos recibidos:', {
      title,
      category,
      priority,
      customerEmail,
      customerName,
      providedCustomerId,
      userRole: user.role,
      userId: user.id,
    });

    const categoryRecord = await Category.findOne({
      where: { name: category },
    });
    if (!categoryRecord) {
      logger.error(`❌ Categoría no encontrada: "${category}"`);
      return res.status(400).json({ message: 'Categoría no encontrada' });
    }

    const resolved = await resolveCustomerIdForTicket(user, {
      customerId: providedCustomerId,
      customerEmail,
      customerName,
    });
    if (resolved.ok === false) {
      return res.status(resolved.status).json({ message: resolved.message });
    }
    const { customerId } = resolved;

    const ticket = await Ticket.create({
      title,
      description,
      categoryId: categoryRecord.id,
      priority,
      customerId,
      status: 'open',
      marca: marca || null,
      modeloEquipo: modeloEquipo || null,
    });

    // Obtener el ticket con la información del cliente
    const ticketWithCustomer = (await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
      ],
    })) as TicketWithRelations | null;

    // Enviar notificación por correo electrónico
    if (ticketWithCustomer?.customer) {
      try {
        const payload: TicketEmailData = {
          ticket: ticketWithCustomer,
          customer: ticketWithCustomer.customer,
          technician: ticketWithCustomer.technician,
        };
        const emailSent =
          await emailService.sendTicketCreatedNotification(payload);
        if (emailSent) {
          logger.info(`Email notification sent for ticket ${ticket.id}`);
        } else {
          logger.warn(
            `Failed to send email notification for ticket ${ticket.id}`
          );
        }
      } catch (emailError) {
        logger.error('Error sending email notification:', emailError);
        // No fallar la creación del ticket si el email falla
      }
    }

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket: ticketWithCustomer,
    });
  } catch (error) {
    logger.error('Error al crear ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const testEmailConfiguration = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Email es requerido para la prueba' });
    }

    const emailSent = await emailService.sendTestEmail(email);

    if (emailSent) {
      res.json({
        message: 'Email de prueba enviado exitosamente',
        success: true,
      });
    } else {
      res.status(500).json({
        message: 'Error al enviar email de prueba',
        success: false,
      });
    }
  } catch (error) {
    logger.error('Error testing email configuration:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      success: false,
    });
  }
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  redirected: 'Redireccionado',
};

const IMPORTANT_STATUSES = new Set([
  'in_progress',
  'resolved',
  'redirected',
  'closed',
]);

function appendObservation(existing: string, newPart: string): string {
  return existing ? `${existing}\n\n${newPart}` : newPart;
}

function formatTimestamp(): string {
  return new Date().toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function buildNewObservationLine(
  timestamp: string,
  newStatus: string | undefined,
  technicalObservations: string | undefined
): string | null {
  const statusText = newStatus ? STATUS_LABELS[newStatus] ?? newStatus : null;
  if (technicalObservations && statusText) {
    return `[${timestamp}] ${statusText}\n${technicalObservations}`;
  }
  if (technicalObservations) {
    return `[${timestamp}] ${technicalObservations}`;
  }
  if (newStatus && IMPORTANT_STATUSES.has(newStatus) && statusText) {
    return `[${timestamp}] ${statusText}`;
  }
  return null;
}

function buildTechnicalObservations(
  ticket: Ticket,
  newStatus: string | undefined,
  technicalObservations: string | undefined
): string | undefined {
  const newLine = buildNewObservationLine(
    formatTimestamp(),
    newStatus,
    technicalObservations
  );
  if (!newLine) return undefined;
  const existingObs = ticket.technicalObservations ?? '';
  return appendObservation(existingObs, newLine);
}

async function sendTechnicianAssignmentEmail(
  ticketId: string,
  oldTechnicianId: string | undefined
): Promise<void> {
  const ticketWithRelations = (await Ticket.findByPk(ticketId, {
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
    ],
  })) as TicketWithRelations | null;

  const technician = ticketWithRelations?.technician;
  if (!ticketWithRelations?.customer || !technician) return;

  const previousTechnician = oldTechnicianId
    ? await User.findByPk(oldTechnicianId, {
        attributes: ['id', 'name', 'email'],
      })
    : undefined;

  const emailSent = await emailService.sendTechnicianAssignmentNotification({
    ticket: ticketWithRelations,
    customer: ticketWithRelations.customer,
    technician,
    isReassignment: Boolean(oldTechnicianId),
    previousTechnician: previousTechnician ?? undefined,
  });

  if (emailSent) {
    const actionText = oldTechnicianId ? 'reasignación' : 'asignación';
    logger.info(`Technician ${actionText} email sent for ticket ${ticketId} to ${technician.email}`);
  } else {
    logger.warn(`Failed to send technician assignment email for ticket ${ticketId}`);
  }
}

async function sendStatusChangeEmail(
  ticketId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  const updatedTicket = (await Ticket.findByPk(ticketId, {
    include: [
      { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'technician', attributes: ['id', 'name', 'email'] },
    ],
  })) as TicketWithRelations | null;

  if (!updatedTicket?.customer) return;

  const emailSent = await emailService.sendTicketStatusChangeNotification({
    ticket: updatedTicket,
    customer: updatedTicket.customer,
    technician: updatedTicket.technician,
    oldStatus,
    newStatus,
  });

  if (emailSent) {
    logger.info(`Status change email sent for ticket ${ticketId}: ${oldStatus} → ${newStatus}`);
  } else {
    logger.warn(`Failed to send status change email for ticket ${ticketId}`);
  }
}

type TicketStatus = TicketAttributes['status'];
type TicketPriority = TicketAttributes['priority'];

function buildTicketUpdateData(
  user: { role: string },
  ticket: Ticket,
  body: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    technicianId?: string;
    technicalObservations?: string;
  }
): Partial<TicketAttributes> {
  const updateData: Partial<TicketAttributes> = {};
  if (user.role === 'customer') {
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    return updateData;
  }
  updateData.title = body.title ?? ticket.title;
  updateData.description = body.description ?? ticket.description;
  updateData.status = (body.status ?? ticket.status) as TicketStatus;
  updateData.priority = (body.priority ?? ticket.priority) as TicketPriority;
  updateData.technicianId = body.technicianId ?? ticket.technicianId ?? undefined;
  const newObservations = buildTechnicalObservations(
    ticket,
    body.status,
    body.technicalObservations
  );
  if (newObservations !== undefined) {
    updateData.technicalObservations = newObservations;
  }
  return updateData;
}

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const user = req.user as { id: string; role: string };

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }
    if (user.role === 'customer' && ticket.customerId !== user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para actualizar este ticket' });
    }

    const oldStatus = ticket.status;
    const oldTechnicianId = ticket.technicianId;
    const updateData = buildTicketUpdateData(user, ticket, body);
    await ticket.update(updateData);

    if (body.technicianId && body.technicianId !== oldTechnicianId) {
      try {
        await sendTechnicianAssignmentEmail(id, oldTechnicianId ?? undefined);
      } catch (emailError) {
        logger.error('Error sending technician assignment email:', emailError);
      }
    }

    const statusChanged =
      body.status &&
      body.status !== oldStatus &&
      ['in_progress', 'resolved', 'redirected'].includes(body.status);
    if (statusChanged) {
      try {
        await sendStatusChangeEmail(id, oldStatus, body.status);
      } catch (emailError) {
        logger.error('Error sending status change email:', emailError);
      }
    }

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
    const user = req.user as { id: string; role: string };

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
