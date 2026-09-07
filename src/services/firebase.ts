import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AttendanceRecord, EmployeePayroll, AdminOrganization } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance using databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const ATTENDANCE_COLLECTION = 'attendance_records';
const EMPLOYEES_COLLECTION = 'employee_payrolls';
const ADMIN_ORGS_COLLECTION = 'admin_organizations';

export const FirebaseService = {
  // Save new attendance record to Firestore
  async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, record.id);
      await setDoc(docRef, {
        ...record,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving attendance to Firestore:', err);
    }
  },

  // Subscribe to real-time attendance updates
  subscribeAttendance(callback: (records: AttendanceRecord[]) => void) {
    try {
      const q = query(collection(db, ATTENDANCE_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        const records: AttendanceRecord[] = [];
        snapshot.forEach((doc) => {
          records.push(doc.data() as AttendanceRecord);
        });
        records.sort((a, b) => b.id.localeCompare(a.id));
        if (records.length > 0) {
          callback(records);
        }
      }, (err) => {
        console.warn('Firestore snapshot error for attendance:', err);
      });
    } catch (err) {
      console.warn('Firestore attendance sub error:', err);
      return () => {};
    }
  },

  // Save or update employee payroll
  async saveEmployee(emp: EmployeePayroll): Promise<void> {
    try {
      const docRef = doc(db, EMPLOYEES_COLLECTION, emp.empId);
      await setDoc(docRef, {
        ...emp,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving employee to Firestore:', err);
    }
  },

  // Delete employee
  async deleteEmployee(empId: string): Promise<void> {
    try {
      const docRef = doc(db, EMPLOYEES_COLLECTION, empId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting employee from Firestore:', err);
    }
  },

  // Subscribe to employee updates
  subscribeEmployees(callback: (employees: EmployeePayroll[]) => void) {
    try {
      const q = query(collection(db, EMPLOYEES_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        const employees: EmployeePayroll[] = [];
        snapshot.forEach((doc) => {
          employees.push(doc.data() as EmployeePayroll);
        });
        if (employees.length > 0) {
          callback(employees);
        }
      }, (err) => {
        console.warn('Firestore snapshot error for employees:', err);
      });
    } catch (err) {
      console.warn('Firestore employee sub error:', err);
      return () => {};
    }
  },

  // Save or Register new Admin Organization
  async saveAdminOrg(org: AdminOrganization): Promise<void> {
    try {
      const orgId = org.adminEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const docRef = doc(db, ADMIN_ORGS_COLLECTION, orgId);
      await setDoc(docRef, {
        ...org,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving admin organization to Firestore:', err);
    }
  },

  // Subscribe to Admin Organizations
  subscribeAdminOrgs(callback: (orgs: AdminOrganization[]) => void) {
    try {
      const q = query(collection(db, ADMIN_ORGS_COLLECTION));
      return onSnapshot(q, (snapshot) => {
        const orgs: AdminOrganization[] = [];
        snapshot.forEach((doc) => {
          orgs.push(doc.data() as AdminOrganization);
        });
        callback(orgs);
      }, (err) => {
        console.warn('Firestore snapshot error for admin orgs:', err);
      });
    } catch (err) {
      console.warn('Firestore admin orgs sub error:', err);
      return () => {};
    }
  }
};
