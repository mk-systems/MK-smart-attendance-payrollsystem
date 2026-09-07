import React, { useState } from 'react';
import { GoogleWorkspaceService } from '../services/googleWorkspace';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSheetsConnected: boolean;
  onConnectOAuth: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  isSheetsConnected,
  onConnectOAuth,
  onShowToast,
}) => {
  const [sheetId, setSheetId] = useState('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [driveFolder, setDriveFolder] = useState('WorkPulse_Selfies_2026');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);

  if (!isOpen) return null;

  const handleCreateNewSheet = async () => {
    setIsCreatingSheet(true);
    const result = await GoogleWorkspaceService.createMonthlyPayrollSheet('WorkPulse_Attendance_Master_2026');
    setIsCreatingSheet(false);

    if (result.success && result.spreadsheetId) {
      setSheetId(result.spreadsheetId);
      onShowToast('สร้าง Google Sheet สำเร็จ!', `สร้าง Sheet ID: ${result.spreadsheetId}`, 'table_chart');
    } else {
      onShowToast('Google Sheets API Status', result.message, 'info');
    }
  };

  const handleTestAppend = async () => {
    const now = new Date();
    const result = await GoogleWorkspaceService.appendAttendanceToSheet(sheetId, {
      empId: 'DEV-0042',
      empName: 'สมศักดิ์ มั่นคง',
      type: 'CHECK_IN',
      mode: 'onsite',
      lat: 13.736717,
      lng: 100.523186,
      dist: 14.8,
      note: 'ทดสอบระบบบันทึกเวลา Google Sheets',
      timestamp: now.toISOString()
    });

    onShowToast(result.success ? 'สำเร็จ!' : 'สถานะการเชื่อมต่อ', result.message, result.success ? 'check_circle' : 'cloud_done');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-white">Google Workspace Integration</h4>
              <p className="text-[11px] text-slate-400">เชื่อมต่อ Google Sheets & Google Drive API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isSheetsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
              <div>
                <p className="font-bold text-[13px] text-white">
                  {isSheetsConnected ? 'Google Account Connected' : 'Google Account Not Authenticated'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isSheetsConnected ? 'OAuth 2.0 Scopes Granted: spreadsheets & drive.file' : 'กดปุ่มด้านล่างเพื่อเชื่อมต่อบัญชี Google Workspace'}
                </p>
              </div>
            </div>

            {!isSheetsConnected && (
              <button
                onClick={onConnectOAuth}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-lg shadow-indigo-600/30"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Target Spreadsheet ID */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 block">Google Spreadsheet ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl border border-slate-800 font-mono text-[11px] bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
                placeholder="ป้อน Spreadsheet ID..."
              />
              <button
                onClick={handleCreateNewSheet}
                disabled={isCreatingSheet}
                className="px-3.5 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 font-semibold text-[11px] border border-indigo-500/30 whitespace-nowrap"
              >
                {isCreatingSheet ? 'กำลังสร้าง...' : 'สร้าง Sheet ใหม่'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              ข้อมูลการตอกบัตรเข้า-ออกงานจะถูก append ลงในแท็บ `Attendance` ของ Sheet นี้
            </p>
          </div>

          {/* Drive Folder */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 block">Google Drive Target Folder</label>
            <input
              type="text"
              value={driveFolder}
              onChange={(e) => setDriveFolder(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-800 font-mono text-[11px] bg-slate-950 text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-400">
              รูปถ่าย selfie Face Verification จะบันทึกเป็น WebP ลงในโฟลเดอร์นี้
            </p>
          </div>

          {/* Test Buttons */}
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button
              onClick={handleTestAppend}
              className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[12px] flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              ทดสอบส่งข้อมูลลง Google Sheet
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800 font-semibold text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
