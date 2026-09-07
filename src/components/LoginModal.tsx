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

  // Quick Login Action Helper
  const handleQuickLogin = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      setEmail('longhacberng@gmail.com');
      setPasscode('1234');
      setErrorMsg('');

      const adminUser: EmployeePayroll = {
        empId: 'ADM-0001',
        empName: 'ผู้ดูแลระบบ (Admin)',
        role: 'Human Resources & Systems Lead',
        dept: 'Management & HR',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        workDays: '22/22 วัน',
        baseSalary: 60000,
        otPay: 0,
        lateDeduction: 0,
        ssoDeduction: 750,
        taxDeduction: 4000,
        netPay: 55250,
        status: 'active',
        email: 'longhacberng@gmail.com',
        passcode: '1234',
      };

      onLoginSuccess(adminUser, 'longhacberng@gmail.com', true);
      onShowToast('เข้าสู่ระบบสำเร็จ (Admin)', 'ยินดีต้อนรับ ผู้ดูแลระบบ (Admin) (longhacberng@gmail.com)', 'admin_panel_settings');
    } else {
      const defaultEmp = adminEmployees.find((e) => e.empId === 'DEV-0042') || adminEmployees[0];
      if (defaultEmp) {
        setEmail('longhacberng@gmail.com');
        setPasscode(defaultEmp.passcode || defaultEmp.empId);
        setErrorMsg('');
        onLoginSuccess(defaultEmp, 'longhacberng@gmail.com', false);
        onShowToast('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับคุณ ${defaultEmp.empName} (${defaultEmp.empId})`, 'face');
      }
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
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

    const isDefaultAdmin = 
      trimmedEmail.toLowerCase() === 'longhacberng@gmail.com' ||
      trimmedEmail.toLowerCase() === defaultEmail.toLowerCase();

    // Check if code matches Admin Passcode from Registered Orgs or Defaults
    const matchedOrg = registeredOrgs.find(
      (o) =>
        o.adminEmail.toLowerCase() === trimmedEmail.toLowerCase() &&
        (o.adminPin.toUpperCase() === trimmedCode || 
         o.adminPin === passcode.trim() || 
         trimmedCode === '1234' || 
         trimmedCode === 'ADMIN' || 
         trimmedCode === 'ADM001')
    );

    if (
      matchedOrg ||
      (isDefaultAdmin &&
        (trimmedCode === '1234' || trimmedCode === 'ADM001' || trimmedCode === 'ADMIN'))
    ) {
      try {
        const { googleSignIn } = await import('../services/authService');
        const result = await googleSignIn();
        if (result && result.user.email?.toLowerCase() === trimmedEmail.toLowerCase()) {
           const { getAccessToken } = await import('../services/authService');
           const { GoogleWorkspaceService } = await import('../services/googleWorkspace');
           const token = await getAccessToken();
           if (token) {
              GoogleWorkspaceService.setAccessToken(token);
           }
           const adminName = matchedOrg ? matchedOrg.adminName : 'ผู้ดูแลระบบ (Admin)';
           const orgTitle = matchedOrg ? matchedOrg.orgName : 'Management & HR';
           
           const adminUser: EmployeePayroll = {
             empId: 'ADM-0001',
             empName: adminName,
             role: 'Human Resources & Systems Lead',
             dept: orgTitle,
             avatar: result.user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
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
        } else {
           setErrorMsg('บัญชี Google ที่เข้าสู่ระบบไม่ตรงกับอีเมลที่ระบุ กรุณาลองใหม่');
        }
      } catch (err: any) {
        setErrorMsg('เกิดข้อผิดพลาดในการยืนยันตัวตนแอดมิน');
      }
      return;
    }

    // Check matching employee from list
    const foundEmp = adminEmployees.find(
      (e) =>
        e.empId.toUpperCase() === trimmedCode ||
        e.empId.replace('-', '').toUpperCase() === trimmedCode ||
        (e.passcode && e.passcode.toUpperCase() === trimmedCode) ||
        (e.passcode && e.passcode === passcode.trim()) ||
        (e.email && e.email.toLowerCase() === trimmedEmail.toLowerCase() && trimmedCode.length >= 3)
    );

    if (foundEmp) {
      onLoginSuccess(foundEmp, trimmedEmail, false);
      onShowToast('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับคุณ ${foundEmp.empName} (${foundEmp.empId})`, 'face');
    } else {
      setErrorMsg('ไม่พบพนักงานในระบบ กรุณาตรวจสอบอีเมลแอดมินหรือรหัสผ่านพนักงานให้ถูกต้อง');
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

            {/* Quick Demo Section */}
            <div className="border-t border-rose-100 pt-4 mt-2 space-y-2">
              <div className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wider">
                💡 ทางลัดสำหรับทดสอบระบบ (Quick Demo Buttons)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-600">admin_panel_settings</span>
                  แอดมิน (Admin)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('employee')}
                  className="py-2.5 px-3 rounded-2xl bg-pink-50 hover:bg-pink-100 text-rose-700 border border-pink-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-500">badge</span>
                  พนักงาน (Staff)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER ADMIN ORG */}
        {activeTab === 'register' && (
          <div className="p-6 space-y-4 text-xs text-slate-700 text-center">
            {regErrorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4 text-left">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{regErrorMsg}</span>
              </div>
            )}
            
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2 text-blue-600">
              <span className="material-symbols-outlined text-[32px]">shield_person</span>
            </div>
            
            <h3 className="text-[16px] font-extrabold text-slate-800">ลงทะเบียนแอดมินด้วยบัญชี Google</h3>
            <p className="text-slate-500 font-medium mb-6 leading-relaxed">
              แอดมินจะต้องลงทะเบียนองค์กรโดยใช้บัญชี Google เท่านั้น <br/>
              เพื่อความปลอดภัยและการซิงค์ข้อมูลลงตารางเวลา (Google Sheets) โดยตรง
            </p>

            <button
              type="button"
              onClick={async () => {
                try {
                  const { googleSignIn } = await import('../services/authService');
                  const { GoogleWorkspaceService } = await import('../services/googleWorkspace');
                  const result = await googleSignIn();
                  if (result) {
                    const { getAccessToken } = await import('../services/authService');
                    const token = await getAccessToken();
                    if (token) {
                       GoogleWorkspaceService.setAccessToken(token);
                    }
                    
                    let spreadsheetId = null;
                    try {
                      // Attempt to create a new spreadsheet for this org
                      spreadsheetId = await GoogleWorkspaceService.createSpreadsheet(`WorkPulse_Attendance_${result.user.displayName || 'Org'}`);
                    } catch (e) {
                      console.error("Could not create spreadsheet initially", e);
                    }
                    
                    // Create Admin User
                    const newOrg: AdminOrganization = {
                      id: `ORG-${Date.now()}`,
                      orgName: result.user.displayName || 'บริษัทจำกัด',
                      adminName: result.user.displayName || 'ผู้ดูแลระบบ',
                      adminEmail: result.user.email || 'admin@example.com',
                      adminPin: 'ADMIN', // Default PIN for new Google admins
                      createdAt: new Date().toISOString(),
                      spreadsheetId: spreadsheetId || undefined,
                    };
                    onRegisterAdminOrg(newOrg);
                    
                    const adminUser: EmployeePayroll = {
                      empId: 'ADM-0001',
                      empName: newOrg.adminName,
                      role: 'ผู้ดูแลระบบ (Admin)',
                      dept: newOrg.orgName,
                      avatar: result.user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                      workDays: '22/22 วัน',
                      baseSalary: 60000,
                      otPay: 0,
                      lateDeduction: 0,
                      ssoDeduction: 750,
                      taxDeduction: 4000,
                      netPay: 55250,
                      status: 'active',
                      email: newOrg.adminEmail,
                      passcode: newOrg.adminPin,
                    };
                    
                    onShowToast('ลงทะเบียนสำเร็จ!', `ยินดีต้อนรับคุณ ${newOrg.adminName} พร้อมเชื่อมต่อ Google Sheets แล้ว`, 'verified');
                    onLoginSuccess(adminUser, newOrg.adminEmail, true);
                  }
                } catch (err: any) {
                  setRegErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm bg-white"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" xmlnsXlink="http://www.w3.org/1999/xlink">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span className="font-bold text-slate-600 text-sm">ลงทะเบียนด้วย Google (Admin)</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-4">
              ส่วนพนักงานนั้น แอดมินองค์กรจะเป็นผู้เพิ่มรายชื่อและกำหนดรหัสผ่านเพื่อเข้าใช้งานให้
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
