import React, { useState, useEffect } from 'react';
import { CompanyInfo } from '../types';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
  onSaveCompanyInfo: (newInfo: CompanyInfo) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  companyInfo,
  onSaveCompanyInfo,
}) => {
  const [formData, setFormData] = useState<CompanyInfo>(companyInfo);

  useEffect(() => {
    setFormData(companyInfo);
  }, [companyInfo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompanyInfo(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <span className="material-symbols-outlined text-[22px]">domain</span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-white">ตั้งค่าข้อมูลบริษัท & ออกสลิป</h3>
              <p className="text-[11px] text-slate-400">แก้ไขชื่อบริษัท, ที่อยู่เสียภาษี, เลขประจำตัวผู้เสียภาษี</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">ชื่อบริษัท (Company Name)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500"
              placeholder="บริษัท เวิร์คพัลส์ ดิจิทัล โซลูชั่นส์ (ประเทศไทย) จำกัด"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">ที่อยู่ตามภ.พ.20 / ใบเสร็จ (Company Address)</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="เลขที่... ถนน... แขวง/ตำบล... กรุงเทพฯ"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
              <input
                type="text"
                required
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                placeholder="0105565019821"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">สาขา (Branch)</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500"
                placeholder="สำนักงานใหญ่ (00000)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">รอบคำนวณเงินเดือน (Pay Period)</label>
              <input
                type="text"
                required
                value={formData.payPeriod}
                onChange={(e) => setFormData({ ...formData, payPeriod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500"
                placeholder="26/01/2568 - 25/02/2568"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">วันที่สั่งจ่าย (Pay Date)</label>
              <input
                type="text"
                required
                value={formData.payDate}
                onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500"
                placeholder="28 กุมภาพันธ์ 2568"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">เบอร์โทรศัพท์ติดต่อ (Phone)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500"
                placeholder="02-123-4567"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">อีเมลองค์กร (Email)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500"
                placeholder="hr@workpulse.co.th"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              บันทึกข้อมูลบริษัท
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
