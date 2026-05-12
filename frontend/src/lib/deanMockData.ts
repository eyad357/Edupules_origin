// src/lib/deanMockData.ts
// Comprehensive mock data for the Dean's Command Center

export interface DeanStudent {
  id: string;
  name: string;
  studentId: string;
  department: string;
  year: number;
  gpa: number;
  attendance: number;
  riskLevel: 'Normal' | 'Low' | 'High' | 'Critical';
  riskScore: number;
  trend: 'improving' | 'stable' | 'declining' | 'sudden_drop';
  email: string;
  advisor: string;
  failedCourses: number;
  absences: number;
}

export interface DeanInstructor {
  id: string;
  name: string;
  title: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Teaching Assistant';
  department: string;
  courses: number;
  totalStudents: number;
  successRate: number;
  rating: number;
  email: string;
  avgSuccessRate: number; // college average for comparison
}

export interface DeanCourse {
  id: string;
  code: string;
  name: string;
  department: string;
  year: number;
  instructor: string;
  enrolled: number;
  avgGrade: number;
  attendance: number;
  failRate: number;
  passRate: number;
  semester: string;
  resultsStatus: 'pending' | 'approved' | 'rejected';
}

export interface DeanDepartment {
  id: string;
  name: string;
  shortName: string;
  head: string;
  studentCount: number;
  facultyCount: number;
  avgGpa: number;
  passRate: number;
  trend: 'up' | 'down' | 'stable';
  courses: number;
  atRisk: number;
}

export interface DeanAlert {
  id: string;
  type: 'high_failure' | 'near_dropout' | 'instructor_performance' | 'attendance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  entityId?: string;
  entityName?: string;
}

export interface AttendanceRecord {
  month: string;
  cs: number;
  math: number;
  physics: number;
  chemistry: number;
  biology: number;
  overall: number;
}

export interface ExamResult {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  department: string;
  semester: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  avgScore: number;
  passRate: number;
  failRate: number;
  distribution: { range: string; count: number }[];
}

// ─── Dean Students ────────────────────────────────────────────────────────────

export const deanStudents: DeanStudent[] = [
  { id: 'ds1', name: 'Ahmed Hassan', studentId: 'CS-2021-001', department: 'Computer Science', year: 3, gpa: 3.8, attendance: 92, riskLevel: 'Normal', riskScore: 8, trend: 'stable', email: 'ahmed.hassan@college.edu', advisor: 'Dr. Nour Khalid', failedCourses: 0, absences: 4 },
  { id: 'ds2', name: 'Fatima Al-Zahra', studentId: 'CS-2022-015', department: 'Computer Science', year: 2, gpa: 2.1, attendance: 61, riskLevel: 'High', riskScore: 78, trend: 'declining', email: 'fatima.zahra@college.edu', advisor: 'Dr. Nour Khalid', failedCourses: 2, absences: 18 },
  { id: 'ds3', name: 'Omar Mahmoud', studentId: 'MATH-2020-003', department: 'Mathematics', year: 4, gpa: 3.5, attendance: 88, riskLevel: 'Low', riskScore: 22, trend: 'stable', email: 'omar.mahmoud@college.edu', advisor: 'Dr. Samir Fouad', failedCourses: 0, absences: 6 },
  { id: 'ds4', name: 'Layla Ibrahim', studentId: 'PHYS-2023-007', department: 'Physics', year: 1, gpa: 1.7, attendance: 48, riskLevel: 'Critical', riskScore: 96, trend: 'sudden_drop', email: 'layla.ibrahim@college.edu', advisor: 'Prof. Hamed Saleh', failedCourses: 3, absences: 28 },
  { id: 'ds5', name: 'Yusuf Al-Rashid', studentId: 'CHEM-2021-011', department: 'Chemistry', year: 3, gpa: 3.2, attendance: 79, riskLevel: 'Low', riskScore: 31, trend: 'improving', email: 'yusuf.rashid@college.edu', advisor: 'Dr. Amira Hossam', failedCourses: 0, absences: 9 },
  { id: 'ds6', name: 'Nadia Sami', studentId: 'CS-2022-022', department: 'Computer Science', year: 2, gpa: 2.6, attendance: 71, riskLevel: 'High', riskScore: 69, trend: 'declining', email: 'nadia.sami@college.edu', advisor: 'Dr. Nour Khalid', failedCourses: 1, absences: 14 },
  { id: 'ds7', name: 'Kareem Fathy', studentId: 'BIO-2020-008', department: 'Biology', year: 4, gpa: 3.9, attendance: 95, riskLevel: 'Normal', riskScore: 5, trend: 'stable', email: 'kareem.fathy@college.edu', advisor: 'Dr. Aisha Mustafa', failedCourses: 0, absences: 2 },
  { id: 'ds8', name: 'Sara Adel', studentId: 'MATH-2022-019', department: 'Mathematics', year: 2, gpa: 2.3, attendance: 65, riskLevel: 'High', riskScore: 74, trend: 'sudden_drop', email: 'sara.adel@college.edu', advisor: 'Dr. Samir Fouad', failedCourses: 2, absences: 16 },
  { id: 'ds9', name: 'Hassan Zaki', studentId: 'PHYS-2021-005', department: 'Physics', year: 3, gpa: 3.1, attendance: 84, riskLevel: 'Low', riskScore: 28, trend: 'stable', email: 'hassan.zaki@college.edu', advisor: 'Prof. Hamed Saleh', failedCourses: 0, absences: 8 },
  { id: 'ds10', name: 'Dina Mostafa', studentId: 'BIO-2023-002', department: 'Biology', year: 1, gpa: 2.9, attendance: 77, riskLevel: 'Low', riskScore: 38, trend: 'declining', email: 'dina.mostafa@college.edu', advisor: 'Dr. Aisha Mustafa', failedCourses: 1, absences: 11 },
  { id: 'ds11', name: 'Mohamed Tarek', studentId: 'CHEM-2022-004', department: 'Chemistry', year: 2, gpa: 1.9, attendance: 55, riskLevel: 'Critical', riskScore: 89, trend: 'declining', email: 'mohamed.tarek@college.edu', advisor: 'Dr. Amira Hossam', failedCourses: 3, absences: 23 },
  { id: 'ds12', name: 'Rania Gamal', studentId: 'CS-2020-031', department: 'Computer Science', year: 4, gpa: 3.7, attendance: 91, riskLevel: 'Normal', riskScore: 11, trend: 'improving', email: 'rania.gamal@college.edu', advisor: 'Dr. Nour Khalid', failedCourses: 0, absences: 4 },
];

// ─── Dean Instructors ─────────────────────────────────────────────────────────

export const deanInstructors: DeanInstructor[] = [
  { id: 'di1', name: 'Dr. Nour Khalid', title: 'Professor', department: 'Computer Science', courses: 4, totalStudents: 145, successRate: 88, rating: 4.7, email: 'nour.khalid@college.edu', avgSuccessRate: 78 },
  { id: 'di2', name: 'Dr. Samir Fouad', title: 'Associate Professor', department: 'Mathematics', courses: 3, totalStudents: 112, successRate: 72, rating: 4.1, email: 'samir.fouad@college.edu', avgSuccessRate: 78 },
  { id: 'di3', name: 'Prof. Hamed Saleh', title: 'Professor', department: 'Physics', courses: 3, totalStudents: 98, successRate: 61, rating: 3.6, email: 'hamed.saleh@college.edu', avgSuccessRate: 78 },
  { id: 'di4', name: 'Dr. Amira Hossam', title: 'Associate Professor', department: 'Chemistry', courses: 4, totalStudents: 134, successRate: 79, rating: 4.3, email: 'amira.hossam@college.edu', avgSuccessRate: 78 },
  { id: 'di5', name: 'Dr. Aisha Mustafa', title: 'Assistant Professor', department: 'Biology', courses: 3, totalStudents: 108, successRate: 84, rating: 4.5, email: 'aisha.mustafa@college.edu', avgSuccessRate: 78 },
  { id: 'di6', name: 'Eng. Tarek Ramzy', title: 'Teaching Assistant', department: 'Computer Science', courses: 2, totalStudents: 78, successRate: 76, rating: 3.9, email: 'tarek.ramzy@college.edu', avgSuccessRate: 78 },
  { id: 'di7', name: 'Dr. Bassem Lotfy', title: 'Assistant Professor', department: 'Mathematics', courses: 2, totalStudents: 64, successRate: 58, rating: 3.4, email: 'bassem.lotfy@college.edu', avgSuccessRate: 78 },
  { id: 'di8', name: 'Dr. Mona Sherif', title: 'Associate Professor', department: 'Physics', courses: 3, totalStudents: 91, successRate: 82, rating: 4.4, email: 'mona.sherif@college.edu', avgSuccessRate: 78 },
];

// ─── Dean Courses ─────────────────────────────────────────────────────────────

export const deanCourses: DeanCourse[] = [
  { id: 'dc1', code: 'CS301', name: 'Advanced Algorithms', department: 'Computer Science', year: 3, instructor: 'Dr. Nour Khalid', enrolled: 52, avgGrade: 78, attendance: 87, failRate: 14, passRate: 86, semester: 'Fall 2025', resultsStatus: 'pending' },
  { id: 'dc2', code: 'CS201', name: 'Data Structures', department: 'Computer Science', year: 2, instructor: 'Eng. Tarek Ramzy', enrolled: 78, avgGrade: 71, attendance: 79, failRate: 22, passRate: 78, semester: 'Fall 2025', resultsStatus: 'approved' },
  { id: 'dc3', code: 'MATH201', name: 'Linear Algebra', department: 'Mathematics', year: 2, instructor: 'Dr. Samir Fouad', enrolled: 65, avgGrade: 68, attendance: 72, failRate: 31, passRate: 69, semester: 'Fall 2025', resultsStatus: 'pending' },
  { id: 'dc4', code: 'MATH301', name: 'Real Analysis', department: 'Mathematics', year: 3, instructor: 'Dr. Bassem Lotfy', enrolled: 44, avgGrade: 59, attendance: 68, failRate: 43, passRate: 57, semester: 'Fall 2025', resultsStatus: 'rejected' },
  { id: 'dc5', code: 'PHYS401', name: 'Quantum Mechanics', department: 'Physics', year: 4, instructor: 'Prof. Hamed Saleh', enrolled: 38, avgGrade: 63, attendance: 74, failRate: 38, passRate: 62, semester: 'Fall 2025', resultsStatus: 'pending' },
  { id: 'dc6', code: 'PHYS201', name: 'Classical Mechanics', department: 'Physics', year: 2, instructor: 'Dr. Mona Sherif', enrolled: 56, avgGrade: 82, attendance: 89, failRate: 8, passRate: 92, semester: 'Fall 2025', resultsStatus: 'approved' },
  { id: 'dc7', code: 'CHEM101', name: 'General Chemistry', department: 'Chemistry', year: 1, instructor: 'Dr. Amira Hossam', enrolled: 89, avgGrade: 74, attendance: 81, failRate: 19, passRate: 81, semester: 'Fall 2025', resultsStatus: 'approved' },
  { id: 'dc8', code: 'BIO301', name: 'Molecular Biology', department: 'Biology', year: 3, instructor: 'Dr. Aisha Mustafa', enrolled: 61, avgGrade: 80, attendance: 91, failRate: 11, passRate: 89, semester: 'Fall 2025', resultsStatus: 'pending' },
  { id: 'dc9', code: 'CS401', name: 'Machine Learning', department: 'Computer Science', year: 4, instructor: 'Dr. Nour Khalid', enrolled: 43, avgGrade: 77, attendance: 85, failRate: 16, passRate: 84, semester: 'Fall 2025', resultsStatus: 'approved' },
  { id: 'dc10', code: 'BIO101', name: 'Cell Biology', department: 'Biology', year: 1, instructor: 'Dr. Aisha Mustafa', enrolled: 74, avgGrade: 76, attendance: 88, failRate: 15, passRate: 85, semester: 'Fall 2025', resultsStatus: 'pending' },
];

// ─── Departments ──────────────────────────────────────────────────────────────

export const deanDepartments: DeanDepartment[] = [
  { id: 'dep1', name: 'Computer Science', shortName: 'CS', head: 'Dr. Nour Khalid', studentCount: 223, facultyCount: 12, avgGpa: 3.1, passRate: 82, trend: 'stable', courses: 18, atRisk: 34 },
  { id: 'dep2', name: 'Mathematics', shortName: 'MATH', head: 'Dr. Samir Fouad', studentCount: 176, facultyCount: 9, avgGpa: 2.8, passRate: 71, trend: 'down', courses: 14, atRisk: 48 },
  { id: 'dep3', name: 'Physics', shortName: 'PHYS', head: 'Prof. Hamed Saleh', studentCount: 134, facultyCount: 8, avgGpa: 2.9, passRate: 74, trend: 'down', courses: 12, atRisk: 29 },
  { id: 'dep4', name: 'Chemistry', shortName: 'CHEM', head: 'Dr. Amira Hossam', studentCount: 158, facultyCount: 10, avgGpa: 3.0, passRate: 79, trend: 'stable', courses: 13, atRisk: 31 },
  { id: 'dep5', name: 'Biology', shortName: 'BIO', head: 'Dr. Aisha Mustafa', studentCount: 182, facultyCount: 11, avgGpa: 3.3, passRate: 87, trend: 'up', courses: 15, atRisk: 18 },
];

// ─── Attendance ───────────────────────────────────────────────────────────────

export const attendanceTrend: AttendanceRecord[] = [
  { month: 'Sep', cs: 91, math: 87, physics: 83, chemistry: 88, biology: 93, overall: 88 },
  { month: 'Oct', cs: 88, math: 83, physics: 80, chemistry: 86, biology: 91, overall: 86 },
  { month: 'Nov', cs: 85, math: 79, physics: 76, chemistry: 83, biology: 89, overall: 82 },
  { month: 'Dec', cs: 82, math: 74, physics: 71, chemistry: 81, biology: 87, overall: 79 },
  { month: 'Jan', cs: 84, math: 76, physics: 73, chemistry: 82, biology: 88, overall: 81 },
  { month: 'Feb', cs: 80, math: 72, physics: 69, chemistry: 79, biology: 86, overall: 77 },
];

export const absenteeStudents = deanStudents.filter(s => s.attendance < 75);

// ─── Exam Results ─────────────────────────────────────────────────────────────

export const examResults: ExamResult[] = [
  {
    id: 'er1', courseCode: 'MATH301', courseName: 'Real Analysis', instructor: 'Dr. Bassem Lotfy',
    department: 'Mathematics', semester: 'Fall 2025', submittedDate: '2025-04-28',
    status: 'pending', avgScore: 59, passRate: 57, failRate: 43,
    distribution: [
      { range: '0-49', count: 12 }, { range: '50-59', count: 8 }, { range: '60-69', count: 10 },
      { range: '70-79', count: 9 }, { range: '80-89', count: 4 }, { range: '90-100', count: 1 },
    ]
  },
  {
    id: 'er2', courseCode: 'CS301', courseName: 'Advanced Algorithms', instructor: 'Dr. Nour Khalid',
    department: 'Computer Science', semester: 'Fall 2025', submittedDate: '2025-04-29',
    status: 'pending', avgScore: 78, passRate: 86, failRate: 14,
    distribution: [
      { range: '0-49', count: 4 }, { range: '50-59', count: 3 }, { range: '60-69', count: 8 },
      { range: '70-79', count: 14 }, { range: '80-89', count: 16 }, { range: '90-100', count: 7 },
    ]
  },
  {
    id: 'er3', courseCode: 'PHYS401', courseName: 'Quantum Mechanics', instructor: 'Prof. Hamed Saleh',
    department: 'Physics', semester: 'Fall 2025', submittedDate: '2025-04-27',
    status: 'pending', avgScore: 63, passRate: 62, failRate: 38,
    distribution: [
      { range: '0-49', count: 8 }, { range: '50-59', count: 6 }, { range: '60-69', count: 9 },
      { range: '70-79', count: 8 }, { range: '80-89', count: 5 }, { range: '90-100', count: 2 },
    ]
  },
  {
    id: 'er4', courseCode: 'BIO301', courseName: 'Molecular Biology', instructor: 'Dr. Aisha Mustafa',
    department: 'Biology', semester: 'Fall 2025', submittedDate: '2025-04-26',
    status: 'pending', avgScore: 80, passRate: 89, failRate: 11,
    distribution: [
      { range: '0-49', count: 3 }, { range: '50-59', count: 4 }, { range: '60-69', count: 6 },
      { range: '70-79', count: 14 }, { range: '80-89', count: 22 }, { range: '90-100', count: 12 },
    ]
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const deanAlerts: DeanAlert[] = [
  { id: 'a1', type: 'near_dropout', severity: 'critical', title: 'Student Near Dropout', message: 'Layla Ibrahim (PHYS-2023-007) has 28 unexcused absences and GPA 1.7. Dropout probability: 96%.', timestamp: '2025-04-30T08:15:00Z', read: false, actionable: true, entityId: 'ds4', entityName: 'Layla Ibrahim' },
  { id: 'a2', type: 'near_dropout', severity: 'critical', title: 'Student Near Dropout', message: 'Mohamed Tarek (CHEM-2022-004) has failed 3 courses this semester. Immediate intervention required.', timestamp: '2025-04-30T07:30:00Z', read: false, actionable: true, entityId: 'ds11', entityName: 'Mohamed Tarek' },
  { id: 'a3', type: 'high_failure', severity: 'critical', title: 'High Failure Rate — Real Analysis', message: 'MATH301 Real Analysis has 43% failure rate this semester. Course intervention recommended.', timestamp: '2025-04-29T14:00:00Z', read: false, actionable: true, entityId: 'dc4', entityName: 'MATH301' },
  { id: 'a4', type: 'instructor_performance', severity: 'warning', title: 'Instructor Performance Drop', message: 'Dr. Bassem Lotfy student success rate (58%) is below the 65% threshold. Review recommended.', timestamp: '2025-04-29T10:00:00Z', read: false, actionable: true, entityId: 'di7', entityName: 'Dr. Bassem Lotfy' },
  { id: 'a5', type: 'attendance', severity: 'warning', title: 'Attendance Threshold Exceeded', message: 'Mathematics department attendance dropped to 72% in February — 6 students exceeded 25% absence limit.', timestamp: '2025-04-28T16:00:00Z', read: false, actionable: true },
  { id: 'a6', type: 'high_failure', severity: 'warning', title: 'High Failure Rate — Quantum Mechanics', message: 'PHYS401 Quantum Mechanics failure rate is 38%. Consider additional support sessions.', timestamp: '2025-04-28T09:00:00Z', read: true, actionable: true, entityId: 'dc5', entityName: 'PHYS401' },
  { id: 'a7', type: 'attendance', severity: 'info', title: 'Overall Attendance Declining', message: 'College-wide attendance fell from 88% (Sep) to 77% (Feb). Trend analysis available.', timestamp: '2025-04-27T11:30:00Z', read: true, actionable: false },
  { id: 'a8', type: 'high_failure', severity: 'warning', title: 'High Failure Rate — Linear Algebra', message: 'MATH201 failure rate at 31%. Student tutoring sessions recommended.', timestamp: '2025-04-26T15:00:00Z', read: true, actionable: true, entityId: 'dc3', entityName: 'MATH201' },
];

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export const deanKPIs = {
  totalStudents: 873,
  totalStudentsChange: 3.8,
  totalFaculty: 50,
  facultyChange: 5.0,
  activeCourses: 72,
  activeCoursesChange: -2.1,
  avgGpa: 3.02,
  avgGpaChange: -0.8,
  passRate: 79.4,
  passRateChange: -1.2,
  failRate: 20.6,
  failRateChange: 1.2,
};

export const riskDistribution = [
  { name: 'Normal', value: 2, color: '#10B981' },
  { name: 'Low',    value: 2, color: '#F59E0B' },
  { name: 'High',   value: 3, color: '#F97316' },
  { name: 'Critical', value: 1, color: '#DC2626' },
];

export const gpaTrend = [
  { month: 'Jan', avg: 3.10, target: 3.2 },
  { month: 'Feb', avg: 3.05, target: 3.2 },
  { month: 'Mar', avg: 2.95, target: 3.2 },
  { month: 'Apr', avg: 2.91, target: 3.2 },
  { month: 'May', avg: 2.88, target: 3.2 },
];

export const topFailingCourses = deanCourses
  .sort((a, b) => b.failRate - a.failRate)
  .slice(0, 5);

export const studentsAtRisk = deanStudents
  .filter(s => s.riskLevel === 'High' || s.riskLevel === 'Critical')
  .sort((a, b) => b.riskScore - a.riskScore)
  .slice(0, 5);

export const aiInsights = [
  { icon: '⚠️', text: '4 students are at critical dropout risk — immediate action needed', type: 'critical' as const },
  { icon: '📉', text: 'Mathematics department shows declining GPA trend (−0.4 this semester)', type: 'warning' as const },
  { icon: '🎯', text: 'Biology department leads performance with 87% pass rate — share best practices', type: 'success' as const },
  { icon: '🤖', text: 'AI predicts 12% increase in at-risk students next semester without intervention', type: 'warning' as const },
  { icon: '📋', text: '4 exam results pending your approval before student access', type: 'info' as const },
];
