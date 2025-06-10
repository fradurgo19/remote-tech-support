import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { logger } from '../utils/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    logger.info(`Intento de login para email: ${email}`);

    const user = await User.findOne({ where: { email } });
    logger.info(`Usuario encontrado: ${user ? 'Sí' : 'No'}`);

    if (!user) {
      logger.warn(`Usuario no encontrado: ${email}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    logger.info(`Comparando contraseñas para usuario: ${user.name}`);
    const isValidPassword = await bcrypt.compare(password, user.password);
    logger.info(`Contraseña válida: ${isValidPassword ? 'Sí' : 'No'}`);

    if (!isValidPassword) {
      logger.warn(`Contraseña inválida para usuario: ${user.name}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Login exitoso para usuario: ${user.name}`);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      status: 'offline'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // En una implementación real, podrías invalidar el token aquí
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 