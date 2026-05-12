// src/pages/student/StudentAnnouncements.tsx
// University-wide and course-specific announcements and calendar

import { useState } from 'react';
import { Megaphone, Calendar, BookOpen, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const announcements = [
  {
    id: 1, type: 'urgent', source: 'university',
    title: 'Midterm Exam Postponement – CS301',
    body: 'Due to a scheduling conflict with the National Engineering Day event, the CS301 Midterm Exam has been rescheduled from October 18 to October 20, 2024, at 9:00 AM in Hall A. All other details remain unchanged. Please check your seat numbers.',
    date: 'Oct 5, 2024', time: '2:30 PM', read: false,
  },
  {
    id: 2, type: 'info', source: 'CS301',
    title: 'Office Hours Update – Dr. Amr Hassan',
    body: 'Starting next week, office hours for CS301 will be held on Monday 2:00–3:00 PM and Thursday 11:00–12:00 PM in Room 204. Students are encouraged to bring specific questions about the Dynamic Programming chapter.',
    date: 'Oct 4, 2024', time: '10:00 AM', read: false,
  },
  {
    id: 3, type: 'info', source: 'university',
    title: 'Spring 2025 Registration Opens November 1',
    body: 'Academic registration for Spring Semester 2025 will open on November 1, 2024 for 3rd and 4th year students. Advising appointments must be completed before you can register. Please schedule your appointment with your academic advisor by October 25.',
    date: 'Oct 3, 2024', time: '9:00 AM', read: true,
  },
  {
    id: 4, type: 'warning', source: 'MATH301',
    title: 'Attendance Warning – MATH301',
    body: 'Your attendance in MATH301 (Probability & Statistics) has dropped to 79%. University policy requires a minimum of 75% attendance to sit for the final exam. Please ensure you attend all remaining classes to avoid being barred from the final examination.',
    date: 'Oct 2, 2024', time: '8:00 AM', read: true,
  },
  {
    id: 5, type: 'info', source: 'CS310',
    title: 'Assignment 2 Posted – OS',
    body: 'Assignment 2 for Operating Systems has been posted on the course portal. Topic: Implementation of a simple process scheduler in C. Due date: October 17, 2024 at 11:59 PM. Late submissions will incur a 20% penalty per day.',
    date: 'Oct 1, 2024', time: '4:00 PM', read: true,
  },
  {
    id: 6, type: 'info', source: 'university',
    title: 'Library Extended Hours During Midterms',
    body: 'The Central University Library will extend its operating hours to 24/7 from October 15–30 to support students during the midterm examination period. A quiet study zone with charging stations will be available on the 3rd floor.',
    date: 'Sep 30, 2024', time: '12:00 PM', read: true,
  },
];

const calendarEvents = [
  { date: 'Oct 7', event: 'Add/Drop Period Ends', type: 'deadline', color: 'bg-red-500' },
  { date: 'Oct 8', event: 'CS301 Quiz 3', type: 'quiz', color: 'bg-orange-500' },
  { date: 'Oct 10', event: 'CS310 Quiz 2', type: 'quiz', color: 'bg-orange-500' },
  { date: 'Oct 15', event: 'Library 24hr Opens', type: 'event', color: 'bg-blue-500' },
  { date: 'Oct 15', event: 'MATH301 Midterm Quiz', type: 'quiz', color: 'bg-orange-500' },
  { date: 'Oct 20', event: 'CS301 Midterm Exam', type: 'exam', color: 'bg-red-600' },
  { date: 'Oct 22', event: 'CS310 Midterm Exam', type: 'exam', color: 'bg-red-600' },
  { date: 'Oct 24', event: 'MATH301 Midterm Exam', type: 'exam', color: 'bg-red-600' },
  { date: 'Oct 25', event: 'HUM201 Midterm Exam', type: 'exam', color: 'bg-red-600' },
  { date: 'Oct 28', event: 'CS320 Midterm Exam', type: 'exam', color: 'bg-red-600' },
  { date: 'Nov 1', event: 'Spring 2025 Registration Opens', type: 'registration', color: 'bg-emerald-500' },
  { date: 'Nov 30', event: 'Registration Deadline', type: 'deadline', color: 'bg-red-500' },
  { date: 'Dec 15', event: 'Final Exams Begin', type: 'exam', color: 'bg-red-700' },
];

const typeConfig = {
  urgent: { label: 'Urgent', icon: AlertTriangle, iconColor: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-900/40' },
  warning: { label: 'Warning', icon: AlertTriangle, iconColor: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900/40' },
  info: { label: 'Info', icon: Info, iconColor: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/40' },
};

export function StudentAnnouncements() {
  const [filter, setFilter] = useState<'all' | 'university' | 'courses'>('all');
  const [expanded, setExpanded] = useState<number | null>(1);
  const [readAll, setReadAll] = useState(false);

  const filtered = announcements.filter(a =>
    filter === 'all' || (filter === 'university' ? a.source === 'university' : a.source !== 'university')
  );

  const unread = announcements.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Announcements</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">University-wide and course notifications</p>
        </div>
        {unread > 0 && !readAll && (
          <button onClick={() => setReadAll(true)} className="text-sm text-red-600 hover:underline font-medium">
            Mark all as read ({unread})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            {(['all', 'university', 'courses'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  filter === f ? 'bg-red-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}>{f === 'all' ? 'All' : f === 'university' ? 'University' : 'My Courses'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(ann => {
              const cfg = typeConfig[ann.type as keyof typeof typeConfig];
              const Icon = cfg.icon;
              const isExpanded = expanded === ann.id;
              const isUnread = !ann.read && !readAll;

              return (
                <div key={ann.id} className={cn('rounded-xl border overflow-hidden', cfg.border, isUnread && 'shadow-sm')}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : ann.id)}
                    className={cn('w-full flex items-start gap-3 p-4 text-left', cfg.bg)}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', isUnread ? 'bg-white dark:bg-neutral-900' : 'bg-white/60 dark:bg-neutral-900/60')}>
                      <Icon className={cn('w-4 h-4', cfg.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            {ann.source !== 'university' ? (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-neutral-500" />
                                <span className="text-xs font-semibold text-neutral-500">{ann.source}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Megaphone className="w-3 h-3 text-neutral-500" />
                                <span className="text-xs text-neutral-500">University</span>
                              </div>
                            )}
                            {isUnread && <span className="w-2 h-2 rounded-full bg-red-600" />}
                          </div>
                          <p className={cn('text-sm font-semibold text-neutral-900 dark:text-white', isUnread && 'font-bold')}>{ann.title}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-neutral-400">{ann.date}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                        </div>
                      </div>
                      {!isExpanded && <p className="text-xs text-neutral-500 mt-1 truncate">{ann.body}</p>}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-2 bg-white dark:bg-neutral-900">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{ann.body}</p>
                      <p className="text-xs text-neutral-400 mt-2">{ann.date} at {ann.time}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Calendar */}
        <div>
          <Card title="Academic Calendar" subtitle="Important dates ahead">
            <div className="space-y-2">
              {calendarEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', ev.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{ev.event}</p>
                    <p className="text-xs text-neutral-400">{ev.date}</p>
                  </div>
                  <Badge variant={ev.type === 'exam' ? 'critical' : ev.type === 'deadline' ? 'warning' : 'normal'} className="text-xs shrink-0">
                    {ev.type}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}