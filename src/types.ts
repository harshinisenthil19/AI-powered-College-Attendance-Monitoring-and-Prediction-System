export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type RiskLevel = 'GOOD' | 'WARNING' | 'AT_RISK';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  studentId?: string; // e.g. "CS2023041"
  teacherId?: string; // e.g. "FAC-102"
}

export interface Student {
  id: string;
  rollNumber: string; // e.g. "23CS101"
  name: string;
  email: string;
  department: string; // e.g. "Computer Science & Engineering"
  year: number; // 1, 2, 3, 4
  semester: number; // 1-8
  section: string; // "A", "B", "C"
  phone: string;
  parentPhone: string;
  attendancePercentage: number;
  totalClassesHeld: number;
  totalClassesAttended: number;
  riskStatus: RiskLevel;
  warningAlertSent: boolean;
}

export interface Subject {
  id: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Data Structures & Algorithms"
  department: string;
  semester: number;
  credits: number;
  teacherId: string;
  teacherName: string;
  totalPlannedClasses: number;
  conductedClasses: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedByTeacherId: string;
  remarks?: string;
  markedAt: string;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  conductedClasses: number;
  attendedClasses: number;
  percentage: number;
  status: RiskLevel;
}

export interface StudentPrediction {
  studentId: string;
  rollNumber: string;
  studentName: string;
  department: string;
  semester: number;
  currentAttendancePct: number;
  totalHeld: number;
  totalAttended: number;
  totalPlannedSemesterClasses: number;
  remainingClasses: number;
  recentTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  trendSlope: number; // percentage change per week
  predictedFinalPct: number;
  riskStatus: RiskLevel;
  requiredClassesTo75: number;
  requiredClassesTo85: number;
  maxCanAffordToMiss: number;
  aiExplanation: string;
  subjectPredictions: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    currentPct: number;
    predictedPct: number;
    status: RiskLevel;
    classesNeededFor75: number;
  }[];
}

export interface WarningAlert {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  date: string;
  percentage: number;
  message: string;
  severity: 'WARNING' | 'CRITICAL';
  acknowledged: boolean;
}
