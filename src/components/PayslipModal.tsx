import React from 'react';
import { CompanyInfo, EmployeePayroll } from '../types';
import { thaiBahtText } from '../lib/bahttext';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  companyInfo: CompanyInfo;
  selectedEmployee: EmployeePayroll | null;
  onDownloadPDF: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  companyInfo,
  selectedEmployee,
  onDownloadPDF,
}) => {
  if (!isOpen) return null;

  // Fallback if no specific employee selected
  const empName = selectedEmployee ? selectedEmployee.empName : currentUser.name;
  const empId = selectedEmployee ? selectedEmployee.empId : currentUser.empId;
  const role = selectedEmployee ? selectedEmployee.role : currentUser.role;
  const dept = selectedEmployee ? selectedEmployee.dept : (currentUser.dept || 'Tech & Engineering');
  const bankAcc = selectedEmployee?.bankAcc || currentUser.bankAcc || 'KBANK ••• 4198';
  const baseSalary = selectedEmployee ? selectedEmployee.baseSalary : 45000;
  const otPay = selectedEmployee ? selectedEmployee.otPay : 1650;
  const ssoDeduction = selectedEmployee ? selectedEmployee.ssoDeduction : 750;
  const taxDeduction = selectedEmployee ? selectedEmployee.taxDeduction : 3400;
  const lateDeduction = selectedEmployee ? selectedEmployee.lateDeduction : 0;

  const totalEarnings = baseSalary + otPay;
  const totalDeductions = ssoDeduction + taxDeduction + lateDeduction;
  const netPay = selectedEmployee ? selectedEmployee.netPay : (totalEarnings - totalDeductions);
  const bahtTextStr = thaiBahtText(netPay);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-white">ใบแจ้งยอดเงินเดือน (e-Payslip)</h4>
              <span className="text-[10px] text-slate-400 font-mono">
                PERIOD: {companyInfo.payPeriod || '26/01/2568 - 25/02/2568'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="พิมพ์เอกสาร / พิมพ์เป็น PDF"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              พิมพ์ / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Payslip Document Body */}
        <div className="p-6 overflow-y-auto space-y-4 font-sans text-xs">
          {/* Corporate Header */}
          <div className="text-center pb-3 border-b border-slate-800 space-y-1">
            <div className="text-[16px] font-bold text-white tracking-tight">
              {companyInfo.name || 'บริษัท เวิร์คพัลส์ ดิจิทัล โซลูชั่นส์ (ประเทศไทย) จำกัด'}
            </div>
            <div className="text-[11px] text-slate-400 leading-snug max-w-md mx-auto">
              {companyInfo.address || '99/1 อาคาร เวิร์คพัลส์ ทาวเวอร์ ชั้น 18 สุขุมวิท กรุงเทพฯ'}
            </div>
            <div className="text-[11px] text-indigo-400 font-mono">
              เลขประจำตัวผู้เสียภาษีอากร: {companyInfo.taxId || '0105565019821'} • {companyInfo.branch || 'สำนักงานใหญ่'}
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400">รหัสพนักงาน:</span>{' '}
              <span className="font-mono font-semibold text-white">{empId}</span>
            </div>
            <div>
              <span className="text-slate-400">ชื่อ-นามสกุล:</span>{' '}
              <span className="font-semibold text-white">{empName}</span>
            </div>
            <div>
              <span className="text-slate-400">ตำแหน่ง:</span>{' '}
              <span className="text-slate-200">{role}</span>
            </div>
            <div>
              <span className="text-slate-400">แผนก:</span>{' '}
              <span className="text-slate-200">{dept}</span>
            </div>
            <div>
              <span className="text-slate-400">วันที่สั่งจ่าย:</span>{' '}
              <span className="text-slate-200">{companyInfo.payDate || '28 กุมภาพันธ์ 2568'}</span>
            </div>
            <div>
              <span className="text-slate-400">โอนเข้าบัญชี:</span>{' '}
              <span className="font-mono text-slate-200">{bankAcc}</span>
            </div>
          </div>

          {/* Ledger Double Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Column 1: Income */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[11px] font-bold text-emerald-400 mb-2 pb-1 border-b border-emerald-500/20 flex justify-between">
                <span>รายการเงินได้ (EARNINGS)</span>
                <span>จำนวนเงิน (บาท)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">เงินเดือนประจำ</span>
                  <span className="font-mono text-slate-200">
                    {baseSalary.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {otPay > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">ค่า OT / เบี้ยขยัน</span>
                    <span className="font-mono text-emerald-400">
                      +{otPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-500/20 flex justify-between font-bold text-white">
                  <span>รวมเงินได้</span>
                  <span className="font-mono text-emerald-400">
                    ฿{totalEarnings.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Deductions */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-[11px] font-bold text-rose-400 mb-2 pb-1 border-b border-rose-500/20 flex justify-between">
                <span>รายการหัก (DEDUCTIONS)</span>
                <span>จำนวนเงิน (บาท)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {ssoDeduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">ประกันสังคม (SSO)</span>
                    <span className="font-mono text-rose-400">
                      {ssoDeduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {taxDeduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">ภาษีหัก ณ ที่จ่าย (ภ.ง.ด.1)</span>
                    <span className="font-mono text-rose-400">
                      {taxDeduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {lateDeduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-300">หักมาสาย / ขาดงาน</span>
                    <span className="font-mono text-rose-400">
                      {lateDeduction.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-rose-500/20 flex justify-between font-bold text-white">
                  <span>รวมรายการหัก</span>
                  <span className="font-mono text-rose-400">
                    -฿{totalDeductions.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                เงินได้สุทธิ (NET PAYROLL AMOUNT)
              </span>
              <span className="text-xs text-slate-200 font-semibold">
                ({bahtTextStr})
              </span>
            </div>
            <div className="font-mono text-[24px] font-bold text-indigo-400 self-end sm:self-auto">
              ฿{netPay.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-[10px] text-center text-slate-500 pt-1">
            * เอกสารนี้สร้างขึ้นจากระบบ WorkPulse Hub โดยอัตโนมัติ ออกให้โดย {companyInfo.name || 'บริษัท'}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            ปิดหน้าต่าง
          </button>
          <button
            onClick={onDownloadPDF}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            ดาวน์โหลด PDF
          </button>
        </div>
      </div>
    </div>
  );
};
