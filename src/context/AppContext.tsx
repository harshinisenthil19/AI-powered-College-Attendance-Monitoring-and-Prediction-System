import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_USERS,
  INITIAL_WARNING_ALERTS,
  generateInitialAttendanceRecords
} from '../data/mockData';
import {
  AttendanceRecord,
  AttendanceStatus,
  Student,
  Subject,
  User,
  WarningAlert
} from '../types';
import { calculateStandardAttendance, computeRiskLevel } from '../utils/aiPredictionEngine';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  students: Student[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  alerts: WarningAlert[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (user: User) => void;
  addStudent: (studentData: Omit<Student, 'id' | 'attendancePercentage' | 'totalClassesHeld' | 'totalClassesAttended' | 'riskStatus' | 'warningAlertSent'>) => void;
  updateStudent: (id: string, studentData: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addSubject: (subjectData: Omit<Subject, 'id' | 'conductedClasses'>) => void;
  updateSubject: (id: string, subjectData: Partial<Subject>) => void;
  markBatchAttendance: (
    date: string,
    subjectId: string,
    entries: { studentId: string; status: AttendanceStatus; remarks?: string }[]
  ) => void;
  updateSingleAttendance: (recordId: string, status: AttendanceStatus, remarks?: string) => void;
  sendLowAttendanceAlert: (studentId: string, customMessage?: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'apex_attendance_user',
  STUDENTS: 'apex_attendance_students',
  SUBJECTS: 'apex_attendance_subjects',
  RECORDS: 'apex_attendance_records',
  ALERTS: 'apex_attendance_alerts',
  ACTIVE_TAB: 'apex_attendance_active_tab'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage fallbacks
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    // Default to teacher Dr. Sarah Jenkins for rich initial view
    return INITIAL_USERS[0];
  });

  const [users] = useState<User[]>(INITIAL_USERS);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_STUDENTS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_SUBJECTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return generateInitialAttendanceRecords();
  });

  const [alerts, setAlerts] = useState<WarningAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_WARNING_ALERTS;
  });

  const [activeTab, setActiveTabState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    return saved || 'dashboard';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
  };

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  // Recalculate student overall stats when records change
  const recalculateStudentStats = (allRecords: AttendanceRecord[]) => {
    setStudents(prevStudents =>
      prevStudents.map(student => {
        const studentRecords = allRecords.filter(r => r.studentId === student.id);
        const { totalHeld, totalAttended, percentage } = calculateStandardAttendance(studentRecords);
        const riskStatus = computeRiskLevel(percentage);
        return {
          ...student,
          totalClassesHeld: totalHeld,
          totalClassesAttended: totalAttended,
          attendancePercentage: percentage,
          riskStatus
        };
      })
    );
  };

  const login = (username: string, _password?: string): boolean => {
    const matched = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() ||
           u.email.toLowerCase() === username.trim().toLowerCase()
    );
    if (matched) {
      setCurrentUser(matched);
      setActiveTab('dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const addStudent = (
    studentData: Omit<Student, 'id' | 'attendancePercentage' | 'totalClassesHeld' | 'totalClassesAttended' | 'riskStatus' | 'warningAlertSent'>
  ) => {
    const newId = `std-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      attendancePercentage: 100,
      totalClassesHeld: 0,
      totalClassesAttended: 0,
      riskStatus: 'GOOD',
      warningAlertSent: false
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, studentData: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...studentData } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.studentId !== id));
  };

  const addSubject = (subjectData: Omit<Subject, 'id' | 'conductedClasses'>) => {
    const newId = `sub-${Date.now()}`;
    const newSubject: Subject = {
      ...subjectData,
      id: newId,
      conductedClasses: 0
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (id: string, subjectData: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...subjectData } : s)));
  };

  const markBatchAttendance = (
    date: string,
    subjectId: string,
    entries: { studentId: string; status: AttendanceStatus; remarks?: string }[]
  ) => {
    const targetSubject = subjects.find(s => s.id === subjectId);
    if (!targetSubject) return;

    // Filter out previous records for this date & subject
    const otherRecords = attendanceRecords.filter(
      r => !(r.date === date && r.subjectId === subjectId)
    );

    const now = new Date().toISOString();
    const newRecords: AttendanceRecord[] = entries.map((entry, idx) => {
      const student = students.find(s => s.id === entry.studentId);
      return {
        id: `rec-${Date.now()}-${idx}`,
        studentId: entry.studentId,
        studentName: student?.name || 'Unknown',
        rollNumber: student?.rollNumber || '',
        subjectId: targetSubject.id,
        subjectCode: targetSubject.code,
        subjectName: targetSubject.name,
        date,
        status: entry.status,
        markedByTeacherId: currentUser?.teacherId || 'FAC-00',
        markedAt: now,
        remarks: entry.remarks
      };
    });

    const updatedRecords = [...otherRecords, ...newRecords];
    setAttendanceRecords(updatedRecords);

    // Update conducted classes count for subject
    const subjectDateSet = new Set(
      updatedRecords.filter(r => r.subjectId === subjectId).map(r => r.date)
    );
    updateSubject(subjectId, { conductedClasses: subjectDateSet.size });

    // Recalculate stats for all affected students
    recalculateStudentStats(updatedRecords);
  };

  const updateSingleAttendance = (recordId: string, status: AttendanceStatus, remarks?: string) => {
    const updated = attendanceRecords.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          status,
          remarks: remarks !== undefined ? remarks : r.remarks,
          markedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setAttendanceRecords(updated);
    recalculateStudentStats(updated);
  };

  const sendLowAttendanceAlert = (studentId: string, customMessage?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newAlert: WarningAlert = {
      id: `alt-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      date: new Date().toISOString().split('T')[0],
      percentage: student.attendancePercentage,
      message: customMessage || `Official low attendance alert issued to ${student.name} (${student.rollNumber}). Current attendance is ${student.attendancePercentage}%. Minimum required is 75%.`,
      severity: student.attendancePercentage < 65 ? 'CRITICAL' : 'WARNING',
      acknowledged: false
    };

    setAlerts(prev => [newAlert, ...prev]);
    updateStudent(studentId, { warningAlertSent: true });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setCurrentUser(INITIAL_USERS[0]);
    setStudents(INITIAL_STUDENTS);
    setSubjects(INITIAL_SUBJECTS);
    setAttendanceRecords(generateInitialAttendanceRecords());
    setAlerts(INITIAL_WARNING_ALERTS);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        students,
        subjects,
        attendanceRecords,
        alerts,
        activeTab,
        setActiveTab,
        login,
        logout,
        switchUser,
        addStudent,
        updateStudent,
        deleteStudent,
        addSubject,
        updateSubject,
        markBatchAttendance,
        updateSingleAttendance,
        sendLowAttendanceAlert,
        acknowledgeAlert,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
