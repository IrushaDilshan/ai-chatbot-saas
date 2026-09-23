import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Building, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function CompanyManagement() {
  const [name, setName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setFetching(true);
    setFetchError('');
    try {
      const res = await axios.get('http://localhost:5000/api/company');
      const companyList = res.data?.companies || (Array.isArray(res.data) ? res.data : []);
      setCompanies(companyList);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setFetchError(
        err.response?.data?.error ||
          err.message ||
          'Failed to load companies. Make sure backend server is running!'
      );
    }
    setFetching(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/company', { name });
      if (res.data.company) {
        setCompanies([res.data.company, ...companies]);
      } else {
        fetchCompanies();
      }
      setName('');
    } catch (err) {
      console.error('Error creating company:', err);
      alert(err.response?.data?.error || 'Error creating company');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company and all its knowledge base entries?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/company/${id}`);
      fetchCompanies();
    } catch (err) {
      console.error('Error deleting company:', err);
      alert(err.response?.data?.error || err.message || 'Error deleting company');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Building className="w-8 h-8 text-indigo-600" />
          Company Management
        </h1>
        <button
          onClick={fetchCompanies}
          disabled={fetching}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-sm hover:border-slate-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Add New Tenant / Company</h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Malki Gift Center"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
            Create
          </button>
        </form>
      </div>

      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-sm">
            <tr>
              <th className="px-6 py-4">Company ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {fetching ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    Fetching companies list...
                  </div>
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-slate-500 text-sm">
                  No companies created yet. Create one above or register a new company tenant!
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{c.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 text-sm">{c.name}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
