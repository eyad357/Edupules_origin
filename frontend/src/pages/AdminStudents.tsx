// src/pages/AdminStudents.tsx
// ══════════════════════════════════════════════════════════════════════════════
//  FIXED: Was using mockStudents + mockRiskAssessments (hardcoded fake data).
//
//  Now fetches from GET /api/v1/students/ — real PostgreSQL via FastAPI.
//  Each row returns: id, name, email, student_number, major, year, gpa,
//  risk_level, risk_score, trend, dropout_probability, attendance_rate.
//
//  Any change made in the Admin Data Panel (edit GPA, change major, etc.)
//  is immediately reflected here because both pages hit the same DB table.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Download, UserPlus, ArrowUpRight, ArrowDownRight,
  Minus, RefreshCw, AlertCircle, Loader2, X, ChevronLeft,
  ChevronRight, Filter, Pencil, Trash2, Check, Save,
  UserCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── API ───────────────────────────────────────────────────────────────────────

const FASTAPI_URL =
  (import.meta as any).env?.VITE_FASTAPI_URL ?? 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'eduguard_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${FASTAPI_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface StudentRow {
  id: number;
  user_id: number | null;
  student_number: string | null;
  major: string | null;
  year: number | null;
  gpa: number | null;
  name: string | null;
  email: string | null;
  risk_level: 'Normal' | 'Low' | 'High' | 'Critical';
  risk_score: number;
  trend: 'improving' | 'stable' | 'declining' | 'sudden_drop' | null;
  dropout_probability: number;
  attendance_rate: number;
}

interface StudentsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  students: StudentRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_STYLES: Record<string, string> = {
  Normal:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Low:      'bg-green-100  text-green-700  dark:bg-green-900/20  dark:text-green-400',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  Critical: 'bg-red-100    text-red-700    dark:bg-red-900/20    dark:text-red-400',
};

const GPA_COLOR = (gpa: number) =>
  gpa >= 3.5 ? 'text-emerald-600' : gpa >= 2.5 ? 'text-yellow-500' : 'text-red-600';

const ATT_COLOR = (rate: number) =>
  rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-yellow-400' : 'bg-red-500';

function TrendIcon({ trend }: { trend: StudentRow['trend'] }) {
  if (trend === 'improving')
    return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
  if (trend === 'declining' || trend === 'sudden_drop')
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-neutral-400" />;
}

function Avatar({ name }: { name: string | null }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? '?';
  const colors = [
    'bg-red-100 text-red-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700',
  ];
  const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm', colors[idx])}>
      {letter}
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  student,
  onClose,
  onSaved,
}: {
  student: StudentRow;
  onClose: () => void;
  onSaved: (updated: StudentRow) => void;
}) {
  const [form, setForm] = useState({
    major:          student.major ?? '',
    year:           String(student.year ?? ''),
    gpa:            String(student.gpa ?? ''),
    student_number: student.student_number ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const save = async () => {
    setSaving(true); setError('');
    try {
      const updated = await apiFetch<StudentRow>(`/students/${student.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          major:          form.major   || null,
          year:           form.year    ? parseInt(form.year)    : null,
          gpa:            form.gpa     ? parseFloat(form.gpa)   : null,
          student_number: form.student_number || null,
        }),
      });
      onSaved(updated);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <Avatar name={student.name} />
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white text-sm">{student.name ?? 'Unknown'}</p>
              <p className="text-xs text-neutral-500">{student.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
          {[
            { label: 'Student Number', key: 'student_number', type: 'text' },
            { label: 'Major',          key: 'major',          type: 'text' },
            { label: 'Year',           key: 'year',           type: 'number' },
            { label: 'GPA',            key: 'gpa',            type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
                {f.label}
              </label>
              <input
                type={f.type}
                step={f.key === 'gpa' ? '0.01' : '1'}
                min={f.key === 'gpa' ? '0' : '1'}
                max={f.key === 'gpa' ? '4' : undefined}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Cancel</button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteModal({ name, onClose, onConfirm, isDeleting }: {
  name: string | null; onClose: () => void; onConfirm: () => void; isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Delete Student?</h3>
        <p className="text-sm text-neutral-500 mb-1">
          You are about to permanently delete <span className="font-medium text-neutral-800 dark:text-neutral-200">{name ?? 'this student'}</span>.
        </p>
        <p className="text-xs text-red-500 mb-6">All related attendance, risk, and enrollment records will be removed.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ students }: { students: StudentRow[] }) {
  const total    = students.length;
  const avgGpa   = total ? (students.reduce((s, r) => s + (r.gpa ?? 0), 0) / total).toFixed(2) : '—';
  const avgAtt   = total ? Math.round(students.reduce((s, r) => s + r.attendance_rate, 0) / total) : 0;
  const critical = students.filter(s => s.risk_level === 'Critical').length;
  const high     = students.filter(s => s.risk_level === 'High').length;

  const stats = [
    { label: 'Total Students', value: total, color: 'text-neutral-900 dark:text-white' },
    { label: 'Avg GPA',        value: avgGpa,  color: 'text-blue-600' },
    { label: 'Avg Attendance', value: `${avgAtt}%`, color: avgAtt >= 80 ? 'text-emerald-600' : 'text-orange-500' },
    { label: 'High Risk',      value: high,    color: 'text-orange-600' },
    { label: 'Critical',       value: critical, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
          <p className={cn('text-2xl font-bold mt-0.5', s.color)}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const RISK_OPTIONS = ['all', 'Normal', 'Low', 'High', 'Critical'] as const;

export function AdminStudents() {
  const [allStudents, setAllStudents]   = useState<StudentRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalCount, setTotalCount]     = useState(0);

  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [filterRisk, setFilterRisk]     = useState<string>('all');

  const [editStudent, setEditStudent]   = useState<StudentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ok = true) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, ok });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchStudents = useCallback(async (opts?: { resetPage?: boolean }) => {
    setLoading(true); setError('');
    const p = opts?.resetPage ? 1 : page;
    if (opts?.resetPage) setPage(1);
    try {
      const params = new URLSearchParams({
        page:      String(p),
        page_size: String(PAGE_SIZE),
        ...(search ? { search } : {}),
      });
      const data = await apiFetch<StudentsResponse>(`/students/?${params}`);
      setAllStudents(data.students);
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchStudents(); }, [page, search]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Derived list (client-side risk filter) ─────────────────────────────────

  const students = filterRisk === 'all'
    ? allStudents
    : allStudents.filter(s => s.risk_level === filterRisk);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleUpdated = (updated: StudentRow) => {
    setAllStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    showToast(`${updated.name ?? 'Student'} updated successfully.`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/students/${deleteTarget.id}`, { method: 'DELETE' });
      setAllStudents(prev => prev.filter(s => s.id !== deleteTarget.id));
      showToast(`${deleteTarget.name ?? 'Student'} deleted.`);
      setDeleteTarget(null);
    } catch (e: any) {
      showToast(e.message ?? 'Delete failed.', false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────

  const exportCsv = () => {
    const header = 'Name,Email,Student Number,Major,Year,GPA,Attendance,Risk Level,Risk Score,Trend';
    const rows = students.map(s =>
      [s.name, s.email, s.student_number, s.major, s.year,
       s.gpa, `${s.attendance_rate}%`, s.risk_level, s.risk_score, s.trend ?? 'stable']
      .map(v => `"${v ?? ''}"`)
      .join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Students</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {loading ? 'Loading…' : `${totalCount} student${totalCount !== 1 ? 's' : ''} — live from database`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStudents()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={loading || students.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats — only when data loaded */}
      {!loading && students.length > 0 && <StatsBar students={allStudents} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, major…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="flex gap-1">
            {RISK_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  filterRisk === r
                    ? r === 'all'
                      ? 'bg-neutral-800 text-white border-neutral-800 dark:bg-white dark:text-neutral-900 dark:border-white'
                      : r === 'Critical'
                        ? 'bg-red-600 text-white border-red-600'
                        : r === 'High'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : r === 'Low'
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                )}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading students from database…</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm text-center">{error}</p>
            <button onClick={() => fetchStudents()} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-neutral-400">
            <UserCircle2 className="w-10 h-10 opacity-30" />
            <p className="text-sm">{search ? 'No students match your search.' : 'No students found in database.'}</p>
            {search && <button onClick={() => { setSearchInput(''); setSearch(''); }} className="text-xs text-red-600 hover:underline">Clear search</button>}
          </div>
        )}

        {/* Data table */}
        {!loading && !error && students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                  {['Student', 'Department / Major', 'Year', 'GPA', 'Attendance', 'Risk', 'Trend', ''].map(h => (
                    <th key={h} className={cn(
                      'px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider',
                      h === '' ? 'text-right' : 'text-left'
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">

                    {/* Student */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} />
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white text-sm">{s.name ?? '—'}</p>
                          <p className="text-xs text-neutral-400 font-mono">{s.student_number ?? s.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Major */}
                    <td className="px-5 py-3 text-neutral-700 dark:text-neutral-300">{s.major ?? '—'}</td>

                    {/* Year */}
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                      {s.year != null ? `Year ${s.year}` : '—'}
                    </td>

                    {/* GPA */}
                    <td className="px-5 py-3">
                      {s.gpa != null ? (
                        <span className={cn('font-bold text-base tabular-nums', GPA_COLOR(s.gpa))}>
                          {s.gpa.toFixed(2)}
                        </span>
                      ) : <span className="text-neutral-300">—</span>}
                    </td>

                    {/* Attendance */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className="flex-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', ATT_COLOR(s.attendance_rate))}
                            style={{ width: `${s.attendance_rate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 tabular-nums w-8">
                          {s.attendance_rate}%
                        </span>
                      </div>
                    </td>

                    {/* Risk badge */}
                    <td className="px-5 py-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', RISK_STYLES[s.risk_level] ?? RISK_STYLES.Normal)}>
                        {s.risk_level}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <TrendIcon trend={s.trend} />
                        <span className={cn(
                          'text-xs capitalize',
                          s.trend === 'improving' ? 'text-emerald-600' :
                          s.trend === 'declining' || s.trend === 'sudden_drop' ? 'text-red-500' : 'text-neutral-400'
                        )}>
                          {s.trend?.replace('_', ' ') ?? 'stable'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditStudent(s)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit student"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!loading && !error && students.length > 0 && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Page {page} of {totalPages} &bull; {totalCount.toLocaleString()} total
              {filterRisk !== 'all' && ` · Filtered: ${students.length} ${filterRisk}`}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-500" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-7 h-7 rounded text-xs font-medium transition-colors',
                      p === page ? 'bg-red-600 text-white' : 'text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editStudent && (
        <EditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSaved={handleUpdated}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium',
          toast.ok
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700',
        )}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}