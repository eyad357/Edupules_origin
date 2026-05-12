// src/pages/dean/DeanDepartments.tsx
// UPGRADE: Replaced deanMockData import with live data from GET /api/v1/analytics/departments

import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus, Users, BookOpen, GraduationCap, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnalyticsExtAPI } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ── Shape returned by GET /api/v1/analytics/departments ──────────────────────
interface ApiDepartment {
  name: string;
  short_name: string;
  code?: string;
  head?: string;           // populated when backend joins professors table
  student_count: number;
  faculty_count: number;
  avg_gpa: number;
  pass_rate: number;
  attendance_rate: number;
  at_risk: number;
  course_count: number;
  // trend is derived client-side from pass_rate; backend doesn't supply it yet
}

// Derive a simple trend indicator from pass rate (can be replaced when backend
// returns historical comparison data).
function deriveTrend(passRate: number): 'up' | 'down' | 'stable' {
  if (passRate >= 85) return 'up';
  if (passRate < 75)  return 'down';
  return 'stable';
}

export function DeanDepartments() {
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AnalyticsExtAPI.departments();
      setDepartments(data.departments ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const chartData = departments.map(d => ({
    name:       d.short_name || d.code || d.name.slice(0, 4).toUpperCase(),
    Students:   d.student_count,
    'At Risk':  d.at_risk,
    'Pass Rate': d.pass_rate,
  }));

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading department data…</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Departments</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            College of Sciences — {departments.length} department{departments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 hover:text-red-600 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-red-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => {
          const trend    = deriveTrend(dept.pass_rate);
          const shortName = dept.short_name || dept.code || dept.name.slice(0, 4).toUpperCase();

          return (
            <div
              key={dept.name}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">{dept.name}</h3>
                  {dept.head && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Head: {dept.head}</p>
                  )}
                </div>
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm',
                  dept.pass_rate >= 85 ? 'bg-green-500' : dept.pass_rate >= 75 ? 'bg-amber-500' : 'bg-red-500',
                )}>
                  {shortName}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
                  <Users className="w-3.5 h-3.5 text-neutral-400 mx-auto mb-0.5" />
                  <p className="text-base font-black text-neutral-900 dark:text-white">{dept.student_count}</p>
                  <p className="text-xs text-neutral-400">Students</p>
                </div>
                <div className="text-center bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
                  <GraduationCap className="w-3.5 h-3.5 text-neutral-400 mx-auto mb-0.5" />
                  <p className="text-base font-black text-neutral-900 dark:text-white">{dept.faculty_count}</p>
                  <p className="text-xs text-neutral-400">Faculty</p>
                </div>
                <div className="text-center bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
                  <BookOpen className="w-3.5 h-3.5 text-neutral-400 mx-auto mb-0.5" />
                  <p className="text-base font-black text-neutral-900 dark:text-white">{dept.course_count}</p>
                  <p className="text-xs text-neutral-400">Courses</p>
                </div>
              </div>

              {/* GPA + Pass Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Avg GPA</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {dept.avg_gpa != null ? dept.avg_gpa.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Pass Rate</span>
                  <div className="flex items-center gap-1.5">
                    {trend === 'up'   ? <TrendingUp   className="w-3.5 h-3.5 text-green-500" /> :
                     trend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-red-500"   /> :
                                       <Minus         className="w-3.5 h-3.5 text-neutral-400" />}
                    <span className={cn(
                      'font-bold',
                      dept.pass_rate >= 85 ? 'text-green-600' :
                      dept.pass_rate >= 75 ? 'text-amber-600' : 'text-red-600',
                    )}>
                      {dept.pass_rate}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      dept.pass_rate >= 85 ? 'bg-green-500' :
                      dept.pass_rate >= 75 ? 'bg-amber-500' : 'bg-red-500',
                    )}
                    style={{ width: `${dept.pass_rate}%` }}
                  />
                </div>
              </div>

              {/* At-risk warning */}
              {dept.at_risk > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {dept.at_risk} student{dept.at_risk !== 1 ? 's' : ''} at risk
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Department Comparison</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-10">No data available</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Students" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="At Risk"  fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}