import type { 
  Student, Course, RiskAssessment, InterventionPlan, 
  Notification, Quiz, QuizSubmission, DashboardStats, 
  TimeSeriesPoint, User, SimulationResult 
} from '../types';

export const mockUser: User = {
  id: '1',
  email: 'admin@eduguard.edu',
  name: 'Dr. Sarah Mitchell',
  role: 'admin',
};

export const mockStudents: Student[] = [
  { id: 's1', user_id: 'u1', name: 'Alice Johnson', email: 'alice@student.edu', major: 'Computer Science', year: 3, gpa: 3.8, enrollment_date: '2023-09-01' },
  { id: 's2', user_id: 'u2', name: 'Bob Smith', email: 'bob@student.edu', major: 'Mathematics', year: 2, gpa: 2.1, enrollment_date: '2024-09-01' },
  { id: 's3', user_id: 'u3', name: 'Carol White', email: 'carol@student.edu', major: 'Physics', year: 4, gpa: 3.5, enrollment_date: '2022-09-01' },
  { id: 's4', user_id: 'u4', name: 'David Brown', email: 'david@student.edu', major: 'Chemistry', year: 1, gpa: 1.8, enrollment_date: '2025-01-15' },
  { id: 's5', user_id: 'u5', name: 'Eva Martinez', email: 'eva@student.edu', major: 'Biology', year: 3, gpa: 3.2, enrollment_date: '2023-09-01' },
  { id: 's6', user_id: 'u6', name: 'Frank Lee', email: 'frank@student.edu', major: 'Computer Science', year: 2, gpa: 2.7, enrollment_date: '2024-09-01' },
  { id: 's7', user_id: 'u7', name: 'Grace Kim', email: 'grace@student.edu', major: 'Psychology', year: 4, gpa: 3.9, enrollment_date: '2022-09-01' },
  { id: 's8', user_id: 'u8', name: 'Henry Wilson', email: 'henry@student.edu', major: 'Engineering', year: 2, gpa: 2.3, enrollment_date: '2024-09-01' },
];

export const mockCourses: Course[] = [
  { id: 'c1', code: 'CS301', name: 'Advanced Algorithms', professor_id: 'p1', credits: 3, semester: 'Fall', year: 2025 },
  { id: 'c2', code: 'MATH201', name: 'Linear Algebra', professor_id: 'p2', credits: 3, semester: 'Fall', year: 2025 },
  { id: 'c3', code: 'PHYS401', name: 'Quantum Mechanics', professor_id: 'p3', credits: 4, semester: 'Fall', year: 2025 },
  { id: 'c4', code: 'CHEM101', name: 'General Chemistry', professor_id: 'p4', credits: 4, semester: 'Fall', year: 2025 },
  { id: 'c5', code: 'BIO301', name: 'Molecular Biology', professor_id: 'p5', credits: 3, semester: 'Fall', year: 2025 },
];

export const mockRiskAssessments: RiskAssessment[] = [
  { id: 'r1', student_id: 's1', risk_level: 'Normal', probability: 12, grades_impact: 15, attendance_impact: 10, activity_impact: 8, dropout_probability: 5, graduation_delay_likelihood: 8, scholarship_eligibility: 92, trend: 'stable', assessed_at: '2025-04-28' },
  { id: 'r2', student_id: 's2', risk_level: 'High', probability: 78, grades_impact: 65, attendance_impact: 45, activity_impact: 55, dropout_probability: 62, graduation_delay_likelihood: 71, scholarship_eligibility: 15, trend: 'declining', assessed_at: '2025-04-28' },
  { id: 'r3', student_id: 's3', risk_level: 'Low', probability: 28, grades_impact: 25, attendance_impact: 20, activity_impact: 30, dropout_probability: 12, graduation_delay_likelihood: 18, scholarship_eligibility: 75, trend: 'stable', assessed_at: '2025-04-28' },
  { id: 'r4', student_id: 's4', risk_level: 'Critical', probability: 94, grades_impact: 85, attendance_impact: 70, activity_impact: 60, dropout_probability: 88, graduation_delay_likelihood: 91, scholarship_eligibility: 3, trend: 'sudden_drop', assessed_at: '2025-04-28' },
  { id: 's5', student_id: 's5', risk_level: 'Low', probability: 35, grades_impact: 30, attendance_impact: 25, activity_impact: 35, dropout_probability: 18, graduation_delay_likelihood: 22, scholarship_eligibility: 68, trend: 'improving', assessed_at: '2025-04-28' },
  { id: 'r6', student_id: 's6', risk_level: 'High', probability: 72, grades_impact: 60, attendance_impact: 50, activity_impact: 40, dropout_probability: 55, graduation_delay_likelihood: 65, scholarship_eligibility: 22, trend: 'declining', assessed_at: '2025-04-28' },
  { id: 'r7', student_id: 's7', risk_level: 'Normal', probability: 8, grades_impact: 10, attendance_impact: 5, activity_impact: 8, dropout_probability: 2, graduation_delay_likelihood: 5, scholarship_eligibility: 98, trend: 'stable', assessed_at: '2025-04-28' },
  { id: 'r8', student_id: 's8', risk_level: 'High', probability: 81, grades_impact: 70, attendance_impact: 55, activity_impact: 50, dropout_probability: 68, graduation_delay_likelihood: 74, scholarship_eligibility: 12, trend: 'sudden_drop', assessed_at: '2025-04-28' },
];

export const mockInterventions: InterventionPlan[] = [
  { id: 'i1', student_id: 's2', advisor_id: 'a1', title: 'Academic Recovery Plan', description: 'Focus on improving assignment completion and attendance', actions: [{ id: 'a1', description: 'Schedule weekly tutoring sessions', completed: true }, { id: 'a2', description: 'Meet with academic advisor bi-weekly', completed: false }, { id: 'a3', description: 'Complete all pending assignments', completed: false }], status: 'active', priority: 'high', created_at: '2025-04-15', deadline: '2025-05-15' },
  { id: 'i2', student_id: 's4', advisor_id: 'a1', title: 'Critical Intervention', description: 'Immediate support for at-risk student', actions: [{ id: 'a4', description: 'Emergency advisor meeting', completed: true }, { id: 'a5', description: 'Connect with counseling services', completed: false }, { id: 'a6', description: 'Create study schedule', completed: false }, { id: 'a7', description: 'Review course load', completed: false }], status: 'active', priority: 'high', created_at: '2025-04-20', deadline: '2025-05-01' },
  { id: 'i3', student_id: 's6', advisor_id: 'a2', title: 'Engagement Boost Plan', description: 'Increase platform activity and participation', actions: [{ id: 'a8', description: 'Set daily study reminders', completed: false }, { id: 'a9', description: 'Join study group', completed: false }], status: 'pending', priority: 'medium', created_at: '2025-04-25', deadline: '2025-05-20' },
  { id: 'i4', student_id: 's8', advisor_id: 'a2', title: 'Attendance Improvement', description: 'Address chronic absenteeism', actions: [{ id: 'a10', description: 'Set up attendance monitoring', completed: true }, { id: 'a11', description: 'Identify barriers to attendance', completed: false }], status: 'active', priority: 'high', created_at: '2025-04-22', deadline: '2025-05-10' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', user_id: '1', title: 'Critical Risk Alert', message: 'David Brown has reached critical risk level (94%)', priority: 'high', read: false, type: 'risk_alert', created_at: '2025-04-28T10:00:00Z' },
  { id: 'n2', user_id: '1', title: 'New Intervention Assigned', message: 'Academic Recovery Plan assigned to Bob Smith', priority: 'medium', read: false, type: 'intervention', created_at: '2025-04-27T14:30:00Z' },
  { id: 'n3', user_id: '1', title: 'Quiz Results Available', message: 'Advanced Algorithms Quiz #3 results are now available', priority: 'low', read: true, type: 'quiz', created_at: '2025-04-26T09:00:00Z' },
  { id: 'n4', user_id: '1', title: 'Grade Drop Detected', message: "Henry Wilson's GPA dropped by 0.5 points this semester", priority: 'high', read: false, type: 'grade', created_at: '2025-04-25T16:00:00Z' },
  { id: 'n5', user_id: '1', title: 'System Maintenance', message: 'Scheduled maintenance on May 1st, 2:00 AM - 4:00 AM', priority: 'low', read: true, type: 'system', created_at: '2025-04-24T08:00:00Z' },
];

export const mockQuizzes: Quiz[] = [
  { id: 'q1', title: 'Advanced Algorithms Quiz #3', course_id: 'c1', duration_minutes: 60, attempts_limit: 2, start_time: '2025-04-25T09:00:00Z', end_time: '2025-04-30T23:59:00Z', shuffle_questions: true, randomize_options: true, status: 'published' },
  { id: 'q2', title: 'Linear Algebra Midterm', course_id: 'c2', duration_minutes: 90, attempts_limit: 1, start_time: '2025-05-05T10:00:00Z', end_time: '2025-05-05T12:00:00Z', shuffle_questions: false, randomize_options: false, status: 'published' },
  { id: 'q3', title: 'Chemistry Lab Assessment', course_id: 'c4', duration_minutes: 45, attempts_limit: 3, start_time: '2025-05-10T14:00:00Z', end_time: '2025-05-12T14:00:00Z', shuffle_questions: true, randomize_options: true, status: 'draft' },
];

export const mockQuizSubmissions: QuizSubmission[] = [
  { id: 'sub1', quiz_id: 'q1', student_id: 's1', answers: { 'ques1': 'A', 'ques2': 'B', 'ques3': 'C' }, score: 85, max_score: 100, submitted_at: '2025-04-26T10:30:00Z', attempt_number: 1 },
  { id: 'sub2', quiz_id: 'q1', student_id: 's2', answers: { 'ques1': 'B', 'ques2': 'A', 'ques3': 'D' }, score: 45, max_score: 100, submitted_at: '2025-04-26T11:00:00Z', attempt_number: 1 },
  { id: 'sub3', quiz_id: 'q1', student_id: 's3', answers: { 'ques1': 'A', 'ques2': 'B', 'ques3': 'C' }, score: 92, max_score: 100, submitted_at: '2025-04-26T09:45:00Z', attempt_number: 1 },
  { id: 'sub4', quiz_id: 'q1', student_id: 's5', answers: { 'ques1': 'A', 'ques2': 'C', 'ques3': 'B' }, score: 78, max_score: 100, submitted_at: '2025-04-26T10:15:00Z', attempt_number: 1 },
];

export const mockDashboardStats: DashboardStats = {
  total_students: 8,
  at_risk_count: 4,
  critical_count: 1,
  avg_gpa: 2.91,
  attendance_rate: 76,
  intervention_count: 4,
};

export function generateTimeSeries(studentId: string): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const baseDate = new Date('2025-01-01');
  const student = mockStudents.find(s => s.id === studentId);
  const baseGpa = student?.gpa || 3.0;

  for (let i = 0; i < 16; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 7);
    const week = i;
    const noise = (Math.random() - 0.5) * 0.3;
    const trend = week * (baseGpa < 2.5 ? -0.03 : 0.01);

    data.push({
      date: date.toISOString().split('T')[0],
      gpa: Math.max(0, Math.min(4, baseGpa + trend + noise)),
      attendance_rate: Math.max(50, Math.min(100, 85 + (Math.random() - 0.5) * 30)),
      activity_score: Math.max(10, Math.min(100, 60 + (Math.random() - 0.5) * 40)),
      risk_score: Math.max(0, Math.min(100, 30 + (baseGpa < 2.5 ? week * 3 : -week) + (Math.random() - 0.5) * 15)),
    });
  }
  return data;
}

export function getStudentRisk(studentId: string): RiskAssessment | undefined {
  return mockRiskAssessments.find(r => r.student_id === studentId);
}

export function getStudentInterventions(studentId: string): InterventionPlan[] {
  return mockInterventions.filter(i => i.student_id === studentId);
}

export function simulateWhatIf(studentId: string, newGrade: number): SimulationResult {
  const current = getStudentRisk(studentId);
  const student = mockStudents.find(s => s.id === studentId);

  if (!current || !student) {
    throw new Error('Student not found');
  }

  const gradeDelta = (newGrade / 100) * 4 - student.gpa;
  const gpaChange = gradeDelta * 0.3;
  const projectedGpa = Math.min(4, Math.max(0, student.gpa + gpaChange));

  const riskReduction = Math.min(40, gradeDelta * 15);
  const projectedRisk: RiskAssessment = {
    ...current,
    probability: Math.max(5, current.probability - riskReduction),
    dropout_probability: Math.max(2, current.dropout_probability - riskReduction * 0.8),
    graduation_delay_likelihood: Math.max(5, current.graduation_delay_likelihood - riskReduction * 0.7),
    scholarship_eligibility: Math.min(100, current.scholarship_eligibility + riskReduction * 1.2),
    risk_level: current.probability - riskReduction < 25 ? 'Normal' : current.probability - riskReduction < 50 ? 'Low' : current.probability - riskReduction < 75 ? 'High' : 'Critical',
    grades_impact: Math.max(10, current.grades_impact - riskReduction * 0.5),
  };

  return {
    current_gpa: student.gpa,
    projected_gpa: projectedGpa,
    current_risk: current,
    projected_risk: projectedRisk,
    changes: {
      gpa_change: gpaChange,
      risk_change: -riskReduction,
      dropout_change: -riskReduction * 0.8,
    }
  };
}