// src/lib/professorMockData.ts
// Extended mock data for the full Professor management system

export interface ProfCourse {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: string;
  year: number;
  color: string;
  coverIcon: string;
  enrolled: number;
  gradeBreakdown: { midterm: number; assignments: number; quizzes: number; final: number };
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  week: number;
  files: CourseFile[];
}

export interface CourseFile {
  id: string;
  moduleId: string;
  name: string;
  type: 'pdf' | 'ppt' | 'video' | 'doc';
  size: string;
  uploadedAt: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  type: 'quiz' | 'exam' | 'assignment';
  status: 'draft' | 'published' | 'closed';
  deadline: string;
  duration?: number;
  attempts?: number;
  totalPoints: number;
  submissions: number;
  avgScore?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching' | 'code';
  text: string;
  options?: string[];
  correctAnswer?: string | string[];
  matchPairs?: { left: string; right: string }[];
  points: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string;
  submissionType: 'individual' | 'group';
  maxFileSizeMB: number;
  totalPoints: number;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt?: string;
  status: 'submitted' | 'late' | 'missing';
  score?: number;
  feedback?: string;
  fileName?: string;
}

export interface GradebookEntry {
  studentId: string;
  studentName: string;
  email: string;
  scores: Record<string, number | null>;
  total: number;
  letterGrade: string;
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  body: string;
  createdAt: string;
  hasAttachment: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const profCourses: ProfCourse[] = [
  {
    id: 'c1', code: 'CS301', name: 'Advanced Algorithms', description: 'Deep dive into algorithm design, analysis, and complexity theory.', credits: 3, semester: 'Fall', year: 2025,
    color: 'bg-red-500', coverIcon: '⚡', enrolled: 32,
    gradeBreakdown: { midterm: 25, assignments: 30, quizzes: 20, final: 25 },
  },
  {
    id: 'c2', code: 'MATH201', name: 'Linear Algebra', description: 'Vectors, matrices, eigenvalues, and applications in computer science.', credits: 3, semester: 'Fall', year: 2025,
    color: 'bg-blue-500', coverIcon: '📐', enrolled: 28,
    gradeBreakdown: { midterm: 30, assignments: 20, quizzes: 15, final: 35 },
  },
  {
    id: 'c3', code: 'PHYS401', name: 'Quantum Physics', description: 'Fundamentals of quantum mechanics and modern physics applications.', credits: 4, semester: 'Fall', year: 2025,
    color: 'bg-emerald-500', coverIcon: '⚛️', enrolled: 18,
    gradeBreakdown: { midterm: 25, assignments: 25, quizzes: 20, final: 30 },
  },
  {
    id: 'c4', code: 'CHEM101', name: 'General Chemistry', description: 'Atomic structure, chemical bonding, reactions, and thermodynamics.', credits: 3, semester: 'Fall', year: 2025,
    color: 'bg-orange-500', coverIcon: '🧪', enrolled: 45,
    gradeBreakdown: { midterm: 20, assignments: 30, quizzes: 20, final: 30 },
  },
  {
    id: 'c5', code: 'BIO301', name: 'Molecular Biology', description: 'DNA replication, transcription, translation, and gene regulation.', credits: 3, semester: 'Fall', year: 2025,
    color: 'bg-purple-500', coverIcon: '🧬', enrolled: 22,
    gradeBreakdown: { midterm: 25, assignments: 25, quizzes: 15, final: 35 },
  },
];

export const courseModules: CourseModule[] = [
  { id: 'm1', courseId: 'c1', title: 'Week 1: Introduction to Complexity', week: 1, files: [
    { id: 'f1', moduleId: 'm1', name: 'Lecture 1 - Big-O Notation.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2025-09-01' },
    { id: 'f2', moduleId: 'm1', name: 'Slides - Complexity Theory.pptx', type: 'ppt', size: '5.1 MB', uploadedAt: '2025-09-01' },
  ]},
  { id: 'm2', courseId: 'c1', title: 'Week 2: Sorting & Searching', week: 2, files: [
    { id: 'f3', moduleId: 'm2', name: 'Lecture 2 - QuickSort.pdf', type: 'pdf', size: '1.8 MB', uploadedAt: '2025-09-08' },
    { id: 'f4', moduleId: 'm2', name: 'Demo - MergeSort.mp4', type: 'video', size: '120 MB', uploadedAt: '2025-09-08' },
  ]},
  { id: 'm3', courseId: 'c1', title: 'Week 3: Dynamic Programming', week: 3, files: [
    { id: 'f5', moduleId: 'm3', name: 'DP Problems Set.pdf', type: 'pdf', size: '3.2 MB', uploadedAt: '2025-09-15' },
  ]},
  { id: 'm4', courseId: 'c2', title: 'Week 1: Vectors & Spaces', week: 1, files: [
    { id: 'f6', moduleId: 'm4', name: 'Chapter 1 - Linear Spaces.pdf', type: 'pdf', size: '1.9 MB', uploadedAt: '2025-09-01' },
  ]},
];

export const assessments: Assessment[] = [
  {
    id: 'a1', courseId: 'c1', title: 'Algorithms Quiz #1', type: 'quiz', status: 'published',
    deadline: '2025-10-15', duration: 45, attempts: 2, totalPoints: 100, submissions: 30, avgScore: 78,
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'What is the time complexity of QuickSort in the average case?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 'O(n log n)', points: 10 },
      { id: 'q2', type: 'true_false', text: 'Binary search requires a sorted array.', correctAnswer: 'true', points: 5 },
      { id: 'q3', type: 'short_answer', text: 'Explain the concept of memoization in dynamic programming.', points: 15 },
      { id: 'q4', type: 'code', text: 'Implement a function to find the nth Fibonacci number using dynamic programming.', points: 20 },
    ],
  },
  {
    id: 'a2', courseId: 'c1', title: 'Midterm Exam', type: 'exam', status: 'closed',
    deadline: '2025-11-01', duration: 120, attempts: 1, totalPoints: 200, submissions: 32, avgScore: 152,
  },
  {
    id: 'a3', courseId: 'c1', title: 'Dynamic Programming Assignment', type: 'assignment', status: 'published',
    deadline: '2025-11-20', totalPoints: 100, submissions: 25,
  },
  {
    id: 'a4', courseId: 'c2', title: 'Linear Algebra Quiz #1', type: 'quiz', status: 'published',
    deadline: '2025-10-20', duration: 30, attempts: 1, totalPoints: 50, submissions: 26, avgScore: 38,
  },
  {
    id: 'a5', courseId: 'c1', title: 'Graph Theory Quiz', type: 'quiz', status: 'draft',
    deadline: '2025-12-01', duration: 60, attempts: 2, totalPoints: 100, submissions: 0,
    questions: [],
  },
];

const studentNames = [
  'Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Emma Wilson',
  'Frank Davis', 'Grace Martinez', 'Henry Taylor', 'Ivy Anderson', 'Jack Thompson',
  'Karen Moore', 'Liam Jackson', 'Mia Harris', 'Noah Martin', 'Olivia Garcia',
  'Paul Rodriguez', 'Quinn Lewis', 'Rachel Lee', 'Sam Walker', 'Tina Hall',
  'Uma Allen', 'Victor Young', 'Wendy King', 'Xander Wright', 'Yara Scott',
  'Zach Green', 'Amy Baker', 'Ben Adams', 'Chloe Nelson', 'Derek Carter',
  'Elena Mitchell', 'Felix Perez',
];

export const assignments: Assignment[] = [
  {
    id: 'asgn1', courseId: 'c1', title: 'Algorithm Analysis Report', description: 'Analyze the time and space complexity of 5 different sorting algorithms with benchmarks.',
    deadline: '2025-11-10', submissionType: 'individual', maxFileSizeMB: 10, totalPoints: 100,
    submissions: studentNames.slice(0, 32).map((name, i) => ({
      id: `sub${i}`, studentId: `s${i+1}`, studentName: name,
      status: i < 25 ? 'submitted' : i < 29 ? 'late' : 'missing',
      submittedAt: i < 25 ? '2025-11-09' : i < 29 ? '2025-11-12' : undefined,
      score: i < 25 ? Math.floor(Math.random() * 30) + 70 : i < 29 ? Math.floor(Math.random() * 20) + 55 : undefined,
      feedback: i < 25 ? 'Well done! Great analysis.' : undefined,
      fileName: i < 29 ? `${name.replace(' ', '_')}_report.pdf` : undefined,
    })),
  },
  {
    id: 'asgn2', courseId: 'c1', title: 'Graph Implementation Project', description: 'Implement BFS and DFS algorithms on a weighted graph with a working demo.',
    deadline: '2025-12-01', submissionType: 'group', maxFileSizeMB: 50, totalPoints: 150,
    submissions: studentNames.slice(0, 10).map((name, i) => ({
      id: `gsub${i}`, studentId: `s${i+1}`, studentName: name,
      status: i < 7 ? 'submitted' : 'missing',
      submittedAt: i < 7 ? '2025-11-30' : undefined,
      score: i < 7 ? Math.floor(Math.random() * 40) + 110 : undefined,
      fileName: i < 7 ? `Group_${i+1}_project.zip` : undefined,
    })),
  },
];

function calcTotal(scores: Record<string, number | null>): number {
  const vals = Object.values(scores).filter((v): v is number => v !== null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

function letterGrade(total: number): string {
  if (total >= 90) return 'A';
  if (total >= 80) return 'B';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}

export const gradebookEntries: GradebookEntry[] = studentNames.slice(0, 32).map((name, i) => {
  const quiz1 = Math.floor(Math.random() * 40) + 60;
  const midterm = Math.floor(Math.random() * 35) + 60;
  const assignment = Math.floor(Math.random() * 30) + 65;
  const final = Math.floor(Math.random() * 40) + 55;
  const scores = { 'Quiz #1': quiz1, 'Midterm': midterm, 'Assignment': assignment, 'Final': final };
  const total = calcTotal(scores);
  return {
    studentId: `s${i+1}`,
    studentName: name,
    email: `${name.toLowerCase().replace(' ', '.')}@university.edu`,
    scores,
    total,
    letterGrade: letterGrade(total),
  };
});

export const announcements: Announcement[] = [
  { id: 'an1', courseId: 'c1', title: 'Office Hours Change', body: 'Office hours this week will be held on Thursday 3-5 PM instead of Wednesday. Please plan accordingly.', createdAt: '2025-11-01', hasAttachment: false },
  { id: 'an2', courseId: 'c1', title: 'Midterm Results Posted', body: 'Midterm exam results have been posted to the gradebook. Please review your scores and contact me if you have any questions.', createdAt: '2025-11-05', hasAttachment: true },
  { id: 'an3', courseId: 'c1', title: 'Final Project Guidelines', body: 'The final project guidelines document has been uploaded to Week 12 module. Start early!', createdAt: '2025-11-10', hasAttachment: true },
];
