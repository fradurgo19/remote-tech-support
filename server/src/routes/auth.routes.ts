import { Router } from 'express';
import { login, register, logout } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../middleware/validators';

const router = Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/logout', logout);

export default router; 