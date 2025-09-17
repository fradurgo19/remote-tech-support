import { Request, Response } from 'express';
import { User } from '../models';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Temporalmente guardar contraseña en texto plano
    const user = await User.create({
      name,
      email,
      password: password, // Temporalmente en texto plano
      role: role || 'customer',
      status: 'offline',
      emailVerified: false,
    });

    // Retornar el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    logger.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'avatar', 'createdAt']
    });
    res.json(users);
  } catch (error) {
    logger.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'status', 'avatar', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status, avatar } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Preparar datos de actualización
    const updateData: any = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      status: status || user.status,
      avatar: avatar || user.avatar
    };

    // Si se proporciona una nueva contraseña, guardarla (temporalmente en texto plano)
    if (password && password.trim() !== '') {
      logger.info(`Actualizando contraseña para usuario: ${user.name}`);
      // Temporalmente guardar en texto plano hasta arreglar el hashing
      user.password = password;
    } else {
      logger.info(`Manteniendo contraseña actual para usuario: ${user.name}`);
    }

    // Actualizar otros campos
    Object.assign(user, updateData);
    await user.save();

    // Retornar el usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json({
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    logger.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 