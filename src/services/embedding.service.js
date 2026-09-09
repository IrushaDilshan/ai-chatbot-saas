import dotenv from 'dotenv';

dotenv.config();

export async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: {
        parts: [{ text: text }],
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Gemini Embedding API Error:', data);
    throw new Error(data.error?.message || 'Failed to fetch embedding');
  }

  return data.embedding.values;
}
