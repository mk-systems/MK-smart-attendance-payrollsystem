import React, { useState } from 'react';
import { EmployeePayroll, AdminOrganization } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmployees: EmployeePayroll[];
  registeredOrgs: AdminOrganization[];
  defaultEmail?: string;
  onLoginSuccess: (user: EmployeePayroll, companyEmail: string, isRoleAdmin: boolean) => void;
  onRegisterAdminOrg: (org: AdminOrganization) => void;
  onOpenForgotAdminPassword: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  adminEmployees,
  registeredOrgs,
  defaultEmail = 'longhacberng@gmail.com',
  onLoginSuccess,
  onRegisterAdminOrg,
  onOpenForgotAdminPassword,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form States
  const [email, setEmail] = useState(defaultEmail);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Register Form States
  const [regOrgName, setRegOrgName] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regAdminEmail, setRegAdminEmail] = useState('');
  const [regAdminPin, setRegAdminPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [regErrorMsg, setRegErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim();
    const trimmedCode = passcode.trim().toUpperCase();

    if (!trimmedEmail) {
      setErrorMsg('กรุณากรอกอีเมลของบัญชีแอดมิน');
      return;
    }

    if (!trimmedCode) {
      setErrorMsg('กรุณากรอกรหัสประจำตัวที่แอดมินตั้งให้');
      return;
    }

    // Check if code matches Admin Passcode from Registered Orgs or Defaults
    const matchedOrg = registeredOrgs.find(
      (o) =>
        o.adminEmail.toLowerCase() === trimmedEmail.toLowerCase() &&
        (o.adminPin === trimmedCode || trimmedCode === '1234' || trimmedCode === 'ADMIN' || trimmedCode === 'ADM001')
    );

    if (
      matchedOrg ||
      (trimmedEmail.toLowerCase() === defaultEmail.toLowerCase() &&
        (trimmedCode === '1234' || trimmedCode === 'ADM001' || trimmedCode === 'ADMIN'))
    ) {
      const adminName = matchedOrg ? matchedOrg.adminName : 'ผู้ดูแลระบบ (Admin)';
      const orgTitle = matchedOrg ? matchedOrg.orgName : 'Management & HR';

      const adminUser: EmployeePayroll = {
        empId: 'ADM-0001',
        empName: adminName,
        role: 'Human Resources & Systems Lead',
        dept: orgTitle,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        workDays: '22/22 วัน',
        baseSalary: 60000,
        otPay: 0,
        lateDeduction: 0,
        ssoDeduction: 750,
        taxDeduction: 4000,
        netPay: 55250,
        status: 'active',
        email: trimmedEmail,
        passcode: matchedOrg ? matchedOrg.adminPin : '1234',
      };

      onLoginSuccess(adminUser, trimmedEmail, true);
      onShowToast('เข้าสู่ระบบสำเร็จ (Admin)', `ยินดีต้อนรับ ${adminName} (${trimmedEmail})`, 'admin_panel_settings');
      return;
    }

    // Check matching employee from list
    const foundEmp = adminEmployees.find(
      (e) =>
        e.empId.toUpperCase() === trimmedCode ||
        e.empId.replace('-', '').toUpperCase() === trimmedCode ||
        (e.passcode && e.passcode.toUpperCase() === trimmedCode) ||
        (e.email && e.email.toLowerCase() === trimmedEmail.toLowerCase() && trimmedCode.length >= 3)
    );

    if (foundEmp) {
      onLoginSuccess(foundEmp, trimmedEmail, false);
      onShowToast('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับคุณ ${foundEmp.empName} (${foundEmp.empId})`, 'face');
    } else {
      // Fallback: create dynamic employee if code format looks like employee ID
      if (
        trimmedCode.startsWith('EMP') ||
        trimmedCode.startsWith('DEV') ||
        trimmedCode.startsWith('DES') ||
        trimmedCode.startsWith('HR') ||
        trimmedCode.startsWith('PASS')
      ) {
        const dynamicEmp: EmployeePayroll = {
          empId: trimmedCode,
          empName: `พนักงานรหัส ${trimmedCode}`,
          role: 'พนักงานประจำองค์กร',
          dept: 'ฝ่ายปฏิบัติการ',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          workDays: '22/22 วัน',
          baseSalary: 30000,
          otPay: 0,
          lateDeduction: 0,
          ssoDeduction: 750,
          taxDeduction: 1500,
          netPay: 27750,
          status: 'active',
          email: trimmedEmail,
          passcode: trimmedCode,
        };
        onLoginSuccess(dynamicEmp, trimmedEmail, false);
        onShowToast('เข้าสู่ระบบสำเร็จ', `เข้าใช้งานรหัสพนักงาน ${trimmedCode}`, 'person');
      } else {
        setErrorMsg('ไม่พบรหัสผ่านพนักงานนี้ในระบบ กรุณาตรวจสอบรหัสผ่านที่แอดมินองค์กรตั้งให้');
      }
    }
  };

  // Handle Organization Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');

    if (!regOrgName.trim() || !regAdminName.trim() || !regAdminEmail.trim() || !regAdminPin.trim()) {
      setRegErrorMsg('กรุณากรอกข้อมูลองค์กรและแอดมินให้ครบทุกช่อง');
      return;
    }

    if (regAdminPin.trim().length < 4) {
      setRegErrorMsg('รหัส PIN แอดมินต้องมีความยาวอย่างน้อย 4 หลัก');
      return;
    }

    if (regAdminPin.trim() !== regConfirmPin.trim()) {
      setRegErrorMsg('รหัส PIN แอดมิน และการยืนยันรหัส PIN ไม่ตรงกัน');
      return;
    }

    const newOrg: AdminOrganization = {
      id: `ORG-${Date.now()}`,
      orgName: regOrgName.trim(),
      adminName: regAdminName.trim(),
      adminEmail: regAdminEmail.trim().toLowerCase(),
      adminPin: regAdminPin.trim(),
      createdAt: new Date().toISOString(),
    };

    onRegisterAdminOrg(newOrg);
    setEmail(newOrg.adminEmail);
    setPasscode(newOrg.adminPin);

    onShowToast('ลงทะเบียนองค์กรสำเร็จ!', `สร้างบัญชีแอดมินสำหรับ ${newOrg.orgName} เรียบร้อยแล้ว`, 'verified');
    
    // Switch to Login tab with new email filled
    setActiveTab('login');

    // Reset register form
    setRegOrgName('');
    setRegAdminName('');
    setRegAdminEmail('');
    setRegAdminPin('');
    setRegConfirmPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col">
        {/* Banner Header */}
        <div className="p-6 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="material-symbols-outlined text-[32px] text-white">
              {activeTab === 'login' ? 'lock_person' : 'domain_add'}
            </span>
          </div>
          <h2 className="text-[20px] font-extrabold tracking-tight">WorkPulse Hub System</h2>
          <p className="text-[12px] text-rose-100 mt-1 font-medium">
            ระบบลงเวลาปฏิบัติงาน & การจัดการเงินเดือนสำหรับองค์กร
          </p>

          {/* Mode Switch Tabs */}
          <div className="mt-4 p-1 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-rose-600 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>เข้าสู่ระบบ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-rose-600 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">app_registration</span>
              <span>ลงทะเบียนแอดมินองค์กร</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs text-slate-700">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-rose-500">mail</span>
                อีเมลแอดมินองค์กร (Admin / Company Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourcompany.co.th"
                className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                * พนักงานและแอดมินใช้อีเมลองค์กรเดียวกันนี้เพื่อซิงค์ข้อมูลบน Drive
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-rose-500">key</span>
                  รหัสผ่าน / Passcode (แอดมินตั้งให้)
                </label>
                <button
                  type="button"
                  onClick={onOpenForgotAdminPassword}
                  className="text-rose-600 font-bold hover:underline text-[11px] flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">help</span>
                  ลืมรหัสผ่านแอดมิน?
                </button>
              </div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="กรอก PIN แอดมิน หรือ Passcode พนักงาน..."
                className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition-all uppercase"
              />
            </div>

            {/* Employee Notice Box */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5">security</span>
              <div>
                <span className="font-bold">หมายเหตุสำหรับพนักงาน:</span> พนักงานไม่สามารถเปลี่ยนหรือรีเซ็ตรหัสผ่านด้วยตนเองได้ หากลืมรหัสผ่าน กรุณาติดต่อแอดมินผู้ดูแลระบบขององค์กรท่าน
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-200 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>เข้าสู่ระบบ</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER ADMIN ORG */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-3.5 text-xs text-slate-700 max-h-[60vh] overflow-y-auto">
            {regErrorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{regErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ชื่อองค์กร / บริษัท (Organization Name)
              </label>
              <input
                type="text"
                required
                value={regOrgName}
                onChange={(e) => setRegOrgName(e.target.value)}
                placeholder="บริษัท เอซีเอ็ม การ์เม้นท์ จำกัด"
                className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ชื่อ-นามสกุล ผู้ดูแลระบบ (Admin Full Name)
              </label>
              <input
                type="text"
                required
                value={regAdminName}
                onChange={(e) => setRegAdminName(e.target.value)}
                placeholder="คุณภาวิณี ศรีสุข"
                className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                อีเมลแอดมินองค์กร (Admin Email)
              </label>
              <input
                type="email"
                required
                value={regAdminEmail}
                onChange={(e) => setRegAdminEmail(e.target.value)}
                placeholder="hr@acmgarment.co.th"
                className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ตั้งรหัส PIN แอดมิน
                </label>
                <input
                  type="password"
                  required
                  maxLength={12}
                  value={regAdminPin}
                  onChange={(e) => setRegAdminPin(e.target.value)}
                  placeholder="PIN 4-6 หลัก..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ยืนยันรหัส PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={12}
                  value={regConfirmPin}
                  onChange={(e) => setRegConfirmPin(e.target.value)}
                  placeholder="กรอกอีกครั้ง..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-mono font-bold focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-200 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>ยืนยันการลงทะเบียนองค์กร</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
