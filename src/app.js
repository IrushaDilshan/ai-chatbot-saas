import express from 'express';
import cors from 'cors';
import companyRoutes from './routes/company.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import chatRoutes from './routes/chat.routes.js';
import clientRoutes from './routes/client.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('AI Chatbot SaaS Backend with Vector RAG is running!');
});

app.use('/api/company', companyRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/client', clientRoutes);

export default app;
