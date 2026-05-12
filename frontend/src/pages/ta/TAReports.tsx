// src/pages/ta/TAReports.tsx
import { useState } from 'react';
import { Download, Send, CalendarDays, BarChart3, AlertTriangle } from 'lucide-react';
import { taStudents } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WEEK_DATA: Record<string, { s1Att: number; s2Att: number; s1Grade: number; s2Grade: number; prob: number; notes: string }> = {
  '10': { s1Att: 90, s2Att: 85, s1Grade: 82, s2Grade: 78, prob: 3, notes: 'Good engagement this week. Quiz 2 results pending. Sec 1 performing above average.' },
  '9':  { s1Att: 88, s2Att: 87, s1Grade: 80, s2Grade: 76, prob: 4, notes: 'Sec 2 struggled with recursion. Extra session scheduled for Saturday.' },
};

const TREND = [
  { week: 'W7',  sec1: 88, sec2: 82 },
  { week: 'W8',  sec1: 84, sec2: 80 },
  { week: 'W9',  sec1: 80, sec2: 76 },
  { week: 'W10', sec1: 82, sec2: 78 },
];

export function TAReports() {
  const [selectedWeek, setSelectedWeek] = useState('10');
  const d = WEEK_DATA[selectedWeek] ?? WEEK_DATA['10'];
  const problemStudents = taStudents.filter(s => s.labGrade < 70);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Weekly Reports</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Section performance · attendance · problem students</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none"
          >
            <option value="10">Week 10</option>
            <option value="9">Week 9</option>
          </select>
          <Button variant="secondary">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Sec 1 Attendance"  value={`${d.s1Att}%`}    subtitle="This week"   icon={CalendarDays}  color="green"  />
        <StatCard title="Sec 2 Attendance"  value={`${d.s2Att}%`}    subtitle="This week"   icon={CalendarDays}  color="blue"   />
        <StatCard title="Sec 1 Avg Grade"   value={`${d.s1Grade}%`}  subtitle="Lab + Quiz"  icon={BarChart3}     color="red"    />
        <StatCard title="Problem Students"  value={d.prob}            subtitle="Below avg"   icon={AlertTriangle} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Week-to-Week Grade Trend" subtitle="Sec 1 vs Sec 2">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sec1" name="Sec 1" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sec2" name="Sec 2" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={`Week ${selectedWeek} Summary`} subtitle="Auto-generated report">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">{d.notes}</p>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Problem Students</p>
              {problemStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-red-700">{s.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">{s.labGrade}%</span>
                </div>
              ))}
            </div>

            <Button className="w-full justify-center" onClick={() => alert('Report sent to doctor!')}>
              <Send className="w-4 h-4" /> Send Report to Doctor
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

