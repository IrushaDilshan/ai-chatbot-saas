import genAI from '../config/gemini.js';

export async function generateChatResponse(systemPrompt) {
  const chatModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const response = await chatModel.generateContent(systemPrompt);
  return response.response.text();
}
