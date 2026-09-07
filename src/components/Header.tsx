import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentMode: ViewMode;
  onSwitchMode: (mode: ViewMode) => void;
  onOpenProfileDrawer: () => void;
  onOpenGoogleWorkspaceModal: () => void;
  isSheetsConnected: boolean;
  currentUser: {
    name: string;
    devCode?: string;
    empId?: string;
    avatar: string;
  };
  isAdminAuthenticated: boolean;
  onRequestAdminAuth: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSwitchMode,
  onOpenProfileDrawer,
  onOpenGoogleWorkspaceModal,
  isSheetsConnected,
  currentUser,
  isAdminAuthenticated,
  onRequestAdminAuth,
  onLogout,
}) => {
  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      onSwitchMode('admin');
    } else {
      onRequestAdminAuth();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-200 shadow-sm shadow-pink-100/50 w-full">
      <div className="flex justify-between items-center w-full px-4 md:px-8 h-16 max-w-7xl mx-auto">
        {/* Brand & Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onSwitchMode('employee')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-200 border border-white/40">
            <span className="material-symbols-outlined text-[24px]">timer</span>
          </div>
          <div className="hidden min-[400px]:block">
            <div className="text-[14px] sm:text-[16px] font-extrabold text-slate-800 tracking-tight flex items-center gap-1">
              Smart Attendance
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-rose-700 border border-pink-300">
                v2.5 Cute
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight flex items-center gap-1 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Firebase & Drive Synced
            </p>
          </div>
        </div>

        {/* Right Nav & Mode Switcher */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Google Sheets API Status */}
          <button
            onClick={onOpenGoogleWorkspaceModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[12px] font-mono hover:bg-rose-100 transition-colors"
            title="จัดการการเชื่อมต่อ Google Sheets & Drive"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSheetsConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isSheetsConnected ? 'cloud_done' : 'cloud_off'}
            </span>
            <span>{isSheetsConnected ? 'Sheets: Synced' : 'Connect Workspace'}</span>
          </button>

          {/* Mode Switcher Segmented Control */}
          <div className="bg-rose-50/80 p-1 rounded-2xl flex items-center border border-rose-200 shadow-inner">
            <button
              onClick={() => onSwitchMode('employee')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center gap-1 ${
                currentMode === 'employee'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span className="hidden sm:inline">พนักงาน</span>
            </button>

            <button
              onClick={handleAdminClick}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 ${
                currentMode === 'admin'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
              title={isAdminAuthenticated ? 'เข้าสู่โหมดผู้ดูแลระบบ' : 'ต้องใส่ PIN แอดมิน'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAdminAuthenticated ? 'admin_panel_settings' : 'lock'}
              </span>
              <span className="hidden sm:inline">Admin Mode</span>
            </button>

            <button
              onClick={() => onSwitchMode('profile')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center gap-1 ${
                currentMode === 'profile'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span className="hidden sm:inline">โปรไฟล์</span>
            </button>
          </div>

          {/* Quick Avatar Profile & Logout */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenProfileDrawer}
              className="flex items-center gap-2 p-1 pl-2.5 pr-1 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
              title="เปิดเมนูโปรไฟล์"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-slate-800 leading-tight">{currentUser.name.replace('นาย', '').replace('นางสาว', '')}</div>
                <div className="text-[10px] font-mono font-semibold text-rose-600">{currentUser.empId || currentUser.devCode}</div>
              </div>
              <img
                src={currentUser.avatar}
                alt="Profile Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-rose-300 shadow-xs"
              />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 border border-pink-300 transition-colors flex items-center justify-center"
                title="สลับบัญชีผู้ใช้ / ล็อกอินใหม่"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
