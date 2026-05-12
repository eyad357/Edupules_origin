import { useState } from 'react';
import { 
  Users, BookOpen, AlertTriangle, TrendingUp, Search,
  ChevronRight, GraduationCap, BarChart3, Flame
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { 
  mockStudents, mockRiskAssessments, mockCourses, mockQuizSubmissions 
} from '../lib/mockData';
import { cn } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const coursePerformance = [
  { course: 'CS301', avg: 78, max: 98, min: 45 },
  { course: 'MATH201', avg: 72, max: 95, min: 38 },
  { course: 'PHYS401', avg: 81, max: 99, min: 55 },
  { course: 'CHEM101', avg: 68, max: 92, min: 32 },
  { course: 'BIO301', avg: 75, max: 96, min: 48 },
];

const studentRadar = [
  { subject: 'Assignments', A: 85, fullMark: 100 },
  { subject: 'Attendance', A: 70, fullMark: 100 },
  { subject: 'Participation', A: 60, fullMark: 100 },
  { subject: 'Quizzes', A: 75, fullMark: 100 },
  { subject: 'Projects', A: 80, fullMark: 100 },
  { subject: 'Exams', A: 65, fullMark: 100 },
];

export function ProfessorDashboard() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const myStudents = mockStudents.slice(0, 6);
  const atRiskStudents = myStudents.filter(s => {
    const risk = mockRiskAssessments.find(r => r.student_id === s.id);
    return risk && (risk.risk_level === 'High' || risk.risk_level === 'Critical');
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Professor Dashboard</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Monitor your courses and student performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Students" value={myStudents.length} icon={Users} color="red" />
        <StatCard title="At Risk" value={atRiskStudents.length} subtitle="Need attention" icon={AlertTriangle} color="orange" />
        <StatCard title="Avg Score" value="74.2%" subtitle="Across all courses" icon={BarChart3} color="blue" />
        <StatCard title="Courses" value={mockCourses.length} subtitle="Active this semester" icon={BookOpen} color="purple" />
      </div>

      {/* Risk Heatmap & Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Heatmap */}
        <Card title="Risk Heatmap" subtitle="Students by risk level">
          <div className="space-y-3">
            {myStudents.map(student => {
              const risk = mockRiskAssessments.find(r => r.student_id === student.id);
              const riskColors = {
                Normal: 'bg-emerald-500',
                Low: 'bg-yellow-500',
                High: 'bg-orange-500',
                Critical: 'bg-red-500',
              };
              return (
                <div 
                  key={student.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                  onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                >
                  <div className={cn("w-3 h-12 rounded-full", riskColors[risk?.risk_level as keyof typeof riskColors] || 'bg-neutral-300')} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{student.name}</p>
                      <Badge variant={risk?.risk_level.toLowerCase() as any || 'normal'}>{risk?.risk_level}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <ProgressBar value={risk?.probability || 0} size="sm" className="flex-1" />
                      <span className="text-xs text-neutral-500 w-10 text-right">{risk?.probability}%</span>
                    </div>
                    {selectedStudent === student.id && (
                      <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Grades Impact</span>
                          <span className="font-medium">{risk?.grades_impact}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Attendance Impact</span>
                          <span className="font-medium">{risk?.attendance_impact}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Activity Impact</span>
                          <span className="font-medium">{risk?.activity_impact}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Dropout Probability</span>
                          <span className="font-medium text-red-600">{risk?.dropout_probability}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Course Performance */}
        <Card title="Course Performance" subtitle="Score distribution by course">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="course" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e5e5', 
                    borderRadius: '8px' 
                  }}
                />
                <Bar dataKey="avg" fill="#DC2626" radius={[4, 4, 0, 0]} name="Average" />
                <Bar dataKey="max" fill="#F87171" radius={[4, 4, 0, 0]} name="Highest" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Student Radar & Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Student Profile" subtitle="Performance dimensions" className="lg:col-span-1">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={studentRadar}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#737373' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#a3a3a3' }} />
                <Radar name="Performance" dataKey="A" stroke="#DC2626" fill="#DC2626" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Student Rankings" subtitle="Top performers this semester" className="lg:col-span-2">
          <div className="space-y-2">
            {myStudents
              .sort((a, b) => b.gpa - a.gpa)
              .map((student, index) => {
                const risk = mockRiskAssessments.find(r => r.student_id === student.id);
                return (
                  <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-neutral-200 text-neutral-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-neutral-100 text-neutral-500"
                    )}>
                      {index + 1}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400">{student.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-neutral-500">{student.major}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{student.gpa.toFixed(2)}</p>
                      <p className="text-xs text-neutral-500">GPA</p>
                    </div>
                    <div className="text-right w-20">
                      <ProgressBar value={risk?.probability || 0} size="sm" />
                      <p className="text-xs text-neutral-400 mt-0.5">{risk?.probability}% risk</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
