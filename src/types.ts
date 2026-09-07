/**
 * WorkPulse Hub Type Definitions
 */

export type ViewMode = 'employee' | 'admin' | 'profile';

export type MobileTab = 'punch' | 'history' | 'payroll' | 'team';

export type WorkMode = 'onsite' | 'wfh' | 'client';

export type PunchType = 'CHECK_IN' | 'CHECK_OUT';

export interface AttendanceRecord {
  id: string;
  empId: string;
  empName: string;
  avatar: string;
  role: string;
  timestamp: string;
  dateStr: string;
  type: PunchType;
  statusTag: string; // 'ตรงเวลา' | 'OT 2.5 ชม.' | 'สาย 18 นาที' | 'WFH Verified'
  statusColor: 'secondary' | 'primary' | 'error' | 'neutral';
  location: string;
  distanceMeter: number;
  workMode: WorkMode;
  workModeLabel: string;
  note?: string;
  imageSize?: string;
  photoUrl: string;
  financialAdjustment?: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  taxId: string;
  branch: string;
  phone: string;
  email: string;
  payPeriod: string;
  payDate: string;
}

export interface EmployeePayroll {
  empId: string;
  empName: string;
  role: string;
  dept: string;
  avatar: string;
  workDays: string; // e.g. "22/22 วัน"
  baseSalary: number;
  otPay: number;
  lateDeduction: number;
  ssoDeduction: number;
  taxDeduction: number;
  netPay: number;
  status: 'active' | 'late' | 'leave';
  bankAcc?: string;
  address?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  passcode?: string;
}

export interface AdminOrganization {
  id: string;
  orgName: string;
  adminName: string;
  adminEmail: string;
  adminPin: string; // Admin password/PIN
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  icon: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
