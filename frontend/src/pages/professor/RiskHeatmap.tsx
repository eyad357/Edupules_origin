import { useState } from 'react';
import { AlertTriangle, Flame, Info } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { mockStudents, mockRiskAssessments, mockCourses } from '../../lib/mockData';
import { cn } from '../../lib/utils';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const riskColors: Record<string, string> = {
  Normal: '#10b981',
  Low: '#f59e0b',
  High: '#f97316',
  Critical: '#dc2626',
};

const riskBg: Record<string, string> = {
  Normal: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30',
  Low: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30',
  High: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30',
  Critical: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30',
};

export function RiskHeatmap() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const studentsWithRisk = mockStudents.map(s => ({
    ...s,
    risk: mockRiskAssessments.find(r => r.student_id === s.id),
  }));

  const filtered = selectedLevel
    ? studentsWithRisk.filter(s => s.risk?.risk_level === selectedLevel)
    : studentsWithRisk;

  // Scatter chart data: x = attendance impact, y = grades impact, size by probability
  const scatterData = studentsWithRisk.map(s => ({
    name: s.name,
    x: s.risk?.attendance_impact || 0,
    y: s.risk?.grades_impact || 0,
    z: s.risk?.probability || 0,
    level: s.risk?.risk_level || 'Normal',
  }));

  const levelCounts = {
    Critical: studentsWithRisk.filter(s => s.risk?.risk_level === 'Critical').length,
    High: studentsWithRisk.filter(s => s.risk?.risk_level === 'High').length,
    Low: studentsWithRisk.filter(s => s.risk?.risk_level === 'Low').length,
    Normal: studentsWithRisk.filter(s => s.risk?.risk_level === 'Normal').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Risk Heatmap</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Visual overview of student risk levels across all courses</p>
      </div>

      {/* Risk level summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['Critical', 'High', 'Low', 'Normal'] as const).map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all duration-200",
              riskBg[level],
              selectedLevel === level ? "ring-2 ring-offset-1 shadow-md" : "hover:shadow-sm"
            )}
            style={selectedLevel === level ? { ringColor: riskColors[level] } : {}}
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-5 h-5" style={{ color: riskColors[level] }} />
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">{levelCounts[level]}</span>
            </div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{level} Risk</p>
            <p className="text-xs text-neutral-500 mt-0.5">{Math.round(levelCounts[level] / mockStudents.length * 100)}% of students</p>
          </button>
        ))}
      </div>

      {selectedLevel && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-400">
          <Info className="w-4 h-4 shrink-0" />
          Showing only <strong className="text-neutral-900 dark:text-white">{selectedLevel}</strong> risk students.
          <button onClick={() => setSelectedLevel(null)} className="ml-auto text-red-600 hover:text-red-700 font-medium">Clear filter</button>
        </div>
      )}

      {/* Scatter Chart */}
      <Card title="Risk Distribution Matrix" subtitle="Grades vs Attendance impact — bubble size = overall risk probability">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis type="number" dataKey="x" name="Attendance Impact" stroke="#737373" fontSize={12}
                label={{ value: 'Attendance Impact (%)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#737373' }} />
              <YAxis type="number" dataKey="y" name="Grades Impact" stroke="#737373" fontSize={12}
                label={{ value: 'Grades Impact (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#737373' }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">{d.name}</p>
                        <p className="text-xs text-neutral-500">Attendance: {d.x}%</p>
                        <p className="text-xs text-neutral-500">Grades: {d.y}%</p>
                        <p className="text-xs font-medium mt-1" style={{ color: riskColors[d.level] }}>{d.level} ({d.z}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} name="Students">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={riskColors[entry.level]} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Student Heatmap Grid */}
      <Card title="Student Risk Grid" subtitle="All students sorted by risk level">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered
            .sort((a, b) => (b.risk?.probability || 0) - (a.risk?.probability || 0))
            .map(student => {
              const riskLevel = student.risk?.risk_level || 'Normal';
              return (
                <div
                  key={student.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    riskBg[riskLevel]
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
                    style={{ backgroundColor: riskColors[riskLevel] }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{student.name}</p>
                      <Badge variant={(riskLevel.toLowerCase() as 'normal' | 'low' | 'high' | 'critical')}>
                        {riskLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{student.major} · GPA {student.gpa.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <ProgressBar value={student.risk?.probability || 0} size="sm" className="flex-1" />
                      <span className="text-xs font-medium shrink-0" style={{ color: riskColors[riskLevel] }}>
                        {student.risk?.probability}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Course Risk Summary */}
      <Card title="Risk by Course" subtitle="Student risk distribution per course">
        <div className="space-y-4">
          {mockCourses.slice(0, 4).map((course, i) => {
            const courseRisk = [
              { level: 'Normal', pct: 40 - i * 5 },
              { level: 'Low', pct: 25 },
              { level: 'High', pct: 20 + i * 3 },
              { level: 'Critical', pct: 15 - i * 2 },
            ];
            return (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{course.code}</span>
                    <span className="text-xs text-neutral-500 ml-2">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {courseRisk.filter(r => r.level === 'Critical' || r.level === 'High').map(r => (
                      <span key={r.level} className="text-xs font-medium" style={{ color: riskColors[r.level] }}>
                        {r.pct}% {r.level}
                      </span>
                    )).slice(0, 1)}
                  </div>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {courseRisk.map(r => (
                    <div
                      key={r.level}
                      className="h-full transition-all"
                      style={{ width: `${r.pct}%`, backgroundColor: riskColors[r.level] }}
                      title={`${r.level}: ${r.pct}%`}
                    />
                  ))}
                </div>
                <div className="flex gap-4 mt-1.5">
                  {courseRisk.map(r => (
                    <div key={r.level} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: riskColors[r.level] }} />
                      <span className="text-xs text-neutral-500">{r.level} {r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
