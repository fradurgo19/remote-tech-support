import { Request, Response } from 'express';
import { Category } from '../models';
import { logger } from '../utils/logger';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'description']
    });

    res.json(categories);
  } catch (error) {
    logger.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
