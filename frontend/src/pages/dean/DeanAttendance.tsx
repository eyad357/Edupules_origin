// src/pages/dean/DeanAttendance.tsx
// UPGRADE: Replaces all attendance mock data arrays with live
// /api/v1/analytics/attendance-summary endpoint.
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, AlertTriangle, Users, CalendarDays } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { AnalyticsExtAPI } from '../../lib/api';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';

export function DeanAttendance() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await AnalyticsExtAPI.attendanceSummary();
      setSummary(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />{error}
        <button onClick={fetchData} className="ml-auto underline text-sm">Retry</button>
      </div>
    );
  }

  const byDept = summary?.by_department ?? [];
  const absentees = summary?.absentee_students ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Real attendance data from database</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Rate',  value: `${summary?.overall_rate ?? 0}%`, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Present',       value: summary?.present_count ?? 0,       color: 'text-blue-600 bg-blue-50' },
          { label: 'Late',          value: summary?.late_count ?? 0,          color: 'text-amber-600 bg-amber-50' },
          { label: 'Absent',        value: summary?.absent_count ?? 0,        color: 'text-red-600 bg-red-50' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className={cn('inline-flex p-2 rounded-lg mb-2', k.color.split(' ')[1])}>
              <CalendarDays className={cn('w-4 h-4', k.color.split(' ')[0])} />
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{k.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {/* By Department Chart */}
      {byDept.length > 0 && (
        <Card title="Attendance by Department" subtitle="Average attendance rate per major">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept.map((d: any) => ({ dept: d.department?.slice(0, 12), rate: d.attendance_rate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="dept" stroke="#a3a3a3" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#a3a3a3" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                <Bar dataKey="rate" fill="#DC2626" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Absentee Students */}
      <Card title={`Students Below 75% Attendance (${absentees.length})`} subtitle="Students at risk of attendance-based ban">
        {absentees.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">No students below 75% attendance threshold</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {['Student', 'ID', 'Major', 'Attendance', 'Risk Level'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {absentees.map((s: any) => (
                  <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-red-700">{(s.name ?? '?')[0]}</span>
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-neutral-400">{s.student_number}</td>
                    <td className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400">{s.major}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.attendance_rate}%` }} />
                        </div>
                        <span className="text-xs font-bold text-red-600">{s.attendance_rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                        s.risk_level === 'Critical' ? 'bg-red-100 text-red-700' :
                        s.risk_level === 'High'     ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700')}>
                        {s.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
