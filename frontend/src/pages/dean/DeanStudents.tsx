// src/pages/dean/DeanStudents.tsx
// UPGRADE v2: Multi-select filters for Year, Department, and Risk Level.
//             The backend /api/v1/analytics/students already accepts
//             `major` and `risk_level` query params — we extend the UI
//             to support selecting multiple values and OR-filter on each.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, AlertTriangle, Loader2, Filter, X, ChevronDown } from 'lucide-react';
import { AnalyticsExtAPI } from '../../lib/api';
import { cn } from '../../lib/utils';

// ─── Risk badge colours ────────────────────────────────────────────────────
const RISK_BADGE: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  High:     'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  Low:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  Normal:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
};

const RISK_LEVELS  = ['Critical', 'High', 'Low', 'Normal'];
const YEAR_LABELS  = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const DEPARTMENTS  = [
  'Computer Science',
  'Artificial Intelligence',
  'Information Systems',
  'Computer Networks',
  'Software Engineering',
  'Cybersecurity',
  'Data Science',
  'Human-Computer Interaction',
];

// ─── Multi-select dropdown ─────────────────────────────────────────────────
interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
}

function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    onChange(
      selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]
    );
  };

  const displayLabel =
    selected.length === 0   ? label :
    selected.length === 1   ? selected[0] :
    `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap',
          selected.length > 0
            ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium'
            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
        )}
      >
        <Filter className="w-3.5 h-3.5 shrink-0" />
        <span>{displayLabel}</span>
        {selected.length > 0 && (
          <span
            onClick={e => { e.stopPropagation(); onChange([]); }}
            className="ml-0.5 text-red-500 hover:text-red-700"
          >
            <X className="w-3 h-3" />
          </span>
        )}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg min-w-max">
          <div className="p-1.5 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="w-3.5 h-3.5 accent-red-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{opt}</span>
              </label>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => onChange([])}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Active filter chip ────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export function DeanStudents() {
  const [students, setStudents]       = useState<any[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [riskFilters, setRiskFilters] = useState<string[]>([]);
  const [yearFilters, setYearFilters] = useState<string[]>([]);
  const [deptFilters, setDeptFilters] = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const PAGE_SIZE = 20;

  // Derive active year numbers from label strings
  const selectedYears = yearFilters.map(l => parseInt(l.replace('Year ', '')));

  const fetchStudents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // Fetch all matching pages when multiple filters are active (client-side OR)
      // For simplicity, we fetch a large page and filter locally for multi-select.
      const params: Record<string, any> = { page: 1, page_size: 200 };
      if (search)                  params.search = search;
      // Single risk filter — backend supports one at a time; multi handled client-side
      if (riskFilters.length === 1) params.risk_level = riskFilters[0];
      if (deptFilters.length === 1) params.major = deptFilters[0];

      const data = await AnalyticsExtAPI.students(params);
      let rows: any[] = data.students ?? [];

      // Client-side multi-select filtering (OR within each group, AND between groups)
      if (riskFilters.length > 1)
        rows = rows.filter(s => riskFilters.includes(s.risk_level ?? 'Normal'));
      if (deptFilters.length > 1)
        rows = rows.filter(s => deptFilters.includes(s.major ?? ''));
      if (selectedYears.length > 0)
        rows = rows.filter(s => selectedYears.includes(s.year));

      setTotal(rows.length);
      // Manual pagination on filtered list
      const start = (page - 1) * PAGE_SIZE;
      setStudents(rows.slice(start, start + PAGE_SIZE));
    } catch (e: any) {
      setError(e.message ?? 'Failed to load students');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, riskFilters, yearFilters, deptFilters]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { setPage(1); }, [search, riskFilters, yearFilters, deptFilters]);

  const activeFilterCount = riskFilters.length + yearFilters.length + deptFilters.length;
  const clearAll = () => { setRiskFilters([]); setYearFilters([]); setDeptFilters([]); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Students</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {loading ? 'Loading…' : `${total} students — live from database`}
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Search + Filters row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or student number…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Multi-select dropdowns */}
          <MultiSelect
            label="Risk Level"
            options={RISK_LEVELS}
            selected={riskFilters}
            onChange={setRiskFilters}
          />
          <MultiSelect
            label="Year"
            options={YEAR_LABELS}
            selected={yearFilters}
            onChange={setYearFilters}
          />
          <MultiSelect
            label="Department"
            options={DEPARTMENTS}
            selected={deptFilters}
            onChange={setDeptFilters}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-red-600 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-red-300 transition-colors"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {riskFilters.map(f => (
              <Chip key={f} label={`Risk: ${f}`} onRemove={() => setRiskFilters(v => v.filter(x => x !== f))} />
            ))}
            {yearFilters.map(f => (
              <Chip key={f} label={f} onRemove={() => setYearFilters(v => v.filter(x => x !== f))} />
            ))}
            {deptFilters.map(f => (
              <Chip key={f} label={f} onRemove={() => setDeptFilters(v => v.filter(x => x !== f))} />
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          <button onClick={fetchStudents} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <p className="text-sm">No students match your filters{search ? ` for "${search}"` : ''}</p>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="mt-2 text-xs text-red-600 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50/60 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-700">
                  {['Student', 'Department', 'Year', 'GPA', 'Attendance', 'Risk Level', 'Courses'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                {students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-red-700 dark:text-red-400">
                            {(s.name ?? '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-neutral-400 font-mono">{s.student_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">{s.major ?? '—'}</td>
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">
                      {s.year ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          Year {s.year}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        'font-bold tabular-nums',
                        (s.gpa ?? 0) >= 3.0 ? 'text-emerald-600' :
                        (s.gpa ?? 0) >= 2.0 ? 'text-amber-500' : 'text-red-600'
                      )}>
                        {s.gpa?.toFixed(2) ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', (s.attendance_rate ?? 0) >= 75 ? 'bg-emerald-500' : 'bg-red-500')}
                            style={{ width: `${s.attendance_rate ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-neutral-600 dark:text-neutral-400">{s.attendance_rate ?? 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', RISK_BADGE[s.risk_level] ?? RISK_BADGE.Normal)}>
                        {s.risk_level ?? 'Normal'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">{s.enrolled_courses ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-neutral-500">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >Previous</button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * PAGE_SIZE >= total || loading}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}