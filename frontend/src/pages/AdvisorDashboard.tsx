import { useState } from 'react';
import { 
  Users, Shield, TrendingUp, MessageSquare, Calendar,
  CheckCircle2, Clock, AlertTriangle, ChevronRight,
  Plus, Search, Filter
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';
import { 
  mockStudents, mockRiskAssessments, mockInterventions,
  generateTimeSeries
} from '../lib/mockData';
import { cn } from '../lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const improvementData = [
  { week: 'W1', improved: 2, stable: 8, declined: 3 },
  { week: 'W2', improved: 3, stable: 7, declined: 3 },
  { week: 'W3', improved: 5, stable: 6, declined: 2 },
  { week: 'W4', improved: 4, stable: 7, declined: 2 },
  { week: 'W5', improved: 6, stable: 5, declined: 2 },
  { week: 'W6', improved: 7, stable: 5, declined: 1 },
];

export function AdvisorDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const assignedStudents = mockStudents.slice(1, 5); // 4 students
  const myInterventions = mockInterventions;

  const filteredInterventions = myInterventions.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    const student = mockStudents.find(s => s.id === i.student_id);
    return student?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    totalStudents: assignedStudents.length,
    activeInterventions: myInterventions.filter(i => i.status === 'active').length,
    completedThisMonth: 3,
    avgImprovement: 12,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Advisor Dashboard</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your assigned students and interventions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Intervention
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Students" value={stats.totalStudents} subtitle="Assigned to you" icon={Users} color="red" />
        <StatCard title="Active Plans" value={stats.activeInterventions} subtitle="In progress" icon={Shield} color="orange" />
        <StatCard title="Completed" value={stats.completedThisMonth} subtitle="This month" icon={CheckCircle2} color="green" />
        <StatCard title="Avg Improvement" value={`+${stats.avgImprovement}%`} subtitle="Risk reduction" icon={TrendingUp} color="blue" />
      </div>

      {/* Students & Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <Card title="My Students" subtitle="Click to view details" className="lg:col-span-1">
          <div className="space-y-2">
            {assignedStudents.map(student => {
              const risk = mockRiskAssessments.find(r => r.student_id === student.id);
              const interventionCount = mockInterventions.filter(i => i.student_id === student.id).length;
              const isSelected = selectedStudent === student.id;

              return (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(isSelected ? null : student.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all border",
                    isSelected 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10" 
                      : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-700 dark:text-red-400">{student.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{student.name}</p>
                      <p className="text-xs text-neutral-500">{student.major} • GPA {student.gpa}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={risk?.risk_level.toLowerCase() as any || 'normal'} className="text-xs">
                        {risk?.risk_level}
                      </Badge>
                      <p className="text-xs text-neutral-400 mt-1">{interventionCount} plans</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900/20 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Dropout Risk</span>
                        <span className="font-medium text-red-600">{risk?.dropout_probability}%</span>
                      </div>
                      <ProgressBar value={risk?.dropout_probability || 0} size="sm" />
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Graduation Delay</span>
                        <span className="font-medium">{risk?.graduation_delay_likelihood}%</span>
                      </div>
                      <ProgressBar value={risk?.graduation_delay_likelihood || 0} size="sm" color="bg-orange-500" />
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Scholarship</span>
                        <span className="font-medium text-emerald-600">{risk?.scholarship_eligibility}%</span>
                      </div>
                      <ProgressBar value={risk?.scholarship_eligibility || 0} size="sm" color="bg-emerald-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Intervention Management */}
        <Card 
          title="Intervention Plans" 
          subtitle="Manage and track progress"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs w-32 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          }
        >
          <div className="space-y-3">
            {filteredInterventions.map(plan => {
              const student = mockStudents.find(s => s.id === plan.student_id);
              const completedActions = plan.actions.filter(a => a.completed).length;
              const progress = (completedActions / plan.actions.length) * 100;

              return (
                <div key={plan.id} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">{student?.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{plan.title}</h4>
                        <p className="text-xs text-neutral-500">{student?.name} • {plan.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={plan.priority === 'high' ? 'critical' : plan.priority === 'medium' ? 'warning' : 'normal'}>
                        {plan.priority}
                      </Badge>
                      <Badge variant={plan.status === 'active' ? 'info' : plan.status === 'completed' ? 'normal' : 'warning'}>
                        {plan.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">Progress</span>
                      <span className="font-medium">{completedActions}/{plan.actions.length} actions</span>
                    </div>
                    <ProgressBar value={progress} size="sm" color="bg-red-500" />
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due {plan.deadline ? new Date(plan.deadline).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Created {new Date(plan.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Improvement Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Student Improvement" subtitle="Weekly trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={improvementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="week" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                />
                <Bar dataKey="improved" fill="#10B981" radius={[4, 4, 0, 0]} name="Improved" />
                <Bar dataKey="stable" fill="#6B7280" radius={[4, 4, 0, 0]} name="Stable" />
                <Bar dataKey="declined" fill="#DC2626" radius={[4, 4, 0, 0]} name="Declined" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Activity" subtitle="Latest updates">
          <div className="space-y-3">
            {[
              { action: 'Intervention completed', student: 'Bob Smith', detail: 'Academic Recovery Plan', time: '2 hours ago', type: 'success' },
              { action: 'Risk level changed', student: 'David Brown', detail: 'High → Critical', time: '5 hours ago', type: 'warning' },
              { action: 'New intervention created', student: 'Frank Lee', detail: 'Engagement Boost Plan', time: '1 day ago', type: 'info' },
              { action: 'Grade updated', student: 'Carol White', detail: 'Physics 401: A- → A', time: '2 days ago', type: 'success' },
              { action: 'Attendance alert', student: 'Henry Wilson', detail: '3 consecutive absences', time: '3 days ago', type: 'warning' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  item.type === 'success' ? 'bg-emerald-500' : item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                )} />
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 dark:text-white">
                    <span className="font-medium">{item.action}</span>
                    <span className="text-neutral-500"> — {item.student}</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.detail}</p>
                </div>
                <span className="text-xs text-neutral-400">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
