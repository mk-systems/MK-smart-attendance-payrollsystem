import React from 'react';
import { MobileTab, ViewMode } from '../types';

interface BottomNavProps {
  currentTab: MobileTab;
  currentMode: ViewMode;
  onSelectTab: (tab: MobileTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  currentMode,
  onSelectTab,
}) => {
  return (
    <nav
      aria-label="แถบการนำทางหลัก"
      className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-1.5 h-16 bg-white/95 backdrop-blur-xl shadow-2xl shadow-pink-200 border-t border-rose-200 pb-safe"
    >
      {/* Punch Tab */}
      <button
        onClick={() => onSelectTab('punch')}
        className={`flex flex-col items-center justify-center w-16 transition-all active:scale-95 ${
          currentTab === 'punch' && currentMode === 'employee'
            ? 'text-rose-600 font-extrabold'
            : 'text-slate-500 hover:text-rose-500'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">timer</span>
        <span className="text-[11px] font-bold mt-0.5">Punch</span>
      </button>

      {/* History Tab */}
      <button
        onClick={() => onSelectTab('history')}
        className={`flex flex-col items-center justify-center w-16 transition-all active:scale-95 ${
          currentTab === 'history' && currentMode === 'employee'
            ? 'text-rose-600 font-extrabold'
            : 'text-slate-500 hover:text-rose-500'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">history</span>
        <span className="text-[11px] font-bold mt-0.5">History</span>
      </button>

      {/* Payroll Tab */}
      <button
        onClick={() => onSelectTab('payroll')}
        className={`flex flex-col items-center justify-center w-16 transition-all active:scale-95 ${
          currentTab === 'payroll'
            ? 'text-rose-600 font-extrabold'
            : 'text-slate-500 hover:text-rose-500'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">receipt_long</span>
        <span className="text-[11px] font-bold mt-0.5">Payroll</span>
      </button>

      {/* Profile / Team Tab */}
      <button
        onClick={() => onSelectTab('team')}
        className={`flex flex-col items-center justify-center w-16 transition-all active:scale-95 ${
          currentTab === 'team' || currentMode === 'profile' || currentMode === 'admin'
            ? 'text-rose-600 font-extrabold'
            : 'text-slate-500 hover:text-rose-500'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">
          {currentMode === 'profile' ? 'person' : 'group'}
        </span>
        <span className="text-[11px] font-bold mt-0.5">
          {currentMode === 'profile' ? 'Profile' : 'Team'}
        </span>
      </button>
    </nav>
  );
};
