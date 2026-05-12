// src/lib/taMockData.ts
// Mock data for Teaching Assistant features

export interface TAStudent {
  id: string;
  name: string;
  studentId: string;
  section: 'Sec 1' | 'Sec 2';
  absences: number;
  absencePct: number;
  labGrade: number;
  quiz1: number;
  quiz2: number;
  status: 'good' | 'warning' | 'ban';
  notes: string;
}

export interface TASection {
  id: string;
  name: string;
  course: string;
  day: string;
  time: string;
  room: string;
  capacity: number;
  enrolled: number;
}

export interface TAMaterial {
  id: string;
  title: string;
  week: number;
  type: 'pdf' | 'video' | 'other';
  uploadedAt: string;
}

export interface TAAnnouncement {
  id: string;
  section: 'Sec 1' | 'Sec 2' | 'Both';
  title: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TAScheduleEvent {
  day: string;
  time: string;
  label: string;
  room: string;
  type: 'section' | 'lecture' | 'office' | 'extra';
}

// ─── Students ────────────────────────────────────────────────────────────────

export const taStudents: TAStudent[] = [
  { id: 'ts1', name: 'Ahmed Hassan',    studentId: 'CS-2024-001', section: 'Sec 1', absences: 2, absencePct: 8,  labGrade: 82, quiz1: 85, quiz2: 78, status: 'good',    notes: '' },
  { id: 'ts2', name: 'Sara Adel',       studentId: 'CS-2024-002', section: 'Sec 1', absences: 4, absencePct: 16, labGrade: 61, quiz1: 58, quiz2: 65, status: 'warning',  notes: 'First absence warning sent' },
  { id: 'ts3', name: 'Omar Mahmoud',    studentId: 'CS-2024-003', section: 'Sec 1', absences: 7, absencePct: 28, labGrade: 44, quiz1: 40, quiz2: 47, status: 'ban',      notes: 'Ban threshold reached' },
  { id: 'ts4', name: 'Layla Ibrahim',   studentId: 'CS-2024-004', section: 'Sec 2', absences: 1, absencePct: 4,  labGrade: 90, quiz1: 92, quiz2: 88, status: 'good',    notes: '' },
  { id: 'ts5', name: 'Kareem Fathy',    studentId: 'CS-2024-005', section: 'Sec 2', absences: 3, absencePct: 12, labGrade: 73, quiz1: 70, quiz2: 76, status: 'good',    notes: '' },
  { id: 'ts6', name: 'Nadia Sami',      studentId: 'CS-2024-006', section: 'Sec 2', absences: 5, absencePct: 20, labGrade: 55, quiz1: 52, quiz2: 58, status: 'warning',  notes: 'Struggling with lab work' },
  { id: 'ts7', name: 'Yusuf Al-Rashid', studentId: 'CS-2024-007', section: 'Sec 1', absences: 0, absencePct: 0,  labGrade: 95, quiz1: 96, quiz2: 94, status: 'good',    notes: '' },
  { id: 'ts8', name: 'Fatima Al-Zahra', studentId: 'CS-2024-008', section: 'Sec 2', absences: 6, absencePct: 24, labGrade: 48, quiz1: 45, quiz2: 51, status: 'warning',  notes: 'Needs extra session' },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

export const taSections: TASection[] = [
  { id: 's1', name: 'Sec 1', course: 'CS201 – Data Structures', day: 'Sun/Tue', time: '09:00', room: 'Lab 3', capacity: 20, enrolled: 4 },
  { id: 's2', name: 'Sec 2', course: 'CS201 – Data Structures', day: 'Mon/Wed', time: '11:00', room: 'Lab 5', capacity: 20, enrolled: 4 },
];

// ─── Materials ────────────────────────────────────────────────────────────────

export const taMaterials: TAMaterial[] = [
  { id: 'm1', title: 'Lab 1 – Linked Lists',         week: 1, type: 'pdf',   uploadedAt: '2025-09-05' },
  { id: 'm2', title: 'Lab 2 – Stacks & Queues',      week: 2, type: 'pdf',   uploadedAt: '2025-09-12' },
  { id: 'm3', title: 'Lab 3 – Binary Trees (Video)', week: 3, type: 'video', uploadedAt: '2025-09-19' },
  { id: 'm4', title: 'Model Solution – Lab 1',        week: 1, type: 'pdf',   uploadedAt: '2025-09-06' },
];

// ─── Announcements ────────────────────────────────────────────────────────────

export const taAnnouncements: TAAnnouncement[] = [
  { id: 'a1', section: 'Both',  title: 'Lab 3 postponed to next week',  date: '2025-10-01', priority: 'high'   },
  { id: 'a2', section: 'Sec 1', title: 'Extra session Saturday 10 AM',  date: '2025-09-28', priority: 'medium' },
  { id: 'a3', section: 'Sec 2', title: 'Quiz 2 rescheduled',            date: '2025-09-25', priority: 'low'    },
];

// ─── Schedule ─────────────────────────────────────────────────────────────────

export const taSchedule: TAScheduleEvent[] = [
  { day: 'Sunday',    time: '09:00–10:30', label: 'Sec 1 Lab Session',      room: 'Lab 3',  type: 'section' },
  { day: 'Sunday',    time: '11:00–13:00', label: 'Doctor Lecture (CS201)', room: 'Hall A', type: 'lecture' },
  { day: 'Monday',    time: '14:00–15:00', label: 'Office Hours',            room: 'Rm 204', type: 'office'  },
  { day: 'Tuesday',   time: '09:00–10:30', label: 'Sec 1 Lab Session',      room: 'Lab 3',  type: 'section' },
  { day: 'Wednesday', time: '11:00–12:30', label: 'Sec 2 Lab Session',      room: 'Lab 5',  type: 'section' },
  { day: 'Thursday',  time: '11:00–13:00', label: 'Doctor Lecture (CS201)', room: 'Hall A', type: 'lecture' },
  { day: 'Saturday',  time: '10:00–11:30', label: 'Extra Session – Sec 1',  room: 'Lab 3',  type: 'extra'   },
  { day: 'Saturday',  time: '12:00–13:30', label: 'Extra Session – Sec 2',  room: 'Lab 5',  type: 'extra'   },
];
