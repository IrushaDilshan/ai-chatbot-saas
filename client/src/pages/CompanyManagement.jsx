import { useState } from 'react';
import axios from 'axios';
import { Plus, Building } from 'lucide-react';

export default function CompanyManagement() {
  const [name, setName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/company', { name });
      setCompanies([...companies, res.data.company]);
      setName('');
    } catch (err) {
      alert('Error creating company');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
        <Building className="w-8 h-8 text-indigo-600" />
        Company Management
      </h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Add New Tenant</h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company Name"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Create
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">Company ID</th>
              <th className="px-6 py-4">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {companies.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-slate-500">
                  No companies created yet during this session. Create one above!
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">{c.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
