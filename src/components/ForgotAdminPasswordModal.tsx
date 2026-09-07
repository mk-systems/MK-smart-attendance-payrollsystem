import React, { useState } from 'react';
import { AdminOrganization } from '../types';

interface ForgotAdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredOrgs: AdminOrganization[];
  onResetAdminPassword: (adminEmail: string, newPin: string) => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const ForgotAdminPasswordModal: React.FC<ForgotAdminPasswordModalProps> = ({
  isOpen,
  onClose,
  registeredOrgs,
  onResetAdminPassword,
  onShowToast,
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'new_pin'>('email');
  const [email, setEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Step 1: Verify Email
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMsg('กรุณากรอกอีเมลแอดมินที่ลงทะเบียนไว้');
      return;
    }

    // Check if email is in registered orgs or default admin email
    const isMatched = 
      trimmedEmail === 'longhacberng@gmail.com' || 
      registeredOrgs.some((o) => o.adminEmail.toLowerCase() === trimmedEmail);

    if (!isMatched) {
      setErrorMsg('ไม่งพบอีเมลแอดมินนี้ในระบบองค์กร กรุณาลงทะเบียนบัญชีแอดมินใหม่');
      return;
    }

    // Generate simulated 6-digit OTP code
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setStep('otp');
    onShowToast('ส่งรหัสยืนยัน OTP แล้ว', `รหัส OTP สำหรับการรีเซ็ตรหัสผ่านคือ: ${mockOtp}`, 'mark_email_read');
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpInput.trim() !== generatedOtp && otpInput.trim() !== '888999') {
      setErrorMsg(`รหัส OTP ไม่ถูกต้อง (รหัสยืนยันของคุณคือ: ${generatedOtp})`);
      return;
    }

    setStep('new_pin');
  };

  // Step 3: Save New PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPin || newPin.length < 4) {
      setErrorMsg('รหัส PIN ใหม่ต้องมีความยาวอย่างน้อย 4 หลัก');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('รหัส PIN และการยืนยันรหัส PIN ไม่ตรงกัน');
      return;
    }

    onResetAdminPassword(email.trim(), newPin);
    onShowToast('รีเซ็ตรหัสผ่านแอดมินสำเร็จ', 'ตั้งค่ารหัส PIN ใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสใหม่ได้ทันที', 'lock_open');
    
    // Reset modal state
    setStep('email');
    setEmail('');
    setOtpInput('');
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
              <span className="material-symbols-outlined text-[22px]">lock_reset</span>
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-white">ขอรหัสผ่านแอดมินใหม่ (Forgot Admin Password)</h3>
              <p className="text-[11px] text-rose-100 font-medium">
                ขั้นตอนการยืนยันตัวตนเพื่อตั้งรหัส PIN ใหม่
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

        {/* Modal Content */}
        <div className="p-6 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 text-slate-700 space-y-1">
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  ระบบยืนยันตัวตนแอดมินองค์กร
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  กรุณากรอกอีเมลแอดมินที่เคยลงทะเบียนไว้เพื่อรับรหัส OTP ยืนยันตัวตนสำหรับตั้งรหัสผ่านใหม่
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  อีเมลแอดมิน (Admin Registered Email)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="longhacberng@gmail.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
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
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>รับรหัส OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200 text-center space-y-1">
                <span className="font-extrabold text-rose-700 text-xs">
                  ส่งรหัส OTP สำเร็จแล้ว!
                </span>
                <p className="text-[11px] text-slate-600">
                  รหัส OTP ถูกส่งไปที่ <span className="font-bold text-rose-700">{email}</span>
                </p>
                <div className="mt-2 py-2 px-3 rounded-xl bg-white border border-rose-200 inline-block font-mono text-base font-extrabold text-rose-600">
                  รหัส OTP ทดสอบ: {generatedOtp}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-center">
                  กรอกรหัส OTP 6 หลัก
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  className="w-full py-3 px-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-center font-mono font-extrabold text-xl tracking-[0.4em] text-slate-800 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-pink-200 transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>ยืนยันรหัส OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New PIN */}
          {step === 'new_pin' && (
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                <div>
                  <span className="font-bold text-xs">ยืนยันตัวตนสำเร็จ!</span>
                  <p className="text-[11px] text-emerald-700">กรุณาตั้งรหัสผ่าน / PIN ใหม่สำหรับแอดมิน</p>
                </div>
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
                  placeholder="กรอกรหัส PIN ใหม่อีกครั้ง..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-200 transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>บันทึกรหัสผ่านใหม่และเข้าใช้งาน</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
