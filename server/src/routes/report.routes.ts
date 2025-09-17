import { Router } from 'express';
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  updateReport,
} from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para obtener informes (todos los usuarios autenticados)
router.get('/', getReports);
router.get('/:id', getReportById);

// Rutas para crear, actualizar y eliminar informes (solo admin y technician)
router.post('/', authorize('admin', 'technician'), createReport);
router.put('/:id', authorize('admin', 'technician'), updateReport);
router.delete('/:id', authorize('admin', 'technician'), deleteReport);

export default router;
