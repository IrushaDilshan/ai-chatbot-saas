import { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

export default function TestChat() {
  const [companyId, setCompanyId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!companyId || !input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        company_id: companyId,
        message: userMsg.content,
      });
      setMessages((prev) => [...prev, { role: 'bot', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', content: err.response?.data?.error || 'Error' }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-indigo-600" />
          Test RAG Chatbot
        </h1>
        <div className="flex gap-4">
          <input
            type="text"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="Enter Company ID to test..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
        {!companyId && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-slate-500">
            <Bot className="w-16 h-16 mb-4 text-slate-300" />
            <p className="font-medium text-lg">Enter a Company ID above to start testing.</p>
          </div>
        )}

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
             <div className="h-full flex items-center justify-center text-slate-400">No messages yet. Say hello!</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-100 text-slate-500 px-5 py-3 rounded-2xl rounded-tl-none flex gap-2 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-3 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!companyId || loading}
              placeholder="Type your message..."
              className="flex-1 pl-4 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!companyId || loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
