// src/pages/student/StudentProgress.tsx
// Academic progress tracking with degree map, credit hours, and course status

import { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, Clock, ChevronRight, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { cn } from '../../lib/utils';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

const degreeRequirements = {
  totalCredits: 130,
  completedCredits: 78,
  inProgressCredits: 15,
  categories: [
    {
      name: 'Core Computer Science',
      credits: { required: 60, completed: 45, inProgress: 9 },
      courses: [
        { code: 'CS101', name: 'Intro to Programming', credits: 3, status: 'completed', grade: 'A', semester: 'Fall 2022' },
        { code: 'CS201', name: 'Data Structures', credits: 3, status: 'completed', grade: 'B+', semester: 'Spring 2023' },
        { code: 'CS301', name: 'Algorithms', credits: 3, status: 'inprogress', grade: null, semester: 'Fall 2024' },
        { code: 'CS310', name: 'Operating Systems', credits: 3, status: 'inprogress', grade: null, semester: 'Fall 2024' },
        { code: 'CS401', name: 'Database Systems', credits: 3, status: 'completed', grade: 'A-', semester: 'Spring 2024' },
        { code: 'CS410', name: 'Computer Networks', credits: 3, status: 'remaining', grade: null, semester: null },
        { code: 'CS450', name: 'Software Engineering', credits: 3, status: 'remaining', grade: null, semester: null },
        { code: 'CS490', name: 'Senior Project I', credits: 3, status: 'remaining', grade: null, semester: null },
      ]
    },
    {
      name: 'Mathematics',
      credits: { required: 24, completed: 18, inProgress: 3 },
      courses: [
        { code: 'MATH101', name: 'Calculus I', credits: 3, status: 'completed', grade: 'A', semester: 'Fall 2022' },
        { code: 'MATH102', name: 'Calculus II', credits: 3, status: 'completed', grade: 'B', semester: 'Spring 2023' },
        { code: 'MATH201', name: 'Linear Algebra', credits: 3, status: 'completed', grade: 'A-', semester: 'Fall 2023' },
        { code: 'MATH210', name: 'Discrete Mathematics', credits: 3, status: 'completed', grade: 'B+', semester: 'Spring 2024' },
        { code: 'MATH301', name: 'Probability & Statistics', credits: 3, status: 'inprogress', grade: null, semester: 'Fall 2024' },
        { code: 'MATH350', name: 'Numerical Methods', credits: 3, status: 'remaining', grade: null, semester: null },
      ]
    },
    {
      name: 'General Education',
      credits: { required: 30, completed: 15, inProgress: 3 },
      courses: [
        { code: 'ENG101', name: 'Academic Writing', credits: 3, status: 'completed', grade: 'B+', semester: 'Fall 2022' },
        { code: 'ENG201', name: 'Technical Writing', credits: 3, status: 'completed', grade: 'A', semester: 'Spring 2023' },
        { code: 'PHY101', name: 'Physics I', credits: 3, status: 'completed', grade: 'B', semester: 'Fall 2022' },
        { code: 'PHY102', name: 'Physics II', credits: 3, status: 'completed', grade: 'B-', semester: 'Spring 2023' },
        { code: 'HUM201', name: 'Ethics in Technology', credits: 3, status: 'inprogress', grade: null, semester: 'Fall 2024' },
        { code: 'SOC101', name: 'Sociology', credits: 3, status: 'remaining', grade: null, semester: null },
        { code: 'PHI201', name: 'Logic & Critical Thinking', credits: 3, status: 'remaining', grade: null, semester: null },
      ]
    },
    {
      name: 'Electives',
      credits: { required: 16, completed: 0, inProgress: 0 },
      courses: [
        { code: 'CS470', name: 'Machine Learning', credits: 3, status: 'remaining', grade: null, semester: null },
        { code: 'CS480', name: 'Computer Vision', credits: 3, status: 'remaining', grade: null, semester: null },
        { code: 'CS460', name: 'Cybersecurity', credits: 3, status: 'remaining', grade: null, semester: null },
        { code: 'CS455', name: 'Mobile App Development', credits: 3, status: 'remaining', grade: null, semester: null },
      ]
    }
  ]
};

const semesterGPAs = [
  { semester: 'Fall 22', gpa: 3.2 },
  { semester: 'Spr 23', gpa: 3.0 },
  { semester: 'Fall 23', gpa: 3.4 },
  { semester: 'Spr 24', gpa: 3.1 },
  { semester: 'Fall 24', gpa: 3.3 },
];

const skillRadar = [
  { skill: 'Programming', score: 85 },
  { skill: 'Math', score: 72 },
  { skill: 'Communication', score: 68 },
  { skill: 'Problem Solving', score: 80 },
  { skill: 'Teamwork', score: 75 },
  { skill: 'Research', score: 65 },
];

const gradeColors: Record<string, string> = {
  'A': '#16a34a', 'A-': '#22c55e', 'B+': '#84cc16', 'B': '#eab308',
  'B-': '#f97316', 'C+': '#ef4444', 'C': '#dc2626'
};

export function StudentProgress() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Core Computer Science');
  const completionPct = Math.round((degreeRequirements.completedCredits / degreeRequirements.totalCredits) * 100);
  const inProgressPct = Math.round((degreeRequirements.inProgressCredits / degreeRequirements.totalCredits) * 100);

  const statusConfig = {
    completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2, iconColor: 'text-emerald-600' },
    inprogress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Clock, iconColor: 'text-blue-600' },
    remaining: { label: 'Remaining', color: 'text-neutral-500', bg: 'bg-neutral-50 dark:bg-neutral-800', icon: Circle, iconColor: 'text-neutral-400' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Academic Progress</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Track your degree completion and academic performance</p>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Credits Completed', value: degreeRequirements.completedCredits, total: degreeRequirements.totalCredits, color: 'text-emerald-600' },
          { label: 'Credits In Progress', value: degreeRequirements.inProgressCredits, total: degreeRequirements.totalCredits, color: 'text-blue-600' },
          { label: 'Credits Remaining', value: degreeRequirements.totalCredits - degreeRequirements.completedCredits - degreeRequirements.inProgressCredits, total: degreeRequirements.totalCredits, color: 'text-neutral-500' },
          { label: 'Overall Completion', value: `${completionPct}%`, total: null, color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}{stat.total && <span className="text-sm text-neutral-400 font-normal"> / {stat.total}</span>}</p>
          </div>
        ))}
      </div>

      {/* Degree Progress Bar */}
      <Card title="Degree Progress Map" subtitle={`${degreeRequirements.completedCredits} of ${degreeRequirements.totalCredits} credit hours`}>
        <div className="mb-4">
          <div className="flex h-6 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <div className="bg-emerald-500 transition-all duration-500 flex items-center justify-center" style={{ width: `${completionPct}%` }}>
              <span className="text-xs text-white font-semibold">{completionPct}%</span>
            </div>
            <div className="bg-blue-400 transition-all" style={{ width: `${inProgressPct}%` }} />
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" />Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-400" />In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />Remaining</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          {degreeRequirements.categories.map(cat => {
            const catPct = Math.round((cat.credits.completed / cat.credits.required) * 100);
            const isOpen = expandedCategory === cat.name;
            return (
              <div key={cat.name} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(isOpen ? null : cat.name)}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-red-600" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{cat.name}</p>
                      <p className="text-xs text-neutral-500">{cat.credits.completed}/{cat.credits.required} credits • {cat.courses.length} courses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block w-32">
                      <ProgressBar value={catPct} size="sm" color="bg-red-500" />
                    </div>
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 w-10 text-right">{catPct}%</span>
                    <ChevronRight className={cn('w-4 h-4 text-neutral-400 transition-transform', isOpen && 'rotate-90')} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-100 dark:border-neutral-800">
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {cat.courses.map(course => {
                        const cfg = statusConfig[course.status as keyof typeof statusConfig];
                        const Icon = cfg.icon;
                        return (
                          <div key={course.code} className={cn('flex items-center justify-between px-4 py-3', cfg.bg)}>
                            <div className="flex items-center gap-3">
                              <Icon className={cn('w-4 h-4 shrink-0', cfg.iconColor)} />
                              <div>
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{course.code}</span>
                                <p className="text-sm text-neutral-800 dark:text-neutral-200">{course.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <span className="text-xs text-neutral-500">{course.credits} cr</span>
                              {course.semester && <span className="text-xs text-neutral-400 hidden sm:block">{course.semester}</span>}
                              {course.grade ? (
                                <span className="text-sm font-bold" style={{ color: gradeColors[course.grade] || '#737373' }}>{course.grade}</span>
                              ) : (
                                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>{cfg.label}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="GPA by Semester" subtitle="Academic performance trend">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterGPAs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="semester" fontSize={11} stroke="#737373" />
                <YAxis domain={[0, 4]} fontSize={11} stroke="#737373" />
                <Tooltip formatter={(v: number) => [v.toFixed(2), 'GPA']} />
                <Bar dataKey="gpa" radius={[4, 4, 0, 0]}>
                  {semesterGPAs.map((entry, index) => (
                    <Cell key={index} fill={entry.gpa >= 3.3 ? '#16a34a' : entry.gpa >= 3.0 ? '#dc2626' : '#f97316'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Skill Competency" subtitle="Based on course performance">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" fontSize={11} />
                <Radar dataKey="score" stroke="#DC2626" fill="#DC2626" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Projected Graduation */}
      <Card title="Graduation Timeline" subtitle="Estimated based on current enrollment">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1 space-y-3">
            {[
              { label: 'Expected Graduation', value: 'Spring 2026', icon: '🎓', color: 'text-emerald-600' },
              { label: 'Credits Remaining', value: `${degreeRequirements.totalCredits - degreeRequirements.completedCredits - degreeRequirements.inProgressCredits} credits`, icon: '📚', color: 'text-blue-600' },
              { label: 'Semesters Left', value: '3 semesters', icon: '📅', color: 'text-orange-600' },
              { label: 'Current Cumulative GPA', value: '3.15', icon: '⭐', color: 'text-red-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</span>
                </div>
                <span className={cn('text-sm font-bold', item.color)}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">AI Recommendation</p>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              To graduate on time with a strong GPA, consider enrolling in <strong>CS410 + MATH350</strong> next semester.
              Avoid taking more than 18 credit hours per semester based on your historical performance data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}