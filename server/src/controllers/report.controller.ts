import { Request, Response } from 'express';
import { Report, Ticket, User } from '../models';
import { storageService } from '../services/storage.service';
import { logger } from '../utils/logger';

export const getReports = async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: string; role: string };
    const whereClause: { customerId?: string } = {};

    // Filtrar informes según el rol del usuario
    if (user.role === 'customer') {
      // Los clientes solo pueden ver informes asignados a ellos
      whereClause.customerId = user.id;
    }
    // Los administradores y técnicos pueden ver todos los informes (no se aplica filtro)

    const reports = await Report.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'email'] },
        {
          model: Ticket,
          attributes: ['id', 'title', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(reports);
  } catch (error) {
    logger.error('Error al obtener informes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as { id: string; role: string };

    const report = await Report.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'email'] },
        {
          model: Ticket,
          attributes: ['id', 'title', 'status', 'description'],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado' });
    }

    // Verificar permisos de acceso
    if (user.role === 'customer') {
      if (report.customerId !== user.id) {
        return res
          .status(403)
          .json({ message: 'No tienes permisos para ver este informe' });
      }
    }

    res.json(report);
  } catch (error) {
    logger.error('Error al obtener informe:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      customerId,
      tags,
      attachments,
    } = req.body;
    const user = req.user as { id: string; role: string };

    // Verificar permisos de creación
    if (user.role === 'customer') {
      return res
        .status(403)
        .json({ message: 'Los clientes no pueden crear informes' });
    }

    // customerId es opcional - puede ser null para reportes generales
    console.log('✅ Datos recibidos:', {
      title,
      description,
      customerId,
      files: req.files?.length || 0,
    });

    // Crear el reporte primero
    const report = await Report.create({
      title,
      description,
      type,
      priority,
      authorId: user.id,
      customerId: customerId || null,
      tags: tags || [],
      attachments: [],
      status: 'draft',
    });

    // Subir archivos a Supabase Storage si existen
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log(
        `📤 Subiendo ${req.files.length} archivos a Supabase Storage...`
      );
      const uploadedUrls: string[] = [];

      for (const file of req.files as Express.Multer.File[]) {
        try {
          console.log(`  📎 Subiendo: ${file.originalname}`);
          const uploadResult = await storageService.uploadReportAttachment(
            report.id,
            file
          );
          uploadedUrls.push(uploadResult.url);
          console.log(`  ✅ Subido: ${uploadResult.url}`);
        } catch (uploadError) {
          console.error(
            `  ❌ Error al subir ${file.originalname}:`,
            uploadError
          );
        }
      }

      // Actualizar el reporte con las URLs de los archivos
      await report.update({ attachments: uploadedUrls });
      console.log(
        `✅ ${uploadedUrls.length} archivos subidos a Supabase Storage`
      );
    }

    // Obtener el informe con la información del autor y cliente
    const reportWithDetails = await Report.findByPk(report.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'email'] },
        {
          model: Ticket,
          attributes: ['id', 'title', 'status'],
        },
      ],
    });

    res.status(201).json({
      message: 'Informe creado exitosamente',
      report: reportWithDetails,
    });
  } catch (error) {
    logger.error('Error al crear informe:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, priority, status, tags, attachments } =
      req.body;
    const user = req.user as { id: string; role: string };

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado' });
    }

    // Verificar permisos de actualización
    if (user.role === 'customer') {
      return res
        .status(403)
        .json({ message: 'Los clientes no pueden actualizar informes' });
    }

    // Solo el autor del informe o un administrador puede actualizarlo
    if (user.role !== 'admin' && report.authorId !== user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para actualizar este informe' });
    }

    const updateData: {
      title: string;
      description: string;
      type: string;
      priority: string;
      tags?: string[];
      attachments?: string[];
      status?: string;
      reviewedBy?: string;
    } = {
      title: title || report.title,
      description: description || report.description,
      type: type || report.type,
      priority: priority || report.priority,
      tags: tags || report.tags,
      attachments: attachments || report.attachments,
    };

    // Solo los administradores pueden cambiar el estado
    if (user.role === 'admin' && status) {
      updateData.status = status;
      if (status === 'approved' || status === 'rejected') {
        updateData.reviewedAt = new Date();
        updateData.reviewedById = user.id;
      }
    }

    await report.update(updateData);

    res.json({
      message: 'Informe actualizado exitosamente',
      report,
    });
  } catch (error) {
    logger.error('Error al actualizar informe:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as { id: string; role: string };

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: 'Informe no encontrado' });
    }

    // Verificar permisos de eliminación
    if (user.role === 'customer') {
      return res
        .status(403)
        .json({ message: 'Los clientes no pueden eliminar informes' });
    }

    // Solo el autor del informe o un administrador puede eliminarlo
    if (user.role !== 'admin' && report.authorId !== user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para eliminar este informe' });
    }

    await report.destroy();
    res.json({ message: 'Informe eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar informe:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
