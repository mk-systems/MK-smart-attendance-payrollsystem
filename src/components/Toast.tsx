import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 border border-slate-800 animate-slideDown">
      <span className="material-symbols-outlined text-emerald-400 text-[24px]">
        {toast.icon || 'check_circle'}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[14px] text-white">{toast.title}</div>
        <div className="text-[12px] text-slate-300 mt-0.5 leading-tight">{toast.message}</div>
      </div>
    </div>
  );
};
