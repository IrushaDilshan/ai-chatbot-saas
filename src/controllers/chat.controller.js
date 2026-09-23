import { generateEmbedding } from '../services/embedding.service.js';
import { matchKnowledge } from '../services/vectorStore.service.js';
import { generateChatResponse } from '../services/ai.service.js';

export const chatWithKnowledge = async (req, res) => {
  try {
    const { company_id, message } = req.body;

    if (!company_id || !message) {
      return res.status(400).json({ error: 'Both company_id and message are required.' });
    }

    const queryEmbedding = await generateEmbedding(message);
    const matchedDocs = await matchKnowledge(queryEmbedding, company_id);

    const context = matchedDocs.map((doc) => doc.content).join('\n');

    const systemPrompt = `
You are a helpful customer support assistant. 
Use ONLY the following company knowledge base to answer the user's question. 
If the information is not available in the context below, politely inform the user that you do not have that information.

--- RELEVANT COMPANY KNOWLEDGE BASE ---
${context || 'No matching knowledge base entry found for this company.'}
---------------------------------------

User Question: ${message}
`;

    const reply = await generateChatResponse(systemPrompt);

    res.json({ reply });
  } catch (error) {
    console.error('Detailed Chat Controller Error:', error);
    const is503Error =
      error.status === 503 ||
      error.message?.includes('503') ||
      error.message?.includes('Service Unavailable') ||
      error.message?.includes('overloaded');

    const friendlyErrorMessage = is503Error
      ? 'Server is temporarily busy, please try again in a moment.'
      : error.message || 'Something went wrong.';

    res.status(500).json({ error: friendlyErrorMessage });
  }
};
