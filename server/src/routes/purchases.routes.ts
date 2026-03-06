import { Router } from 'express';
import {
  purchasesHealth,
  searchPurchasesByNitOrName,
} from '../controllers/purchases.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get(
  '/search',
  authorize('admin', 'technician'),
  searchPurchasesByNitOrName
);
router.get('/health', authorize('admin', 'technician'), purchasesHealth);

export default router;
