// src/pages/dean/DeanExams.tsx
// ENHANCED v3.0: Fully connected to real database via GET /api/v1/analytics/exam-analytics
// Replaced all deanMockData imports with live DB queries.
// Added: grade distributions, top performers, completion rates, pass/fail analytics.

import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Eye, BarChart2, X, RefreshCw, Loader2,
  AlertTriangle, TrendingDown, Users, Award, BookOpen, Activity,
  Clock, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '../../lib/utils';
import { AnalyticsExtAPI } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizResult {
  id: number;
  title: string;
  course_code: string | null;
  course_name: string | null;
  instructor: string | null;
  department: string | null;
  semester: string | null;
  status: string;
  duration: number | null;
  attempts_limit: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string | null;
  enrolled_students: number;
  submissions: number;
  completion_pct: number;
  avg_score: number;
  pass_rate: number;
  fail_rate: number;
  max_score: number;
  min_score: number;
  passed_count: number;
  failed_count: number;
  distribution: { range: string; count: number }[];
  top_performers: { name: string; score: number; student_number: string }[];
}

interface ExamAnalytics {
  quizzes: QuizResult[];
  total_quizzes: number;
  published_quizzes: number;
  total_submissions: number;
  avg_pass_rate: number;
  avg_score_overall: number;
  high_fail_quizzes: QuizResult[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    case 'draft':     return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'archived':  return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
    default:          return 'bg-neutral-100 text-neutral-600';
  }
}

const DIST_COLORS = ['#DC2626', '#F97316', '#F59E0B', '#3B82F6', '#10B981', '#059669'];

// ── Detail Modal ──────────────────────────────────────────────────────────────

function ExamModal({ quiz, onClose }: { quiz: QuizResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">{quiz.title}</h2>
            <p className="text-sm text-neutral-500">
              {quiz.course_code} {quiz.course_name && `— ${quiz.course_name}`}
              {quiz.instructor && ` · ${quiz.instructor}`}
              {quiz.department && ` · ${quiz.department}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* KPI grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Avg Score',   value: quiz.submissions > 0 ? `${quiz.avg_score}%` : '—',   color: quiz.avg_score >= 70 ? 'text-emerald-600' : quiz.avg_score >= 55 ? 'text-amber-600' : 'text-red-600' },
              { label: 'Pass Rate',   value: quiz.submissions > 0 ? `${quiz.pass_rate}%` : '—',   color: quiz.pass_rate >= 70 ? 'text-emerald-600' : quiz.pass_rate >= 55 ? 'text-amber-600' : 'text-red-600' },
              { label: 'Fail Rate',   value: quiz.submissions > 0 ? `${quiz.fail_rate}%` : '—',   color: quiz.fail_rate >= 40 ? 'text-red-600' : quiz.fail_rate >= 25 ? 'text-amber-600' : 'text-emerald-600' },
              { label: 'Submissions', value: quiz.submissions,     color: 'text-neutral-900 dark:text-white' },
              { label: 'Enrolled',    value: quiz.enrolled_students, color: 'text-neutral-900 dark:text-white' },
              { label: 'Completion',  value: quiz.enrolled_students > 0 ? `${quiz.completion_pct}%` : '—', color: quiz.completion_pct >= 80 ? 'text-emerald-600' : 'text-amber-600' },
            ].map(m => (
              <div key={m.label} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 text-center">
                <p className={cn('text-xl font-black', m.color)}>{m.value}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Score range */}
          {quiz.submissions > 0 && (
            <div className="flex gap-3">
              <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500 mb-0.5">Highest Score</p>
                <p className="text-lg font-bold text-emerald-600">{quiz.max_score}%</p>
              </div>
              <div className="flex-1 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500 mb-0.5">Lowest Score</p>
                <p className="text-lg font-bold text-red-600">{quiz.min_score}%</p>
              </div>
            </div>
          )}

          {/* Grade distribution */}
          {quiz.submissions > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-red-600" /> Grade Distribution
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quiz.distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                      formatter={(v: any) => [v, 'Students']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Students">
                      {quiz.distribution.map((_, i) => (
                        <Cell key={i} fill={DIST_COLORS[i] ?? '#DC2626'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top performers */}
          {quiz.top_performers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Top Performers
              </h3>
              <div className="space-y-2">
                {quiz.top_performers.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-neutral-400 font-mono">{p.student_number}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{p.score.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz details */}
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
            {quiz.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{quiz.duration} minutes · {quiz.attempts_limit ?? 1} attempt(s)</span>
              </div>
            )}
            {quiz.semester && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{quiz.semester}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DeanExams() {
  const [analytics,     setAnalytics]     = useState<ExamAnalytics | null>(null);
  const [selectedQuiz,  setSelectedQuiz]  = useState<QuizResult | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterDept,    setFilterDept]    = useState('all');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [toast,         setToast]         = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const data = await AnalyticsExtAPI.examAnalytics();
      setAnalytics(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-sm text-neutral-500">Loading exam analytics from database…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{error}</p>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  const quizzes = analytics.quizzes ?? [];

  // Filters
  const departments = [...new Set(quizzes.map(q => q.department).filter(Boolean))];
  const filtered = quizzes.filter(q => {
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    const matchDept   = filterDept   === 'all' || q.department === filterDept;
    const matchSearch = !searchQuery ||
      (q.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.course_code ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.instructor ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchDept && matchSearch;
  });

  const withSubmissions = filtered.filter(q => q.submissions > 0);
  const avgPassRate = withSubmissions.length
    ? Math.round(withSubmissions.reduce((s, q) => s + q.pass_rate, 0) / withSubmissions.length)
    : 0;

  // Grade distribution aggregated across all filtered quizzes
  const aggregatedDist: Record<string, number> = { '0-49': 0, '50-59': 0, '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0 };
  withSubmissions.forEach(q => q.distribution.forEach(d => { aggregatedDist[d.range] = (aggregatedDist[d.range] ?? 0) + d.count; }));
  const distData = Object.entries(aggregatedDist).map(([range, count]) => ({ range, count }));

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">✓ {toast}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Exams & Results</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Live analytics from database · {quizzes.length} assessments
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-500 hover:text-red-600 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-red-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: BookOpen,    label: 'Total Quizzes',      value: analytics.total_quizzes,     color: 'bg-blue-100 text-blue-600' },
          { icon: CheckCircle, label: 'Published',          value: analytics.published_quizzes, color: 'bg-green-100 text-green-600' },
          { icon: Users,       label: 'Total Submissions',  value: analytics.total_submissions, color: 'bg-violet-100 text-violet-600' },
          { icon: Target,      label: 'Avg Pass Rate',      value: `${analytics.avg_pass_rate}%`, color: analytics.avg_pass_rate >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600' },
          { icon: Activity,    label: 'Avg Score',          value: `${analytics.avg_score_overall}%`, color: analytics.avg_score_overall >= 65 ? 'bg-teal-100 text-teal-600' : 'bg-orange-100 text-orange-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-500 truncate">{label}</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* High-failure alert */}
      {analytics.high_fail_quizzes?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <TrendingDown className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              {analytics.high_fail_quizzes.length} quiz(zes) with high failure rate (&ge;30%)
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {analytics.high_fail_quizzes.slice(0, 3).map(q => `${q.course_code ?? q.title} (${q.fail_rate}%)`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search quizzes, courses, instructors…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        {departments.length > 0 && (
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d!} value={d!}>{d}</option>)}
          </select>
        )}
      </div>

      {/* Charts row */}
      {withSubmissions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Aggregated grade distribution */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-red-600" /> Overall Grade Distribution
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Students">
                    {distData.map((_, i) => (
                      <Cell key={i} fill={DIST_COLORS[i] ?? '#DC2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pass vs Fail pie chart */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Pass/Fail Summary</h3>
            <div className="h-52 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Passed', value: withSubmissions.reduce((s, q) => s + q.passed_count, 0) },
                      { name: 'Failed', value: withSubmissions.reduce((s, q) => s + q.failed_count, 0) },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#DC2626" />
                  </Pie>
                  <Tooltip formatter={(v: any, name: string) => [v, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Passed</span>
                  <span className="ml-auto text-sm font-bold text-emerald-600">
                    {withSubmissions.reduce((s, q) => s + q.passed_count, 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Failed</span>
                  <span className="ml-auto text-sm font-bold text-red-600">
                    {withSubmissions.reduce((s, q) => s + q.failed_count, 0)}
                  </span>
                </div>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2">
                  <p className="text-xs text-neutral-500">Overall Pass Rate</p>
                  <p className={cn('text-xl font-black', avgPassRate >= 70 ? 'text-emerald-600' : 'text-amber-600')}>
                    {avgPassRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            All Assessments <span className="text-neutral-400 font-normal ml-1">({filtered.length})</span>
          </h3>
          <span className="text-xs text-neutral-400">Real-time data from database</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                {['Assessment', 'Instructor', 'Dept', 'Status', 'Submissions', 'Completion', 'Avg Score', 'Pass Rate', 'Fail Rate', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm text-neutral-400">
                    No assessments match your filters.
                  </td>
                </tr>
              ) : filtered.map(q => (
                <tr key={q.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">{q.title}</p>
                    <p className="text-xs text-neutral-400">{q.course_code ?? '—'}{q.course_name ? ` · ${q.course_name}` : ''}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                    {q.instructor ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-500">{q.department ?? '—'}</td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold capitalize', statusColor(q.status))}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-medium text-neutral-900 dark:text-white">{q.submissions}</span>
                      {q.enrolled_students > 0 && (
                        <span className="text-neutral-400">/ {q.enrolled_students}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {q.enrolled_students > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', q.completion_pct >= 80 ? 'bg-emerald-500' : 'bg-amber-400')}
                            style={{ width: `${q.completion_pct}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-neutral-600">{q.completion_pct}%</span>
                      </div>
                    ) : <span className="text-xs text-neutral-400">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    {q.submissions > 0 ? (
                      <span className={cn('text-sm font-bold',
                        q.avg_score >= 70 ? 'text-emerald-600' :
                        q.avg_score >= 55 ? 'text-amber-600' : 'text-red-600'
                      )}>{q.avg_score}%</span>
                    ) : <span className="text-xs text-neutral-400">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    {q.submissions > 0 ? (
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{q.pass_rate}%</span>
                    ) : <span className="text-xs text-neutral-400">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    {q.submissions > 0 ? (
                      <span className={cn('text-sm font-medium',
                        q.fail_rate >= 40 ? 'text-red-700' : q.fail_rate >= 25 ? 'text-amber-600' : 'text-neutral-600 dark:text-neutral-400'
                      )}>{q.fail_rate}%</span>
                    ) : <span className="text-xs text-neutral-400">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedQuiz(q)}
                      className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuiz && <ExamModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />}
    </div>
  );
}