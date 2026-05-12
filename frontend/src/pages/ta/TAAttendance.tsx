// src/pages/ta/TAAttendance.tsx
import { useState } from 'react';
import { Printer, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { taStudents } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function TAAttendance() {
  const [selectedSection, setSelectedSection] = useState<'Sec 1' | 'Sec 2'>('Sec 1');
  const [date, setDate] = useState('2025-10-15');
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    taStudents.forEach(s => { init[s.id] = true; });
    return init;
  });

  const students     = taStudents.filter(s => s.section === selectedSection);
  const presentCount = students.filter(s => attendance[s.id]).length;
  const rate         = Math.round((presentCount / students.length) * 100);

  const pctColor = (p: number) =>
    p >= 25 ? 'text-red-600' : p >= 15 ? 'text-amber-600' : 'text-green-600';
  const barColor = (p: number) =>
    p >= 25 ? 'bg-red-500' : p >= 15 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Attendance System</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Electronic attendance with auto-tracking</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" /> Print Sheet
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2">Section</p>
            <div className="flex gap-2">
              {(['Sec 1', 'Sec 2'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSection(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSection === s
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>
        </div>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Present" value={presentCount} subtitle={`of ${students.length}`} icon={CheckCircle2} color="green" />
        <StatCard title="Absent"  value={students.length - presentCount} subtitle="today" icon={XCircle} color="red" />
        <StatCard title="Rate"    value={`${rate}%`} subtitle="this session" icon={BarChart3} color="blue" />
      </div>

      {/* Attendance sheet */}
      <Card title={`${selectedSection} — ${date}`} subtitle="Check present students">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                {['Student', 'ID', 'Total Absences', 'Absence %', 'Status', 'Present Today'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-red-700">{s.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-500">{s.studentId}</td>
                  <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">{s.absences}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={s.absencePct} size="sm" color={barColor(s.absencePct)} className="w-20" />
                      <span className={`text-xs font-semibold ${pctColor(s.absencePct)}`}>
                        {s.absencePct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={s.status}>
                      {s.status === 'ban' ? '⚠ Ban Risk' : s.status === 'warning' ? '⚡ Warning' : '✓ Good'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={attendance[s.id] ?? true}
                      onChange={e => setAttendance(a => ({ ...a, [s.id]: e.target.checked }))}
                      className="w-5 h-5 rounded accent-red-600 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button className="flex-1 justify-center" onClick={() => alert('Attendance saved!')}>
            Save Attendance
          </Button>
          <Button
            variant="secondary"
            className="flex-1 justify-center"
            onClick={() => setAttendance(a => {
              const next = { ...a };
              students.forEach(s => { next[s.id] = true; });
              return next;
            })}
          >
            Mark All Present
          </Button>
        </div>
      </Card>

      {/* Threshold legend */}
      <Card title="Alert Thresholds">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { border: 'border-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', titleColor: 'text-amber-700', bodyColor: 'text-amber-600', title: '⚡ First Warning', body: 'Absence rate ≥ 15% — doctor notified automatically' },
            { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20', titleColor: 'text-red-700', bodyColor: 'text-red-600', title: '⚠ Ban Threshold', body: 'Absence rate ≥ 25% — student barred from final exam' },
            { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-950/20', titleColor: 'text-green-700', bodyColor: 'text-green-600', title: '✓ Backup Sheets', body: 'Click Print Sheet for physical attendance backup' },
          ].map((t, i) => (
            <div key={i} className={`p-4 rounded-lg border-l-4 ${t.border} ${t.bg}`}>
              <p className={`text-sm font-semibold ${t.titleColor}`}>{t.title}</p>
              <p className={`text-xs mt-1 ${t.bodyColor}`}>{t.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

