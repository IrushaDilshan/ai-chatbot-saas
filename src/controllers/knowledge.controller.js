import { generateEmbedding } from '../services/embedding.service.js';
import { addKnowledgeEntry } from '../services/vectorStore.service.js';

export const addKnowledge = async (req, res) => {
  try {
    const { company_id, content } = req.body;

    if (!company_id || !content) {
      return res.status(400).json({ error: 'Both company_id and content are required.' });
    }

    const embedding = await generateEmbedding(content);
    const entry = await addKnowledgeEntry(company_id, content, embedding);

    res.status(201).json({
      message: 'Knowledge base entry and vector embedding added successfully',
      entry,
    });
  } catch (error) {
    console.error('Error adding knowledge:', error);
    res.status(500).json({ error: error.message || 'Failed to add knowledge base entry.' });
  }
};
