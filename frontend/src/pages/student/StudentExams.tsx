// src/pages/student/StudentExams.tsx
// Exam schedule with countdown timers, seat numbers, hall info

import { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const exams = [
  {
    course: 'CS301', name: 'Algorithms', type: 'Midterm',
    date: '2024-10-20', time: '09:00', duration: 120,
    hall: 'Hall A – Exam Center', seat: 'A-47',
    floor: 'Ground Floor', building: 'Main Building',
    status: 'upcoming',
  },
  {
    course: 'CS310', name: 'Operating Systems', type: 'Midterm',
    date: '2024-10-22', time: '11:00', duration: 90,
    hall: 'Hall B – Exam Center', seat: 'B-23',
    floor: '1st Floor', building: 'Main Building',
    status: 'upcoming',
  },
  {
    course: 'MATH301', name: 'Probability & Statistics', type: 'Midterm',
    date: '2024-10-24', time: '09:00', duration: 120,
    hall: 'Hall C – Science Block', seat: 'C-15',
    floor: '2nd Floor', building: 'Science Block',
    status: 'upcoming',
  },
  {
    course: 'HUM201', name: 'Ethics in Technology', type: 'Midterm',
    date: '2024-10-25', time: '14:00', duration: 60,
    hall: 'Hall D – Humanities', seat: 'D-32',
    floor: 'Ground Floor', building: 'Humanities Block',
    status: 'upcoming',
  },
  {
    course: 'CS320', name: 'Computer Architecture', type: 'Midterm',
    date: '2024-10-28', time: '11:00', duration: 120,
    hall: 'Hall A – Exam Center', seat: 'A-61',
    floor: 'Ground Floor', building: 'Main Building',
    status: 'upcoming',
  },
  {
    course: 'CS301', name: 'Algorithms', type: 'Final',
    date: '2024-12-15', time: '09:00', duration: 180,
    hall: 'Hall A – Exam Center', seat: 'TBA',
    floor: 'Ground Floor', building: 'Main Building',
    status: 'scheduled',
  },
  {
    course: 'CS310', name: 'Operating Systems', type: 'Final',
    date: '2024-12-17', time: '11:00', duration: 180,
    hall: 'Hall B – Exam Center', seat: 'TBA',
    floor: '1st Floor', building: 'Main Building',
    status: 'scheduled',
  },
];

function Countdown({ targetDate, targetTime }: { targetDate: string; targetTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(`${targetDate}T${targetTime}:00`);
    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate, targetTime]);

  return (
    <div className="flex items-center gap-2 mt-3">
      {[
        { v: timeLeft.days, l: 'days' },
        { v: timeLeft.hours, l: 'hrs' },
        { v: timeLeft.minutes, l: 'min' },
        { v: timeLeft.seconds, l: 'sec' },
      ].map(({ v, l }) => (
        <div key={l} className="text-center bg-neutral-900 dark:bg-neutral-800 rounded-lg px-2 py-1 min-w-[44px]">
          <p className="text-base font-mono font-bold text-white">{String(v).padStart(2, '0')}</p>
          <p className="text-xs text-neutral-400">{l}</p>
        </div>
      ))}
    </div>
  );
}

export function StudentExams() {
  const [filter, setFilter] = useState<'all' | 'midterm' | 'final'>('all');

  const filtered = exams.filter(e => filter === 'all' || e.type.toLowerCase() === filter);
  const upcoming = exams.filter(e => e.status === 'upcoming');

  const examDate = (e: typeof exams[0]) => {
    return new Date(`${e.date}T${e.time}:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Exam Schedule</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Official exam timetable with seat assignments and countdown timers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Exams', value: exams.length, color: 'text-neutral-700 dark:text-neutral-300' },
          { label: 'Upcoming (Midterms)', value: upcoming.length, color: 'text-orange-600' },
          { label: 'Next Exam In', value: `${Math.floor((new Date('2024-10-20T09:00:00').getTime() - Date.now()) / 86400000)} days`, color: 'text-red-600' },
          { label: 'Finals Start', value: 'Dec 15', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Important Exam Regulations</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Report to your exam hall 15 minutes before start time. Bring your Student ID and approved stationery only.
            Electronic devices are prohibited. Missing an exam without prior approval results in a zero grade.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'midterm', 'final'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
              filter === f ? 'bg-red-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}>{f === 'all' ? 'All Exams' : `${f.charAt(0).toUpperCase() + f.slice(1)}s`}
          </button>
        ))}
      </div>

      {/* Exam Cards */}
      <div className="space-y-4">
        {filtered.map((exam, i) => (
          <div key={i} className={cn('bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5',
            exam.status === 'upcoming' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-400'
          )}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-red-600">{exam.course}</span>
                  <Badge variant={exam.type === 'Midterm' ? 'warning' : 'critical'}>{exam.type}</Badge>
                  {exam.status === 'upcoming' && <Badge variant="low">Upcoming</Badge>}
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{exam.name}</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>{examDate(exam)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{exam.time} · {exam.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{exam.hall}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <span className="text-xs">🪑</span>
                    <span>Seat {exam.seat} · {exam.floor}</span>
                  </div>
                </div>

                {exam.status === 'upcoming' && (
                  <>
                    <p className="text-xs text-neutral-400 mt-3">Time until exam:</p>
                    <Countdown targetDate={exam.date} targetTime={exam.time} />
                  </>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {exam.seat !== 'TBA' && (
                  <div className="text-center bg-red-600 text-white px-4 py-3 rounded-xl">
                    <p className="text-xs font-medium opacity-75">Seat</p>
                    <p className="text-xl font-bold">{exam.seat}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <Card title="Exam Preparation Tips" subtitle="AI-powered suggestions based on your performance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { course: 'CS301', tip: 'Focus on Dynamic Programming and Graph Algorithms — these are your weakest areas based on quiz performance.' },
            { course: 'CS310', tip: 'Review process scheduling algorithms and memory management. Your Quiz 1 score suggests strong understanding of concepts.' },
            { course: 'MATH301', tip: 'Practice hypothesis testing problems — your previous quiz score of 55% suggests this topic needs more attention.' },
            { course: 'CS320', tip: 'Your attendance in this course is at 70% — review missed lecture slides and attend the Saturday extra session.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-red-600 block">{item.course}</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{item.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}