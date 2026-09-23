import pdfParse from 'pdf-parse';
import { generateEmbedding } from '../services/embedding.service.js';
import {
  addKnowledgeEntry,
  getKnowledgeByCompany,
  deleteKnowledgeEntry,
  updateKnowledgeEntry,
} from '../services/vectorStore.service.js';

function chunkText(text, maxChunkSize = 1000) {
  if (!text) return [];
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + '\n\n' + paragraph).length <= maxChunkSize) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (paragraph.length > maxChunkSize) {
        let start = 0;
        while (start < paragraph.length) {
          chunks.push(paragraph.slice(start, start + maxChunkSize));
          start += maxChunkSize;
        }
        currentChunk = '';
      } else {
        currentChunk = paragraph;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

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

export const uploadFileKnowledge = async (req, res) => {
  try {
    const { company_id } = req.body;
    const file = req.file;

    if (!company_id) {
      return res.status(400).json({ error: 'company_id is required.' });
    }

    if (!file) {
      return res.status(400).json({ error: 'PDF file is required.' });
    }

    if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files are supported.' });
    }

    const pdfData = await pdfParse(file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from the PDF file.' });
    }

    const chunks = chunkText(extractedText, 1000);
    const addedEntries = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      const entry = await addKnowledgeEntry(company_id, chunk, embedding);
      addedEntries.push(entry);
    }

    res.status(201).json({
      message: 'PDF file processed and added to knowledge base successfully',
      chunksCount: chunks.length,
      entries: addedEntries,
    });
  } catch (error) {
    console.error('Error uploading file knowledge:', error);
    res.status(500).json({ error: error.message || 'Failed to process PDF file.' });
  }
};

export const getKnowledgeController = async (req, res) => {
  try {
    const company_id = req.params.company_id || req.query.company_id;
    if (!company_id) return res.status(400).json({ error: 'company_id is required.' });

    const entries = await getKnowledgeByCompany(company_id);
    res.status(200).json({ entries });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteKnowledgeController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Entry id is required.' });

    await deleteKnowledgeEntry(id);
    res.status(200).json({ message: 'Knowledge base entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge entry:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateKnowledgeController = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) return res.status(400).json({ error: 'Entry id is required.' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required.' });

    const embedding = await generateEmbedding(content);
    const updatedEntry = await updateKnowledgeEntry(id, content, embedding);

    res.status(200).json({ message: 'Knowledge entry updated successfully', entry: updatedEntry });
  } catch (error) {
    console.error('Error updating knowledge entry:', error);
    res.status(500).json({ error: error.message });
  }
};


