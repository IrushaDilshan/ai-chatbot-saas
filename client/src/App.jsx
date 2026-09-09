import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CompanyManagement from './pages/CompanyManagement';
import KnowledgeBase from './pages/KnowledgeBase';
import TestChat from './pages/TestChat';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<CompanyManagement />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/chat" element={<TestChat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
