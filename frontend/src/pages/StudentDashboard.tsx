import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Award, Flame, 
  BookOpen, Calendar, Clock, ChevronRight, Zap, Shield
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { 
  mockStudents, mockRiskAssessments, mockInterventions, 
  generateTimeSeries, mockQuizSubmissions 
} from '../lib/mockData';
import { cn } from '../lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export function StudentDashboard() {
  const [timeRange, setTimeRange] = useState('semester');

  // Demo: show first student as logged in
  const student = mockStudents[1]; // Bob Smith (at risk for better demo)
  const risk = mockRiskAssessments.find(r => r.student_id === student.id);
  const interventions = mockInterventions.filter(i => i.student_id === student.id);
  const timeSeries = generateTimeSeries(student.id);
  const submissions = mockQuizSubmissions.filter(s => s.student_id === student.id);

  const gamification = {
    points: 2450,
    streak: 12,
    level: 'Gold',
    nextLevel: 'Platinum',
    pointsToNext: 550,
    badges: [
      { name: 'Early Bird', icon: 'sun', earned: true },
      { name: 'Quiz Master', icon: 'brain', earned: true },
      { name: 'Perfect Week', icon: 'calendar', earned: true },
      { name: 'Helping Hand', icon: 'users', earned: false },
      { name: 'Top 10%', icon: 'trophy', earned: false },
    ]
  };

  const riskColor = {
    Normal: 'text-emerald-600',
    Low: 'text-yellow-600',
    High: 'text-orange-600',
    Critical: 'text-red-600',
  };

  const riskBg = {
    Normal: 'bg-emerald-50 dark:bg-emerald-900/20',
    Low: 'bg-yellow-50 dark:bg-yellow-900/20',
    High: 'bg-orange-50 dark:bg-orange-900/20',
    Critical: 'bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-xl font-bold text-red-700 dark:text-red-400">{student.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome back, {student.name.split(' ')[0]}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">{student.major} • Year {student.year}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{gamification.streak} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
            <Award className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">{gamification.points} pts</span>
          </div>
        </div>
      </div>

      {/* Risk Score Card */}
      <div className={cn("rounded-xl border p-6", riskBg[risk?.risk_level as keyof typeof riskBg] || 'bg-neutral-50', "border-red-100 dark:border-red-900/20")}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Risk Assessment</h2>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Based on your grades, attendance, and platform activity
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Grades: {risk?.grades_impact}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Attendance: {risk?.attendance_impact}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Activity: {risk?.activity_impact}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={cn("text-4xl font-bold", riskColor[risk?.risk_level as keyof typeof riskColor] || 'text-neutral-600')}>
                {risk?.probability}%
              </div>
              <p className="text-xs text-neutral-500 mt-1">Risk Probability</p>
            </div>
            <div className="w-px h-16 bg-red-200 dark:bg-red-900/30" />
            <div className="text-center">
              <Badge variant={risk?.risk_level.toLowerCase() as any || 'normal'} className="text-sm px-3 py-1">
                {risk?.risk_level}
              </Badge>
              <p className="text-xs text-neutral-500 mt-1">Risk Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Trend */}
        <Card title="GPA Trend" subtitle="Your performance over time" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="studentGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} stroke="#737373" fontSize={11} />
                <YAxis domain={[0, 4]} stroke="#737373" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                  formatter={(value: number) => [value.toFixed(2), 'GPA']}
                />
                <Area type="monotone" dataKey="gpa" stroke="#DC2626" fill="url(#studentGpa)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Multi-metric */}
        <Card title="Key Metrics" subtitle="Current semester">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Current GPA</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{student.gpa.toFixed(2)}</span>
              </div>
              <ProgressBar value={student.gpa} max={4} size="md" color="bg-red-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Attendance</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">68%</span>
              </div>
              <ProgressBar value={68} size="md" color="bg-orange-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Activity Score</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">52%</span>
              </div>
              <ProgressBar value={52} size="md" color="bg-yellow-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Dropout Risk</span>
                <span className="text-sm font-bold text-red-600">{risk?.dropout_probability}%</span>
              </div>
              <ProgressBar value={risk?.dropout_probability || 0} size="md" />
            </div>
          </div>
        </Card>
      </div>

      {/* Predictions & Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Predictions */}
        <Card title="AI Predictions" subtitle="Multi-target forecasting">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">Dropout Probability</span>
                </div>
                <span className="text-lg font-bold text-red-600">{risk?.dropout_probability}%</span>
              </div>
              <ProgressBar value={risk?.dropout_probability || 0} size="sm" className="mt-2" />
              <p className="text-xs text-red-600 mt-1">High risk - intervention recommended</p>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">Graduation Delay</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{risk?.graduation_delay_likelihood}%</span>
              </div>
              <ProgressBar value={risk?.graduation_delay_likelihood || 0} size="sm" className="mt-2" color="bg-orange-500" />
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">Scholarship Eligibility</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">{risk?.scholarship_eligibility}%</span>
              </div>
              <ProgressBar value={risk?.scholarship_eligibility || 0} size="sm" className="mt-2" color="bg-emerald-500" />
            </div>
          </div>
        </Card>

        {/* Intervention Plans */}
        <Card title="My Intervention Plans" subtitle="Personalized action items">
          {interventions.length > 0 ? (
            <div className="space-y-3">
              {interventions.map(plan => (
                <div key={plan.id} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{plan.title}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{plan.description}</p>
                    </div>
                    <Badge variant={plan.priority === 'high' ? 'critical' : plan.priority === 'medium' ? 'warning' : 'normal'}>
                      {plan.priority}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {plan.actions.map(action => (
                      <div key={action.id} className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center",
                          action.completed 
                            ? "bg-red-600 border-red-600" 
                            : "border-neutral-300 dark:border-neutral-600"
                        )}>
                          {action.completed && <Zap className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={cn(
                          "text-xs",
                          action.completed ? "text-neutral-400 line-through" : "text-neutral-700 dark:text-neutral-300"
                        )}>
                          {action.description}
                        </span>
                      </div>
                    ))}
                  </div>
                  {plan.deadline && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-neutral-500">
                      <Calendar className="w-3 h-3" />
                      <span>Due {new Date(plan.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-sm text-neutral-500 mt-2">No active interventions</p>
              <p className="text-xs text-neutral-400">You're doing great!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Gamification */}
      <Card title="Achievements" subtitle="Your progress and badges">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-center">
            <Award className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">{gamification.level}</p>
            <p className="text-xs text-neutral-500">Current Level</p>
            <div className="mt-3">
              <ProgressBar value={gamification.points} max={gamification.points + gamification.pointsToNext} size="sm" color="bg-red-500" />
              <p className="text-xs text-neutral-500 mt-1">{gamification.pointsToNext} pts to {gamification.nextLevel}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-center">
            <Flame className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">{gamification.streak}</p>
            <p className="text-xs text-neutral-500">Day Streak</p>
            <p className="text-xs text-amber-600 mt-2 font-medium">Keep it up!</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-center">
            <Target className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">{gamification.points}</p>
            <p className="text-xs text-neutral-500">Total Points</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">Top 15% of class</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {gamification.badges.map((badge, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
                badge.earned 
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30" 
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700"
              )}
            >
              <Award className="w-3 h-3" />
              {badge.name}
              {badge.earned && <Zap className="w-3 h-3" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
