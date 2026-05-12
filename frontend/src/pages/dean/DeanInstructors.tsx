// src/pages/dean/DeanInstructors.tsx
// ENHANCED v3.0:
//   • Icons added to stat cards (BookOpen → Courses, Users → Students, Star → Rating)
//   • Additional metrics: avg_student_gpa, avg_attendance, risk_students_count,
//     course_completion_rate, performance_rating
//   • Enterprise analytics feel with detailed instructor breakdown

import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, AlertTriangle, Loader2, Mail, TrendingUp, Star,
  HelpCircle, BookOpen, Users, BarChart2, Award, ShieldAlert,
  CheckCircle, GraduationCap, Activity,
} from 'lucide-react';
import { AnalyticsExtAPI } from '../../lib/api';
import { cn } from '../../lib/utils';

// ─── Colour helpers ──────────────────────────────────────────────────────────

function rateColor(rate: number): string {
  if (rate >= 85) return '#16a34a';
  if (rate >= 70) return '#ca8a04';
  if (rate >= 55) return '#ea580c';
  return '#dc2626';
}

function rateTextClass(rate: number): string {
  if (rate >= 85) return 'text-green-600 dark:text-green-400';
  if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
  if (rate >= 55) return 'text-orange-500 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

// ─── Progress bar ────────────────────────────────────────────────────────────

function SuccessBar({ value, avg }: { value: number; avg: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative w-full h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: rateColor(pct) }}
      />
      <div
        className="absolute top-0 h-full w-0.5 bg-neutral-400 dark:bg-neutral-500"
        style={{ left: `${avg}%` }}
      />
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Prof {
  id: number;
  name: string;
  email: string;
  department: string;
  title: string;
  role: 'professor' | 'ta';
  role_label: string;
  course_count: number;
  student_count: number;
  success_rate: number;
  avg_student_gpa: number;
  avg_attendance: number;
  risk_students_count: number;
  course_completion_rate: number;
  avg_quiz_score: number;
  performance_rating: number;
  rating: number;
}

// ─── Mini stat tile with icon ────────────────────────────────────────────────

function StatTile({
  icon: Icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconClass?: string;
}) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2 text-center">
      <Icon className={cn('w-3.5 h-3.5 mx-auto mb-0.5', iconClass ?? 'text-neutral-400')} />
      <p className="text-sm font-bold text-neutral-900 dark:text-white">{value ?? '—'}</p>
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  );
}

// ─── Instructor card ─────────────────────────────────────────────────────────

function InstructorCard({
  inst,
  avg,
  onToast,
}: {
  inst: Prof;
  avg: number;
  onToast: (msg: string) => void;
}) {
  const isTA     = inst.role === 'ta';
  const hasData  = inst.success_rate >= 0;
  const rate     = hasData ? inst.success_rate : 0;
  const needsDev = !isTA && hasData && rate < 65;
  const initials = inst.name?.split(' ').slice(-1)[0]?.[0] ?? '?';

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-red-700 dark:text-red-400">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{inst.name}</p>
          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
            <span className={cn(
              'inline-block px-1.5 py-0.5 rounded text-xs font-semibold',
              isTA
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            )}>
              {isTA ? 'Teaching Assistant' : (inst.title ?? 'Professor')}
            </span>
            <span className="truncate">{inst.department ?? '—'}</span>
          </p>
        </div>
        {needsDev && (
          <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            Needs Dev
          </span>
        )}
      </div>

      {/* Core stats with icons */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile icon={BookOpen} label="Courses"  value={inst.course_count}  iconClass="text-blue-500" />
        <StatTile icon={Users}    label="Students" value={inst.student_count} iconClass="text-violet-500" />
        <StatTile
          icon={Star}
          label="Rating"
          value={inst.rating > 0 ? inst.rating.toFixed(1) : '—'}
          iconClass="text-amber-400"
        />
      </div>

      {/* Extended metrics row */}
      {!isTA && hasData && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-2 py-1.5">
            <GraduationCap className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="text-neutral-500">Avg GPA</span>
            <span className={cn('ml-auto font-semibold',
              inst.avg_student_gpa >= 3.0 ? 'text-emerald-600' :
              inst.avg_student_gpa >= 2.5 ? 'text-amber-500' : 'text-red-600'
            )}>
              {inst.avg_student_gpa > 0 ? inst.avg_student_gpa.toFixed(2) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-2 py-1.5">
            <Activity className="w-3 h-3 text-teal-500 shrink-0" />
            <span className="text-neutral-500">Attendance</span>
            <span className={cn('ml-auto font-semibold',
              inst.avg_attendance >= 80 ? 'text-emerald-600' :
              inst.avg_attendance >= 65 ? 'text-amber-500' : 'text-red-600'
            )}>
              {inst.avg_attendance > 0 ? `${inst.avg_attendance}%` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-2 py-1.5">
            <ShieldAlert className="w-3 h-3 text-orange-500 shrink-0" />
            <span className="text-neutral-500">At Risk</span>
            <span className={cn('ml-auto font-semibold',
              inst.risk_students_count === 0 ? 'text-emerald-600' :
              inst.risk_students_count <= 3  ? 'text-amber-500' : 'text-red-600'
            )}>
              {inst.risk_students_count}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-2 py-1.5">
            <CheckCircle className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="text-neutral-500">Completion</span>
            <span className={cn('ml-auto font-semibold',
              inst.course_completion_rate >= 85 ? 'text-emerald-600' :
              inst.course_completion_rate >= 65 ? 'text-amber-500' : 'text-red-600'
            )}>
              {inst.course_completion_rate > 0 ? `${inst.course_completion_rate}%` : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Success rate bar */}
      <div>
        <div className="flex justify-between text-xs mb-0.5">
          <span className="text-neutral-500">Success Rate</span>
          {hasData ? (
            <span className="text-blue-500 dark:text-blue-400">avg {avg}%</span>
          ) : (
            <span className="text-neutral-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> no data
            </span>
          )}
        </div>
        {hasData ? (
          <>
            <SuccessBar value={rate} avg={avg} />
            <p className={cn('text-right text-xs font-semibold mt-0.5', rateTextClass(rate))}>
              {rate}%
            </p>
          </>
        ) : (
          <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full mt-1" />
        )}
      </div>

      {/* Performance rating badge */}
      {!isTA && inst.performance_rating > 0 && (
        <div className="flex items-center gap-1.5 text-xs">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-neutral-500">Performance Score</span>
          <span className={cn('ml-auto font-bold',
            inst.performance_rating >= 4.0 ? 'text-emerald-600' :
            inst.performance_rating >= 3.0 ? 'text-amber-500' : 'text-red-600'
          )}>
            {inst.performance_rating.toFixed(1)} / 5.0
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onToast(`Email sent to ${inst.name}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <Mail className="w-3.5 h-3.5" /> Contact
        </button>
        {needsDev && (
          <button
            onClick={() => onToast(`Development plan initiated for ${inst.name}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Dev Plan
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function DeanInstructors() {
  const [profs, setProfs]     = useState<Prof[]>([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [view, setView]       = useState<'cards' | 'table'>('cards');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [toast, setToast]     = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: Record<string, any> = { page_size: 100 };
      if (search) params.search = search;
      const data = await AnalyticsExtAPI.instructors(params);
      setProfs(data.professors ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load instructors');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProfs(); }, [fetchProfs]);

  const profRates = profs.filter(p => p.role === 'professor' && p.success_rate >= 0).map(p => p.success_rate);
  const avgRate   = profRates.length
    ? Math.round(profRates.reduce((a, b) => a + b, 0) / profRates.length)
    : 75;

  const needingDev = profs.filter(p => p.role === 'professor' && p.success_rate >= 0 && p.success_rate < 65);
  const sorted     = [...profs].sort((a, b) => b.success_rate - a.success_rate);

  // Aggregate KPIs
  const totalStudents     = profs.reduce((s, p) => s + (p.student_count || 0), 0);
  const avgAttendance     = profs.filter(p => p.avg_attendance > 0).length > 0
    ? Math.round(profs.filter(p => p.avg_attendance > 0).reduce((s, p) => s + p.avg_attendance, 0) / profs.filter(p => p.avg_attendance > 0).length)
    : 0;
  const totalRiskStudents = profs.reduce((s, p) => s + (p.risk_students_count || 0), 0);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Instructors</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {loading ? 'Loading…' : `${total} instructors (faculty & TAs) — live from database`}
          </p>
        </div>
        <div className="flex gap-2">
          {(['cards', 'table'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors',
                view === v
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary row */}
      {!loading && profs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users,       label: 'Total Faculty',       value: total,           color: 'bg-purple-100 text-purple-600' },
            { icon: BookOpen,    label: 'Students Taught',      value: totalStudents,   color: 'bg-blue-100 text-blue-600' },
            { icon: Activity,    label: 'Avg Attendance',       value: `${avgAttendance}%`, color: 'bg-teal-100 text-teal-600' },
            { icon: ShieldAlert, label: 'At-Risk Across Faculty', value: totalRiskStudents, color: 'bg-orange-100 text-orange-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search instructors…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        />
      </div>

      {/* Alert banner */}
      {needingDev.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              {needingDev.length} instructor{needingDev.length > 1 ? 's' : ''} below performance threshold
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {needingDev.map(i => i.name).join(', ')} — success rate below 65%
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error} <button onClick={fetchProfs} className="underline ml-2">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {profs.map(inst => (
            <InstructorCard key={inst.id} inst={inst} avg={avgRate} onToast={showToast} />
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                  {['Instructor', 'Role', 'Department', 'Courses', 'Students', 'Avg GPA', 'Attendance', 'At Risk', 'Success Rate', 'Rating', 'Perf. Score', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {sorted.map(inst => {
                  const isTA     = inst.role === 'ta';
                  const hasData  = inst.success_rate >= 0;
                  const rate     = hasData ? inst.success_rate : 0;
                  const needsDev = !isTA && hasData && rate < 65;
                  return (
                    <tr key={inst.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-red-700 dark:text-red-400">{inst.name?.split(' ').pop()?.[0] ?? '?'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{inst.name}</p>
                            <p className="text-xs text-neutral-400">{inst.title ?? 'Instructor'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-semibold',
                          isTA
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                        )}>
                          {isTA ? 'TA' : 'Prof'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-300">{inst.department ?? '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{inst.course_count}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">{inst.student_count}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('text-sm font-semibold',
                          inst.avg_student_gpa >= 3.0 ? 'text-emerald-600' :
                          inst.avg_student_gpa >= 2.5 ? 'text-amber-500' : 'text-red-600'
                        )}>
                          {inst.avg_student_gpa > 0 ? inst.avg_student_gpa.toFixed(2) : <span className="text-neutral-400 italic text-xs">N/A</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('text-sm font-semibold',
                          inst.avg_attendance >= 80 ? 'text-emerald-600' :
                          inst.avg_attendance >= 65 ? 'text-amber-500' : 'text-red-600'
                        )}>
                          {inst.avg_attendance > 0 ? `${inst.avg_attendance}%` : <span className="text-neutral-400 italic text-xs">N/A</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('text-sm font-semibold',
                          inst.risk_students_count === 0 ? 'text-emerald-600' :
                          inst.risk_students_count <= 2  ? 'text-amber-500' : 'text-red-600'
                        )}>
                          {inst.risk_students_count}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {hasData ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${rate}%`, backgroundColor: rateColor(rate) }}
                              />
                            </div>
                            <span className={cn('text-sm font-bold', rateTextClass(rate))}>{rate}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {inst.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{inst.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {inst.performance_rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span className={cn('text-sm font-bold',
                              inst.performance_rating >= 4.0 ? 'text-emerald-600' :
                              inst.performance_rating >= 3.0 ? 'text-amber-500' : 'text-red-600'
                            )}>{inst.performance_rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isTA && inst.success_rate < 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">No Data</span>
                        ) : needsDev ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">Needs Dev</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Good</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {profs.length === 0 && !loading && (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-sm">No instructors found.</p>
        </div>
      )}
    </div>
  );
}