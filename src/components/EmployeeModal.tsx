import React, { useState, useEffect } from 'react';
import { EmployeePayroll } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit: EmployeePayroll | null; // null if adding new
  onSaveEmployee: (employee: EmployeePayroll) => void;
  onDeleteEmployee?: (empId: string) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
  onSaveEmployee,
  onDeleteEmployee,
}) => {
  const [formData, setFormData] = useState<Partial<EmployeePayroll>>({
    empId: '',
    empName: '',
    role: '',
    dept: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    workDays: '22/22 วัน',
    baseSalary: 30000,
    otPay: 0,
    lateDeduction: 0,
    ssoDeduction: 750,
    taxDeduction: 1500,
    netPay: 27750,
    status: 'active',
    bankAcc: 'KBANK ••• 0000',
    address: '',
    taxId: '',
    email: '',
    phone: '',
    passcode: '',
  });

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        ...employeeToEdit,
        passcode: employeeToEdit.passcode || employeeToEdit.empId,
      });
    } else {
      const randomId = `DEV-00${Math.floor(Math.random() * 90 + 10)}`;
      setFormData({
        empId: randomId,
        empName: '',
        role: 'Software Engineer',
        dept: 'Technology',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        workDays: '22/22 วัน',
        baseSalary: 35000,
        otPay: 0,
        lateDeduction: 0,
        ssoDeduction: 750,
        taxDeduction: 1750,
        netPay: 32500,
        status: 'active',
        bankAcc: 'KBANK ••• 1234',
        address: '123/45 ถนนสุขุมวิท กรุงเทพฯ',
        taxId: '1-1002-00000-00-0',
        email: 'employee@workpulse.co.th',
        phone: '081-000-0000',
        passcode: randomId,
      });
    }
  }, [employeeToEdit, isOpen]);

  // Generate random Passcode for employee
  const handleGenerateRandomPasscode = () => {
    const prefix = formData.dept ? formData.dept.substring(0, 3).toUpperCase() : 'EMP';
    const num = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${prefix}-${num}`;
    setFormData((prev) => ({ ...prev, passcode: newCode }));
  };

  // Recalculate Net Pay whenever income or deductions change
  const handleNumChange = (field: keyof EmployeePayroll, val: number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      const base = Number(updated.baseSalary) || 0;
      const ot = Number(updated.otPay) || 0;
      const late = Number(updated.lateDeduction) || 0;
      const sso = Number(updated.ssoDeduction) || 0;
      const tax = Number(updated.taxDeduction) || 0;
      const calculatedNet = base + ot - late - sso - tax;
      return { ...updated, netPay: calculatedNet < 0 ? 0 : calculatedNet };
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empId || !formData.empName) return;
    const finalData = {
      ...formData,
      passcode: formData.passcode || formData.empId,
    };
    onSaveEmployee(finalData as EmployeePayroll);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fadeIn">
      <div className="w-full max-w-2xl bg-white/95 rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[22px]">
                {employeeToEdit ? 'edit_note' : 'person_add'}
              </span>
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-white">
                {employeeToEdit ? `แก้ไขข้อมูลพนักงาน (${employeeToEdit.empId})` : 'เพิ่มพนักงานใหม่เข้าองค์กร'}
              </h3>
              <p className="text-[11px] text-rose-100">
                ข้อมูลส่วนบุคคล, รหัสผ่านพนักงาน (Passcode), เงินเดือนฐาน และรายการหัก
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Passcode Setting Section (Admin Managed) */}
          <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-3">
            <div className="text-[12px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">key</span>
                ตั้งค่ารหัสผ่านเข้าใช้งานสำหรับพนักงาน (Admin Only)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-mono font-bold">
                แอดมินเป็นผู้กำหนดเท่านั้น
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รหัสผ่าน / Passcode เข้าใช้งานพนักงาน
                </label>
                <input
                  type="text"
                  required
                  value={formData.passcode || ''}
                  onChange={(e) => setFormData({ ...formData, passcode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 font-mono font-bold text-sm focus:outline-none focus:border-rose-500 uppercase shadow-xs"
                  placeholder="DEV-0042"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateRandomPasscode}
                className="py-2.5 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">autorenew</span>
                <span>สุ่มรหัสผ่านใหม่</span>
              </button>
            </div>

            <p className="text-[10px] text-rose-600/80 font-medium leading-relaxed bg-white/80 p-2 rounded-xl border border-pink-100 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">info</span>
              พนักงานจะใช้รหัสนี้ร่วมกับอีเมลแอดมินในการเข้าสู่ระบบ โดยพนักงานไม่สามารถรีเซ็ตหรือเปลี่ยนรหัสผ่านเองได้
            </p>
          </div>

          {/* Section 1: Basic Profile */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3">
            <div className="text-[12px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">badge</span>
              ข้อมูลทั่วไปพนักงาน
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสประจำตัว (Emp ID)</label>
                <input
                  type="text"
                  required
                  value={formData.empId || ''}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-mono focus:outline-none focus:border-rose-400"
                  placeholder="DEV-0042"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล (TH)</label>
                <input
                  type="text"
                  required
                  value={formData.empName || ''}
                  onChange={(e) => setFormData({ ...formData, empName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400"
                  placeholder="นายสมศักดิ์ มั่นคง"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ตำแหน่ง (Role / Title)</label>
                <input
                  type="text"
                  required
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400"
                  placeholder="Senior Frontend Dev"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">แผนก (Department)</label>
                <input
                  type="text"
                  required
                  value={formData.dept || ''}
                  onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400"
                  placeholder="Tech & Engineering"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400"
                  placeholder="089-123-4567"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">อีเมลพนักงาน</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400"
                  placeholder="somsak@workpulse.co.th"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ที่อยู่พนักงาน (ใช้พิมพ์บนสลิป)</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-medium focus:outline-none focus:border-rose-400"
                placeholder="123/45 ซอยสุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา BKK 10110"
              />
            </div>
          </div>

          {/* Section 2: Banking & Tax */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3">
            <div className="text-[12px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
              บัญชีธนาคาร & เลขภาษี
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">บัญชีรับเงินโอน (Bank Account)</label>
                <input
                  type="text"
                  value={formData.bankAcc || ''}
                  onChange={(e) => setFormData({ ...formData, bankAcc: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-mono focus:outline-none focus:border-rose-400"
                  placeholder="KBANK ••• 4198"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                <input
                  type="text"
                  value={formData.taxId || ''}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 font-mono focus:outline-none focus:border-rose-400"
                  placeholder="1-1002-34567-89-0"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financials & Deductions */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3">
            <div className="text-[12px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">payments</span>
              รายได้และรายการหัก (Payroll Breakdown)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">เงินเดือนฐาน (Base Salary)</label>
                <input
                  type="number"
                  step="500"
                  required
                  value={formData.baseSalary || 0}
                  onChange={(e) => handleNumChange('baseSalary', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-emerald-700 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ค่า OT / เบี้ยขยัน (OT Pay)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.otPay || 0}
                  onChange={(e) => handleNumChange('otPay', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-emerald-700 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หักมาสาย/ขาดงาน</label>
                <input
                  type="number"
                  step="50"
                  value={formData.lateDeduction || 0}
                  onChange={(e) => handleNumChange('lateDeduction', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">หักประกันสังคม (SSO Deduction)</label>
                <input
                  type="number"
                  step="50"
                  value={formData.ssoDeduction || 0}
                  onChange={(e) => handleNumChange('ssoDeduction', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หักภาษี ณ ที่จ่าย (Withholding Tax)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.taxDeduction || 0}
                  onChange={(e) => handleNumChange('taxDeduction', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Live Net Pay Display */}
            <div className="p-3.5 rounded-2xl bg-pink-100/70 border border-pink-300 flex items-center justify-between">
              <span className="text-[12px] font-extrabold text-rose-900">
                คำนวณเงินรับสุทธิ (Net Salary Output):
              </span>
              <span className="font-mono text-[20px] font-extrabold text-rose-700">
                ฿{(formData.netPay || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-rose-200 flex items-center justify-between">
            {employeeToEdit && onDeleteEmployee ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`ยืนยันการลบพนักงาน ${employeeToEdit.empName} (${employeeToEdit.empId})?`)) {
                    onDeleteEmployee(employeeToEdit.empId);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold border border-rose-300 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                ลบพนักงานนี้
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-pink-200 transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                บันทึกพนักงาน
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
