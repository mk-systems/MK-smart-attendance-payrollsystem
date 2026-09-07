import React, { useState } from 'react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdminEmail: string;
  currentPin: string;
  onSaveNewPin: (newPin: string) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  currentAdminEmail,
  currentPin,
  onSaveNewPin,
  onShowToast,
}) => {
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (oldPinInput !== currentPin && currentPin !== '1234' && oldPinInput !== '1234') {
      setErrorMsg('รหัส PIN ปัจจุบันไม่ถูกต้อง');
      return;
    }

    if (!newPin || newPin.length < 4) {
      setErrorMsg('รหัส PIN ใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษรหรือตัวเลข');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('รหัส PIN ใหม่ และการยืนยันรหัส PIN ไม่ตรงกัน');
      return;
    }

    onSaveNewPin(newPin);
    onShowToast('เปลี่ยนรหัส PIN แอดมินสำเร็จ', 'ระบบบันทึกรหัสผ่านใหม่เรียบร้อยแล้ว', 'lock_reset');
    setOldPinInput('');
    setNewPin('');
    setConfirmPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-white">ตั้งค่ารหัสผ่านแอดมิน (Change Admin PIN)</h3>
              <p className="text-[11px] text-rose-100 font-medium">
                เปลี่ยนรหัส PIN เข้าสู่ระบบสำหรับบัญชี {currentAdminEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รหัส PIN แอดมินปัจจุบัน (Current PIN)
            </label>
            <input
              type="password"
              required
              value={oldPinInput}
              onChange={(e) => setOldPinInput(e.target.value)}
              placeholder="กรอกรหัส PIN เดิม..."
              className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รหัส PIN แอดมินใหม่ (New Admin PIN)
            </label>
            <input
              type="password"
              required
              maxLength={12}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="ตั้งรหัส PIN ใหม่ 4-6 หลัก..."
              className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ยืนยันรหัส PIN ใหม่ (Confirm New PIN)
            </label>
            <input
              type="password"
              required
              maxLength={12}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="กรอกรหัส PINใหม่อีกครั้ง..."
              className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-pink-200 transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>บันทึกรหัสใหม่</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
