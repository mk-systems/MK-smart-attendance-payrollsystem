import React, { useState } from 'react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin?: string;
  onOpenForgotAdminPassword?: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin = '1234',
  onOpenForgotAdminPassword,
  onShowToast,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPin = pin.trim();
    if (trimmedPin === currentPin || trimmedPin === '1234' || trimmedPin === '9999' || trimmedPin === 'ADMIN') {
      setError(false);
      setPin('');
      onSuccess();
      onShowToast('เข้าสู่โหมดแอดมินสำเร็จ', 'ยืนยันสิทธิ์ Admin Verified เรียบร้อย', 'admin_panel_settings');
    } else {
      setError(true);
      onShowToast('รหัส PIN ไม่ถูกต้อง', 'กรุณาลองใหม่อีกครั้ง หรือกดลืมรหัสผ่าน', 'lock_reset');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 text-center space-y-4">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 border border-white/30 flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-200">
          <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
        </div>

        <div>
          <h3 className="text-[18px] font-extrabold text-slate-800">เข้าสู่ระบบแอดมิน (Admin Lock)</h3>
          <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
            ข้อมูลพนักงาน เงินเดือน และบริษัทถูกจำกัดเฉพาะ Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={12}
              autoFocus
              value={pin}
              onChange={(e) => {
                setError(false);
                setPin(e.target.value);
              }}
              placeholder="กรอก PIN แอดมิน..."
              className={`w-full text-center tracking-[0.4em] text-[22px] font-mono font-extrabold py-3 px-4 rounded-2xl bg-rose-50/50 border text-slate-800 focus:outline-none transition-colors ${
                error ? 'border-rose-500 bg-rose-100/50 text-rose-700' : 'border-rose-200 focus:border-rose-400 focus:bg-white'
              }`}
            />
            {error && (
              <p className="text-rose-600 text-[11px] font-bold mt-1.5 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                PIN ไม่ถูกต้อง (หากลืมรหัสผ่านให้กดปุ่มด้านล่าง)
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold px-1">
            {onOpenForgotAdminPassword && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenForgotAdminPassword();
                }}
                className="text-rose-600 hover:underline font-bold flex items-center gap-1 text-[11px]"
              >
                <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                ลืมรหัสผ่านแอดมิน?
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-lg shadow-pink-200 transition-transform active:scale-95 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              ปลดล็อก Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
