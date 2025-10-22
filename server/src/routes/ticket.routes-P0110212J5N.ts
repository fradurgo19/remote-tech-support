import { Router } from 'express';
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  testEmailConfiguration,
  updateTicket,
} from '../controllers/ticket.controller';
import {
  authenticate,
  authorize,
  authorizeTicketAccess,
} from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getTickets);
router.get('/:id', authorizeTicketAccess, getTicketById);
router.post('/', createTicket);
router.put('/:id', authorizeTicketAccess, updateTicket);
router.delete('/:id', authorizeTicketAccess, deleteTicket);
router.post('/test-email', authorize('admin'), testEmailConfiguration);

export default router;
