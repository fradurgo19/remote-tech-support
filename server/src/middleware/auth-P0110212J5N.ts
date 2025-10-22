import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
    ) as JwtPayload;

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Error de autenticación:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    next();
  };
};

// Middleware específico para autorización de tickets
export const authorizeTicketAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { id } = req.params;
    const user = req.user;

    // Los administradores y técnicos pueden acceder a todos los tickets
    if (user.role === 'admin' || user.role === 'technician') {
      return next();
    }

    // Para clientes, verificar que el ticket les pertenece
    if (user.role === 'customer') {
      const { Ticket } = await import('../models');
      const ticket = await Ticket.findByPk(id);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      if (ticket.customerId !== user.id) {
        return res.status(403).json({ message: 'No tienes permisos para acceder a este ticket' });
      }
    }

    next();
  } catch (error) {
    logger.error('Error en autorización de ticket:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 