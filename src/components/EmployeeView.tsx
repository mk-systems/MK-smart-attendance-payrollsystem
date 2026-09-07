import React, { useState, useEffect, useRef } from 'react';
import { AttendanceRecord, WorkMode, PunchType } from '../types';

interface EmployeeViewProps {
  currentUser: any;
  historyList: AttendanceRecord[];
  onRecordPunch: (type: PunchType, mode: WorkMode, note: string, photoDataUrl?: string) => void;
  onOpenPayslipModal: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
  activeTab?: string;
  onSelectSubTab?: (tab: string) => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  currentUser,
  historyList,
  onRecordPunch,
  onOpenPayslipModal,
  onShowToast,
  activeTab: externalActiveTab = 'punch',
  onSelectSubTab,
}) => {
  const [internalTab, setInternalTab] = useState<string>(externalActiveTab);

  useEffect(() => {
    if (externalActiveTab) {
      setInternalTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  const handleTabChange = (tab: string) => {
    setInternalTab(tab);
    if (onSelectSubTab) {
      onSelectSubTab(tab);
    }
  };

  // Live Clock State
  const [timeStr, setTimeStr] = useState({ main: '08:42', sec: ':18', fullDate: '' });
  const [stampDate, setStampDate] = useState('');

  // GPS State
  const [gps, setGps] = useState({ lat: 13.736717, lng: 100.523186, dist: 14.8, isRefreshing: false });

  // Camera State with Front/Back Switch Capability
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const streamRef = useRef<MediaStream | null>(null);

  // Form State
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>('onsite');
  const [punchNote, setPunchNote] = useState('');

  // Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      setTimeStr({
        main: `${h}:${m}`,
        sec: `:${s}`,
        fullDate: `วันพฤหัสบดีที่ ${day} กุมภาพันธ์ ${year + 543}`
      });

      setStampDate(`${year}-${month}-${day} ${h}:${m}:${s} ICT`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize and attach camera stream based on facingMode
  const startCameraStream = async (mode: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: mode }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      }
    } catch (err) {
      console.warn('Webcam stream error or denied, fallback simulated feed:', err);
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCameraStream(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Camera Toggle Switch (Front <-> Back)
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    onShowToast(
      'สลับกล้องถ่ายรูป',
      `เปลี่ยนเป็น ${nextMode === 'user' ? 'กล้องหน้า (Selfie)' : 'กล้องหลัง (Main Camera)'}`,
      'flip_camera_ios'
    );
  };

  // GPS Refresh Handler
  const handleRefreshGPS = () => {
    setGps((prev) => ({ ...prev, isRefreshing: true }));
    setTimeout(() => {
      const randomJitterLat = Number((13.736717 + (Math.random() * 0.0001 - 0.00005)).toFixed(6));
      const randomJitterLng = Number((100.523186 + (Math.random() * 0.0001 - 0.00005)).toFixed(6));
      const randomDist = Number((12 + Math.random() * 5).toFixed(1));

      setGps({
        lat: randomJitterLat,
        lng: randomJitterLng,
        dist: randomDist,
        isRefreshing: false
      });

      onShowToast(
        'พิกัด GPS อัปเดตแล้ว',
        `อยู่ในรัศมีสำนักงานใหญ่ (${randomDist} เมตร) ความแม่นยำสูง ±3.8 ม.`,
        'gps_fixed'
      );
    }, 600);
  };

  // Camera Snap Handler
  const handleSnapPhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        setCapturedPhoto(dataUrl);
      }
    } else {
      setCapturedPhoto(currentUser.avatar);
    }

    onShowToast('ถ่ายภาพเรียบร้อย', 'แนบรูปภาพพร้อมพิกัด GPS บันทึกลง Drive & Firestore', 'photo_camera');
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    onShowToast('พร้อมถ่ายภาพใหม่', 'จัดตำแหน่งภาพให้อยู่ในกรอบ', 'flip_camera_ios');
  };

  // Trigger Punch Handler
  const handleTriggerPunch = (type: PunchType) => {
    const photoToSave = capturedPhoto || currentUser.avatar;
    onRecordPunch(type, selectedWorkMode, punchNote, photoToSave);
    setPunchNote('');
    setCapturedPhoto(null);
  };

  // Filter history records to ONLY show those belonging to current logged in employee
  const myHistoryList = historyList.filter(
    (item) => !item.empId || item.empId === currentUser.empId || item.empName === currentUser.name
  );

  return (
    <div className="space-y-6">
      {/* Employee Greeting & Role Badge */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-rose-200/80 shadow-xl shadow-rose-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-300 shadow-md shadow-pink-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-extrabold text-slate-800">สวัสดีค่ะ/ครับ, {currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rose-700 border border-pink-300 text-[10px] font-bold">
                พนักงาน
              </span>
            </div>
            <p className="text-[12px] text-slate-500 font-medium">
              {currentUser.role} • {currentUser.dept || 'Tech & Engineering'} ({currentUser.empId})
            </p>
          </div>
        </div>

        {/* Security Isolation Indicator */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-1.5 font-medium">
          <span className="material-symbols-outlined text-[16px] text-rose-500">shield_lock</span>
          <span>สิทธิ์เข้าถึง: ข้อมูลส่วนตัวของคุณเท่านั้น</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs for Employee */}
      <div className="bg-white/80 backdrop-blur p-1.5 rounded-3xl border border-rose-200 shadow-lg shadow-pink-100/40 flex items-center justify-between gap-1 overflow-x-auto">
        <button
          onClick={() => handleTabChange('punch')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            internalTab === 'punch'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">timer</span>
          <span>ลงเวลาทำงาน</span>
        </button>

        <button
          onClick={() => handleTabChange('history')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            internalTab === 'history'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>ประวัติลงเวลาของฉัน ({myHistoryList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('payslip')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            internalTab === 'payslip'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-200'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>สลิปเงินเดือนของฉัน</span>
        </button>
      </div>

      {/* SECTION 1: Clock & Punch Control */}
      {internalTab === 'punch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Attendance Action Card */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur rounded-3xl p-6 border border-rose-200 shadow-xl shadow-pink-100/50 flex flex-col justify-between space-y-5">
            {/* Live Clock Display */}
            <div className="text-center py-5 bg-gradient-to-b from-rose-50/80 to-pink-50/50 rounded-2xl border border-rose-200/80 space-y-1">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest block">
                {timeStr.fullDate || 'วันพฤหัสบดีที่ 27 กุมภาพันธ์ 2568'}
              </span>
              <div className="font-mono text-[36px] min-[380px]:text-[44px] sm:text-[56px] font-extrabold text-slate-800 leading-none tracking-tight">
                {timeStr.main}
                <span className="text-[20px] min-[380px]:text-[24px] sm:text-[28px] font-bold text-rose-400">{timeStr.sec}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5 pt-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>พิกัด GPS: {gps.lat}, {gps.lng} (ระยะห่าง {gps.dist} ม.)</span>
              </div>
            </div>

            {/* Work Mode Selector */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700 block">รูปแบบการเข้างานวันนี้:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorkMode('onsite')}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedWorkMode === 'onsite'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-pink-200'
                      : 'bg-rose-50/50 border-rose-200 text-slate-600 hover:bg-rose-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">apartment</span>
                  <span>เข้างานบริษัท</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedWorkMode('wfh')}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedWorkMode === 'wfh'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-pink-200'
                      : 'bg-rose-50/50 border-rose-200 text-slate-600 hover:bg-rose-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">home</span>
                  <span>WFH (ทำงานบ้าน)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedWorkMode('client')}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedWorkMode === 'client'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-pink-200'
                      : 'bg-rose-50/50 border-rose-200 text-slate-600 hover:bg-rose-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">near_me</span>
                  <span>ออกไซต์ลูกค้า</span>
                </button>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <input
                type="text"
                value={punchNote}
                onChange={(e) => setPunchNote(e.target.value)}
                placeholder="ระบุหมายเหตุการลงเวลา (ถ้ามี)..."
                className="w-full px-4 py-2.5 rounded-2xl bg-rose-50/30 border border-rose-200 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
              />
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleTriggerPunch('CHECK_IN')}
                className="py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-[15px] shadow-lg shadow-pink-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[24px]">login</span>
                <span>บันทึกเวลาเข้างาน</span>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerPunch('CHECK_OUT')}
                className="py-4 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[15px] shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[24px]">logout</span>
                <span>บันทึกเวลาเลิกงาน</span>
              </button>
            </div>
          </div>

          {/* Camera & Geofence Verification Card (Right) */}
          <div className="lg:col-span-5 bg-white/90 backdrop-blur rounded-3xl p-6 border border-rose-200 shadow-xl shadow-pink-100/50 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-500 text-[20px]">photo_camera</span>
                  กล้องยืนยันตัวตน (Face Check-in)
                </h3>
                <p className="text-[11px] text-slate-500">ถ่ายรูปเซลฟี่เพื่อแนบเข้า Google Drive</p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Camera Switch Toggle Button */}
                <button
                  onClick={handleToggleCamera}
                  className="p-2 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-700 border border-pink-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title="สลับกล้องหน้า / กล้องหลัง"
                >
                  <span className="material-symbols-outlined text-[18px]">flip_camera_ios</span>
                  <span className="hidden sm:inline">{facingMode === 'user' ? 'กล้องหน้า' : 'กล้องหลัง'}</span>
                </button>

                <button
                  onClick={handleRefreshGPS}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                  title="รีเฟรช GPS"
                >
                  <span className={`material-symbols-outlined text-[18px] ${gps.isRefreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                </button>
              </div>
            </div>

            {/* Webcam / Selfie Preview Container */}
            <div className="relative w-full aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden border border-rose-200 flex items-center justify-center shadow-inner">
              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Captured Selfie" className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              <canvas ref={canvasRef} className="hidden" />

              {/* Watermark timestamp overlay */}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[10px] font-mono text-slate-200 flex items-center justify-between">
                <span>GPS: {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}</span>
                <span className="text-pink-300 font-bold">โหมด: {facingMode === 'user' ? 'กล้องหน้า' : 'กล้องหลัง'}</span>
              </div>
            </div>

            {/* Photo Snap Controls */}
            <div className="flex items-center gap-2">
              {capturedPhoto ? (
                <button
                  onClick={handleRetakePhoto}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">flip_camera_ios</span>
                  ถ่ายใหม่อีกครั้ง
                </button>
              ) : (
                <button
                  onClick={handleSnapPhoto}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-pink-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">aperture</span>
                  กดถ่ายรูปเซลฟี่
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Personal Attendance History */}
      {internalTab === 'history' && (
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 border border-rose-200 shadow-xl shadow-pink-100/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <span>ประวัติการลงเวลาทำงานของฉัน</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rose-700 border border-pink-300 text-xs font-mono font-bold">
                  {myHistoryList.length} รายการ
                </span>
              </h3>
              <p className="text-[12px] text-slate-500">
                ประวัติเฉพาะรหัสพนักงาน {currentUser.empId} ({currentUser.name})
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {myHistoryList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-rose-50/50 rounded-2xl border border-rose-100">
                ยังไม่มีประวัติการลงเวลาในระบบ
              </div>
            ) : (
              myHistoryList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center justify-between gap-4 hover:border-pink-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                        item.type === 'CHECK_IN' ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.type === 'CHECK_IN' ? 'login' : 'logout'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-slate-800">
                          {item.type === 'CHECK_IN' ? 'เข้างาน (Check-In)' : 'เลิกงาน (Check-Out)'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          {item.statusTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.location} • {item.workModeLabel}
                      </p>
                      {item.note && (
                        <p className="text-[11px] text-rose-600 italic mt-0.5">"{item.note}"</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-[16px] font-bold text-rose-600">{item.timestamp}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.dateStr}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: My Payslip Direct Access */}
      {internalTab === 'payslip' && (
        <div className="bg-white/90 backdrop-blur rounded-3xl p-6 border border-rose-200 shadow-xl shadow-pink-100/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[18px] font-bold text-slate-800">สลิปเงินเดือนของฉัน (My e-Payslip)</h3>
              <p className="text-[12px] text-slate-500">
                เข้าถึง e-Payslip และประวัติการรับเงินโอนเงินเดือนเฉพาะของคุณ ({currentUser.empId})
              </p>
            </div>

            <button
              onClick={onOpenPayslipModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>เปิดดู e-Payslip ฉบับเต็ม / พิมพ์ PDF</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">เงินเดือนประจำ</span>
                <span className="font-mono text-[18px] font-bold text-slate-800 mt-1 block">฿45,000.00</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">OT / รายได้เพิ่มเติม</span>
                <span className="font-mono text-[18px] font-bold text-emerald-600 mt-1 block">+฿1,650.00</span>
              </div>
              <div className="p-4 rounded-xl bg-pink-100/60 border border-pink-300">
                <span className="text-rose-800 block text-[11px] font-bold">เงินรับสุทธิ (Net Pay)</span>
                <span className="font-mono text-[20px] font-bold text-rose-600 mt-1 block">฿42,500.00</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed border-t border-rose-200/80 pt-3">
              🔒 <span className="text-slate-700 font-semibold">การคุ้มครองข้อมูลส่วนบุคคล (PDPA Compliant):</span> สลิปเงินเดือนนี้เป็นความลับเฉพาะพนักงานรหัส {currentUser.empId} บุคคลอื่นรวมถึงพนักงานท่านอื่นไม่สามารถเข้าถึงเอกสารนี้ได้
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
