import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Ruta pública para obtener usuarios (para la página de login)
router.get('/public', getUsers);

// Rutas protegidas
router.use(authenticate);
router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 