import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Gemini API Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req, res) => {
  res.send('AI Chatbot Backend is running!');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Updated to Gemini 3.6 Flash Model
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Detailed Error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong with AI response' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});