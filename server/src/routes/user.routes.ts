import { Router } from 'express';
import multer from 'multer';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  getUsersPublic,
  searchCustomers,
  updateUser,
  uploadAvatar,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Configurar multer para subida de archivos (memoria para Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

// Ruta pública para obtener usuarios (para la página de login)
router.get('/public', getUsersPublic);

// Rutas protegidas
router.use(authenticate);
router.post('/', createUser);
router.get('/', getUsers);
router.get(
  '/search/customers',
  authorize('admin', 'technician'),
  searchCustomers
);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/:id', deleteUser);

export default router;
