// src/pages/dean/DeanCourses.tsx
// ENHANCED v4.0 — Production-ready, real database only
//
// API shape from /api/v1/analytics/courses:
//   id, code, name, department, year, semester, credits,
//   instructor, professor_id, enrolled, avg_grade,
//   pass_rate, fail_rate, attendance
//
// Sections:
//   1. Page header (title + subtitle + Refresh)
//   2. Filter bar  (Department ▾  Year ▾  |  Search  Legend)
//   3. Course Difficulty Heatmap (dept × year tiles, only when dept/year data exists)
//   4. All Courses professional table (sortable columns, color-coded, status pill)
//   5. Numbered pagination

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, RefreshCw, Loader2, AlertTriangle,
  ChevronDown, ChevronUp, ChevronsUpDown,
  BookOpen,
} from 'lucide-react';
import { AnalyticsExtAPI } from '../../lib/api';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Course {
  id:           number;
  code:         string;
  name:         string;
  department?:  string | null;
  year?:        number | null;
  semester?:    string | null;
  credits?:     number | null;
  instructor?:  string | null;
  professor_id?:number | null;
  enrolled:     number;
  avg_grade:    number;
  pass_rate:    number;
  fail_rate:    number;
  attendance:   number;
}

type SortKey  = 'name' | 'department' | 'instructor' | 'enrolled' | 'avg_grade' | 'attendance' | 'pass_rate';
type SortDir  = 'asc' | 'desc';

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Heatmap tile fill — matches legend ≥80 green / 60-79 amber / <60 red */
const heatFill = (p: number) =>
  p >= 80 ? '#22c55e' : p >= 60 ? '#f59e0b' : '#ef4444';

/** Avg-grade text colour */
const gradeClr = (v: number) =>
  v >= 75 ? 'text-emerald-600 dark:text-emerald-400'
: v >= 60 ? 'text-amber-500  dark:text-amber-400'
:           'text-red-500    dark:text-red-400';

/** Pass-rate text colour */
const passClr = (v: number) =>
  v >= 80 ? 'text-emerald-600 dark:text-emerald-400'
: v >= 60 ? 'text-amber-500  dark:text-amber-400'
:           'text-red-500    dark:text-red-400';

/** Status pill — derived from pass rate */
function courseStatus(passRate: number): { label: string; cls: string } {
  if (passRate >= 80) return { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
  if (passRate >= 60) return { label: 'Pending',  cls: 'bg-amber-100  text-amber-600  dark:bg-amber-900/30  dark:text-amber-300'  };
  return               { label: 'Rejected', cls: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400'    };
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterSelect
// ─────────────────────────────────────────────────────────────────────────────

function FilterSelect({
  value, onChange, options, placeholder = 'All',
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'appearance-none h-9 pl-3 pr-8 text-sm rounded-lg cursor-pointer transition-colors',
          'border border-neutral-200 dark:border-neutral-700',
          'bg-white dark:bg-neutral-900',
          'text-neutral-700 dark:text-neutral-300',
          'focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sort icon
// ─────────────────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3 h-3 ml-1 text-red-500" />
    : <ChevronDown className="w-3 h-3 ml-1 text-red-500" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination button
// ─────────────────────────────────────────────────────────────────────────────

function PBtn({
  children, onClick, disabled = false, active = false,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium border transition-colors select-none',
        active
          ? 'bg-red-600 text-white border-red-600 shadow-sm'
          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Heatmap
// ─────────────────────────────────────────────────────────────────────────────

function CourseHeatmap({ courses }: { courses: Course[] }) {
  const depts = useMemo(
    () => [...new Set(courses.map(c => c.department).filter((d): d is string => !!d))].sort(),
    [courses],
  );
  const years = useMemo(
    () => [...new Set(courses.map(c => c.year).filter((y): y is number => typeof y === 'number'))].sort((a, b) => a - b),
    [courses],
  );

  if (!depts.length || !years.length) return null;

  // Build lookup dept → year → Course[]
  const lookup: Record<string, Record<number, Course[]>> = {};
  for (const c of courses) {
    if (!c.department || !c.year) continue;
    (lookup[c.department] ??= {})[c.year] ??= [];
    lookup[c.department][c.year].push(c);
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Course Difficulty Heatmap — Pass Rate by Department &amp; Year
        </p>
      </div>

      <div className="px-6 py-5 overflow-x-auto">
        {/* Column headers */}
        <div
          className="grid gap-x-2 mb-3"
          style={{ gridTemplateColumns: `180px repeat(${years.length}, minmax(120px, 1fr))` }}
        >
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Department</div>
          {years.map(y => (
            <div key={y} className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-center">
              Year {y}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {depts.map(dept => (
            <div
              key={dept}
              className="grid items-start gap-x-2"
              style={{ gridTemplateColumns: `180px repeat(${years.length}, minmax(120px, 1fr))` }}
            >
              {/* Dept label */}
              <div className="flex items-center min-h-[62px]">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate pr-2">
                  {dept}
                </span>
              </div>

              {/* Cells */}
              {years.map(yr => {
                const cells = lookup[dept]?.[yr];
                if (!cells?.length) {
                  return (
                    <div
                      key={yr}
                      className="h-[52px] rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700/60 bg-neutral-50/80 dark:bg-neutral-800/20"
                    />
                  );
                }
                const avgPass = Math.round(cells.reduce((s, c) => s + (c.pass_rate ?? 0), 0) / cells.length);
                const fill    = heatFill(avgPass);
                const codes   = cells.map(c => c.code).join(', ');

                return (
                  <div key={yr} className="flex flex-col gap-1">
                    <div
                      className="h-[52px] rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-[1.02] cursor-default"
                      style={{ backgroundColor: fill }}
                    >
                      <span className="text-[16px] font-bold text-white leading-none">{avgPass}%</span>
                      <span className="text-[11px] text-white/80 font-medium mt-0.5">Pass</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 text-center truncate px-1 leading-tight">
                      {codes}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'center' }[] = [
  { key: 'name',        label: 'Course',      align: 'left'   },
  { key: 'department',  label: 'Department',  align: 'left'   },
  { key: 'instructor',  label: 'Instructor',  align: 'left'   },
  { key: 'enrolled',    label: 'Enrolled',    align: 'center' },
  { key: 'avg_grade',   label: 'Avg Grade',   align: 'center' },
  { key: 'attendance',  label: 'Attendance',  align: 'center' },
  { key: 'pass_rate',   label: 'Pass Rate',   align: 'center' },
];

export function DeanCourses() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortKey,    setSortKey]    = useState<SortKey>('name');
  const [sortDir,    setSortDir]    = useState<SortDir>('asc');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await AnalyticsExtAPI.courses({ page: 1, page_size: 200 });
      setAllCourses(data.courses ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { setPage(1); }, [search, deptFilter, yearFilter, sortKey, sortDir]);

  // ── Derived filter options ──────────────────────────────────────────────────

  const deptOptions = useMemo(
    () => [...new Set(allCourses.map(c => c.department).filter((d): d is string => !!d))].sort(),
    [allCourses],
  );

  const yearOptions = useMemo(
    () =>
      [...new Set(allCourses.map(c => c.year).filter((y): y is number => typeof y === 'number'))]
        .sort((a, b) => a - b).map(String),
    [allCourses],
  );

  // ── Sort handler ────────────────────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Filter + sort pipeline ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let rows = allCourses;

    // text search
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter(c =>
      c.name?.toLowerCase().includes(q)       ||
      c.code?.toLowerCase().includes(q)       ||
      c.instructor?.toLowerCase().includes(q) ||
      c.department?.toLowerCase().includes(q),
    );

    // dropdowns
    if (deptFilter) rows = rows.filter(c => c.department === deptFilter);
    if (yearFilter) rows = rows.filter(c => String(c.year) === yearFilter);

    // sort
    rows = [...rows].sort((a, b) => {
      const av = (a as any)[sortKey] ?? '';
      const bv = (b as any)[sortKey] ?? '';
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [allCourses, search, deptFilter, yearFilter, sortKey, sortDir]);

  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Heatmap: dept/year filter only (no text search, no sort — shows structural picture)
  const heatmapRows = useMemo(() => {
    let rows = allCourses;
    if (deptFilter) rows = rows.filter(c => c.department === deptFilter);
    if (yearFilter) rows = rows.filter(c => String(c.year) === yearFilter);
    return rows;
  }, [allCourses, deptFilter, yearFilter]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">Courses</h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">
            {loading
              ? 'Loading…'
              : `${total} course${total !== 1 ? 's' : ''} this semester`}
          </p>
        </div>

        <button
          onClick={fetchCourses}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-colors shrink-0',
            'border border-neutral-200 dark:border-neutral-700',
            'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
            'hover:bg-neutral-50 dark:hover:bg-neutral-800',
            'disabled:opacity-50',
          )}
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* ── Filter / Search Bar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Left: dropdowns */}
        <FilterSelect value={deptFilter} onChange={setDeptFilter} options={deptOptions} placeholder="All" />
        <FilterSelect value={yearFilter} onChange={setYearFilter} options={yearOptions} placeholder="All" />

        <div className="flex-1" />

        {/* Right: search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses…"
            className={cn(
              'h-9 pl-8 pr-4 text-sm rounded-lg w-52 transition-colors',
              'border border-neutral-200 dark:border-neutral-700',
              'bg-white dark:bg-neutral-900',
              'text-neutral-900 dark:text-white placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400',
            )}
          />
        </div>

        {/* Legend dots */}
        <div className="flex items-center gap-3.5 pl-1">
          {[
            { fill: '#22c55e', label: '≥80% pass' },
            { fill: '#f59e0b', label: '60–80%'    },
            { fill: '#ef4444', label: '<60%'      },
          ].map(({ fill, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: fill }} />
              <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchCourses} className="text-xs font-semibold underline underline-offset-2">Retry</button>
        </div>
      )}

      {/* ── Heatmap (skeleton while loading, hidden when no dept/year data) ──── */}
      {loading ? (
        <div className="h-52 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : (
        <CourseHeatmap courses={heatmapRows} />
      )}

      {/* ── All Courses Table ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            All Courses
          </h2>
          {!loading && (
            <span className="text-xs text-neutral-400">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            <p className="text-sm text-neutral-400">Loading courses…</p>
          </div>
        ) : pageRows.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
            <BookOpen className="w-10 h-10 opacity-25" />
            <p className="text-sm font-medium">No courses match your search or filters.</p>
            <button
              onClick={() => { setSearch(''); setDeptFilter(''); setYearFilter(''); }}
              className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">

              {/* ── Head ───────────────────────────────────────────────────── */}
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/20">
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        'px-4 py-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none',
                        'hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors',
                        col.align === 'center' ? 'text-center' : 'text-left',
                      )}
                    >
                      <span className="inline-flex items-center">
                        {col.label}
                        <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                  {/* Status col — not sortable */}
                  <th className="px-4 py-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-center">
                    Status
                  </th>
                </tr>
              </thead>

              {/* ── Body ───────────────────────────────────────────────────── */}
              <tbody>
                {pageRows.map((c, idx) => {
                  const { label: statusLabel, cls: statusCls } = courseStatus(c.pass_rate ?? 0);
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        'border-b border-neutral-50 dark:border-neutral-800/40 last:border-0',
                        'hover:bg-red-50/30 dark:hover:bg-neutral-800/30 transition-colors',
                        idx % 2 === 1 ? 'bg-neutral-50/30 dark:bg-neutral-800/10' : '',
                      )}
                    >
                      {/* ── Course name + code ── */}
                      <td className="px-4 py-3.5 min-w-[200px]">
                        <p className="font-semibold text-neutral-900 dark:text-white leading-snug">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5 leading-none">
                          {c.code}
                        </p>
                      </td>

                      {/* ── Department ── */}
                      <td className="px-4 py-3.5 min-w-[130px]">
                        {c.department ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {c.department}
                          </span>
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-600">—</span>
                        )}
                      </td>

                      {/* ── Instructor ── */}
                      <td className="px-4 py-3.5 min-w-[160px] text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {c.instructor ?? <span className="text-neutral-300 dark:text-neutral-600">—</span>}
                      </td>

                      {/* ── Enrolled ── */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
                          {c.enrolled ?? 0}
                        </span>
                      </td>

                      {/* ── Avg Grade ── */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('text-sm font-bold tabular-nums', gradeClr(c.avg_grade ?? 0))}>
                          {c.avg_grade != null ? `${Number(c.avg_grade).toFixed(1)}%` : '—'}
                        </span>
                      </td>

                      {/* ── Attendance ── */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">
                            {c.attendance != null ? `${c.attendance}%` : '—'}
                          </span>
                          {c.attendance != null && (
                            <div className="w-14 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width:           `${Math.min(100, c.attendance)}%`,
                                  backgroundColor: heatFill(c.attendance),
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ── Pass Rate ── */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('text-sm font-bold tabular-nums', passClr(c.pass_rate ?? 0))}>
                            {c.pass_rate != null ? `${c.pass_rate}%` : '—'}
                          </span>
                          {c.pass_rate != null && (
                            <div className="w-14 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width:           `${Math.min(100, c.pass_rate)}%`,
                                  backgroundColor: heatFill(c.pass_rate),
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ── Status pill ── */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
                          statusCls,
                        )}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} courses
          </p>

          <div className="flex items-center gap-1">
            <PBtn onClick={() => setPage(1)}                             disabled={page === 1}>«</PBtn>
            <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}      disabled={page === 1}>‹</PBtn>

            {(() => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).map(p => (
                <PBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PBtn>
              ));
            })()}

            <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>›</PBtn>
            <PBtn onClick={() => setPage(totalPages)}                        disabled={page >= totalPages}>»</PBtn>
          </div>
        </div>
      )}

    </div>
  );
}