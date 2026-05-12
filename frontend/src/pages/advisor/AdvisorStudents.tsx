 // src/pages/advisor/AdvisorStudents.tsx
// MODIFIED: Updated internal navigation from /advisor/interventions → /ta/interventions
//           (Advisor role removed; this page now lives under the TA role at /ta/my-students)
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const STUDENTS = [
  { id: 'as1', name: 'Ahmed Hassan',    major: 'CS',     year: 3, gpa: 3.8, attendance: 92, risk: 'Normal',   interventions: 0 },
  { id: 'as2', name: 'Fatima Al-Zahra', major: 'CS',     year: 2, gpa: 2.1, attendance: 61, risk: 'High',     interventions: 2 },
  { id: 'as3', name: 'Omar Mahmoud',    major: 'Math',   year: 4, gpa: 3.5, attendance: 88, risk: 'Low',      interventions: 1 },
  { id: 'as4', name: 'Layla Ibrahim',   major: 'Physics', year: 1, gpa: 1.7, attendance: 48, risk: 'Critical', interventions: 3 },
];

export function AdvisorStudents() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.major.toLowerCase().includes(search.toLowerCase())
  );

  const riskVariant: Record<string, string> = { Normal: 'normal', Low: 'low', High: 'high', Critical: 'critical' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Students</h1>
        <p className="text-sm text-neutral-500 mt-0.5">All students assigned to your advisory portfolio</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or major…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(s => (
          <Card key={s.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-red-700">{s.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-neutral-500">{s.major} · Year {s.year}</p>
                </div>
              </div>
              <Badge variant={riskVariant[s.risk] as any}>{s.risk}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                ['GPA', s.gpa, s.gpa >= 3.0 ? 'text-green-600' : 'text-red-600'],
                ['Attendance', `${s.attendance}%`, s.attendance < 75 ? 'text-red-600' : 'text-green-600'],
                ['Plans', s.interventions, 'text-neutral-900 dark:text-white'],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-center">
                  <p className="text-xs text-neutral-500">{label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1 justify-center">
                View Profile
              </Button>
              <Button size="sm" className="flex-1 justify-center" onClick={() => navigate('/ta/interventions')}>
                New Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}