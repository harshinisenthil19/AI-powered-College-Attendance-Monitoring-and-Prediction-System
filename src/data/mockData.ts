import { AttendanceRecord, Student, Subject, User, WarningAlert } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'dr.sarah',
    fullName: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@apexcollege.edu',
    role: 'TEACHER',
    teacherId: 'FAC-CS-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-2',
    username: 'prof.rajesh',
    fullName: 'Prof. Rajesh Kumar',
    email: 'rajesh.kumar@apexcollege.edu',
    role: 'TEACHER',
    teacherId: 'FAC-CS-02',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-3',
    username: 'admin',
    fullName: 'Dean of Academics Office',
    email: 'academics@apexcollege.edu',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-4',
    username: 'arjun.sharma',
    fullName: 'Arjun Sharma',
    email: 'arjun.23cs101@apexcollege.edu',
    role: 'STUDENT',
    studentId: 'std-1',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-5',
    username: 'priya.patel',
    fullName: 'Priya Patel',
    email: 'priya.23cs102@apexcollege.edu',
    role: 'STUDENT',
    studentId: 'std-2',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-6',
    username: 'rohit.verma',
    fullName: 'Rohit Verma',
    email: 'rohit.23cs103@apexcollege.edu',
    role: 'STUDENT',
    studentId: 'std-3',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    code: 'CS501',
    name: 'Operating Systems & Kernel Design',
    department: 'Computer Science & Engineering',
    semester: 5,
    credits: 4,
    teacherId: 'FAC-CS-02',
    teacherName: 'Prof. Rajesh Kumar',
    totalPlannedClasses: 36,
    conductedClasses: 22
  },
  {
    id: 'sub-2',
    code: 'CS502',
    name: 'Design & Analysis of Algorithms',
    department: 'Computer Science & Engineering',
    semester: 5,
    credits: 4,
    teacherId: 'FAC-CS-01',
    teacherName: 'Dr. Sarah Jenkins',
    totalPlannedClasses: 40,
    conductedClasses: 24
  },
  {
    id: 'sub-3',
    code: 'CS503',
    name: 'Database Management Systems',
    department: 'Computer Science & Engineering',
    semester: 5,
    credits: 3,
    teacherId: 'FAC-CS-03',
    teacherName: 'Prof. Anita Desai',
    totalPlannedClasses: 32,
    conductedClasses: 20
  },
  {
    id: 'sub-4',
    code: 'CS504',
    name: 'Artificial Intelligence & ML',
    department: 'Computer Science & Engineering',
    semester: 5,
    credits: 4,
    teacherId: 'FAC-CS-01',
    teacherName: 'Dr. Sarah Jenkins',
    totalPlannedClasses: 36,
    conductedClasses: 21
  },
  {
    id: 'sub-5',
    code: 'CS505',
    name: 'Computer Networks & Protocols',
    department: 'Computer Science & Engineering',
    semester: 5,
    credits: 3,
    teacherId: 'FAC-CS-04',
    teacherName: 'Prof. Vikram Mehta',
    totalPlannedClasses: 30,
    conductedClasses: 19
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    rollNumber: '23CS101',
    name: 'Arjun Sharma',
    email: 'arjun.23cs101@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 234-8901',
    parentPhone: '+1 (555) 987-1234',
    attendancePercentage: 68.5,
    totalClassesHeld: 106,
    totalClassesAttended: 73,
    riskStatus: 'AT_RISK',
    warningAlertSent: true
  },
  {
    id: 'std-2',
    rollNumber: '23CS102',
    name: 'Priya Patel',
    email: 'priya.23cs102@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 345-6789',
    parentPhone: '+1 (555) 987-2345',
    attendancePercentage: 94.3,
    totalClassesHeld: 106,
    totalClassesAttended: 100,
    riskStatus: 'GOOD',
    warningAlertSent: false
  },
  {
    id: 'std-3',
    rollNumber: '23CS103',
    name: 'Rohit Verma',
    email: 'rohit.23cs103@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 456-7890',
    parentPhone: '+1 (555) 987-3456',
    attendancePercentage: 62.3,
    totalClassesHeld: 106,
    totalClassesAttended: 66,
    riskStatus: 'AT_RISK',
    warningAlertSent: true
  },
  {
    id: 'std-4',
    rollNumber: '23CS104',
    name: 'Ananya Iyer',
    email: 'ananya.23cs104@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 567-8901',
    parentPhone: '+1 (555) 987-4567',
    attendancePercentage: 77.4,
    totalClassesHeld: 106,
    totalClassesAttended: 82,
    riskStatus: 'WARNING',
    warningAlertSent: false
  },
  {
    id: 'std-5',
    rollNumber: '23CS105',
    name: 'Devansh Kulkarni',
    email: 'devansh.23cs105@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 678-9012',
    parentPhone: '+1 (555) 987-5678',
    attendancePercentage: 88.7,
    totalClassesHeld: 106,
    totalClassesAttended: 94,
    riskStatus: 'GOOD',
    warningAlertSent: false
  },
  {
    id: 'std-6',
    rollNumber: '23CS106',
    name: 'Meera Nambiar',
    email: 'meera.23cs106@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 789-0123',
    parentPhone: '+1 (555) 987-6789',
    attendancePercentage: 76.4,
    totalClassesHeld: 106,
    totalClassesAttended: 81,
    riskStatus: 'WARNING',
    warningAlertSent: false
  },
  {
    id: 'std-7',
    rollNumber: '23CS107',
    name: 'Siddharth Rao',
    email: 'siddharth.23cs107@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 890-1234',
    parentPhone: '+1 (555) 987-7890',
    attendancePercentage: 91.5,
    totalClassesHeld: 106,
    totalClassesAttended: 97,
    riskStatus: 'GOOD',
    warningAlertSent: false
  },
  {
    id: 'std-8',
    rollNumber: '23CS108',
    name: 'Kavya Reddy',
    email: 'kavya.23cs108@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 901-2345',
    parentPhone: '+1 (555) 987-8901',
    attendancePercentage: 59.4,
    totalClassesHeld: 106,
    totalClassesAttended: 63,
    riskStatus: 'AT_RISK',
    warningAlertSent: true
  },
  {
    id: 'std-9',
    rollNumber: '23CS109',
    name: 'Aditya Sen',
    email: 'aditya.23cs109@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 012-3456',
    parentPhone: '+1 (555) 987-9012',
    attendancePercentage: 84.9,
    totalClassesHeld: 106,
    totalClassesAttended: 90,
    riskStatus: 'GOOD',
    warningAlertSent: false
  },
  {
    id: 'std-10',
    rollNumber: '23CS110',
    name: 'Sneha Chatterjee',
    email: 'sneha.23cs110@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 123-4567',
    parentPhone: '+1 (555) 987-0123',
    attendancePercentage: 78.3,
    totalClassesHeld: 106,
    totalClassesAttended: 83,
    riskStatus: 'WARNING',
    warningAlertSent: false
  },
  {
    id: 'std-11',
    rollNumber: '23CS111',
    name: 'Karan Singhania',
    email: 'karan.23cs111@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 234-5678',
    parentPhone: '+1 (555) 987-1122',
    attendancePercentage: 86.8,
    totalClassesHeld: 106,
    totalClassesAttended: 92,
    riskStatus: 'GOOD',
    warningAlertSent: false
  },
  {
    id: 'std-12',
    rollNumber: '23CS112',
    name: 'Tanvi Joshi',
    email: 'tanvi.23cs112@apexcollege.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    semester: 5,
    section: 'A',
    phone: '+1 (555) 345-7890',
    parentPhone: '+1 (555) 987-2233',
    attendancePercentage: 96.2,
    totalClassesHeld: 106,
    totalClassesAttended: 102,
    riskStatus: 'GOOD',
    warningAlertSent: false
  }
];

// Helper to generate calendar dates for past 22 class days
function generateClassDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  let dayOffset = 0;

  while (dates.length < 22) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    const dayOfWeek = d.getDay();
    // Monday (1) to Friday (5) only
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dates.push(d.toISOString().split('T')[0]);
    }
    dayOffset++;
  }
  return dates.reverse();
}

export function generateInitialAttendanceRecords(): AttendanceRecord[] {
  const dates = generateClassDates();
  const records: AttendanceRecord[] = [];
  let recordId = 1;

  // Generate records for each student across subjects and dates
  INITIAL_STUDENTS.forEach(student => {
    // Individual attendance bias (0 to 1)
    let baseBias = 0.85;
    if (student.riskStatus === 'AT_RISK') baseBias = 0.62;
    else if (student.riskStatus === 'WARNING') baseBias = 0.77;
    else if (student.attendancePercentage > 92) baseBias = 0.95;

    dates.forEach((date, dateIdx) => {
      // Rotate 2 subjects per day
      const sub1 = INITIAL_SUBJECTS[dateIdx % INITIAL_SUBJECTS.length];
      const sub2 = INITIAL_SUBJECTS[(dateIdx + 2) % INITIAL_SUBJECTS.length];

      [sub1, sub2].forEach(sub => {
        // pseudo-random determined by student id and dateIdx
        const pseudoRand = ((student.id.charCodeAt(4) * 31 + dateIdx * 17 + sub.code.charCodeAt(2)) % 100) / 100;
        
        let status: 'PRESENT' | 'ABSENT' | 'LATE' = 'PRESENT';
        if (pseudoRand > baseBias) {
          status = pseudoRand > baseBias + 0.1 ? 'ABSENT' : 'LATE';
        }

        records.push({
          id: `rec-${recordId++}`,
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          subjectId: sub.id,
          subjectCode: sub.code,
          subjectName: sub.name,
          date,
          status,
          markedByTeacherId: sub.teacherId,
          markedAt: `${date} 09:30:00`,
          remarks: status === 'ABSENT' ? 'Unexcused absence' : status === 'LATE' ? 'Late by 10 mins' : undefined
        });
      });
    });
  });

  return records;
}

export const INITIAL_WARNING_ALERTS: WarningAlert[] = [
  {
    id: 'alt-1',
    studentId: 'std-1',
    studentName: 'Arjun Sharma',
    rollNumber: '23CS101',
    date: new Date().toISOString().split('T')[0],
    percentage: 68.5,
    message: 'Attendance fallen below mandatory 75% cutoff (Current: 68.5%). Examination debarment risk.',
    severity: 'CRITICAL',
    acknowledged: false
  },
  {
    id: 'alt-2',
    studentId: 'std-3',
    studentName: 'Rohit Verma',
    rollNumber: '23CS103',
    date: new Date().toISOString().split('T')[0],
    percentage: 62.3,
    message: 'Severe attendance deficit (Current: 62.3%). Immediate parent notification & counseling scheduled.',
    severity: 'CRITICAL',
    acknowledged: false
  },
  {
    id: 'alt-3',
    studentId: 'std-8',
    studentName: 'Kavya Reddy',
    rollNumber: '23CS108',
    date: new Date().toISOString().split('T')[0],
    percentage: 59.4,
    message: 'Critical absence pattern in Algorithms and OS. Attendance is at 59.4%.',
    severity: 'CRITICAL',
    acknowledged: false
  },
  {
    id: 'alt-4',
    studentId: 'std-4',
    studentName: 'Ananya Iyer',
    rollNumber: '23CS104',
    date: new Date().toISOString().split('T')[0],
    percentage: 77.4,
    message: 'Attendance warning zone (Current: 77.4%). Safe absence margin exhausted.',
    severity: 'WARNING',
    acknowledged: true
  }
];
