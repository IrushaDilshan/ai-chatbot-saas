import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Upload,
  FileText,
  FileUp,
  Loader2,
  CheckCircle2,
  Trash2,
  Edit2,
  Save,
  X,
  Building2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function KnowledgeBase() {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [uploadType, setUploadType] = useState('text'); // 'text' or 'pdf'
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Manage section states
  const [companies, setCompanies] = useState([]);
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Edit states
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchKnowledgeEntries(selectedCompanyId);
    } else {
      setKnowledgeEntries([]);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/company');
      const fetched = res.data.companies || [];
      setCompanies(fetched);
      if (fetched.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(fetched[0].id);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchKnowledgeEntries = async (cId) => {
    if (!cId) return;
    setEntriesLoading(true);
    setFetchError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/knowledge/${cId}`);
      setKnowledgeEntries(res.data.entries || []);
    } catch (err) {
      console.error('Error fetching knowledge entries:', err);
      setFetchError(
        err.response?.data?.error ||
          err.message ||
          'Failed to load entries. Make sure your backend server was restarted!'
      );
    }
    setEntriesLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!selectedCompanyId) return alert('Please select a Company / Tenant');

    if (uploadType === 'text') {
      if (!content.trim()) return alert('Please enter knowledge content');
      setLoading(true);
      try {
        await axios.post('http://localhost:5000/api/knowledge', {
          company_id: selectedCompanyId,
          content,
        });
        setSuccessMessage('Knowledge text added and embedded successfully!');
        setContent('');
        fetchKnowledgeEntries(selectedCompanyId);
      } catch (err) {
        alert(err.response?.data?.error || 'Error adding knowledge text');
      }
      setLoading(false);
    } else {
      if (!selectedFile) return alert('Please select a PDF file');
      setLoading(true);

      const formData = new FormData();
      formData.append('company_id', selectedCompanyId);
      formData.append('file', selectedFile);

      try {
        const res = await axios.post('http://localhost:5000/api/knowledge/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccessMessage(
          `PDF processed successfully! Created and embedded ${res.data.chunksCount || 1} text chunk(s).`
        );
        setSelectedFile(null);
        const fileInput = document.getElementById('pdf-file-input');
        if (fileInput) fileInput.value = '';
        fetchKnowledgeEntries(selectedCompanyId);
      } catch (err) {
        alert(err.response?.data?.error || 'Error uploading PDF file');
      }
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base entry?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/knowledge/${id}`);
      fetchKnowledgeEntries(selectedCompanyId);
    } catch (err) {
      console.error('Error deleting knowledge entry:', err);
      alert(err.response?.data?.error || 'Error deleting entry');
    }
  };

  const startEdit = (entry) => {
    setEditingEntryId(entry.id);
    setEditingContent(entry.content);
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setEditingContent('');
  };

  const handleUpdateEntry = async (id) => {
    if (!editingContent.trim()) return alert('Content cannot be empty.');
    setUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/knowledge/${id}`, {
        content: editingContent,
      });
      setEditingEntryId(null);
      setEditingContent('');
      fetchKnowledgeEntries(selectedCompanyId);
    } catch (err) {
      console.error('Error updating knowledge entry:', err);
      alert(err.response?.data?.error || 'Error updating knowledge entry');
    }
    setUpdating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Knowledge Base
        </h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {/* Upload Mode Selector */}
          <div className="flex border-b border-slate-200 mb-6 gap-6">
            <button
              type="button"
              onClick={() => setUploadType('text')}
              className={`pb-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
                uploadType === 'text'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              Paste Plain Text
            </button>
            <button
              type="button"
              onClick={() => setUploadType('pdf')}
              className={`pb-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
                uploadType === 'pdf'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileUp className="w-4 h-4" />
              Upload PDF Document
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Company / Tenant
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id.substring(0, 8)}...)
                  </option>
                ))}
              </select>
            </div>

            {uploadType === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Knowledge Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Paste company policies, FAQs, product details, etc."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PDF Document
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition">
                  <input
                    type="file"
                    id="pdf-file-input"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="pdf-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-3"
                  >
                    <FileUp className="w-12 h-12 text-indigo-500 mb-1" />
                    <span className="font-semibold text-slate-700 text-base">
                      {selectedFile ? selectedFile.name : 'Click to select a PDF file'}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {selectedFile
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                        : 'Supports PDF documents up to 10MB'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadType === 'pdf'
                    ? 'Parsing PDF & Generating Vector Embeddings...'
                    : 'Embedding to Vector Store...'}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {uploadType === 'pdf' ? 'Upload & Embed PDF' : 'Upload Knowledge'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Manage Knowledge Base Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Manage Knowledge Base
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View, edit, or remove vector-embedded knowledge entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Company --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {selectedCompanyId && (
              <button
                onClick={() => fetchKnowledgeEntries(selectedCompanyId)}
                title="Refresh entries"
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {!selectedCompanyId ? (
          <div className="text-center py-10 text-slate-500">
            Please select a company to view its knowledge base entries.
          </div>
        ) : entriesLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            Fetching knowledge entries...
          </div>
        ) : knowledgeEntries.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No knowledge entries found for this company. Upload some knowledge above!
          </div>
        ) : (
          <div className="space-y-4">
            {knowledgeEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition bg-slate-50/50"
              >
                {editingEntryId === entry.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        disabled={updating}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateEntry(entry.id)}
                        disabled={updating}
                        className="px-4 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Re-embedding...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Save & Re-embed
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span>ID: {entry.id}</span>
                        {entry.created_at && (
                          <span>• {new Date(entry.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-800 text-sm whitespace-pre-wrap">{entry.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
