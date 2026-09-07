import React, { useState } from 'react';

interface ProfilePageProps {
  currentUser: any;
  onBack: () => void;
  onShowToast: (title: string, message: string, icon?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onBack,
  onShowToast,
}) => {
  // Toggle states
  const [notifyPunch, setNotifyPunch] = useState(true);
  const [notifyPayslip, setNotifyPayslip] = useState(true);
  const [notifyLine, setNotifyLine] = useState(true);

  const [gpsAuto, setGpsAuto] = useState(true);
  const [faceVerification, setFaceVerification] = useState(true);

  const [language, setLanguage] = useState<'th' | 'en'>('th');
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(currentUser.email);
    onShowToast('คัดลอกอีเมลสำเร็จ', `คัดลอก ${currentUser.email} ลงคลิปบอร์ดแล้ว`, 'content_copy');
  };

  const handleCallPhone = () => {
    onShowToast('โทรออก', `กำลังโทรออกไปยัง ${currentUser.phone}...`, 'phone_in_talk');
  };

  const handleSignOut = () => {
    if (window.confirm('คุณต้องการออกจากระบบ WorkPulse Hub หรือไม่?')) {
      onShowToast('ออกจากระบบสำเร็จ', 'เซสชันการลงเวลาและสิทธิ์การเข้าถึงถูกยุติตามมาตรฐานความปลอดภัย', 'logout');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-2 pb-24 space-y-6">
      {/* Top Header Bar for Profile */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[16px] font-bold text-white">โปรไฟล์และการตั้งค่า</h1>
            <p className="text-[11px] text-slate-400 font-medium">WorkPulse Hub • บัญชีผู้ปฏิบัติงาน</p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            onShowToast(
              isEditing ? 'บันทึกการแก้ไข' : 'โหมดแก้ไขโปรไฟล์',
              isEditing ? 'อัปเดตข้อมูลส่วนตัวเรียบร้อย' : 'คุณสามารถแก้ไขข้อมูลผู้ใช้งานได้',
              'edit'
            );
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[12px] font-semibold hover:bg-indigo-500/30 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">{isEditing ? 'check' : 'edit'}</span>
          <span>{isEditing ? 'เสร็จสิ้น' : 'แก้ไข'}</span>
        </button>
      </div>

      {/* 1. HERO PROFILE CARD */}
      <section className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* User Header */}
        <div className="flex items-start gap-4 relative z-10">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-slate-900 p-0.5 rounded-full shadow-xs">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {currentUser.status}
              </span>
            </div>
            <h2 className="text-[20px] font-bold text-white truncate">{currentUser.name}</h2>
            <p className="text-[12px] text-slate-400 mb-1">{currentUser.nameEn}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[12px] bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-indigo-300 font-semibold">
                {currentUser.empId}
              </span>
              <span className="text-[12px] text-slate-200 font-semibold">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Department Meta */}
        <div className="grid grid-cols-1 gap-2 pt-3 border-t border-slate-800 text-[12px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-[18px]">domain</span>
            <span>{currentUser.dept}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-[18px]">location_on</span>
            <span>{currentUser.branch}</span>
          </div>
        </div>

        {/* Bento Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-[11px] text-slate-400 font-semibold mb-0.5 line-clamp-1">ลาพักร้อนคงเหลือ</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-mono text-[22px] text-indigo-400 font-bold">{currentUser.leaveQuota}</span>
              <span className="text-[12px] text-slate-400">วัน</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-[11px] text-slate-400 font-semibold mb-0.5 line-clamp-1">ตรงเวลาต่องวด</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-mono text-[22px] text-emerald-400 font-bold">{currentUser.punctualityRate}</span>
              <span className="text-[12px] text-slate-400">%</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
            <span className="text-[11px] text-slate-400 font-semibold mb-0.5 line-clamp-1">OT สะสมรอบนี้</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-mono text-[22px] text-white font-bold">{currentUser.accumulatedOT}</span>
              <span className="text-[12px] text-slate-400">ชม.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACCOUNT & WORK DETAILS */}
      <section className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[20px]">badge</span>
            ข้อมูลบัญชีและการทำงาน
          </h3>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            ยืนยันแล้ว
          </span>
        </div>

        <div className="divide-y divide-slate-800 text-[13px]">
          {/* Work Email */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">mail</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">อีเมลองค์กร</p>
                <p className="font-medium text-slate-200">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              className="text-slate-500 hover:text-indigo-400 active:scale-95 transition-all p-1"
              title="คัดลอกอีเมล"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
          </div>

          {/* Phone */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">call</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">เบอร์โทรศัพท์ติดต่อ</p>
                <p className="font-medium text-slate-200 font-mono">{currentUser.phone}</p>
              </div>
            </div>
            <button
              onClick={handleCallPhone}
              className="text-slate-500 hover:text-indigo-400 active:scale-95 transition-all p-1"
              title="โทรออก"
            >
              <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
            </button>
          </div>

          {/* LINE & GAS Connection */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">sync</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">การเชื่อมต่อระบบเตือน (LINE & GAS)</p>
                <p className="font-medium text-slate-200">เชื่อมต่อแล้ว (Connected)</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20"></span>
          </div>

          {/* Bank Account */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">account_balance</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">บัญชีรับเงินเดือน</p>
                <p className="font-medium text-slate-200">{currentUser.bankName}</p>
                <p className="font-mono text-[12px] text-slate-400">{currentUser.bankAcc}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-[18px]">lock</span>
          </div>
        </div>
      </section>

      {/* 3. NOTIFICATION PREFERENCES */}
      <section className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[20px]">notifications_active</span>
          <h3 className="text-[16px] font-bold text-white">การแจ้งเตือน (Notifications)</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="pr-2">
              <p className="font-medium text-[14px] text-slate-200">แจ้งเตือนเวลาเข้า-ออกงาน</p>
              <p className="text-[12px] text-slate-400">แจ้งล่วงหน้า 10 นาที (08:50 น. และ 18:00 น.)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={notifyPunch}
                onChange={(e) => setNotifyPunch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="pr-2">
              <p className="font-medium text-[14px] text-slate-200">แจ้งเตือนสลิปเงินเดือนออก</p>
              <p className="text-[12px] text-slate-400">รับการแจ้งเตือนทันทีเมื่อระบบอนุมัติเงินได้รอบเดือน</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={notifyPayslip}
                onChange={(e) => setNotifyPayslip(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="pr-2">
              <p className="font-medium text-[14px] text-slate-200">แจ้งเตือนผ่าน LINE Notify</p>
              <p className="text-[12px] text-slate-400">ส่งข้อความยืนยันการตอกบัตรเข้าสู่แชทส่วนตัว</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={notifyLine}
                onChange={(e) => setNotifyLine(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & GPS PREFERENCES */}
      <section className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[20px]">security</span>
          <h3 className="text-[16px] font-bold text-white">ความปลอดภัยและตำแหน่ง (Security & GPS)</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="pr-2">
              <p className="font-medium text-[14px] text-slate-200">บันทึกพิกัดอัตโนมัติ (High Precision GPS)</p>
              <p className="text-[12px] text-slate-400">ตรวจจับ Geofence รัศมี 100 เมตรของอาคารสำนักงาน</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={gpsAuto}
                onChange={(e) => setGpsAuto(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="pr-2">
              <p className="font-medium text-[14px] text-slate-200">การยืนยันตัวตนด้วยใบหน้า (Face Verification)</p>
              <p className="text-[12px] text-slate-400">สแกนใบหน้าป้องกันการตอกบัตรแทนกันด้วย AI Anti-Spoofing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={faceVerification}
                onChange={(e) => setFaceVerification(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-medium text-[14px] text-slate-200">อุปกรณ์ที่ลงทะเบียนไว้</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-slate-400">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">phone_iphone</span>
                <span>{currentUser.registeredDevice}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-[20px]">chevron_right</span>
          </div>
        </div>
      </section>

      {/* 5. LANGUAGE & DISPLAY */}
      <section className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-400 text-[20px]">translate</span>
          <h3 className="text-[16px] font-bold text-white">ภาษาและการแสดงผล (Language & Display)</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[14px] text-slate-200">ภาษาของระบบ (Language)</p>
              <p className="text-[12px] text-slate-400">แสดงผลทั้งภาษาไทยและอังกฤษ</p>
            </div>
            <div className="inline-flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setLanguage('th')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-xl transition-all ${
                  language === 'th' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                ไทย
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-[11px] font-semibold rounded-xl transition-all ${
                  language === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <p className="font-medium text-[14px] text-slate-200">รูปแบบเวลา (Time Format)</p>
              <p className="text-[12px] text-slate-400">การแสดงผลชั่วโมงการทำงาน</p>
            </div>
            <span className="font-mono text-[13px] bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300">
              24-Hour (18:30 น.)
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <p className="font-medium text-[14px] text-slate-200">โหมดแสดงผล (Appearance)</p>
              <p className="text-[12px] text-slate-400">ธีม Bento Grid Dark Mode</p>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px]">dark_mode</span>
              <span>มืด (Bento Dark)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HELP & SYSTEM INFO */}
      <section className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 divide-y divide-slate-800">
        <a
          href="#faq"
          onClick={(e) => {
            e.preventDefault();
            onShowToast('คู่มือการใช้งาน', 'แสดง FAQ ระบบตอกบัตร และคำถามที่พบบ่อย', 'help_center');
          }}
          className="py-3 flex items-center justify-between text-slate-200 hover:text-indigo-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-500 text-[20px]">help_center</span>
            <span className="font-medium text-[14px]">คู่มือการใช้งานระบบตอกบัตร & FAQ</span>
          </div>
          <span className="material-symbols-outlined text-slate-500 text-[20px]">open_in_new</span>
        </a>

        <a
          href="#hr"
          onClick={(e) => {
            e.preventDefault();
            onShowToast('ติดต่อ HR Support', 'ส่งข้อความถึงทีมทรัพยากรบุคคล (HR-0004)', 'support_agent');
          }}
          className="py-3 flex items-center justify-between text-slate-200 hover:text-indigo-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-500 text-[20px]">support_agent</span>
            <span className="font-medium text-[14px]">ติดต่อฝ่ายทรัพยากรบุคคล (HR Support)</span>
          </div>
          <span className="material-symbols-outlined text-slate-500 text-[20px]">chevron_right</span>
        </a>

        <div className="py-3 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-500 text-[20px]">info</span>
            <div>
              <p className="font-medium text-[14px] text-slate-200">เวอร์ชันระบบ WorkPulse Hub</p>
              <p className="text-[11px] text-slate-500">v2.4 (Enterprise Webhook Build)</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-400">
            ล่าสุด
          </span>
        </div>
      </section>

      {/* 7. ACTION BUTTONS */}
      <section className="space-y-3 pt-2">
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            onShowToast('แก้ไขข้อมูลส่วนตัว', 'เปิดโหมดปรับแต่งชื่อ ตำแหน่ง และข้อมูลส่วนบุคคล', 'manage_accounts');
          }}
          className="w-full py-3.5 px-4 rounded-2xl border border-slate-800 bg-slate-900 text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-95 shadow-xl"
        >
          <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
          <span>แก้ไขข้อมูลส่วนตัว (Edit Profile Details)</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-400 font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-rose-900/50 transition-colors active:scale-95 shadow-lg"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>ออกจากระบบ (Sign Out)</span>
        </button>

        <p className="text-center text-[11px] text-slate-500 pt-1 font-semibold">
          WorkPulse System Security • End-to-End Encrypted Session
        </p>
      </section>
    </div>
  );
};
