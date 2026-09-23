import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import CompanyManagement from './pages/CompanyManagement';
import KnowledgeBase from './pages/KnowledgeBase';
import TestChat from './pages/TestChat';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes with Admin Layout */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex min-h-screen bg-slate-50">
                  <Sidebar />
                  <main className="flex-1 p-8">
                    <Routes>
                      <Route path="companies" element={<CompanyManagement />} />
                      <Route path="knowledge" element={<KnowledgeBase />} />
                      <Route path="chat" element={<TestChat />} />
                      <Route path="*" element={<Navigate to="companies" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Tenant / Client Portal Routes with Tenant Layout */}
          <Route
            path="/client/*"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen bg-slate-50">
                  <Sidebar />
                  <main className="flex-1 p-8">
                    <Routes>
                      <Route path="dashboard" element={<ClientDashboard />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin/companies" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
