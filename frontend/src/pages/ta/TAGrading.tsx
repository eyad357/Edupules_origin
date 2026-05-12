// src/pages/ta/TAGrading.tsx
import { useState } from 'react';
import { Upload, Download, BarChart2, Star } from 'lucide-react';
import { taStudents } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';

type GradeKey = 'labGrade' | 'quiz1' | 'quiz2';
type SectionFilter = 'All' | 'Sec 1' | 'Sec 2';

const TABS: { id: GradeKey; label: string }[] = [
  { id: 'labGrade', label: 'Lab Grades' },
  { id: 'quiz1',    label: 'Quiz 1'     },
  { id: 'quiz2',    label: 'Quiz 2'     },
];

function sectionAvg(sec: string, key: GradeKey) {
  const arr = taStudents.filter(s => s.section === sec);
  return Math.round(arr.reduce((a, b) => a + b[key], 0) / arr.length);
}

function letterGrade(g: number) {
  return g >= 90 ? 'A' : g >= 80 ? 'B' : g >= 70 ? 'C' : g >= 60 ? 'D' : 'F';
}
function gradeColor(g: number) {
  return g >= 80 ? 'text-green-600' : g >= 60 ? 'text-amber-600' : 'text-red-600';
}
function barColor(g: number) {
  return g >= 80 ? 'bg-green-500' : g >= 60 ? 'bg-amber-500' : 'bg-red-500';
}

export function TAGrading() {
  const [activeTab, setActiveTab]   = useState<GradeKey>('labGrade');
  const [section, setSection]       = useState<SectionFilter>('All');

  const filtered = section === 'All' ? taStudents : taStudents.filter(s => s.section === section);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Grading — Lab & Practical</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Upload grades, add comments, compare sections</p>
        </div>
        <Button><Upload className="w-4 h-4" /> Upload Grades</Button>
      </div>

      {/* Section comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Sec 1 Lab Avg"  value={`${sectionAvg('Sec 1','labGrade')}%`} subtitle="This semester" icon={BarChart2} color="red"    />
        <StatCard title="Sec 2 Lab Avg"  value={`${sectionAvg('Sec 2','labGrade')}%`} subtitle="This semester" icon={BarChart2} color="blue"   />
        <StatCard title="Sec 1 Quiz Avg" value={`${sectionAvg('Sec 1','quiz1')}%`}    subtitle="Quiz 1 avg"    icon={Star}     color="green"  />
        <StatCard title="Sec 2 Quiz Avg" value={`${sectionAvg('Sec 2','quiz1')}%`}    subtitle="Quiz 1 avg"    icon={Star}     color="purple" />
      </div>

      {/* Tab + filter row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={section}
          onChange={e => setSection(e.target.value as SectionFilter)}
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
        >
          <option>All</option>
          <option>Sec 1</option>
          <option>Sec 2</option>
        </select>
      </div>

      {/* Grade table */}
      <Card title="Grade Sheet">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                {['Student', 'Section', 'Grade', 'Letter', 'Comments'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const grade  = s[activeTab];
                const letter = letterGrade(grade);
                return (
                  <tr key={s.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-red-700">{s.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3"><Badge variant="info">{s.section}</Badge></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={grade} size="sm" color={barColor(grade)} className="w-20" />
                        <span className={`text-sm font-bold ${gradeColor(grade)}`}>{grade}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold text-sm ${gradeColor(grade)}`}>{letter}</span>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        className="w-full text-xs px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-red-400"
                        defaultValue={s.notes}
                        placeholder="Add comment…"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button className="justify-center" onClick={() => alert('Grades saved!')}>Save Grades</Button>
          <Button variant="secondary" className="justify-center">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </Card>
    </div>
  );
}

