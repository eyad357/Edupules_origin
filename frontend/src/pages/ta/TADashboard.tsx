// src/pages/ta/TADashboard.tsx
import { useNavigate } from 'react-router-dom';
import { taStudents } from '../../lib/taMockData';
import { Users, AlertTriangle, BarChart3, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const weekData = [
  { week: 'W1', sec1: 78, sec2: 74 },
  { week: 'W2', sec1: 80, sec2: 76 },
  { week: 'W3', sec1: 75, sec2: 78 },
  { week: 'W4', sec1: 82, sec2: 80 },
  { week: 'W5', sec1: 85, sec2: 79 },
];

const quickActions = [
  { label: 'Take Attendance',    path: '/ta/attendance',   color: 'bg-red-600'    },
  { label: 'Enter Grades',       path: '/ta/grading',      color: 'bg-blue-600'   },
  { label: 'Send Announcement',  path: '/ta/communication',color: 'bg-green-600'  },
  { label: 'Weekly Report',      path: '/ta/reports',      color: 'bg-purple-600' },
];

export function TADashboard() {
  const navigate = useNavigate();
  const atRisk   = taStudents.filter(s => s.status !== 'good');
  const avgGrade = Math.round(taStudents.reduce((a, b) => a + b.labGrade, 0) / taStudents.length);
  const alerts   = taStudents.filter(s => s.absencePct >= 15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">TA Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-0.5">CS201 – Data Structures · Fall 2025</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Students"  value={taStudents.length} subtitle="Across 2 sections"                         icon={Users}         color="red"    />
        <StatCard title="At Risk"      value={atRisk.length}     subtitle={`${taStudents.filter(s=>s.status==='ban').length} at ban threshold`} icon={AlertTriangle} color="orange" />
        <StatCard title="Avg Grade"    value={`${avgGrade}%`}    subtitle="Lab + Quiz combined"                       icon={BarChart3}     color="blue"   />
        <StatCard title="Sessions"     value="18"                subtitle="This semester"                              icon={Calendar}      color="green"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Section Performance" subtitle="Grade averages by week" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sec1" name="Sec 1" stroke="#DC2626" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="sec2" name="Sec 2" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Absence Alerts" subtitle="Students needing attention">
          <div className="space-y-3">
            {alerts.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-8">No absence alerts 🎉</p>
            )}
            {alerts.map(s => (
              <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-neutral-500">{s.section} · {s.absences} absences</p>
                </div>
                <Badge variant={s.status}>{s.absencePct}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map(a => (
          <button
            key={a.path}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-red-300 hover:shadow-md transition-all"
          >
            <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{a.label.charAt(0)}</span>
            </div>
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

