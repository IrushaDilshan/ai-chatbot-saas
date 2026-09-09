import { useState } from 'react';
import axios from 'axios';
import { BookOpen, Upload } from 'lucide-react';

export default function KnowledgeBase() {
  const [companyId, setCompanyId] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !content) return alert('Fill all fields');
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/knowledge', {
        company_id: companyId,
        content
      });
      alert('Knowledge added successfully!');
      setContent('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding knowledge');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-indigo-600" />
        Knowledge Base
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company ID
            </label>
            <input
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Knowledge Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Paste company policies, FAQs, product details, etc."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {loading ? 'Embedding to Vector Store...' : 'Upload Knowledge'}
          </button>
        </form>
      </div>
    </div>
  );
}
