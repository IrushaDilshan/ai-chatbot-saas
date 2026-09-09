# AI Chatbot SaaS - Project Rules

## Tech Stack
- Backend: Node.js, Express (ES Modules)
- Database & Vector Store: Supabase (PostgreSQL with pgvector extension)
- LLM & Embeddings: Google Gemini API (gemini-3.6-flash for chat, gemini-embedding-001 for vectors)

## Multi-Tenant Architecture Standard
- Every knowledge base record MUST belong to a specific `company_id`.
- Every search or context retrieval MUST filter strictly by `filter_company_id`.
- Vector dimension is set to 3072.

## Coding Style & Instructions
- Keep code clean, modular, and use async/await.
- Log clear error messages for debugging.
- Always handle edge cases like missing company_id or empty context.
