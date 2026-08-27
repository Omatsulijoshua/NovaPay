import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Custom pulsing spinner */}
          <div className="relative flex items-center justify-center">
            <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></div>
            <div className="relative rounded-full h-8 w-8 bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
          </div>
          <span className="text-slate-500 text-sm font-semibold animate-pulse">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
