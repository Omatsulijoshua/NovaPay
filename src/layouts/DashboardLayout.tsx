import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Send, History, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Send', path: '/send', icon: Send },
    { name: 'History', path: '/transactions', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Container wrapper for mobile-first centered layout */}
      <div className="w-full max-w-md mx-auto bg-white min-h-screen shadow-2xl flex flex-col pb-16 relative border-x border-slate-200">
        
        {/* Top Header */}
        <header className="bg-emerald-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm no-print">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <span className="font-bold text-lg tracking-wider text-emerald-100">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight">NovaPay</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-1.5 hover:bg-emerald-700 rounded-full transition-colors text-emerald-100 hover:text-white"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 bg-slate-50 overflow-y-auto">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 z-20 shadow-lg max-w-md mx-auto no-print">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
                    isActive 
                      ? 'text-emerald-600 bg-emerald-50 font-semibold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px]">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
