'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastFn: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export function toast(message: string, type: ToastType = 'info', duration = 4000) {
  toastFn?.(message, type, duration);
}

toast.success = (msg: string) => toast(msg, 'success');
toast.error = (msg: string) => toast(msg, 'error');
toast.warning = (msg: string) => toast(msg, 'warning');
toast.info = (msg: string) => toast(msg, 'info');

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  error: 'border-l-red-500 bg-red-50 dark:bg-red-950/30',
  info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
  warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    toastFn = addToast;
    return () => { toastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg backdrop-blur-sm
            border border-border transition-all duration-300 animate-in slide-in-from-right-full
            ${bgColors[t.type]}`}
        >
          <span className="flex-shrink-0 mt-0.5">{icons[t.type]}</span>
          <p className="text-sm font-medium text-foreground flex-1">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((i) => i.id !== t.id))}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
