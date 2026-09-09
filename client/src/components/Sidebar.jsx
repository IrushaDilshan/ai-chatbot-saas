import { Link, useLocation } from 'react-router-dom';
import { Building2, BookOpen, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Companies', path: '/', icon: Building2 },
    { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen },
    { name: 'Test Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3 text-white font-semibold text-lg border-b border-slate-800">
        <LayoutDashboard className="w-6 h-6 text-indigo-400" />
        AI SaaS Admin
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
