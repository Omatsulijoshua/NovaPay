import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-600 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-white opacity-30"></div>
            <div className="relative rounded-full h-10 w-10 bg-white flex items-center justify-center shadow-lg">
              <span className="text-emerald-600 text-sm font-bold">N</span>
            </div>
          </div>
          <span className="text-white text-sm font-medium animate-pulse">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
