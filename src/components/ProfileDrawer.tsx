import React from 'react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onOpenFullProfile: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenFullProfile,
  onShowToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-slate-900 shadow-2xl p-6 flex flex-col justify-between z-10 animate-slideInRight border-l border-slate-800">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h4 className="text-[16px] font-bold text-white">ข้อมูลโปรไฟล์พนักงาน</h4>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User Hero */}
          <div className="text-center my-6">
            <img
              src={currentUser.avatar}
              alt="Profile"
              className="w-20 h-20 rounded-2xl mx-auto object-cover ring-2 ring-indigo-500/40 shadow-xl"
            />
            <h3 className="text-[18px] font-bold text-white mt-3">{currentUser.name}</h3>
            <p className="text-[12px] text-indigo-400 font-semibold font-mono mt-0.5">
              {currentUser.devCode} • {currentUser.role}
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              Tech & Innovation Division
            </span>
          </div>

          {/* Info List */}
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">อีเมลองค์กร</span>
              <span className="font-mono text-slate-200">{currentUser.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">วันเริ่มงาน</span>
              <span className="font-mono text-slate-200">{currentUser.joinDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">สิทธิ์ลาพักร้อนคงเหลือ</span>
              <span className="font-semibold text-emerald-400">{currentUser.leaveQuota} วัน</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">สิทธิ์ลาป่วยคงเหลือ</span>
              <span className="font-semibold text-slate-200">{currentUser.leaveSickQuota} วัน</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenFullProfile();
            }}
            className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <span className="material-symbols-outlined text-[18px]">account_box</span>
            ดูโปรไฟล์เต็ม (Full Profile Page)
          </button>

          <button
            onClick={() => {
              onClose();
              onShowToast('ออกจากระบบ', 'ยุติตามมาตรฐานการลงเวลา WorkPulse System Security', 'logout');
            }}
            className="w-full py-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 font-semibold text-[13px] flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            ออกจากระบบ (Sign Out)
          </button>
        </div>
      </div>
    </div>
  );
};
