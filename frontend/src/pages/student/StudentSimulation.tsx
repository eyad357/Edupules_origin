// src/pages/student/StudentSimulation.tsx
// Academic Scenario Simulator — GPA what-if, graduation planning, course load optimizer

import { useState, useMemo } from 'react';
import {
  Brain, TrendingUp, TrendingDown, GraduationCap, Calculator,
  Lightbulb, RefreshCcw, ChevronRight, AlertTriangle, CheckCircle2, Target
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { cn } from '../../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, ReferenceLine
} from 'recharts';

const currentCourses = [
  { code: 'CS301', name: 'Algorithms', credits: 3, currentGrade: 72 },
  { code: 'CS310', name: 'Operating Systems', credits: 3, currentGrade: 85 },
  { code: 'MATH301', name: 'Probability & Statistics', credits: 3, currentGrade: 79 },
  { code: 'HUM201', name: 'Ethics in Technology', credits: 3, currentGrade: 91 },
  { code: 'CS320', name: 'Computer Architecture', credits: 3, currentGrade: 65 },
];

const completedCredits = 78;
const completedQualityPoints = 78 * 3.15; // cumulative GPA 3.15
const totalDegreeCredits = 130;

const gradeToGpa = (g: number) => {
  if (g >= 97) return 4.0;
  if (g >= 93) return 4.0;
  if (g >= 90) return 3.7;
  if (g >= 87) return 3.3;
  if (g >= 83) return 3.0;
  if (g >= 80) return 2.7;
  if (g >= 77) return 2.3;
  if (g >= 73) return 2.0;
  if (g >= 70) return 1.7;
  if (g >= 67) return 1.3;
  if (g >= 63) return 1.0;
  if (g >= 60) return 0.7;
  return 0.0;
};

const gradeToLetter = (g: number) => {
  if (g >= 97) return 'A+';
  if (g >= 93) return 'A';
  if (g >= 90) return 'A-';
  if (g >= 87) return 'B+';
  if (g >= 83) return 'B';
  if (g >= 80) return 'B-';
  if (g >= 77) return 'C+';
  if (g >= 73) return 'C';
  if (g >= 70) return 'C-';
  return 'F';
};

type Scenario = 'current' | 'best' | 'worst' | 'custom';

const scenarioPresets: Record<Scenario, { label: string; desc: string; color: string; grades: Record<string, number> }> = {
  current: { label: 'Current Trajectory', desc: 'Based on your current grades', color: 'text-blue-600', grades: {} },
  best: { label: 'Best Case', desc: 'All courses at A/A+', color: 'text-emerald-600', grades: { CS301: 95, CS310: 95, MATH301: 95, HUM201: 95, CS320: 95 } },
  worst: { label: 'Worst Case', desc: 'All courses barely passing', color: 'text-red-600', grades: { CS301: 62, CS310: 62, MATH301: 62, HUM201: 62, CS320: 62 } },
  custom: { label: 'Custom Scenario', desc: 'Adjust each course manually', color: 'text-purple-600', grades: {} },
};

export function StudentSimulation() {
  const [scenario, setScenario] = useState<Scenario>('current');
  const [customGrades, setCustomGrades] = useState<Record<string, number>>(() =>
    Object.fromEntries(currentCourses.map(c => [c.code, c.currentGrade]))
  );
  const [futureCreditsPerSem, setFutureCreditsPerSem] = useState(15);
  const [targetGPA, setTargetGPA] = useState(3.5);

  const activeGrades = useMemo(() => {
    if (scenario === 'custom') return customGrades;
    if (scenario === 'current') return Object.fromEntries(currentCourses.map(c => [c.code, c.currentGrade]));
    return scenarioPresets[scenario].grades;
  }, [scenario, customGrades]);

  const semesterCredits = currentCourses.reduce((a, c) => a + c.credits, 0);
  const semesterQualityPoints = currentCourses.reduce((a, c) => a + c.credits * gradeToGpa(activeGrades[c.code] ?? c.currentGrade), 0);
  const semesterGPA = semesterQualityPoints / semesterCredits;

  const newCompletedCredits = completedCredits + semesterCredits;
  const cumulativeGPA = (completedQualityPoints + semesterQualityPoints) / newCompletedCredits;

  const remainingAfterSem = totalDegreeCredits - newCompletedCredits;
  const semestersLeft = Math.ceil(remainingAfterSem / futureCreditsPerSem);
  const graduationYear = 2025 + Math.floor(semestersLeft / 2);
  const graduationSemester = semestersLeft % 2 === 1 ? 'Fall' : 'Spring';
  const onTime = semestersLeft <= 3;

  // "What GPA do I need?" calculation
  const totalFutureCredits = remainingAfterSem;
  const currentQualityPoints = completedQualityPoints + semesterQualityPoints;
  const neededQualityPoints = targetGPA * (newCompletedCredits + totalFutureCredits) - currentQualityPoints;
  const neededGPAPerCredit = neededQualityPoints / totalFutureCredits;
  const achievable = neededGPAPerCredit <= 4.0 && neededGPAPerCredit >= 0;

  // Timeline chart
  const timelineData = [
    { semester: 'Current', gpa: 3.15 },
    { semester: 'After This', gpa: Number(cumulativeGPA.toFixed(2)) },
    { semester: 'Next Sem', gpa: Math.min(4, cumulativeGPA + (scenario === 'best' ? 0.15 : scenario === 'worst' ? -0.2 : 0.05)) },
    { semester: 'Sem +2', gpa: Math.min(4, cumulativeGPA + (scenario === 'best' ? 0.25 : scenario === 'worst' ? -0.35 : 0.08)) },
    { semester: 'Graduation', gpa: Math.min(4, cumulativeGPA + (scenario === 'best' ? 0.3 : scenario === 'worst' ? -0.5 : 0.1)) },
  ];

  const riskLevel = cumulativeGPA >= 3.5 ? 'Low' : cumulativeGPA >= 3.0 ? 'Normal' : cumulativeGPA >= 2.5 ? 'High' : 'Critical';
  const dropoutRisk = cumulativeGPA >= 3.3 ? 12 : cumulativeGPA >= 2.8 ? 28 : cumulativeGPA >= 2.3 ? 52 : 71;
  const scholarshipEligible = cumulativeGPA >= 3.5;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-full border border-red-100 dark:border-red-900/20 mb-4">
          <Brain className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">Academic Scenario Simulator</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">What-If Engine</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-lg mx-auto text-sm">
          Simulate different grade outcomes, plan your course load, and see how your decisions affect graduation timeline.
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(scenarioPresets) as [Scenario, typeof scenarioPresets[Scenario]][]).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => setScenario(key)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              scenario === key
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-900'
            )}
          >
            <p className={cn('text-sm font-bold', scenario === key ? preset.color : 'text-neutral-700 dark:text-neutral-300')}>{preset.label}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{preset.desc}</p>
          </button>
        ))}
      </div>

      {/* Course Grade Sliders */}
      <Card title="Course Grade Simulation" subtitle={scenario === 'custom' ? 'Drag sliders to adjust projected grades' : 'View grades for selected scenario'}>
        <div className="space-y-4">
          {currentCourses.map(course => {
            const g = activeGrades[course.code] ?? course.currentGrade;
            const gpa = gradeToGpa(g);
            const letter = gradeToLetter(g);
            return (
              <div key={course.code} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-xs font-bold text-red-600">{course.code}</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{course.name}</p>
                  <p className="text-xs text-neutral-400">{course.credits} credits</p>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g}
                    disabled={scenario !== 'custom'}
                    onChange={e => setCustomGrades(prev => ({ ...prev, [course.code]: Number(e.target.value) }))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-red-600 disabled:opacity-60"
                  />
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>0</span><span>50</span><span>100</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{g}%</span>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: g >= 80 ? '#16a34a' : g >= 70 ? '#eab308' : '#dc2626' }}>{letter}</p>
                    <p className="text-xs text-neutral-400">GPA {gpa.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Semester GPA', value: semesterGPA.toFixed(2), sub: 'This semester only', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: 'Cumulative GPA', value: cumulativeGPA.toFixed(2), sub: 'After this semester', icon: TrendingUp, color: cumulativeGPA >= 3.3 ? 'text-emerald-600' : cumulativeGPA >= 2.8 ? 'text-orange-600' : 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10' },
          { label: 'GPA Change', value: `${cumulativeGPA - 3.15 >= 0 ? '+' : ''}${(cumulativeGPA - 3.15).toFixed(2)}`, sub: 'vs current 3.15', icon: cumulativeGPA >= 3.15 ? TrendingUp : TrendingDown, color: cumulativeGPA >= 3.15 ? 'text-emerald-600' : 'text-red-600', bg: 'bg-neutral-50 dark:bg-neutral-800' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={cn('rounded-xl border border-neutral-200 dark:border-neutral-800 p-5', stat.bg)}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn('w-4 h-4', stat.color)} />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</span>
              </div>
              <p className={cn('text-3xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* GPA Timeline Chart */}
      <Card title="Projected GPA Timeline" subtitle="How your GPA evolves toward graduation">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="semester" fontSize={11} stroke="#737373" />
              <YAxis domain={[2, 4]} fontSize={11} stroke="#737373" tickFormatter={v => v.toFixed(1)} />
              <Tooltip formatter={(v: number) => [v.toFixed(2), 'GPA']} />
              <ReferenceLine y={3.5} stroke="#16a34a" strokeDasharray="5 5" label={{ value: 'Honors 3.5', fill: '#16a34a', fontSize: 10 }} />
              <ReferenceLine y={2.0} stroke="#dc2626" strokeDasharray="5 5" label={{ value: 'Min 2.0', fill: '#dc2626', fontSize: 10 }} />
              <Area type="monotone" dataKey="gpa" stroke="#DC2626" fill="url(#gpaGrad)" strokeWidth={2.5} dot={{ fill: '#DC2626', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Graduation & Financial Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graduation Timeline */}
        <Card title="Graduation Planning" subtitle="Adjust future course load">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Credits per Semester</label>
                <span className="text-sm font-bold text-red-600">{futureCreditsPerSem} cr</span>
              </div>
              <input type="range" min={6} max={21} step={3} value={futureCreditsPerSem} onChange={e => setFutureCreditsPerSem(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-red-600" />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>6 (Light)</span><span>15 (Normal)</span><span>21 (Heavy)</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              {[
                { label: 'Credits After This Semester', value: `${newCompletedCredits} / ${totalDegreeCredits}` },
                { label: 'Remaining Credits', value: remainingAfterSem },
                { label: 'Semesters Remaining', value: semestersLeft },
                { label: 'Expected Graduation', value: `${graduationSemester} ${graduationYear}`, highlight: true },
                { label: 'Graduation Status', value: onTime ? '✅ On Track' : '⚠️ Delayed' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</span>
                  <span className={cn('text-sm font-bold', item.highlight ? 'text-red-600' : 'text-neutral-800 dark:text-neutral-200')}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-2">
              <p className="text-xs text-neutral-500 mb-2">Degree Completion</p>
              <ProgressBar value={newCompletedCredits} max={totalDegreeCredits} size="md" color="bg-red-500" />
              <p className="text-xs text-neutral-400 mt-1">{Math.round(newCompletedCredits / totalDegreeCredits * 100)}% complete</p>
            </div>
          </div>
        </Card>

        {/* GPA Target Calculator + Risk */}
        <div className="space-y-4">
          <Card title="GPA Target Calculator" subtitle="What average do you need to reach your goal?">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Target Graduation GPA</label>
                  <span className="text-sm font-bold text-red-600">{targetGPA.toFixed(1)}</span>
                </div>
                <input type="range" min={2.0} max={4.0} step={0.1} value={targetGPA} onChange={e => setTargetGPA(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-red-600" />
                <div className="flex justify-between text-xs text-neutral-400 mt-1"><span>2.0</span><span>3.0</span><span>4.0</span></div>
              </div>

              <div className={cn('p-4 rounded-xl border', achievable ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30')}>
                {achievable ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Achievable!</span>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      You need an average GPA of <strong>{neededGPAPerCredit.toFixed(2)}</strong> in your remaining {totalFutureCredits} credits to reach {targetGPA.toFixed(1)}.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-800 dark:text-red-300">Not achievable</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-400">This target requires a GPA above 4.0 in remaining courses. Consider adjusting your goal.</p>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card title="Outcome Impact">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Academic Risk Level</span>
                <Badge variant={riskLevel.toLowerCase() as 'normal' | 'low' | 'high' | 'critical'}>{riskLevel}</Badge>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Dropout Risk</span>
                  <span className={cn('text-sm font-bold', dropoutRisk > 40 ? 'text-red-600' : 'text-emerald-600')}>{dropoutRisk}%</span>
                </div>
                <ProgressBar value={dropoutRisk} size="sm" color={dropoutRisk > 40 ? 'bg-red-500' : 'bg-emerald-500'} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Scholarship Eligible</span>
                <span className={cn('text-sm font-bold', scholarshipEligible ? 'text-emerald-600' : 'text-neutral-500')}>
                  {scholarshipEligible ? '✅ Yes (GPA ≥ 3.5)' : '❌ No (Need ≥ 3.5)'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="p-5 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl text-white">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm mb-1">AI Academic Advisor Insight</p>
            {scenario === 'best' && (
              <p className="text-neutral-300 text-sm">Excellent projection! If you maintain A-level performance, you'll be scholarship-eligible and on track for early graduation. Focus on CS320 as it's your most challenging course this semester.</p>
            )}
            {scenario === 'worst' && (
              <p className="text-neutral-300 text-sm">⚠️ This trajectory puts you at high dropout risk. Immediate action recommended: attend office hours for CS301 and MATH301, and consider joining a study group. A 70%+ average is needed to stay on track.</p>
            )}
            {scenario === 'current' && (
              <p className="text-neutral-300 text-sm">You're on a stable path. Improving CS320 (currently 65%) by just 10 points would raise your GPA significantly. Consider attending extra sessions on Saturdays.</p>
            )}
            {scenario === 'custom' && (
              <p className="text-neutral-300 text-sm">Based on your custom scenario: cumulative GPA of {cumulativeGPA.toFixed(2)} projected. {cumulativeGPA >= 3.3 ? 'Strong performance — keep up this pace.' : 'Consider where you can improve and use practice mode to prepare for upcoming quizzes.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}