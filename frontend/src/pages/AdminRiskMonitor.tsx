// src/pages/AdminRiskMonitor.tsx
// ══════════════════════════════════════════════════════════════════════════════
//  FIXED: Was using mockStudents + mockRiskAssessments + hardcoded alerts.
//
//  Now fetches from:
//    GET /api/v1/analytics/top-at-risk      → high/critical risk students
//    GET /api/v1/analytics/risk-distribution → risk counts for summary cards
//    GET /api/v1/students/ (risk=High,Critical) → list with attendance + trend
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  AlertTriangle, TrendingDown, ArrowDownRight, RefreshCw,
  Loader2, AlertCircle, UserCircle2, ShieldAlert,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── API ───────────────────────────────────────────────────────────────────────

const FASTAPI_URL =
  (import.meta as any).env?.VITE_FASTAPI_URL ?? 'http://localhost:8000/api/v1';

async function apiFetch<T>(path: string): Promise<T> {
  const token = localStorage.getItem('eduguard_token');
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

interface RiskDist {
  risk_level: string;
  count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, { card: string; text: string; bar: string; dot: string }> = {
  Critical: {
    card: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    bar:  'bg-red-500',
    dot:  'bg-red-500',
  },
  High: {
    card: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    bar:  'bg-orange-500',
    dot:  'bg-orange-500',
  },
  Low: {
    card: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    bar:  'bg-yellow-400',
    dot:  'bg-yellow-500',
  },
  Normal: {
    card: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    bar:  'bg-emerald-500',
    dot:  'bg-emerald-500',
  },
};

const BADGE: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Low:      'bg-yellow-100 text-yellow-700',
  Normal:   'bg-emerald-100 text-emerald-700',
};

function Avatar({ name, risk }: { name: string | null; risk: string }) {
  const c = RISK_COLORS[risk] ?? RISK_COLORS.High;
  return (
    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm border', c.card, c.text)}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminRiskMonitor() {
  const [students, setStudents]   = useState<AtRiskStudent[]>([]);
  const [riskDist, setRiskDist]   = useState<RiskDist[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const [ar, rd] = await Promise.all([
        apiFetch<{ students: AtRiskStudent[] }>('/analytics/top-at-risk?limit=20').then(r => r.students),
        apiFetch<{ distribution: RiskDist[] }>('/analytics/risk-distribution').then(r => r.distribution),
      ]);
      setStudents(ar);
      setRiskDist(rd);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const counts = {
    Critical: riskDist.find(r => r.risk_level === 'Critical')?.count ?? 0,
    High:     riskDist.find(r => r.risk_level === 'High')?.count ?? 0,
    Low:      riskDist.find(r => r.risk_level === 'Low')?.count ?? 0,
    Normal:   riskDist.find(r => r.risk_level === 'Normal')?.count ?? 0,
  };

  const critical = students.filter(s => s.risk_level === 'Critical');
  const high     = students.filter(s => s.risk_level === 'High');

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Risk Monitor</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {lastUpdated
              ? `Real-time monitoring · ${lastUpdated.toLocaleTimeString()}`
              : 'Loading risk data from database…'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Risk Summary Cards */}
      {loading && riskDist.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 p-4 h-24 animate-pulse bg-neutral-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Critical', 'High', 'Low', 'Normal'] as const).map(level => {
            const c = RISK_COLORS[level];
            return (
              <div key={level} className={cn('p-4 rounded-xl border', c.card)}>
                <ShieldAlert className={cn('w-5 h-5 mb-2', c.text)} />
                <p className={cn('text-3xl font-bold', c.text)}>{counts[level]}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">{level} Risk</p>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={fetchAll} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Critical Students */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-red-100 dark:border-red-900/20 bg-red-50 dark:bg-red-900/10">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm">Critical Risk</h3>
            <span className="ml-auto text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">{counts.Critical}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-neutral-300" /></div>
          ) : critical.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
              <UserCircle2 className="w-8 h-8 opacity-30" />
              <p className="text-sm">No critical-risk students</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
              {critical.map(s => <StudentRow key={s.id} s={s} />)}
            </div>
          )}
        </div>

        {/* High Risk Students */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-orange-200 dark:border-orange-900/30 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-orange-100 dark:border-orange-900/20 bg-orange-50 dark:bg-orange-900/10">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-sm">High Risk</h3>
            <span className="ml-auto text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">{counts.High}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-neutral-300" /></div>
          ) : high.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
              <UserCircle2 className="w-8 h-8 opacity-30" />
              <p className="text-sm">No high-risk students</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
              {high.map(s => <StudentRow key={s.id} s={s} />)}
            </div>
          )}
        </div>
      </div>

      {/* All at-risk full table */}
      {!loading && students.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">All At-Risk Students</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{students.length} students with High or Critical risk — live from database</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                  {['Student', 'Major', 'GPA', 'Risk Score', 'Risk Level', 'Trend'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} risk={s.risk_level} />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-neutral-400 font-mono">{s.student_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">{s.major}</td>
                    <td className="px-5 py-3">
                      <span className={cn('font-bold tabular-nums', s.gpa >= 3.0 ? 'text-emerald-600' : s.gpa >= 2.0 ? 'text-yellow-500' : 'text-red-600')}>
                        {s.gpa?.toFixed(2) ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', RISK_COLORS[s.risk_level]?.bar ?? 'bg-orange-500')}
                            style={{ width: `${s.probability}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-neutral-600 dark:text-neutral-400">{s.probability}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', BADGE[s.risk_level] ?? 'bg-neutral-100 text-neutral-600')}>
                        {s.risk_level}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {(s.trend === 'declining' || s.trend === 'sudden_drop') && (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <span className={cn(
                          'text-xs capitalize',
                          s.trend === 'improving' ? 'text-emerald-600' :
                          s.trend === 'declining' || s.trend === 'sudden_drop' ? 'text-red-500' : 'text-neutral-400'
                        )}>
                          {s.trend?.replace('_', ' ') ?? 'stable'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable student row for the two top panels ───────────────────────────────

function StudentRow({ s }: { s: AtRiskStudent }) {
  const c = RISK_COLORS[s.risk_level] ?? RISK_COLORS.High;
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
      <Avatar name={s.name} risk={s.risk_level} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{s.name}</p>
          <span className="text-xs tabular-nums text-neutral-500 shrink-0">{s.probability}%</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div className={cn('h-full rounded-full', c.bar)} style={{ width: `${s.probability}%` }} />
          </div>
          <span className="text-xs text-neutral-400 truncate shrink-0">{s.major} · GPA {s.gpa?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}