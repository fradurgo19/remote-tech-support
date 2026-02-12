import { Router } from 'express';
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTicketKpis,
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

// POST /api/tickets/public está registrado en index.ts sin auth
router.use(authenticate);
router.get('/', getTickets);
router.get('/kpis', getTicketKpis);
router.get('/:id', authorizeTicketAccess, getTicketById);
router.post('/', createTicket);
router.put('/:id', authorizeTicketAccess, updateTicket);
router.delete('/:id', authorizeTicketAccess, deleteTicket);
router.post('/test-email', authorize('admin'), testEmailConfiguration);

export default router;
