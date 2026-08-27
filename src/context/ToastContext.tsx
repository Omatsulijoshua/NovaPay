import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Toast Notification Area */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs space-y-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-xl shadow-xl text-[11px] font-bold text-white text-center transition-all duration-300 pointer-events-auto border flex items-center justify-center ${
              t.type === 'success'
                ? 'bg-emerald-600 border-emerald-500 shadow-emerald-600/10'
                : t.type === 'error'
                ? 'bg-rose-600 border-rose-500 shadow-rose-600/10'
                : 'bg-slate-800 border-slate-700 shadow-slate-900/10'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
