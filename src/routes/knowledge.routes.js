import { Router } from 'express';
import { addKnowledge } from '../controllers/knowledge.controller.js';

const router = Router();

router.post('/', addKnowledge);

export default router;
