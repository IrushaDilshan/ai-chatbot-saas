import { Router } from 'express';
import { createCompanyController, getCompaniesController } from '../controllers/company.controller.js';

const router = Router();

router.get('/', getCompaniesController);
router.post('/', createCompanyController);

export default router;
