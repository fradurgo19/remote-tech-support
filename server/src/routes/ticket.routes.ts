import { Router } from 'express';
import { getTickets, getTicketById, createTicket, updateTicket, deleteTicket } from '../controllers/ticket.controller';
import { authenticate, authorizeTicketAccess } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getTickets);
router.get('/:id', authorizeTicketAccess, getTicketById);
router.post('/', createTicket);
router.put('/:id', authorizeTicketAccess, updateTicket);
router.delete('/:id', authorizeTicketAccess, deleteTicket);

export default router; 