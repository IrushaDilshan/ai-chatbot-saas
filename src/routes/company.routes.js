import { Router } from 'express';
import { createCompanyController, getCompaniesController, deleteCompanyController } from '../controllers/company.controller.js';

const router = Router();

router.get('/', getCompaniesController);
router.post('/', createCompanyController);
router.delete('/:id', deleteCompanyController);

export default router;
