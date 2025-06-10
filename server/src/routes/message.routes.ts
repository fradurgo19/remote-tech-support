import { Router } from 'express';
import { getMessages, createMessage, deleteMessage } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/ticket/:ticketId', getMessages);
router.post('/', createMessage);
router.delete('/:id', deleteMessage);

export default router; 