/**
 * Shared API response types for EduFlow FastAPI backend.
 * Replaces Prisma auto-generated types in the decoupled architecture.
 */

export type Role = "OWNER" | "TEACHER" | "STUDENT";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type FeeStatus = "PAID" | "UNPAID" | "PARTIAL";

export interface Institute {
  id: string;
  name: string;
  logoUrl?: string | null;
  address?: string | null;
}

export interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  subject?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  instituteId: string;
}

export interface Student {
  id: string;
  userId?: string | null;
  fullName: string;
  rollNo?: string | null;
  photoUrl?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  instituteId: string;
  isActive: boolean;
}

export interface Batch {
  id: string;
  name: string;
  subject?: string | null;
  schedule?: string | null;
  teacherId?: string | null;
  instituteId: string;
  teacher?: Teacher | null;
  studentBatches?: StudentBatch[];
  attendances?: Attendance[];
}

export interface StudentBatch {
  id: string;
  studentId: string;
  batchId: string;
  student: Student;
  batch?: Batch;
}

export interface Attendance {
  id: string;
  studentId: string;
  batchId: string;
  date: string;
  status: AttendanceStatus;
}

export interface Fee {
  id: string;
  studentId: string;
  batchId?: string | null;
  amount: number;
  status: FeeStatus;
  monthYear?: string | null;
  paymentDate?: string | null;
  student?: Student;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category?: string | null;
  date: string;
  instituteId: string;
}

export interface Result {
  id: string;
  studentId: string;
  batchId: string;
  examName: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade?: string | null;
  student?: Student;
  batch?: Batch;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetRole?: Role | null;
  instituteId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  createdAt: string;
  user?: { fullName?: string; email: string };
}

export interface DashboardKpi {
  totalStudents: number;
  totalTeachers: number;
  totalBatches: number;
  totalRevenue: number;
  totalExpenses: number;
  attendanceTodayCount: number;
}
