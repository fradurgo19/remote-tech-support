import { Router } from 'express';
import { login, register, logout, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail, me, changePassword } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../middleware/validators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-verification-email', sendVerificationEmail);
router.post('/verify-email', verifyEmail);
router.get('/me', authenticate, me);
router.post('/change-password', authenticate, changePassword);

export default router; 