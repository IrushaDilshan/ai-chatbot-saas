import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  Code2,
  Copy,
  Check,
  BookOpen,
  FileText,
  FileUp,
  Upload,
  Loader2,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  LogOut,
  UserCheck,
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Sliders,
} from 'lucide-react';

export default function ClientDashboard() {
  const { user, logout, accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Knowledge base states
  const [uploadType, setUploadType] = useState('text');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [updatingEntry, setUpdatingEntry] = useState(false);

  // Widget preview customizer states
  const [widgetTitle, setWidgetTitle] = useState('Customer Support AI');
  const [widgetThemeColor, setWidgetThemeColor] = useState('#4f46e5');
  const [widgetPosition, setWidgetPosition] = useState('bottom-right');

  // Test Chatbot states
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Knowledge Assistant. How can I help you or your customers today?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchClientProfile();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const fetchClientProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/client/me', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      setClientData(res.data);
      if (res.data.company?.id) {
        fetchKnowledgeEntries(res.data.company.id);
      }
    } catch (err) {
      console.error('Error fetching client profile:', err);
    }
    setLoading(false);
  };

  const fetchKnowledgeEntries = async (companyId) => {
    setEntriesLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/knowledge/${companyId}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      setKnowledgeEntries(res.data.entries || []);
    } catch (err) {
      console.error('Error fetching knowledge entries:', err);
    }
    setEntriesLoading(false);
  };

  const company = clientData?.company;
  const companyId = company?.id || '4cfa84cb-8140-4ab0-afaa-e58329136f69';
  const embedSnippet = `<script src="http://localhost:5000/widget.js" data-company-id="${companyId}"${
    widgetTitle ? ` data-title="${widgetTitle}"` : ''
  }${widgetThemeColor ? ` data-theme-color="${widgetThemeColor}"` : ''}${
    widgetPosition ? ` data-position="${widgetPosition}"` : ''
  }></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

  const handleKnowledgeUpload = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const currentCompanyId = clientData?.company?.id;
    if (!currentCompanyId) return alert('Company profile not loaded.');

    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    if (uploadType === 'text') {
      if (!content.trim()) return alert('Please enter knowledge content.');
      setUploading(true);
      try {
        await axios.post(
          'http://localhost:5000/api/knowledge',
          {
            company_id: currentCompanyId,
            content,
          },
          { headers }
        );
        setSuccessMessage('Knowledge entry embedded successfully!');
        setContent('');
        fetchKnowledgeEntries(currentCompanyId);
      } catch (err) {
        alert(err.response?.data?.error || 'Error uploading knowledge text');
      }
      setUploading(false);
    } else {
      if (!selectedFile) return alert('Please select a PDF file.');
      setUploading(true);
      const formData = new FormData();
      formData.append('company_id', currentCompanyId);
      formData.append('file', selectedFile);

      try {
        const res = await axios.post('http://localhost:5000/api/knowledge/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...headers,
          },
        });
        setSuccessMessage(
          `PDF processed successfully! Created & embedded ${res.data.chunksCount || 1} text chunk(s).`
        );
        setSelectedFile(null);
        const fileInput = document.getElementById('client-pdf-file-input');
        if (fileInput) fileInput.value = '';
        fetchKnowledgeEntries(currentCompanyId);
      } catch (err) {
        alert(err.response?.data?.error || 'Error uploading PDF file');
      }
      setUploading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge entry?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/knowledge/${id}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      fetchKnowledgeEntries(clientData.company.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting entry');
    }
  };

  const handleUpdateEntry = async (id) => {
    if (!editingContent.trim()) return alert('Content cannot be empty.');
    setUpdatingEntry(true);
    try {
      await axios.put(
        `http://localhost:5000/api/knowledge/${id}`,
        {
          content: editingContent,
        },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );
      setEditingEntryId(null);
      setEditingContent('');
      fetchKnowledgeEntries(clientData.company.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating entry');
    }
    setUpdatingEntry(false);
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const query = customText || chatInput;
    if (!query.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: query };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setChatLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        company_id: clientData.company.id,
        message: query,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.answer || 'No response generated.',
          sources: res.data.sources || [],
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.response?.data?.error || 'Failed to connect to AI server.'}`,
          isError: true,
        },
      ]);
    }
    setChatLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">Loading Tenant Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-500/20">
            {company?.name ? company.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {company?.name || 'My Tenant Portal'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Active Tenant
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition border border-slate-200 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* SUB-TAB VIEW CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Knowledge Base</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{knowledgeEntries.length} Documents</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Widget Embed</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Ready to Deploy</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Engine</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">Gemini AI (Active)</h3>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" /> Company Profile & Tenant Credentials
              </h2>
              <div className="divide-y divide-slate-100 text-sm">
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">Company Name</span>
                  <span className="font-semibold text-slate-900">{company?.name || 'N/A'}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">Company ID / Tenant UUID</span>
                  <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold border border-indigo-100">
                    {company?.id || 'N/A'}
                  </span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">Registered Email</span>
                  <span className="text-slate-800 font-medium">{user?.email}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-slate-500">Account Created</span>
                  <span className="text-slate-700">
                    {company?.created_at ? new Date(company.created_at).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" /> Quick Tenant Actions
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your AI chatbot parameters, embed script, and vector knowledge base.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setSearchParams({ tab: 'knowledge' })}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-left border border-slate-200/80 transition group"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Manage Knowledge Base</span>
                      <span className="text-xs text-slate-500">Upload plain text & PDF docs for RAG</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                </button>

                <button
                  onClick={() => setSearchParams({ tab: 'widget' })}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-left border border-slate-200/80 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Get Embed Script</span>
                      <span className="text-xs text-slate-500">Copy 1-click script for your website</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                </button>

                <button
                  onClick={() => setSearchParams({ tab: 'chat' })}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-left border border-slate-200/80 transition group"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Test Chatbot Answers</span>
                      <span className="text-xs text-slate-500">Interactive live AI test session</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KNOWLEDGE BASE TAB */}
      {activeTab === 'knowledge' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" /> Knowledge Base Management
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload custom training data (Plain Text or PDF) to teach your AI chatbot company-specific information.
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleKnowledgeUpload} className="space-y-4">
            <div className="flex border-b border-slate-200 gap-6">
              <button
                type="button"
                onClick={() => setUploadType('text')}
                className={`pb-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
                  uploadType === 'text'
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" /> Plain Text Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadType('pdf')}
                className={`pb-3 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
                  uploadType === 'pdf'
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileUp className="w-4 h-4" /> PDF Document Processing
              </button>
            </div>

            {uploadType === 'text' ? (
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste company FAQs, pricing details, refund policies, or product specifications..."
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm leading-relaxed"
              />
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                <input
                  type="file"
                  id="client-pdf-file-input"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="client-pdf-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileUp className="w-12 h-12 text-indigo-500" />
                  <span className="font-semibold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Click to select a PDF file'}
                  </span>
                  <span className="text-xs text-slate-400">PDF documents will be parsed & vectorized into knowledge chunks.</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Vectorizing & Embedding...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Embed Knowledge into AI Vector Store
                </>
              )}
            </button>
          </form>

          {/* Entries List */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Embedded Knowledge Entries ({knowledgeEntries.length})
              </h3>
              <button
                onClick={() => fetchKnowledgeEntries(company.id)}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {entriesLoading ? (
              <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Fetching vector database entries...
              </div>
            ) : knowledgeEntries.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No knowledge entries embedded yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">Use the upload box above to add your first document.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {knowledgeEntries.map((entry) => (
                  <div key={entry.id} className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 space-y-2">
                    {editingEntryId === entry.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                          className="w-full p-3 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingEntryId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateEntry(entry.id)}
                            disabled={updatingEntry}
                            className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1 font-medium"
                          >
                            {updatingEntry ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save & Re-embed
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="font-mono bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            ID: {entry.id}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setEditingEntryId(entry.id);
                                setEditingContent(entry.content);
                              }}
                              className="text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-slate-500 hover:text-red-600 flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WIDGET INTEGRATION TAB */}
      {activeTab === 'widget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Script Snippet Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Website Chatbot Snippet</h2>
                </div>
                <p className="text-xs text-slate-500">
                  Embed this single Javascript snippet into your website before the closing <code>&lt;/body&gt;</code> tag to instantly activate your custom chatbot.
                </p>
              </div>

              <div className="relative bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner min-h-[56px] flex items-center">
                <code className="whitespace-pre-wrap break-all font-mono text-emerald-400 font-medium">
                  {embedSnippet}
                </code>
              </div>

              <button
                onClick={copyEmbedCode}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-md ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Embed Code Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy 1-Click Embed Code
                  </>
                )}
              </button>
            </div>

            {/* Right: Widget Appearance Customizer Preview */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" /> Widget Appearance Settings
              </h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Widget Header Title
                  </label>
                  <input
                    type="text"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={widgetThemeColor}
                      onChange={(e) => setWidgetThemeColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-600">{widgetThemeColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Screen Position
                  </label>
                  <select
                    value={widgetPosition}
                    onChange={(e) => setWidgetPosition(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bottom-right">Bottom Right corner</option>
                    <option value="bottom-left">Bottom Left corner</option>
                  </select>
                </div>
              </div>

              {/* Widget Visual Preview Box */}
              <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Live Visual Preview</span>
                <div
                  className="p-3 rounded-lg text-white flex items-center justify-between shadow-sm"
                  style={{ backgroundColor: widgetThemeColor }}
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold text-sm">{widgetTitle}</span>
                  </div>
                  <span className="text-xs opacity-80">● Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEST CHATBOT TAB */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[620px]">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-wide">{company?.name || 'Tenant'} AI Assistant</h2>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> RAG Knowledge Engine Active
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setChatMessages([
                  {
                    role: 'assistant',
                    content: 'Hello! I am your AI Knowledge Assistant. How can I help you or your customers today?',
                  },
                ])
              }
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition border border-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear History
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  Searching knowledge base & generating response...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Test Prompt Chips */}
          <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium shrink-0">Try test prompt:</span>
            {['What services do you offer?', 'What are your support hours?', 'Tell me about your company'].map(
              (promptText) => (
                <button
                  key={promptText}
                  onClick={(e) => handleSendMessage(e, promptText)}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-full border border-slate-200 transition shrink-0 font-medium"
                >
                  "{promptText}"
                </button>
              )
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question to test chatbot RAG responses..."
              className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
