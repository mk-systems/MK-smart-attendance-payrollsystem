import { useState, useEffect } from 'react';
import { ViewMode, MobileTab, AttendanceRecord, ToastMessage, WorkMode, PunchType, CompanyInfo, EmployeePayroll, AdminOrganization } from './types';
import { CURRENT_USER, INITIAL_ATTENDANCE_HISTORY, MOCK_ADMIN_EMPLOYEES, DEFAULT_COMPANY_INFO } from './data/mockData';
import { GoogleWorkspaceService } from './services/googleWorkspace';
import { FirebaseService } from './services/firebase';
import { initAuth, getAccessToken } from './services/authService';

import { Header } from './components/Header';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';
import { ProfilePage } from './components/ProfilePage';
import { PayslipModal } from './components/PayslipModal';
import { CompanyModal } from './components/CompanyModal';
import { EmployeeModal } from './components/EmployeeModal';
import { AdminPinModal } from './components/AdminPinModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { LoginModal } from './components/LoginModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { ForgotAdminPasswordModal } from './components/ForgotAdminPasswordModal';
import { Toast } from './components/Toast';
import { BottomNav } from './components/BottomNav';

export default function App() {
  // Navigation & View States
  const [currentMode, setCurrentMode] = useState<ViewMode>('employee');
  const [currentTab, setCurrentTab] = useState<MobileTab>('punch');

  // Login & Authentication State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(CURRENT_USER);
  const [companyAdminEmail, setCompanyAdminEmail] = useState<string>('longhacberng@gmail.com');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);

  // New Admin Security states
  const [registeredOrgs, setRegisteredOrgs] = useState<AdminOrganization[]>([]);
  const [isForgotAdminPasswordOpen, setIsForgotAdminPasswordOpen] = useState<boolean>(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState<boolean>(false);
  const [currentAdminPin, setCurrentAdminPin] = useState<string>('1234');

  // Modals & Drawers
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Data States
  const [historyList, setHistoryList] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_HISTORY);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [adminEmployees, setAdminEmployees] = useState<EmployeePayroll[]>(MOCK_ADMIN_EMPLOYEES);

  // Selection states for Modals
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<EmployeePayroll | null>(null);
  const [selectedEmployeeForPayslip, setSelectedEmployeeForPayslip] = useState<EmployeePayroll | null>(null);

  // Toast System
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Google Workspace Auth
  const [isSheetsConnected, setIsSheetsConnected] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsSheetsConnected(true);
      },
      () => {
        setIsSheetsConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load local auth session & Admin Org registrations if saved
  useEffect(() => {
    const savedUser = localStorage.getItem('sa_current_user');
    const savedEmail = localStorage.getItem('sa_admin_email');
    const savedPin = localStorage.getItem('sa_admin_pin');
    
    if (savedPin) {
      setCurrentAdminPin(savedPin);
    }

    if (savedUser && savedEmail) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setCompanyAdminEmail(savedEmail);
        setIsLoginModalOpen(false);
        if (parsed.empId === 'ADM-0001' || parsed.role.includes('Admin')) {
          setIsAdminAuthenticated(true);
        }
      } catch (e) {
        console.error('Failed to parse saved login user', e);
      }
    }

    const savedOrgs = localStorage.getItem('sa_registered_orgs');
    if (savedOrgs) {
      try {
        setRegisteredOrgs(JSON.parse(savedOrgs));
      } catch (e) {
        console.error('Failed to parse saved orgs', e);
      }
    }
  }, []);

  // Subscribe to Firebase Admin Orgs Realtime Updates
  useEffect(() => {
    const unsubscribeOrgs = FirebaseService.subscribeAdminOrgs((orgs) => {
      if (orgs && orgs.length > 0) {
        setRegisteredOrgs(orgs);
        localStorage.setItem('sa_registered_orgs', JSON.stringify(orgs));
        
        // Update active Admin PIN if matching email
        const activeOrg = orgs.find(o => o.adminEmail.toLowerCase() === companyAdminEmail.toLowerCase());
        if (activeOrg) {
          setCurrentAdminPin(activeOrg.adminPin);
        }
      }
    });

    return () => {
      if (unsubscribeOrgs) unsubscribeOrgs();
    };
  }, [companyAdminEmail]);

  // Subscribe to Firebase Firestore Attendance Realtime Updates
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeAttendance((records) => {
      if (records && records.length > 0) {
        setHistoryList((prev) => {
          const combined = [...records];
          prev.forEach((p) => {
            if (!combined.some((c) => c.id === p.id)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Subscribe to Firebase Firestore Employees Realtime Updates
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeEmployees((employees) => {
      if (employees && employees.length > 0) {
        setAdminEmployees((prev) => {
          const combined = [...employees];
          prev.forEach((p) => {
            if (!combined.some((c) => c.empId === p.empId)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showToast = (title: string, message: string, icon: string = 'check_circle') => {
    const id = Date.now().toString();
    setToast({ id, title, message, icon });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Login Success Handler
  const handleLoginSuccess = (user: EmployeePayroll, companyEmail: string, isRoleAdmin: boolean) => {
    const formattedUser = {
      name: user.empName,
      role: user.role,
      dept: user.dept,
      devCode: user.empId,
      empId: user.empId,
      avatar: user.avatar || CURRENT_USER.avatar,
      email: companyEmail,
      passcode: user.passcode || user.empId,
      registeredFaceUrl: user.registeredFaceUrl,
    };

    setCurrentUser(formattedUser);
    setCompanyAdminEmail(companyEmail);
    setIsLoginModalOpen(false);

    localStorage.setItem('sa_current_user', JSON.stringify(formattedUser));
    localStorage.setItem('sa_admin_email', companyEmail);

    // Also update Admin PIN if we found a matching registered admin org
    const matchedOrg = registeredOrgs.find(o => o.adminEmail.toLowerCase() === companyEmail.toLowerCase());
    if (matchedOrg) {
      setCurrentAdminPin(matchedOrg.adminPin);
      localStorage.setItem('sa_admin_pin', matchedOrg.adminPin);
    }

    if (isRoleAdmin) {
      setIsAdminAuthenticated(true);
      setCurrentMode('admin');
    } else {
      setIsAdminAuthenticated(false);
      setCurrentMode('employee');
      setCurrentTab('punch');
    }
  };

  // Register New Admin / Organization Org
  const handleRegisterAdminOrg = (newOrg: AdminOrganization) => {
    const updated = [newOrg, ...registeredOrgs.filter(o => o.adminEmail.toLowerCase() !== newOrg.adminEmail.toLowerCase())];
    setRegisteredOrgs(updated);
    localStorage.setItem('sa_registered_orgs', JSON.stringify(updated));
    FirebaseService.saveAdminOrg(newOrg);
  };

  // Reset Admin PIN / Password (Forgot Password flow)
  const handleResetAdminPassword = (adminEmail: string, newPin: string) => {
    const updatedOrgs = registeredOrgs.map((o) => 
      o.adminEmail.toLowerCase() === adminEmail.toLowerCase() ? { ...o, adminPin: newPin } : o
    );
    setRegisteredOrgs(updatedOrgs);
    localStorage.setItem('sa_registered_orgs', JSON.stringify(updatedOrgs));

    const matchedOrg = registeredOrgs.find(o => o.adminEmail.toLowerCase() === adminEmail.toLowerCase());
    if (matchedOrg) {
      FirebaseService.saveAdminOrg({ ...matchedOrg, adminPin: newPin });
    }

    if (adminEmail.toLowerCase() === companyAdminEmail.toLowerCase()) {
      setCurrentAdminPin(newPin);
      localStorage.setItem('sa_admin_pin', newPin);
    }
  };

  // Save new Admin password PIN (Change Password setting flow)
  const handleSaveNewAdminPin = (newPin: string) => {
    setCurrentAdminPin(newPin);
    localStorage.setItem('sa_admin_pin', newPin);

    // Sync back to registered orgs if matching
    const updatedOrgs = registeredOrgs.map((o) => 
      o.adminEmail.toLowerCase() === companyAdminEmail.toLowerCase() ? { ...o, adminPin: newPin } : o
    );
    setRegisteredOrgs(updatedOrgs);
    localStorage.setItem('sa_registered_orgs', JSON.stringify(updatedOrgs));

    const matchedOrg = registeredOrgs.find(o => o.adminEmail.toLowerCase() === companyAdminEmail.toLowerCase());
    if (matchedOrg) {
      FirebaseService.saveAdminOrg({ ...matchedOrg, adminPin: newPin });
    }
  };

  // Logout / Switch Account Handler
  const handleLogout = async () => {
    try {
      const { logout } = await import('./services/authService');
      await logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('sa_current_user');
    setIsAdminAuthenticated(false);
    setIsLoginModalOpen(true);
    showToast('ออกจากระบบแล้ว', 'กรุณาเข้าสู่ระบบใหม่ด้วยอีเมลแอดมินและรหัสของคุณ', 'logout');
  };

  // Handle Switch Mode with Guard
  const handleSwitchMode = (mode: ViewMode) => {
    if (mode === 'admin' && !isAdminAuthenticated) {
      setIsAdminPinModalOpen(true);
      return;
    }
    setCurrentMode(mode);
    if (mode === 'employee') setCurrentTab('punch');
    if (mode === 'profile') setCurrentTab('team');
  };

  // Handle Punch Event (Check-In / Check-Out) with Instant Google Sheet Sync
  const handleRecordPunch = async (
    type: PunchType,
    mode: WorkMode,
    note: string,
    photoDataUrl?: string
  ) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes} น.`;

    const day = now.getDate();
    const month = now.getMonth() + 1;
    const dateStr = `วันนี้ ${day}/0${month}`;

    const workModeLabelMap: Record<WorkMode, string> = {
      onsite: 'เข้างานปกติ',
      wfh: 'ทำงานจากที่บ้าน',
      client: 'ออกไซต์งาน',
    };

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      empId: currentUser.empId || currentUser.devCode,
      empName: currentUser.name,
      role: currentUser.role,
      avatar: currentUser.avatar,
      timestamp: timeStr,
      dateStr: dateStr,
      type: type,
      statusTag: type === 'CHECK_IN' ? 'ตรงเวลา' : 'เลิกงานปกติ',
      statusColor: type === 'CHECK_IN' ? 'secondary' : 'primary',
      location: mode === 'wfh' ? 'บ้านพักพนักงาน (WFH)' : 'สำนักงานใหญ่ อาคาร A (14.8 ม.)',
      distanceMeter: mode === 'wfh' ? 100 : 14.8,
      workMode: mode,
      workModeLabel: workModeLabelMap[mode],
      note: note || undefined,
      photoUrl: photoDataUrl || currentUser.avatar,
    };

    setHistoryList((prev) => [newRecord, ...prev]);

    // Save to Firebase Firestore
    FirebaseService.saveAttendanceRecord(newRecord);

    // Sync to Google Sheets immediately
    const matchedOrg = registeredOrgs.find(o => o.adminEmail.toLowerCase() === companyAdminEmail.toLowerCase());
    const sheetId = matchedOrg?.spreadsheetId || GoogleWorkspaceService.getActiveSpreadsheetId();
    
    if (sheetId) {
      await GoogleWorkspaceService.appendAttendanceToSheet(
        sheetId,
        {
          empId: currentUser.empId || currentUser.devCode,
          empName: currentUser.name,
          type: type === 'CHECK_IN' ? 'เข้างาน (Check-In)' : 'เลิกงาน (Check-Out)',
          mode: mode,
          lat: 13.736717,
          lng: 100.523186,
          dist: 14.8,
          note: note || '-',
          timestamp: now.toISOString(),
        }
      );
    }

    const titleAction = type === 'CHECK_IN' ? 'บันทึกสแกนใบหน้าเข้างานสำเร็จ!' : 'บันทึกเวลาเลิกงานสำเร็จ!';
    showToast(
      titleAction,
      `ข้อมูลการลงเวลาถูกส่งไปยัง Google Sheets บัญชีแอดมิน (${companyAdminEmail}) ทันทีเรียบร้อย`,
      type === 'CHECK_IN' ? 'login' : 'logout'
    );
  };

  // Mobile Bottom Nav Select Handler
  const handleSelectTab = (tab: MobileTab) => {
    setCurrentTab(tab);
    if (tab === 'punch') {
      setCurrentMode('employee');
    } else if (tab === 'history') {
      setCurrentMode('employee');
    } else if (tab === 'payroll') {
      setSelectedEmployeeForPayslip(null); // default to current user
      setIsPayslipOpen(true);
    } else if (tab === 'team') {
      setCurrentMode('profile');
    }
  };

  const handleConnectOAuth = () => {
    setIsSheetsConnected(true);
    showToast(
      'Google Workspace Synced',
      `สิทธิ์ใช้งาน Google Sheets & Drive สำหรับบัญชี ${companyAdminEmail} ถูกเปิดเชื่อมต่อแล้ว`,
      'cloud_done'
    );
  };

  // Company Information Handlers (Syncs to Sheets)
  const handleSaveCompanyInfo = async (newInfo: CompanyInfo) => {
    setCompanyInfo(newInfo);
    await GoogleWorkspaceService.updateCompanyInfoInSheet(newInfo);
    showToast('อัปเดตข้อมูลบริษัทสำเร็จ!', 'ข้อมูลบริษัทถูกปรับปรุงลงใน Google Sheets & Drive เรียบร้อยแล้ว', 'domain');
  };

  // Employee Management Handlers (Syncs to Sheets)
  const handleSaveEmployee = async (empToSave: EmployeePayroll) => {
    setAdminEmployees((prev) => {
      const exists = prev.some((e) => e.empId === empToSave.empId);
      if (exists) {
        return prev.map((e) => (e.empId === empToSave.empId ? empToSave : e));
      } else {
        return [empToSave, ...prev];
      }
    });

    // Save to Firebase Firestore & Google Sheets
    FirebaseService.saveEmployee(empToSave);
    await GoogleWorkspaceService.updateEmployeeInSheet(empToSave);

    showToast(
      'บันทึกพนักงานลง Google Sheets สำเร็จ',
      `อัปเดตข้อมูลของ ${empToSave.empName} (${empToSave.empId}) ไปยัง Google Sheets แอดมินเรียบร้อย`,
      'person'
    );
  };

  const handleDeleteEmployee = (empId: string) => {
    setAdminEmployees((prev) => prev.filter((e) => e.empId !== empId));
    FirebaseService.deleteEmployee(empId);
    showToast('ลบพนักงานสำเร็จ', `พนักงานรหัส ${empId} ถูกลบออกจากระบบเรียบร้อย`, 'delete');
  };

  // Handle Monthly Cutoff & New Google Sheet Tab Creation
  const handleMonthlyCutoff = async () => {
    const res = await GoogleWorkspaceService.createMonthlyPayrollSheet(companyInfo.payPeriod);
    showToast(
      'ตัดรอบเงินเดือนสำเร็จ!',
      `ระบบสร้างแท็บ Google Sheet ใหม่ "${res.newSheetName}" สำหรับรอบถัดไปและส่ง e-Payslip ไปยัง Google Drive แล้ว`,
      'lock_reset'
    );
  };

  const handleOpenAddEmployee = () => {
    setSelectedEmployeeForModal(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: EmployeePayroll) => {
    setSelectedEmployeeForModal(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEmployeePayslip = (emp: EmployeePayroll) => {
    setSelectedEmployeeForPayslip(emp);
    setIsPayslipOpen(true);
  };

  return (
    <div className="bg-rose-50/40 text-slate-800 min-h-screen flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Toast Feedback */}
      <Toast toast={toast} />

      {/* App Header */}
      <Header
        currentMode={currentMode}
        onSwitchMode={handleSwitchMode}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
        onOpenGoogleWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        isSheetsConnected={isSheetsConnected}
        currentUser={currentUser}
        isAdminAuthenticated={isAdminAuthenticated}
        onRequestAdminAuth={() => setIsAdminPinModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 mb-20 md:mb-8">
        {currentMode === 'employee' && (
          <EmployeeView
            currentUser={currentUser}
            historyList={historyList}
            onRecordPunch={handleRecordPunch}
            onOpenPayslipModal={() => {
              setSelectedEmployeeForPayslip(null);
              setIsPayslipOpen(true);
            }}
            onShowToast={showToast}
            activeTab={currentTab}
            onSelectSubTab={(tab) => {
              if (tab === 'punch' || tab === 'history' || tab === 'payroll') {
                setCurrentTab(tab as MobileTab);
              }
            }}
          />
        )}

        {currentMode === 'admin' && (
          <AdminView
            companyInfo={companyInfo}
            adminEmployees={adminEmployees}
            onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
            onOpenAdminPasswordModal={() => setIsAdminPasswordModalOpen(true)}
            onAddEmployee={handleOpenAddEmployee}
            onEditEmployee={handleOpenEditEmployee}
            onSelectEmployeePayslip={handleOpenEmployeePayslip}
            onOpenGoogleWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
            onShowToast={showToast}
            onMonthlyCutoff={handleMonthlyCutoff}
          />
        )}

        {currentMode === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onBack={() => {
              setCurrentMode('employee');
              setCurrentTab('punch');
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom Nav Bar */}
      <BottomNav
        currentTab={currentTab}
        currentMode={currentMode}
        onSelectTab={handleSelectTab}
      />

      {/* Login Gate Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        adminEmployees={adminEmployees}
        registeredOrgs={registeredOrgs}
        defaultEmail={companyAdminEmail}
        onLoginSuccess={handleLoginSuccess}
        onRegisterAdminOrg={handleRegisterAdminOrg}
        onOpenForgotAdminPassword={() => setIsForgotAdminPasswordOpen(true)}
        onShowToast={showToast}
      />

      {/* Modals & Drawers */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        currentPin={currentAdminPin}
        onOpenForgotAdminPassword={() => setIsForgotAdminPasswordOpen(true)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminPinModalOpen(false);
          setCurrentMode('admin');
        }}
        onShowToast={showToast}
      />

      {/* Admin security modals */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        currentAdminEmail={companyAdminEmail}
        currentPin={currentAdminPin}
        onSaveNewPin={handleSaveNewAdminPin}
        onShowToast={showToast}
      />

      <ForgotAdminPasswordModal
        isOpen={isForgotAdminPasswordOpen}
        onClose={() => setIsForgotAdminPasswordOpen(false)}
        registeredOrgs={registeredOrgs}
        onResetAdminPassword={handleResetAdminPassword}
        onShowToast={showToast}
      />

      <PayslipModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        currentUser={currentUser}
        companyInfo={companyInfo}
        selectedEmployee={selectedEmployeeForPayslip}
        onDownloadPDF={() => {
          const empCode = selectedEmployeeForPayslip ? selectedEmployeeForPayslip.empId : currentUser.empId;
          showToast('ดาวน์โหลด PDF สำเร็จ', `ไฟล์ e-Slip_${empCode}_Feb2025.pdf ดาวน์โหลดเสร็จสิ้น`, 'picture_as_pdf');
          setIsPayslipOpen(false);
        }}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        companyInfo={companyInfo}
        onSaveCompanyInfo={handleSaveCompanyInfo}
      />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        employeeToEdit={selectedEmployeeForModal}
        onSaveEmployee={handleSaveEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        currentUser={currentUser}
        onOpenFullProfile={() => {
          setCurrentMode('profile');
          setCurrentTab('team');
        }}
        onShowToast={showToast}
      />

      <GoogleWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        isSheetsConnected={isSheetsConnected}
        onConnectOAuth={handleConnectOAuth}
        onShowToast={showToast}
      />
    </div>
  );
}
