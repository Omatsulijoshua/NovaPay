import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-6 sm:p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-md mb-3">
            <span className="font-bold text-3xl text-white tracking-widest">N</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">NovaPay</h1>
          <p className="text-sm text-slate-500 mt-1">Digital Wallet & Transfer Demo</p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
