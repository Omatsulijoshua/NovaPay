import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ArrowLeftRight, LogOut, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Transactions', path: '/admin/transactions', icon: ArrowLeftRight },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-700 flex flex-col shadow-2xl fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center space-x-3 px-6 py-6 border-b border-emerald-600">
          <div className="bg-white/20 p-2 rounded-xl">
            <span className="font-extrabold text-xl text-white">N</span>
          </div>
          <div>
            <span className="font-bold text-xl text-white tracking-tight">NovaPay</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-300" />
              <span className="text-emerald-300 text-xs font-medium">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-emerald-900 text-white shadow-inner'
                    : 'text-emerald-100 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-emerald-600">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-emerald-200 hover:bg-emerald-600 hover:text-white transition-all w-full text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <h1 className="text-slate-800 font-semibold text-lg">
            {navItems.find((n) =>
              n.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(n.path)
            )?.name ?? 'Admin'}
          </h1>
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 text-xs font-semibold">Administrator</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
