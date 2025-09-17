import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  getUsersPublic,
  searchCustomers,
  updateUser,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

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
router.delete('/:id', deleteUser);

export default router;
