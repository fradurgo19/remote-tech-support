import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
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

    logger.info(`Verificando contraseña para usuario: ${user.name}`);

    // Verificar contraseña con bcrypt
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
        status: user.status,
      },
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
      status: 'offline',
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    await user.save();
    // Simular envío de email
    logger.info(`Token de recuperación para ${email}: ${token}`);
    res.json({
      message: 'Se ha enviado un correo de recuperación (simulado)',
      token,
    });
  } catch (error) {
    logger.error('Error en forgotPassword:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ where: { passwordResetToken: token } });
    if (!user) {
      return res.status(400).json({ message: 'Token inválido' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    await user.save();
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    logger.error('Error en resetPassword:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const sendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    // Guardar el token en el campo passwordResetToken para simplicidad
    user.passwordResetToken = token;
    await user.save();
    logger.info(`Token de verificación para ${email}: ${token}`);
    res.json({
      message: 'Se ha enviado un correo de verificación (simulado)',
      token,
    });
  } catch (error) {
    logger.error('Error en sendVerificationEmail:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ where: { passwordResetToken: token } });
    if (!user) {
      return res.status(400).json({ message: 'Token inválido' });
    }
    user.emailVerified = true;
    user.passwordResetToken = null;
    await user.save();
    res.json({ message: 'Email verificado correctamente' });
  } catch (error) {
    logger.error('Error en verifyEmail:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    // El middleware de autenticación ya verificó el token y puso el usuario en req.user
    const user = req.user as { id: string };

    if (!user) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Obtener el usuario completo de la base de datos
    const fullUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'passwordResetToken'] },
    });

    if (!fullUser) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user: fullUser });
  } catch (error) {
    logger.error('Error en me:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as { id: string }).id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Contraseña actual y nueva contraseña son requeridas',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    // Obtener el usuario actual
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    logger.info(`Cambio de contraseña solicitado para usuario: ${user.name}`);

    // Verificar la contraseña actual con bcrypt
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      logger.warn(`Contraseña actual inválida para usuario: ${user.name}`);
      return res
        .status(401)
        .json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    logger.info(
      `Contraseña actualizada exitosamente para usuario: ${user.name}`
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    logger.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
