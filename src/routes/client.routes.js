import { Router } from 'express';
import {
  getClientCompanyController,
  registerClientController,
  loginClientController,
} from '../controllers/company.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerClientController);
router.post('/login', loginClientController);
router.get('/me', requireAuth, getClientCompanyController);
router.get('/company', requireAuth, getClientCompanyController);

export default router;
