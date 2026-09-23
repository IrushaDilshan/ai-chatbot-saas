import genAI from '../config/gemini.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientError = (error) => {
  if (!error) return false;
  const status = error.status || error.statusCode;
  const msg = (error.message || '').toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('service unavailable') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('overloaded')
  );
};

async function invokeModelWithRetry(modelName, prompt, maxRetries = 2, initialDelayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      return response.response.text();
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini API] Model '${modelName}' attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (isTransientError(error) && attempt < maxRetries) {
        const backoffDelay = initialDelayMs * Math.pow(2, attempt - 1);
        await delay(backoffDelay);
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

export async function generateChatResponse(systemPrompt) {
  // Model fallback chain: gemini-3.6-flash -> gemini-1.5-flash -> gemini-2.0-flash -> gemini-1.5-pro
  const modelChain = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  for (let i = 0; i < modelChain.length; i++) {
    const modelName = modelChain[i];
    try {
      return await invokeModelWithRetry(modelName, systemPrompt, 2, 1000);
    } catch (err) {
      const is404 = err.status === 404 || err.message?.includes('404') || err.message?.includes('not found');
      if (is404) {
        console.warn(`[Gemini API] Model '${modelName}' not available (404). Trying next fallback...`);
      } else {
        console.warn(`[Gemini API] Model '${modelName}' failed (${err.message}). Trying next fallback...`);
      }

      if (i === modelChain.length - 1) {
        console.error('[Gemini API] All fallback models in chain failed:', err);
        throw new Error('Server is temporarily busy, please try again in a moment.');
      }
    }
  }
}
