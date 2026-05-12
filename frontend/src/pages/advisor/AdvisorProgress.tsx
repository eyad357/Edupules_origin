// src/pages/advisor/AdvisorProgress.tsx
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';

const STUDENTS = [
  { name: 'Ahmed Hassan',    gpa: 3.8, risk: 'Normal'   },
  { name: 'Fatima Al-Zahra', gpa: 2.1, risk: 'High'     },
  { name: 'Omar Mahmoud',    gpa: 3.5, risk: 'Low'      },
  { name: 'Layla Ibrahim',   gpa: 1.7, risk: 'Critical' },
];

const TREND = [
  { month: 'Sep', improved: 2, stable: 8, declined: 3 },
  { month: 'Oct', improved: 3, stable: 7, declined: 3 },
  { month: 'Nov', improved: 5, stable: 6, declined: 2 },
  { month: 'Dec', improved: 4, stable: 7, declined: 2 },
];

const riskVariant: Record<string, any> = { Normal: 'normal', Low: 'low', High: 'high', Critical: 'critical' };

export function AdvisorProgress() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Progress Tracking</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Student improvement and outcomes over time</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Improved"  value="7" subtitle="This month"    icon={ArrowUpRight}   color="green" />
        <StatCard title="Stable"    value="5" subtitle="No change"     icon={Activity}       color="blue"  />
        <StatCard title="Declined"  value="2" subtitle="Need attention" icon={ArrowDownRight} color="red"   />
      </div>

      <Card title="Monthly Outcome Trend" subtitle="Student outcome distribution per month">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="improved" name="Improved" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stable"   name="Stable"   fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="declined" name="Declined" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Individual Progress" subtitle="GPA progress bar per student">
        <div className="space-y-5">
          {STUDENTS.map(s => (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={riskVariant[s.risk]}>{s.risk}</Badge>
                  <span className="text-xs text-neutral-500">GPA {s.gpa}</span>
                </div>
              </div>
              <ProgressBar
                value={s.gpa * 25}
                color={
                  s.gpa >= 3.5 ? 'bg-green-500' :
                  s.gpa >= 2.5 ? 'bg-blue-500'  :
                  s.gpa >= 2.0 ? 'bg-amber-500' : 'bg-red-500'
                }
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
