import { Router } from 'express';
import { getTickets, getTicketById, createTicket, updateTicket, deleteTicket } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router; 