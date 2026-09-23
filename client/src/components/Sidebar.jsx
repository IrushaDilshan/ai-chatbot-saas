import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  UserCheck,
  LogOut,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const isTenantPortal = location.pathname.startsWith('/client');

  const adminNavItems = [
    { name: 'Companies', path: '/admin/companies', icon: Building2 },
    { name: 'Knowledge Base', path: '/admin/knowledge', icon: BookOpen },
    { name: 'Test Chat', path: '/admin/chat', icon: MessageSquare },
  ];

  const tenantNavItems = [
    { name: 'Overview', tab: 'overview', icon: LayoutDashboard },
    { name: 'Knowledge Base', tab: 'knowledge', icon: BookOpen },
    { name: 'Widget Integration', tab: 'widget', icon: Code2 },
    { name: 'Test Chatbot', tab: 'chat', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {isTenantPortal ? (
          <>
            {/* Tenant / Client Sidebar Header */}
            <div className="p-6 flex items-center gap-3 text-white font-semibold text-lg border-b border-slate-800 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wide">Tenant Portal</span>
                <span className="text-[10px] text-slate-400 font-normal">Client Dashboard</span>
              </div>
            </div>

            <nav className="p-4 space-y-1.5 flex-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase px-3 py-2 tracking-wider">
                Workspace Navigation
              </div>
              {tenantNavItems.map((item) => {
                const isActive =
                  location.pathname === '/client/dashboard' &&
                  (currentTab === item.tab || (item.tab === 'overview' && !searchParams.get('tab')));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.tab}
                    to={`/client/dashboard?tab=${item.tab}`}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </>
        ) : (
          <>
            {/* Admin Sidebar Header */}
            <div className="p-6 flex items-center gap-3 text-white font-semibold text-lg border-b border-slate-800 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wide">AI SaaS Admin</span>
                <span className="text-[10px] text-slate-400 font-normal">Platform Control</span>
              </div>
            </div>

            <nav className="p-4 space-y-1.5 flex-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase px-3 py-2 tracking-wider">
                Platform Admin
              </div>
              {adminNavItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/admin/companies' && location.pathname === '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Bottom Footer: Sign Out Button Pinned at Bottom */}
      <div className="p-4 border-t border-slate-800/80 space-y-2.5 bg-slate-900 shrink-0">
        {user && (
          <div className="px-3 py-2 bg-slate-800/60 rounded-xl text-xs border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-medium uppercase tracking-wider">Logged in as</span>
            <span className="font-semibold text-slate-200 truncate block mt-0.5">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-xl transition border border-slate-700/50 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

