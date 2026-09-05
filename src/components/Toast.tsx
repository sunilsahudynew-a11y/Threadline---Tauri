import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      showToast: (message: string) => {
        console.log('[Toast]', message);
      }
    };
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration = 3000) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container floating at bottom right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-lg text-xs transition-all animate-in slide-in-from-bottom-2 fade-in duration-150 ${
              toast.type === 'success'
                ? 'bg-[#1C2826] text-[#E8F1EE] border-[#2D3E3A]'
                : toast.type === 'warning'
                ? 'bg-[#2A231C] text-[#F9EFE5] border-[#4A3B2C]'
                : toast.type === 'error'
                ? 'bg-[#2B1B1B] text-[#FDE8E8] border-[#4E2A2A]'
                : 'bg-[#242426] text-[#F0EFF4] border-[#3C3B42]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle size={15} className="text-amber-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={15} className="text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info size={15} className="text-sky-400 shrink-0" />}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 hover:opacity-75 cursor-pointer opacity-50 shrink-0 ml-1"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
