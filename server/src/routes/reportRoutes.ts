import { Router } from 'express';
import multer from 'multer';
import { reportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rutas protegidas que requieren autenticación
router.use(authenticate);

// Obtener todos los informes
router.get('/', reportController.getAll);

// Crear un nuevo informe
router.post('/', upload.array('attachments'), reportController.create);

// Generar PDF del informe
router.get('/:reportId/pdf', reportController.generatePDF);

// Descargar archivo adjunto
router.get('/:reportId/attachments/:fileName', reportController.downloadAttachment);

// Enviar informe por correo
router.post('/:reportId/send-email', reportController.sendEmail);

// Eliminar informe
router.delete('/:reportId', reportController.delete);

export default router; 