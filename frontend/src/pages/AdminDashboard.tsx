// src/pages/AdminDashboard.tsx
// ENHANCED v3.0:
//   • Fetches from /api/v1/analytics/admin-overview for richer KPIs
//   • Added System Alerts section from /api/v1/analytics/system-alerts
//   • Enterprise-grade analytics: quiz stats, alerts panel, enhanced charts
//   • All data is live from PostgreSQL
import { useState, useEffect } from 'react';
import {
  Users, TrendingUp, AlertTriangle, Activity,
  ArrowUpRight, ArrowDownRight, RefreshCw, Loader2,
  GraduationCap, BookOpen, Bell, ShieldAlert, CheckCircle,
  TrendingDown, Zap, BarChart2, Clock, XCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import { cn } from '../lib/utils';

// ── API ───────────────────────────────────────────────────────────────────────

const FASTAPI_URL =
  (import.meta as any).env?.VITE_FASTAPI_URL ?? 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'eduguard_token';

async function apiFetch<T>(path: string): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${FASTAPI_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Overview {
  total_students: number;
  at_risk_students: number;
  critical_students: number;
  average_gpa: number;
  total_courses: number;
  active_interventions: number;
  avg_attendance_rate: number;
  total_quizzes: number;
  total_submissions: number;
  total_instructors?: number;
}

interface RiskDist {
  risk_level: string;
  count: number;
  percentage: number;
}

interface Department {
  name: string;
  code?: string;
  short_name?: string;
  student_count: number;
  avg_gpa: number;
  at_risk: number;
  pass_rate: number;
  attendance_rate: number;
}

interface AtRiskStudent {
  id: number;
  name: string;
  student_number: string;
  major: string;
  gpa: number;
  risk_level: string;
  probability: number;
  trend: string;
}

interface SystemAlert {
  id: string;
  type: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  priority: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  entity_id: number | null;
  entity_name: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  Normal:   '#10B981',
  Low:      '#F59E0B',
  High:     '#F97316',
  Critical: '#DC2626',
};

const RISK_BADGE: Record<string, string> = {
  Normal:   'bg-emerald-100 text-emerald-700',
  Low:      'bg-yellow-100  text-yellow-700',
  High:     'bg-orange-100  text-orange-700',
  Critical: 'bg-red-100     text-red-700',
};

const ALERT_SEVERITY: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  critical: {
    bg:     'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-200 dark:border-red-800',
    icon:   'text-red-600',
    badge:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  warning: {
    bg:     'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800',
    icon:   'text-amber-600',
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  info: {
    bg:     'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    icon:   'text-blue-500',
    badge:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, iconColor, trend, trendLabel,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; iconColor: string;
  trend?: 'up' | 'down'; trendLabel?: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{value}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{sub}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trendLabel && (
        <div className={cn('flex items-center gap-1 mt-3 text-sm font-medium',
          trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
          {trend === 'up'
            ? <ArrowUpRight className="w-4 h-4" />
            : <ArrowDownRight className="w-4 h-4" />}
          {trendLabel}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, sub, children, action }: {
  title: string; sub: string; children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{title}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{sub}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function LoadingBox({ h = 'h-64' }: { h?: string }) {
  return (
    <div className={cn('flex items-center justify-center', h)}>
      <Loader2 className="w-6 h-6 text-neutral-300 animate-spin" />
    </div>
  );
}

// Alert severity icon
function AlertIcon({ severity }: { severity: string }) {
  if (severity === 'critical') return <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
  if (severity === 'warning')  return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
  return <Bell className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [overview,    setOverview]    = useState<Overview | null>(null);
  const [riskDist,    setRiskDist]    = useState<RiskDist[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [atRisk,      setAtRisk]      = useState<AtRiskStudent[]>([]);
  const [alerts,      setAlerts]      = useState<SystemAlert[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ov, rd, depts, ar] = await Promise.all([
        // Try admin-overview first, fall back to legacy overview
        apiFetch<Overview>('/analytics/admin-overview').catch(() =>
          apiFetch<any>('/analytics/overview').then(d => ({
            total_students:      d.total_students ?? 0,
            at_risk_students:    d.at_risk_count  ?? 0,
            critical_students:   d.critical_count ?? 0,
            average_gpa:         d.avg_gpa ?? d.average_gpa ?? 0,
            total_courses:       d.total_courses   ?? 0,
            active_interventions: d.active_interventions ?? 0,
            avg_attendance_rate: d.attendance_rate ?? d.avg_attendance_rate ?? 0,
            total_quizzes:       d.total_quizzes   ?? 0,
            total_submissions:   d.total_submissions ?? 0,
            total_instructors:   d.total_professors ?? 0,
          }))
        ),
        apiFetch<{ distribution: RiskDist[] }>('/analytics/risk-distribution').then(r => r.distribution),
        apiFetch<{ departments: Department[] }>('/analytics/departments').then(r => r.departments),
        apiFetch<{ students: AtRiskStudent[] }>('/analytics/top-at-risk?limit=8').then(r => r.students),
      ]);
      setOverview(ov);
      setRiskDist(rd);
      setDepartments(depts);
      setAtRisk(ar);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Dashboard fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const data = await apiFetch<{ alerts: SystemAlert[] }>('/analytics/system-alerts');
      setAlerts(data.alerts ?? []);
    } catch {
      // fallback to legacy alerts endpoint
      try {
        const data = await apiFetch<{ alerts: SystemAlert[] }>('/analytics/alerts');
        setAlerts(data.alerts ?? []);
      } catch (e) {
        console.error('Alerts fetch failed:', e);
      }
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchAlerts();
  }, []);

  // Department chart data
  const deptChartData = departments.map(d => ({
    dept:     (d as any).short_name ?? (d as any).code ?? d.name?.slice(0, 6),
    students: d.student_count,
    atRisk:   d.at_risk,
    avgGpa:   d.avg_gpa,
    passRate: d.pass_rate,
  }));

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts  = alerts.filter(a => a.severity === 'warning');
  const unreadAlerts   = alerts.filter(a => !a.read);

  const formatTimestamp = (ts: string | null) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Administrator Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lastUpdated
              ? `Live from database · Last updated ${lastUpdated.toLocaleTimeString()}`
              : 'Loading live data…'}
          </p>
        </div>
        <button
          onClick={() => { fetchAll(); fetchAlerts(); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Alert summary banner */}
      {!alertsLoading && (criticalAlerts.length > 0 || warningAlerts.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {criticalAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-semibold">{criticalAlerts.length}</span> critical alert{criticalAlerts.length > 1 ? 's' : ''} require immediate attention
            </div>
          )}
          {warningAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">{warningAlerts.length}</span> warning{warningAlerts.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      {loading && !overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Students"   value={overview.total_students}
            sub="Enrolled this semester"
            icon={Users}             iconColor="bg-red-100 text-red-600"
            trend="up"               trendLabel="Live count"
          />
          <StatCard
            label="At Risk"          value={overview.at_risk_students}
            sub={`${overview.critical_students} critical`}
            icon={AlertTriangle}     iconColor="bg-orange-100 text-orange-600"
            trend={overview.at_risk_students > 0 ? 'down' : 'up'}
            trendLabel={`${Math.round(overview.at_risk_students / Math.max(overview.total_students, 1) * 100)}% of students`}
          />
          <StatCard
            label="Average GPA"      value={overview.average_gpa.toFixed(2)}
            sub="Institution-wide"
            icon={TrendingUp}        iconColor="bg-blue-100 text-blue-600"
            trend={overview.average_gpa >= 3.0 ? 'up' : 'down'}
            trendLabel={overview.average_gpa >= 3.0 ? 'Above 3.0 target' : 'Below 3.0 target'}
          />
          <StatCard
            label="Active Interventions" value={overview.active_interventions}
            sub={`${overview.total_courses} active courses`}
            icon={Activity}          iconColor="bg-emerald-100 text-emerald-600"
            trend="up"               trendLabel="Live count"
          />
        </div>
      )}

      {/* Secondary stat row */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Avg Attendance</p>
              <p className={cn('text-2xl font-bold',
                overview.avg_attendance_rate >= 80 ? 'text-emerald-600' :
                overview.avg_attendance_rate >= 60 ? 'text-yellow-500' : 'text-red-600')}>
                {overview.avg_attendance_rate}%
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Active Courses</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{overview.total_courses}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Total Quizzes</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{overview.total_quizzes}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Critical Students</p>
              <p className="text-2xl font-bold text-red-600">{overview.critical_students}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Risk Distribution Pie */}
        <SectionCard title="Risk Distribution" sub="Latest assessment per student">
          {loading && riskDist.length === 0 ? <LoadingBox /> : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDist.map(r => ({ name: r.risk_level, value: r.count }))}
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={80}
                      paddingAngle={3} dataKey="value"
                    >
                      {riskDist.map((r) => (
                        <Cell key={r.risk_level} fill={RISK_COLORS[r.risk_level] ?? '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} students`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {riskDist.map(r => (
                  <div key={r.risk_level} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[r.risk_level] ?? '#94a3b8' }} />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {r.risk_level} ({r.count})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        {/* Department Analytics Bar */}
        <div className="lg:col-span-2">
          <SectionCard title="Department Analytics" sub="Students enrolled and at-risk per department">
            {loading && deptChartData.length === 0 ? <LoadingBox /> : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="dept" type="category" width={55} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any, name: string) => [val, name === 'students' ? 'Total' : 'At Risk']}
                    />
                    <Legend formatter={(v) => v === 'students' ? 'Total Students' : 'At Risk'} />
                    <Bar dataKey="students" fill="#DC2626" radius={[0, 4, 4, 0]} name="students" />
                    <Bar dataKey="atRisk"   fill="#F97316" radius={[0, 4, 4, 0]} name="atRisk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Students At Risk + Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Students At Risk */}
        <SectionCard title="Students At Risk" sub="Highest risk scores from database">
          {loading && atRisk.length === 0 ? <LoadingBox h="h-48" /> : atRisk.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No high-risk students found.</p>
          ) : (
            <div className="space-y-2">
              {atRisk.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0 font-semibold text-sm text-red-700 dark:text-red-400">
                    {s.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{s.name}</p>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold shrink-0', RISK_BADGE[s.risk_level] ?? 'bg-neutral-100 text-neutral-600')}>
                        {s.risk_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div className="h-full rounded-full bg-red-500" style={{ width: `${s.probability}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500 tabular-nums w-10 shrink-0">{s.probability}%</span>
                      <span className="text-xs text-neutral-400 truncate">{s.major}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Department Performance table */}
        <SectionCard title="Department Performance" sub="Pass rates and GPA — real data">
          {loading && departments.length === 0 ? <LoadingBox h="h-48" /> : departments.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No department data found.</p>
          ) : (
            <div className="space-y-2">
              {departments.map(d => {
                const riskPct = d.student_count > 0 ? Math.round(d.at_risk / d.student_count * 100) : 0;
                const shortName = (d as any).short_name ?? (d as any).code ?? d.name?.slice(0, 4).toUpperCase();
                return (
                  <div key={d.name} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    <div className="w-10 shrink-0">
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{shortName}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{d.name}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-neutral-500">{d.student_count} students</span>
                          <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full',
                            (d.pass_rate ?? 0) >= 80 ? 'bg-emerald-100 text-emerald-700' :
                            (d.pass_rate ?? 0) >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          )}>
                            {(d.pass_rate ?? 0)}% pass
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', riskPct >= 30 ? 'bg-red-500' : riskPct >= 15 ? 'bg-orange-400' : 'bg-emerald-500')}
                            style={{ width: `${riskPct}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums w-14 shrink-0 text-right">
                          GPA {d.avg_gpa?.toFixed(2) ?? '—'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn('text-xs font-semibold', d.at_risk > 0 ? 'text-orange-600' : 'text-emerald-600')}>
                        {d.at_risk} at risk
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* System Alerts Panel */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">System Alerts</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Dynamic alerts from real database activity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadAlerts.length > 0 && (
              <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                {unreadAlerts.length} unread
              </span>
            )}
            {criticalAlerts.length > 0 && (
              <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {criticalAlerts.length} critical
              </span>
            )}
          </div>
        </div>

        {alertsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
            <CheckCircle className="w-8 h-8 opacity-30" />
            <p className="text-sm">No active alerts — system is healthy</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50 dark:divide-neutral-800/60">
            {alerts.slice(0, 10).map(alert => {
              const style = ALERT_SEVERITY[alert.severity] ?? ALERT_SEVERITY.info;
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-4 px-6 py-4 transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20',
                    !alert.read && 'border-l-2 border-l-red-500'
                  )}
                >
                  <AlertIcon severity={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{alert.title}</p>
                          <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full', style.badge)}>
                            {alert.severity.toUpperCase()}
                          </span>
                          {alert.category && (
                            <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">
                              {alert.category}
                            </span>
                          )}
                          {!alert.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{alert.message}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-neutral-400 whitespace-nowrap">{formatTimestamp(alert.timestamp)}</p>
                        {alert.actionable && (
                          <span className="text-xs text-red-600 font-medium mt-0.5 block">Action needed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {alerts.length > 10 && (
              <div className="px-6 py-3 text-center">
                <span className="text-xs text-neutral-400">
                  Showing 10 of {alerts.length} alerts
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}