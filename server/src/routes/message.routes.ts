import { Router } from 'express';
import { getMessages, createMessage, deleteMessage, uploadFile, sendFileMessage } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/:ticketId', getMessages);
router.post('/', createMessage);
router.post('/file', uploadFile, sendFileMessage);
router.delete('/:id', deleteMessage);

export default router; 