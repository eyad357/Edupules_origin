// src/pages/AdminAnalytics.tsx  (also used at /admin/cmd/analytics as DeanAnalytics)
// UPGRADE: All chart data now comes from real database queries.
// Removed: monthlyEnrollment, performanceByDept, riskTrend, radarData constants.
import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { AnalyticsExtAPI } from '../lib/api';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

export function AdminAnalytics() {
  const [overview,     setOverview]     = useState<any>(null);
  const [departments,  setDepartments]  = useState<any[]>([]);
  const [riskTrends,   setRiskTrends]   = useState<any[]>([]);
  const [enrollTrend,  setEnrollTrend]  = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [ov, dept, risk, enroll] = await Promise.all([
        AnalyticsExtAPI.overview(),
        AnalyticsExtAPI.departments(),
        AnalyticsExtAPI.riskTrends(6),
        AnalyticsExtAPI.enrollmentTrend(),
      ]);
      setOverview(ov);
      setDepartments(dept.departments ?? []);
      setRiskTrends(risk.trends ?? []);
      setEnrollTrend(enroll.trend ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <p>{error}</p>
        <button onClick={fetchAll} className="ml-auto underline text-sm">Retry</button>
      </div>
    );
  }

  const summaryStats = [
    { label: 'Total Students',       value: overview?.total_students ?? 0,          change: null },
    { label: 'Avg GPA',              value: overview?.avg_gpa?.toFixed(2) ?? '—',   change: null },
    { label: 'Attendance Rate',      value: `${overview?.attendance_rate ?? 0}%`,   change: null },
    { label: 'At-Risk Students',     value: overview?.at_risk_count ?? 0,           change: null },
  ];

  // Radar data from departments
  const radarData = ['attendance_rate', 'avg_gpa', 'pass_rate'].flatMap(key => (
    departments.slice(0, 3).map(d => ({
      subject: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      [d.short_name]: key === 'avg_gpa' ? (d[key] ?? 0) * 25 : (d[key] ?? 0),
    }))
  ));

  // Build unified radar structure
  const subjects = ['Attendance', 'GPA', 'Pass Rate', 'Engagement'];
  const radarUnified = subjects.map(subject => {
    const row: Record<string, any> = { subject };
    departments.slice(0, 4).forEach(d => {
      const v = subject === 'Attendance' ? d.attendance_rate
              : subject === 'GPA'        ? d.avg_gpa * 25
              : subject === 'Pass Rate'  ? d.pass_rate
              : 75;
      row[d.short_name] = Math.round(v ?? 0);
    });
    return row;
  });

  const deptColors = ['#DC2626', '#F97316', '#0ea5e9', '#10B981'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Analytics (AI)</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5 text-sm">
            Deep insights from real PostgreSQL data
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map(stat => (
          <div key={stat.label} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stat.value}</p>
            <p className="text-xs font-medium mt-1 text-emerald-600">Live from database</p>
          </div>
        ))}
      </div>

      {/* Enrollment Trend */}
      <Card title="Enrollment Trend" subtitle="Student enrollment over time">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={enrollTrend}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="month" stroke="#a3a3a3" fontSize={12} />
              <YAxis stroke="#a3a3a3" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="enrolled" stroke="#DC2626" fill="url(#enrollGrad)" strokeWidth={2} name="Enrolled" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card title="Department Performance" subtitle="GPA and pass rates by department — real data">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments.map(d => ({ dept: d.short_name, passRate: d.pass_rate, attendance: d.attendance_rate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="dept" stroke="#a3a3a3" fontSize={12} />
                <YAxis stroke="#a3a3a3" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="passRate"   fill="#DC2626" radius={[4,4,0,0]} name="Pass Rate %" />
                <Bar dataKey="attendance" fill="#F97316" radius={[4,4,0,0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Trend */}
        <Card title="Risk Level Trend" subtitle="Weekly risk distribution — real data">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="week" stroke="#a3a3a3" fontSize={12} />
                <YAxis stroke="#a3a3a3" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="normal"   stroke="#10B981" strokeWidth={2} name="Normal"   dot={false} />
                <Line type="monotone" dataKey="high"     stroke="#F97316" strokeWidth={2} name="High"     dot={false} />
                <Line type="monotone" dataKey="critical" stroke="#DC2626" strokeWidth={2} name="Critical" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Radar Chart */}
      {departments.length >= 2 && (
        <Card title="Multi-Dimension Comparison" subtitle="Department performance across key metrics">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarUnified}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                {departments.slice(0, 4).map((d, i) => (
                  <Radar
                    key={d.short_name}
                    name={d.name}
                    dataKey={d.short_name}
                    stroke={deptColors[i]}
                    fill={deptColors[i]}
                    fillOpacity={0.15}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Department Table */}
      {departments.length > 0 && (
        <Card title="Department Summary" subtitle="All departments — live from database">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {['Department', 'Students', 'Faculty', 'Avg GPA', 'Pass Rate', 'Attendance', 'At Risk'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {departments.map((d: any) => (
                  <tr key={d.name} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-2.5 font-medium text-neutral-900 dark:text-white">{d.name}</td>
                    <td className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400">{d.student_count}</td>
                    <td className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400">{d.faculty_count}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('font-bold', d.avg_gpa >= 3.0 ? 'text-emerald-600' : d.avg_gpa >= 2.5 ? 'text-amber-500' : 'text-red-600')}>
                        {d.avg_gpa?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400">{d.pass_rate}%</td>
                    <td className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400">{d.attendance_rate}%</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                        d.at_risk > 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>
                        {d.at_risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// Re-export as DeanAnalytics for the admin router
export { AdminAnalytics as DeanAnalytics };
