// src/pages/student/StudentCourses.tsx
// Course management: current courses, registration, schedule, materials

import { useState } from 'react';
import { BookOpen, Clock, MapPin, User, FileText, Video, Download, Calendar, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { cn } from '../../lib/utils';

type Tab = 'current' | 'registration' | 'schedule' | 'materials';

const currentCourses = [
  {
    code: 'CS301', name: 'Algorithms', credits: 3,
    professor: 'Dr. Amr Hassan', section: 'Sec 1',
    schedule: [
      { day: 'Sun', time: '09:00–10:30', type: 'Lecture', room: 'Hall A-201' },
      { day: 'Tue', time: '11:00–12:00', type: 'Tutorial', room: 'Lab 3' },
    ],
    attendance: 78, grade: 72, quizzes: 3, assignments: 2,
    color: 'border-red-500',
  },
  {
    code: 'CS310', name: 'Operating Systems', credits: 3,
    professor: 'Dr. Layla Nour', section: 'Sec 2',
    schedule: [
      { day: 'Mon', time: '10:00–11:30', type: 'Lecture', room: 'Hall B-105' },
      { day: 'Wed', time: '13:00–14:00', type: 'Lab', room: 'Lab 1' },
    ],
    attendance: 92, grade: 85, quizzes: 2, assignments: 3,
    color: 'border-blue-500',
  },
  {
    code: 'MATH301', name: 'Probability & Statistics', credits: 3,
    professor: 'Dr. Khaled Ibrahim', section: 'Sec 1',
    schedule: [
      { day: 'Sun', time: '11:00–12:30', type: 'Lecture', room: 'Hall C-302' },
      { day: 'Thu', time: '09:00–10:00', type: 'Tutorial', room: 'Room 204' },
    ],
    attendance: 85, grade: 79, quizzes: 4, assignments: 2,
    color: 'border-emerald-500',
  },
  {
    code: 'HUM201', name: 'Ethics in Technology', credits: 3,
    professor: 'Dr. Sara Mostafa', section: 'Sec 3',
    schedule: [
      { day: 'Tue', time: '14:00–15:30', type: 'Lecture', room: 'Hall A-104' },
    ],
    attendance: 95, grade: 91, quizzes: 1, assignments: 4,
    color: 'border-purple-500',
  },
  {
    code: 'CS320', name: 'Computer Architecture', credits: 3,
    professor: 'Dr. Mohamed Ali', section: 'Sec 2',
    schedule: [
      { day: 'Wed', time: '09:00–10:30', type: 'Lecture', room: 'Hall B-201' },
      { day: 'Sun', time: '14:00–15:00', type: 'Lab', room: 'Lab 5' },
    ],
    attendance: 70, grade: 65, quizzes: 3, assignments: 1,
    color: 'border-orange-500',
  },
];

const availableCourses = [
  { code: 'CS410', name: 'Computer Networks', credits: 3, professor: 'Dr. Hany Samir', seats: 8, prereqs: ['CS301'], hasPrereq: true },
  { code: 'CS450', name: 'Software Engineering', credits: 3, professor: 'Dr. Nadia Kamal', seats: 15, prereqs: ['CS301', 'CS401'], hasPrereq: true },
  { code: 'CS470', name: 'Machine Learning', credits: 3, professor: 'Dr. Rami Fawzy', seats: 3, prereqs: ['MATH301', 'CS401'], hasPrereq: false },
  { code: 'CS480', name: 'Computer Vision', credits: 3, professor: 'Dr. Amr Hassan', seats: 12, prereqs: ['CS470'], hasPrereq: false },
  { code: 'MATH350', name: 'Numerical Methods', credits: 3, professor: 'Dr. Khaled Ibrahim', seats: 20, prereqs: ['MATH201', 'MATH102'], hasPrereq: true },
];

const courseMaterials = {
  'CS301': [
    { type: 'pdf', name: 'Lecture 1 - Introduction to Algorithms', size: '2.4 MB', date: 'Sep 2' },
    { type: 'pdf', name: 'Lecture 2 - Big O Notation', size: '1.8 MB', date: 'Sep 9' },
    { type: 'video', name: 'Tutorial: Sorting Algorithms Explained', size: '124 MB', date: 'Sep 14' },
    { type: 'pdf', name: 'Problem Set 1', size: '0.5 MB', date: 'Sep 16' },
  ],
  'CS310': [
    { type: 'pdf', name: 'OS Lecture Slides 1-4', size: '5.1 MB', date: 'Sep 3' },
    { type: 'video', name: 'Lab Demo: Process Scheduling', size: '89 MB', date: 'Sep 10' },
    { type: 'pdf', name: 'Assignment 1 Brief', size: '0.3 MB', date: 'Sep 17' },
  ],
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const scheduleEvents = [
  { day: 'Sun', start: 9, duration: 1.5, code: 'CS301', name: 'Algorithms', room: 'Hall A-201', type: 'Lecture', color: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { day: 'Sun', start: 11, duration: 1.5, code: 'MATH301', name: 'Probability', room: 'Hall C-302', type: 'Lecture', color: 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { day: 'Sun', start: 14, duration: 1, code: 'CS320', name: 'Comp. Arch.', room: 'Lab 5', type: 'Lab', color: 'bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  { day: 'Mon', start: 10, duration: 1.5, code: 'CS310', name: 'OS', room: 'Hall B-105', type: 'Lecture', color: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { day: 'Tue', start: 11, duration: 1, code: 'CS301', name: 'Algorithms', room: 'Lab 3', type: 'Tutorial', color: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { day: 'Tue', start: 14, duration: 1.5, code: 'HUM201', name: 'Ethics', room: 'Hall A-104', type: 'Lecture', color: 'bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { day: 'Wed', start: 9, duration: 1.5, code: 'CS320', name: 'Comp. Arch.', room: 'Hall B-201', type: 'Lecture', color: 'bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  { day: 'Wed', start: 13, duration: 1, code: 'CS310', name: 'OS', room: 'Lab 1', type: 'Lab', color: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { day: 'Thu', start: 9, duration: 1, code: 'MATH301', name: 'Probability', room: 'Room 204', type: 'Tutorial', color: 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
];

export function StudentCourses() {
  const [tab, setTab] = useState<Tab>('current');
  const [selectedCourse, setSelectedCourse] = useState('CS301');
  const [addedCourses, setAddedCourses] = useState<string[]>([]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'current', label: 'Current Courses' },
    { id: 'schedule', label: 'Weekly Schedule' },
    { id: 'registration', label: 'Course Registration' },
    { id: 'materials', label: 'Course Materials' },
  ];

  const CELL_HEIGHT = 64;
  const START_HOUR = 8;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Courses</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage your courses, schedule, and learning materials</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Current Courses */}
      {tab === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {currentCourses.map(course => (
            <div key={course.code} className={cn('bg-white dark:bg-neutral-900 rounded-xl border-l-4 border border-neutral-200 dark:border-neutral-800 p-5', course.color)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500">{course.code}</span>
                    <Badge variant="normal">{course.section}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">{course.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                    <User className="w-3 h-3" />
                    <span>{course.professor}</span>
                    <span>•</span>
                    <span>{course.credits} credits</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{course.grade}</p>
                  <p className="text-xs text-neutral-500">Current Grade</p>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Attendance</span>
                  <span className={cn('font-semibold', course.attendance < 75 ? 'text-red-600' : 'text-emerald-600')}>{course.attendance}%</span>
                </div>
                <ProgressBar value={course.attendance} size="sm" color={course.attendance < 75 ? 'bg-red-500' : 'bg-emerald-500'} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {course.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800 px-2 py-1.5 rounded-lg">
                    <Calendar className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{s.day} {s.time}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.quizzes} quizzes</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{course.assignments} assignments</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Schedule */}
      {tab === 'schedule' && (
        <Card title="Weekly Timetable" subtitle="Fall Semester 2024/2025">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-1 mb-2">
                <div className="text-xs text-neutral-400 py-2" />
                {weekDays.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-neutral-600 dark:text-neutral-400 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">{d}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="relative">
                {timeSlots.map((time, ti) => (
                  <div key={time} className="grid grid-cols-6 gap-1" style={{ height: CELL_HEIGHT }}>
                    <div className="text-xs text-neutral-400 flex items-start justify-end pr-2 pt-1">{time}</div>
                    {weekDays.map(day => (
                      <div key={day} className="border-t border-neutral-100 dark:border-neutral-800 relative" />
                    ))}
                  </div>
                ))}

                {/* Events */}
                {scheduleEvents.map((ev, i) => {
                  const dayIdx = weekDays.indexOf(ev.day);
                  const topOffset = (ev.start - START_HOUR) * CELL_HEIGHT;
                  const height = ev.duration * CELL_HEIGHT - 4;
                  const leftOffset = `calc(${(dayIdx + 1) / 6 * 100}% + 2px)`;
                  const width = `calc(${1 / 6 * 100}% - 6px)`;
                  return (
                    <div
                      key={i}
                      className={cn('absolute rounded-lg border-l-2 px-2 py-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow', ev.color)}
                      style={{ top: topOffset, left: leftOffset, width, height }}
                    >
                      <p className="text-xs font-bold truncate">{ev.code}</p>
                      <p className="text-xs truncate opacity-75">{ev.room}</p>
                      <span className="text-xs opacity-60">{ev.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Course Registration */}
      {tab === 'registration' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Registration Period Open</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Spring 2025 registration closes: November 30, 2024</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300">{15 + (addedCourses.length * 3)} / 18</p>
              <p className="text-xs text-blue-600">Credit Hours</p>
            </div>
          </div>

          <Card title="Available Courses for Next Semester" subtitle="Spring 2025 — Check prerequisites before adding">
            <div className="space-y-3">
              {availableCourses.map(course => (
                <div key={course.code} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-800 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600">{course.code}</span>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">{course.name}</span>
                      <Badge variant="normal">{course.credits} cr</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{course.professor}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{course.seats} seats left</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-400">Prerequisites:</span>
                      {course.prereqs.map(p => (
                        <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">{p}</span>
                      ))}
                      {course.hasPrereq ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" />Met</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="w-3 h-3" />Not met</span>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={!course.hasPrereq}
                    onClick={() => setAddedCourses(prev =>
                      prev.includes(course.code) ? prev.filter(c => c !== course.code) : [...prev, course.code]
                    )}
                    className={cn(
                      'ml-4 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      !course.hasPrereq
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                        : addedCourses.includes(course.code)
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-600 text-white hover:bg-red-700'
                    )}
                  >
                    {addedCourses.includes(course.code) ? <><CheckCircle2 className="w-4 h-4" /> Added</> : <><Plus className="w-4 h-4" /> Add</>}
                  </button>
                </div>
              ))}
            </div>
            {addedCourses.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <Button variant="primary">Confirm Registration ({addedCourses.length} courses)</Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Course Materials */}
      {tab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Selector */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Select Course</p>
            {currentCourses.filter(c => courseMaterials[c.code as keyof typeof courseMaterials]).map(course => (
              <button
                key={course.code}
                onClick={() => setSelectedCourse(course.code)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border transition-all',
                  selectedCourse === course.code
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-900'
                )}
              >
                <p className="text-xs text-red-600 font-semibold">{course.code}</p>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{course.name}</p>
              </button>
            ))}
          </div>

          {/* Files */}
          <div className="lg:col-span-2">
            <Card title={`${selectedCourse} Materials`} subtitle="Lecture notes, videos & assignments">
              <div className="space-y-3">
                {(courseMaterials[selectedCourse as keyof typeof courseMaterials] || []).map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', file.type === 'pdf' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20')}>
                        {file.type === 'pdf' ? <FileText className="w-5 h-5 text-red-600" /> : <Video className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{file.name}</p>
                        <p className="text-xs text-neutral-500">{file.size} • {file.date}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}