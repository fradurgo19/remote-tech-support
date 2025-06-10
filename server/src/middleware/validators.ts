import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email y contraseña deben ser texto' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    next();
  } catch (error) {
    logger.error('Error en validación de login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Los campos deben ser texto' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (role && !['admin', 'technician', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    next();
  } catch (error) {
    logger.error('Error en validación de registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 