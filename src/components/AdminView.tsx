import React, { useState } from 'react';
import { CompanyInfo, EmployeePayroll } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminViewProps {
  companyInfo: CompanyInfo;
  adminEmployees: EmployeePayroll[];
  onOpenCompanyModal: () => void;
  onOpenAdminPasswordModal: () => void;
  onAddEmployee: () => void;
  onEditEmployee: (employee: EmployeePayroll) => void;
  onSelectEmployeePayslip: (employee: EmployeePayroll) => void;
  onOpenGoogleWorkspaceModal: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
  onMonthlyCutoff?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  companyInfo,
  adminEmployees,
  onOpenCompanyModal,
  onOpenAdminPasswordModal,
  onAddEmployee,
  onEditEmployee,
  onSelectEmployeePayslip,
  onOpenGoogleWorkspaceModal,
  onShowToast,
  onMonthlyCutoff,
}) => {
  const [activeTab, setActiveTab] = useState<'payroll' | 'overview' | 'audit' | 'all'>('payroll');
  const [searchTerm, setSearchTerm] = useState('');

  const handleMonthlyCutoff = () => {
    if (window.confirm(`ยืนยันการตัดรอบเงินเดือนสำหรับ ${companyInfo.payPeriod} และสร้างแท็บ Google Sheets ใหม่?`)) {
      if (onMonthlyCutoff) {
        onMonthlyCutoff();
      } else {
        onShowToast(
          'ตัดรอบเงินเดือนสำเร็จ!',
          'ระบบสร้างแท็บ 2025_MARCH_PAYROLL และส่งออกสำรองข้อมูลขึ้น Google Drive เรียบร้อย',
          'lock_reset'
        );
      }
    }
  };

  const handleBatchPDF = () => {
    onShowToast(
      'ประมวลผล PDF ทั้งหมด',
      `กำลังสร้างสลิปเงินเดือนพนักงาน ${adminEmployees.length} ท่าน ลงในโฟลเดอร์ Google Drive`,
      'picture_as_pdf'
    );
  };

  const handleDispatchEmails = () => {
    onShowToast(
      'ส่งอีเมล e-Payslip เรียบร้อย',
      `ระบบทยอยส่ง Payslip ทางอีเมลพนักงาน ${adminEmployees.length} ท่านผ่าน Google Mail / GAS Webhook`,
      'mark_email_read'
    );
  };

  // Filter employees by search term
  const filteredEmployees = adminEmployees.filter(
    (emp) =>
      emp.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.passcode && emp.passcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Mock data for Weekly Check-ins vs Check-outs
  const weeklyData = [
    { name: 'จันทร์', checkIns: Math.max(adminEmployees.length - 2, 0), checkOuts: Math.max(adminEmployees.length - 3, 0) },
    { name: 'อังคาร', checkIns: Math.max(adminEmployees.length - 1, 0), checkOuts: Math.max(adminEmployees.length - 1, 0) },
    { name: 'พุธ', checkIns: Math.max(adminEmployees.length - 4, 0), checkOuts: Math.max(adminEmployees.length - 4, 0) },
    { name: 'พฤหัสฯ', checkIns: Math.max(adminEmployees.length - 2, 0), checkOuts: Math.max(adminEmployees.length - 2, 0) },
    { name: 'ศุกร์', checkIns: Math.max(adminEmployees.length - 1, 0), checkOuts: Math.max(adminEmployees.length - 5, 0) },
  ];

  // Derived data for Department-wise attendance
  const deptDataMap = adminEmployees.reduce((acc, emp) => {
    acc[emp.dept] = (acc[emp.dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#3b82f6', '#0ea5e9'];
  
  const departmentData = Object.keys(deptDataMap).map((key, index) => ({
    name: key,
    value: deptDataMap[key],
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Admin Control Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-rose-200 shadow-xl shadow-pink-100/50 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rose-700 border border-pink-300 text-[10px] font-bold uppercase tracking-widest">
              Admin Workbench
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Database: Firestore & Drive Master
            </span>
          </div>
          <h2 className="text-[18px] md:text-[20px] font-extrabold text-slate-800 mt-1">
            ศูนย์ควบคุมการลงเวลา & จัดการเงินเดือนพนักงาน
          </h2>
        </div>

        {/* Header Action Buttons in 2x2 grid on mobile/tablet */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full xl:w-auto">
          <button
            onClick={onOpenAdminPasswordModal}
            className="px-3 py-2 md:py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[12px] md:text-[13px] font-bold border border-amber-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] md:text-[18px] text-amber-600">vpn_key</span>
            เปลี่ยนรหัสแอดมิน
          </button>

          <button
            onClick={onOpenCompanyModal}
            className="px-3 py-2 md:py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] md:text-[13px] font-bold border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] md:text-[18px]">domain</span>
            ตั้งค่าบริษัท
          </button>

          <button
            onClick={handleMonthlyCutoff}
            className="px-3 py-2 md:py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-[12px] md:text-[13px] font-bold shadow-md shadow-pink-200 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] md:text-[18px]">lock_reset</span>
            ตัดรอบเงินเดือน
          </button>

          <button
            onClick={onOpenGoogleWorkspaceModal}
            className="px-3 py-2 md:py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-slate-700 text-[12px] md:text-[13px] font-bold border border-rose-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] md:text-[18px] text-rose-500">folder_open</span>
            Drive / Sheets
          </button>
        </div>
      </div>

      {/* Company Info Summary Banner */}
      <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-5 border border-rose-200 shadow-xl shadow-pink-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-pink-100 border border-pink-300 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px] md:text-[24px]">corporate_fare</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] md:text-[15px] font-extrabold text-slate-800">{companyInfo.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] md:text-[10px] font-mono font-bold">
                {companyInfo.branch}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {companyInfo.address}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-rose-700 font-semibold mt-1">
              <span>Tax ID: {companyInfo.taxId}</span>
              <span className="hidden sm:inline">•</span>
              <span>รอบคำนวณ: {companyInfo.payPeriod}</span>
              <span className="hidden sm:inline">•</span>
              <span>วันจ่ายเงิน: {companyInfo.payDate}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCompanyModal}
          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-colors shrink-0 self-end md:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          แก้ไขข้อมูลบริษัท
        </button>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur p-1.5 rounded-3xl border border-rose-200 shadow-lg shadow-pink-100/40 flex items-center justify-between overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex-1 min-w-[110px] md:min-w-[120px] py-2 md:py-2.5 px-2.5 rounded-2xl text-[12px] md:text-[13px] font-bold transition-all flex items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap ${
            activeTab === 'payroll'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] md:text-[18px]">table_chart</span>
          <span>จัดการพนักงาน ({adminEmployees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[110px] md:min-w-[120px] py-2 md:py-2.5 px-2.5 rounded-2xl text-[12px] md:text-[13px] font-bold transition-all flex items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] md:text-[18px]">analytics</span>
          <span>ภาพรวม KPI</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[110px] md:min-w-[120px] py-2 md:py-2.5 px-2.5 rounded-2xl text-[12px] md:text-[13px] font-bold transition-all flex items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] md:text-[18px]">videocam</span>
          <span>ฟีด Live</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-3 rounded-2xl text-[11px] md:text-[12px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="ดูทุกส่วนในหน้าเดียว"
        >
          <span className="material-symbols-outlined text-[16px]">grid_view</span>
          <span className="hidden md:inline">แสดงทั้งหมด</span>
        </button>
      </div>

      {/* Real-Time KPI Stats & Charts */}
      {(activeTab === 'overview' || activeTab === 'all') && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* KPI 1 */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-5 border border-rose-200 shadow-lg shadow-pink-100/50">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">พนักงานทั้งหมด</span>
                <span className="material-symbols-outlined text-rose-500 text-[20px]">groups</span>
              </div>
              <div className="font-mono text-[24px] md:text-[28px] font-extrabold text-slate-800">
                {adminEmployees.length}<span className="text-xs md:text-sm font-normal text-slate-500"> คน</span>
              </div>
              <div className="text-[10px] md:text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">trending_up</span> ในฐานข้อมูลองค์กร
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-5 border border-rose-200 shadow-lg shadow-pink-100/50">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">มาทำงานแล้ววันนี้</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
              </div>
              <div className="font-mono text-[24px] md:text-[28px] font-extrabold text-slate-800">
                {Math.max(adminEmployees.length - 1, 0)}<span className="text-xs md:text-sm font-normal text-slate-500">/{adminEmployees.length} คน</span>
              </div>
              <div className="text-[10px] md:text-[11px] text-rose-600 font-bold mt-1">
                95% เข้างานตรงเวลา
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-5 border border-rose-200 shadow-lg shadow-pink-100/50">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">ยอดจ่ายเงินเดือนรวม</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">payments</span>
              </div>
              <div className="font-mono text-[18px] md:text-[22px] font-extrabold text-emerald-600 truncate">
                ฿{adminEmployees.reduce((acc, e) => acc + e.netPay, 0).toLocaleString('th-TH')}
              </div>
              <div className="text-[10px] md:text-[11px] text-slate-500 font-medium mt-1">
                ประจำรอบ {companyInfo.payPeriod}
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-5 border border-rose-200 shadow-lg shadow-pink-100/50">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">มาสาย/หักสาย</span>
                <span className="material-symbols-outlined text-rose-500 text-[20px]">warning</span>
              </div>
              <div className="font-mono text-[24px] md:text-[28px] font-extrabold text-rose-600">
                1<span className="text-xs md:text-sm font-normal text-slate-500"> คน</span>
              </div>
              <div className="text-[10px] md:text-[11px] text-rose-600 font-medium mt-1">
                สายเกิน 15 นาที
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart: Weekly Check-ins vs Check-outs */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-6 border border-rose-200 shadow-xl shadow-pink-100/50">
              <div className="mb-4">
                <h3 className="text-[15px] md:text-[16px] font-extrabold text-slate-800">
                  สรุปการลงเวลาเข้า-ออกรายสัปดาห์
                </h3>
                <p className="text-[11px] md:text-[12px] text-slate-500">
                  สถิติเปรียบเทียบ Check-in และ Check-out (5 วันย้อนหลัง)
                </p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #ffe4e6', boxShadow: '0 4px 6px -1px rgba(255, 228, 230, 0.5)', fontSize: '12px' }}
                      cursor={{ fill: '#fff1f2' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="checkIns" name="Check-in (เข้างาน)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="checkOuts" name="Check-out (ออกงาน)" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Department Distribution */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-6 border border-rose-200 shadow-xl shadow-pink-100/50">
              <div className="mb-4">
                <h3 className="text-[15px] md:text-[16px] font-extrabold text-slate-800">
                  สัดส่วนพนักงานแยกตามแผนก
                </h3>
                <p className="text-[11px] md:text-[12px] text-slate-500">
                  การกระจายตัวของบุคลากรภายในองค์กร
                </p>
              </div>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      className="text-[10px] font-bold fill-slate-700"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #ffe4e6', boxShadow: '0 4px 6px -1px rgba(255, 228, 230, 0.5)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll & Employee Computation Table */}
      {(activeTab === 'payroll' || activeTab === 'all') && (
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-6 border border-rose-200 shadow-xl shadow-pink-100/50 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-[15px] md:text-[16px] font-extrabold text-slate-800 flex flex-wrap items-center gap-2">
                <span>จัดการพนักงาน & ตารางเงินเดือน (Employee & Payroll)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rose-700 border border-pink-300 text-xs font-mono font-bold">
                  {filteredEmployees.length} ท่าน
                </span>
              </h3>
              <p className="text-[11px] md:text-[12px] text-slate-500">
                ตั้งรหัสผ่านสำหรับเข้าใช้งาน (Passcode), แก้ไขเงินเดือนฐาน, รายได้ และสลิปพนักงาน
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5">
              <button
                onClick={onAddEmployee}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-[12px] md:text-[13px] font-bold shadow-md shadow-pink-200 transition-transform active:scale-95 flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">person_add</span>
                เพิ่มพนักงาน
              </button>

              <button
                onClick={handleBatchPDF}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] md:text-[13px] font-bold border border-rose-200 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">picture_as_pdf</span>
                ออก PDF
              </button>

              <button
                onClick={handleDispatchEmails}
                className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] md:text-[13px] font-bold transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-200"
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">mark_email_read</span>
                ส่งสลิปผ่านอีเมลทุกคน
              </button>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาพนักงานด้วยชื่อ, รหัสพนักงาน, ตำแหน่ง หรือแผนก..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-rose-50/40 border border-rose-200 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          {/* Elegant Mobile Card Layout - Shows below 'lg' viewpoint to prevent distorted table proportion */}
          <div className="block lg:hidden space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-rose-50/20 rounded-2xl border border-rose-100">
                ไม่พบข้อมูลพนักงานที่ค้นหา
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <div key={emp.empId} className="p-4 rounded-3xl bg-white border border-rose-100 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.empName}
                      className="w-11 h-11 rounded-2xl object-cover border border-rose-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate">{emp.empName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{emp.role} • {emp.dept}</div>
                      <div className="text-[10px] font-mono text-rose-600 font-bold mt-1 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-lg inline-block">
                        Login Code: {emp.passcode || emp.empId}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-rose-50/40 rounded-2xl p-3 text-[11px] font-medium text-slate-600">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">ฐานเงินเดือน</span>
                      <span className="font-mono text-slate-700 font-bold">฿{emp.baseSalary.toLocaleString('th-TH')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">OT / เพิ่มเติม</span>
                      <span className="font-mono text-emerald-600 font-bold">+{emp.otPay.toLocaleString('th-TH')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">หักภาษี + ปกส</span>
                      <span className="font-mono text-rose-500 font-bold">-{(emp.ssoDeduction + emp.taxDeduction + emp.lateDeduction).toLocaleString('th-TH')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-pink-600 block font-bold uppercase">เงินสุทธิ (Net)</span>
                      <span className="font-mono text-rose-600 font-extrabold text-[12px]">฿{emp.netPay.toLocaleString('th-TH')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onEditEmployee(emp)}
                      className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      แก้ไข/รหัส
                    </button>
                    <button
                      onClick={() => onSelectEmployeePayslip(emp)}
                      className="flex-1 py-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-800 border border-pink-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      ดูสลิป
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop/Tablet Wide Screen Responsive Table (Hidden on mobile) */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-rose-200 bg-white shadow-inner">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-rose-50 text-rose-900 font-extrabold uppercase tracking-wider text-[10px] border-b border-rose-200">
                <tr>
                  <th className="p-3.5 pl-4">พนักงาน & รหัสผ่าน Login</th>
                  <th className="p-3.5">ตำแหน่ง & แผนก</th>
                  <th className="p-3.5 text-right">เงินเดือนฐาน</th>
                  <th className="p-3.5 text-right">OT / เพิ่มเติม</th>
                  <th className="p-3.5 text-right">หักภาษี + ปกส.</th>
                  <th className="p-3.5 text-right font-bold text-slate-800">เงินสุทธิ (Net)</th>
                  <th className="p-3.5 text-center pr-4">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 font-medium text-slate-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      ไม่พบข้อมูลพนักงานที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.empId} className="hover:bg-rose-50/50 transition-colors">
                      <td className="p-3.5 pl-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.empName}
                            className="w-9 h-9 rounded-xl object-cover border border-rose-200 shadow-xs"
                          />
                          <div>
                            <div className="text-slate-800 font-bold">{emp.empName}</div>
                            <div className="text-[10px] font-mono text-rose-600 flex items-center gap-1.5">
                              <span>ID: {emp.empId}</span>
                              <span className="px-1.5 py-0.2 bg-pink-100 rounded text-rose-800 border border-pink-200 font-bold">
                                Login Code: {emp.passcode || emp.empId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 font-bold">{emp.role}</div>
                        <div className="text-[11px] text-slate-500">{emp.dept}</div>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-700">
                        ฿{emp.baseSalary.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-600 font-bold">
                        +{emp.otPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right font-mono text-rose-500 font-medium">
                        -{(emp.ssoDeduction + emp.taxDeduction + emp.lateDeduction).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-rose-600 text-[14px]">
                        ฿{emp.netPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center pr-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditEmployee(emp)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="แก้ไขข้อมูลพนักงาน & รหัสผ่าน"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            แก้ไข/รหัส
                          </button>
                          <button
                            onClick={() => onSelectEmployeePayslip(emp)}
                            className="px-2.5 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-800 border border-pink-300 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="ดู e-Payslip ของพนักงานท่านนี้"
                          >
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            สลิป
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Real-time Check-In Audit Feed Stream */}
      {(activeTab === 'audit' || activeTab === 'all') && (
        <div className="bg-white/90 backdrop-blur rounded-3xl p-4 md:p-6 border border-rose-200 shadow-xl shadow-pink-100/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-[15px] md:text-[16px] font-bold text-slate-800">
                ฟีดตรวจสอบการลงเวลาแบบ Real-time (Live Geofence Audit)
              </h3>
              <p className="text-[11px] md:text-[12px] text-slate-500">
                ข้อมูลจากกล้องและพิกัด GPS ส่งตรงจากอุปกรณ์พนักงานขึ้น Firestore & Drive
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[11px] flex items-center gap-1.5 self-start sm:self-auto font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Firebase Stream
            </span>
          </div>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1 */}
            <div className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFj6Y7YRSogsUGMhKfy5Fu8D2l7CRRqGJybfihEhkIwMl0pLdVIdIGXm-0JznA6dOgF7E6hEeTsysk5aUf2mP4GTErFnuGX7yzEyyX7ibSVJUhJq4nQSrN-YZB1Bk0bc88hc-P7eHPOsO08vSYXwitGxobe77m0ksSfatKdDPXhC5kxzED3Sg9gJ4oGs15sMZbrm21FQS7mS57Dl-Rz38EK5JKKMM7HvcYyk9wM2kODc7ugqsouFRgdw"
                  alt="Feed Employee"
                  className="w-11 h-11 rounded-2xl object-cover border border-rose-200"
                />
                <div>
                  <div className="text-[13px] font-bold text-slate-800">วริษา กิจเจริญ</div>
                  <div className="text-[10px] text-slate-500 font-mono">DES-0109 • UI Designer</div>
                </div>
              </div>
              <div className="space-y-1 text-[11px] font-mono border-t border-rose-100 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลาเข้า:</span>
                  <span className="font-bold text-emerald-600">08:35 น. (ตรงเวลา)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">พิกัด GPS:</span>
                  <span className="text-slate-700">อาคาร A (ห่าง 8 ม.)</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2w4YBao2DsfL-ZDq04iZ9EcUXXQqYDmawBhGtoR5ADobARWUYLwUlz2R_k6D9m6EC5bEocJoxd_6ipfOXwZbXiGPgYqDQncoBJueOmscuKqlvqxDvBYxLuklM5jNZLRaKOyS0oucvgy3_pUe9rIAN3pWet2Tcys1Pv82x1zyBJJA6Fw0_eMft7JlpPFTp5RbSN2mCiOdA5fZHXGI7lPr1Pu6W69Rv2br-pEyt6l_QwQPytwMx54W1qg"
                  alt="Feed Employee"
                  className="w-11 h-11 rounded-2xl object-cover border border-rose-200"
                />
                <div>
                  <div className="text-[13px] font-bold text-slate-800">สมศักดิ์ มั่นคง</div>
                  <div className="text-[10px] text-slate-500 font-mono">DEV-0042 • Tech Lead</div>
                </div>
              </div>
              <div className="space-y-1 text-[11px] font-mono border-t border-rose-100 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลาเข้า:</span>
                  <span className="font-bold text-emerald-600">08:42 น. (ตรงเวลา)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">พิกัด GPS:</span>
                  <span className="text-slate-700">อาคาร A (ห่าง 14 ม.)</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7p3p7VLRDojLvzba4gcCGgZko_Er_A47gWueB8POo0zYQWF13uhXD0H15yQt-is9PAESMsZqJRIZ42FSH-1VY6EtdYQEgV8Mvti_vqiVzxQ3W7w-FzX4BBvzsNKYcGyY-MhPLEQhWMpvl1-mdgkpK2LLyKtF6I8ldeYo8jrtTcYmJczSpXQ0-nwhIe9_wuKb53on3VkAFXFBtwC1yjD0KED-6Hsrj2q7nqYbaVC4WET0a-OrEZwLavw"
                  alt="Feed Employee"
                  className="w-11 h-11 rounded-2xl object-cover border border-rose-200"
                />
                <div>
                  <div className="text-[13px] font-bold text-slate-800">นิภาวรรณ ทรัพย์ดี</div>
                  <div className="text-[10px] text-slate-500 font-mono">HR-0004 • HR Lead</div>
                </div>
              </div>
              <div className="space-y-1 text-[11px] font-mono border-t border-rose-100 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลาเข้า:</span>
                  <span className="font-bold text-emerald-600">08:15 น. (ตรงเวลา)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">พิกัด GPS:</span>
                  <span className="text-slate-700">อาคาร A (ห่าง 5 ม.)</span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-4 rounded-2xl bg-rose-100/50 border border-rose-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgHruEfFt3QFMiDUb_fptdKYNW5QF5mcZzn33QohiTr9K-yIKPsIUFkd6n1eC5hiNNsacbkEgVURycwFj6fwKOC_J2GATbm0DYOQqv-XJtKWOaBVvc4qIP4YG3_ugfpm2SESKTarWWcL2qCceE2lcsSlFx7TyLRDlFe0ONDOJ1_d85kzdhf7YaM9gcGerAxGrdgzJar8ZlHSUeWweELv8NwEhekrGr9b__IIhdnNvnmDDIUEA2FM0JNg"
                  alt="Feed Employee"
                  className="w-11 h-11 rounded-2xl object-cover border border-rose-300"
                />
                <div>
                  <div className="text-[13px] font-bold text-slate-800">กานต์ เทพสถิตย์</div>
                  <div className="text-[10px] text-slate-500 font-mono">DEV-0088 • Jr. Dev</div>
                </div>
              </div>
              <div className="space-y-1 text-[11px] font-mono border-t border-rose-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลาเข้า:</span>
                  <span className="font-bold text-rose-600">09:22 น. (สาย 22 น.)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">พิกัด GPS:</span>
                  <span className="text-slate-700">อาคาร A (ห่าง 19 ม.)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
