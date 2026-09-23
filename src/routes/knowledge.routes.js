import { Router } from 'express';
import multer from 'multer';
import {
  addKnowledge,
  uploadFileKnowledge,
  getKnowledgeController,
  deleteKnowledgeController,
  updateKnowledgeController,
} from '../controllers/knowledge.controller.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/', addKnowledge);
router.post('/upload-file', upload.single('file'), uploadFileKnowledge);
router.get('/', getKnowledgeController);
router.get('/:company_id', getKnowledgeController);
router.delete('/:id', deleteKnowledgeController);
router.put('/:id', updateKnowledgeController);

export default router;
