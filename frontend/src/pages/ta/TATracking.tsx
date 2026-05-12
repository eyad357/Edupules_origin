// src/pages/ta/TATracking.tsx
import { useState } from 'react';
import { Calendar, Send, TrendingDown } from 'lucide-react';
import { taStudents } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';

export function TATracking() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const belowAvg = taStudents.filter(s => s.labGrade < 70);

  const gradeColor = (g: number) => g >= 80 ? 'text-green-600' : g >= 60 ? 'text-amber-600' : 'text-red-600';
  const pctColor   = (p: number) => p >= 25 ? 'text-red-600'   : p >= 15 ? 'text-amber-600' : 'text-neutral-900 dark:text-white';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Student Tracking</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Monitor below-average students and log follow-ups</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Below Average"   value={belowAvg.length} subtitle="Grade < 70%"           icon={TrendingDown} color="red"    />
        <StatCard title="Extra Sessions"  value="2"               subtitle="Scheduled this week"    icon={Calendar}    color="orange" />
        <StatCard title="Doctor Alerts"   value="3"               subtitle="Sent this month"        icon={Send}        color="blue"   />
      </div>

      <Card title="Below-Average Students" subtitle="Grade below 70% in my sections">
        <div className="space-y-4">
          {belowAvg.map(s => (
            <div key={s.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-red-700">{s.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-neutral-500">{s.section} · {s.studentId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-600">{s.labGrade}%</span>
                  <p className="text-xs text-neutral-500">Lab grade</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  ['Quiz 1', s.quiz1, gradeColor(s.quiz1)],
                  ['Quiz 2', s.quiz2, gradeColor(s.quiz2)],
                  ['Absences', s.absences, pctColor(s.absencePct)],
                ].map(([label, val, cls]) => (
                  <div key={String(label)} className="p-2 rounded-lg bg-white dark:bg-neutral-700 text-center">
                    <p className="text-xs text-neutral-500">{label}</p>
                    <p className={`text-sm font-bold ${cls}`}>{val}%</p>
                  </div>
                ))}
              </div>

              <textarea
                value={notes[s.id] ?? s.notes}
                onChange={e => setNotes(n => ({ ...n, [s.id]: e.target.value }))}
                placeholder="Log follow-up notes…"
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />

              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="secondary">
                  <Calendar className="w-3.5 h-3.5" /> Schedule Session
                </Button>
                <Button size="sm" variant="danger" onClick={() => alert(`Doctor notified about ${s.name}`)}>
                  <Send className="w-3.5 h-3.5" /> Notify Doctor
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Office Hours & Extra Sessions">
        <div className="space-y-3">
          {[
            { day: 'Monday',   time: '14:00–15:00', type: 'Office Hours',          room: 'Room 204', color: 'border-green-500 bg-green-50 dark:bg-green-950/20' },
            { day: 'Saturday', time: '10:00–11:30', type: 'Extra Session – Sec 1', room: 'Lab 3',   color: 'border-red-500   bg-red-50   dark:bg-red-950/20'   },
            { day: 'Saturday', time: '12:00–13:30', type: 'Extra Session – Sec 2', room: 'Lab 5',   color: 'border-blue-500  bg-blue-50  dark:bg-blue-950/20'  },
          ].map((e, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${e.color}`}>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{e.type}</p>
                <p className="text-xs text-neutral-500">{e.day} · {e.time} · {e.room}</p>
              </div>
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Scheduled</span>
            </div>
          ))}
          <Button variant="secondary" className="w-full justify-center">+ Add Session</Button>
        </div>
      </Card>
    </div>
  );
}

