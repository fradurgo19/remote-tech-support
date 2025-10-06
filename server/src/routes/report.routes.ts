import { Router } from 'express';
import multer from 'multer';
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  updateReport,
} from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Configuración de multer para archivos
const upload = multer({ storage: multer.memoryStorage() });

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para obtener informes (todos los usuarios autenticados)
router.get('/', getReports);
router.get('/:id', getReportById);

// Rutas para crear, actualizar y eliminar informes (solo admin y technician)
router.post(
  '/',
  authorize('admin', 'technician'),
  upload.array('attachments'),
  createReport
);
router.put('/:id', authorize('admin', 'technician'), updateReport);
router.delete('/:id', authorize('admin', 'technician'), deleteReport);

export default router;
