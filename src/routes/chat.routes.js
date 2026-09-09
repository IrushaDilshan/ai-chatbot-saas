import { Router } from 'express';
import { chatWithKnowledge } from '../controllers/chat.controller.js';

const router = Router();

router.post('/', chatWithKnowledge);

export default router;
