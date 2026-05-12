// src/pages/AdminDataPanel.tsx
// FIX: Enum columns (role, status, risk_level, etc.) now render as <select>
// dropdowns instead of free-text inputs, preventing invalid-enum DB errors
// like "invalid input value for enum user_role: 'studnt'".
//
// Changes:
//  1. ExtColumnMeta now includes enum_values?: string[] (sent by backend).
//  2. FormField inputType extended with 'select'.
//  3. colToFormField: detects enum_values OR type containing 'enum' → 'select'.
//  4. FormModal render: adds <select> branch before the generic <input> fallback.
//  5. adminPanelApi ColumnMeta interface updated with enum_values field.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Database, Plus, Pencil, Trash2, Search, RefreshCw,
  X, Check, ChevronDown, ChevronUp, AlertCircle, Loader2,
  Save, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Grid3X3, Activity, Hash, Shield, UserCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  AdminPanelAPI,
  type ColumnMeta,
  type RecordsResponse,
  type TableInfo,
} from '../lib/adminPanelApi';

// Extended ColumnMeta — backend adds "virtual", "label", and "enum_values".
interface ExtColumnMeta extends ColumnMeta {
  virtual?:     boolean;
  label?:       string;
  enum_values?: string[] | null;   // ← NEW: present for ENUM DB columns
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const TABLE_DISPLAY_NAMES: Record<string, string> = {
  users:                'Users',
  students:             'Students',
  professors:           'Professors',
  advisors:             'Advisors',
  courses:              'Courses',
  enrollments:          'Enrollments',
  attendances:          'Attendance',
  activity_logs:        'Activity Logs',
  risk_assessments:     'Risk Assessments',
  intervention_plans:   'Intervention Plans',
  intervention_actions: 'Intervention Actions',
  notifications:        'Notifications',
  quizzes:              'Quizzes',
  questions:            'Questions',
  quiz_submissions:     'Quiz Submissions',
  audit_logs:           'Audit Logs',
};

function tableLabel(key: string): string {
  return TABLE_DISPLAY_NAMES[key]
    ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const TABLE_ICONS: Record<string, React.ElementType> = {
  users:                Shield,
  students:             Activity,
  professors:           Activity,
  advisors:             Activity,
  courses:              Grid3X3,
  enrollments:          Grid3X3,
  attendances:          Grid3X3,
  activity_logs:        Activity,
  risk_assessments:     AlertCircle,
  intervention_plans:   Shield,
  intervention_actions: Shield,
  notifications:        Activity,
  quizzes:              Grid3X3,
  questions:            Grid3X3,
  quiz_submissions:     Grid3X3,
  audit_logs:           Database,
};

// Human-readable labels for role values (DB value → display text)
const ROLE_LABELS: Record<string, string> = {
  ta:    'Teaching Assistant',
  admin: 'Administrator',
};

// Roles hidden from the Add/Edit dropdown (advisor is internal-only)
const HIDDEN_ROLE_OPTIONS = new Set(['advisor']);

const BADGE_COLORS: Record<string, string> = {
  admin:     'bg-red-100 text-red-700',
  student:   'bg-blue-100 text-blue-700',
  professor: 'bg-purple-100 text-purple-700',
  ta:        'bg-indigo-100 text-indigo-700',
  advisor:   'bg-teal-100 text-teal-700',
  active:    'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-neutral-100 text-neutral-500',
  high:      'bg-red-100 text-red-700',
  medium:    'bg-orange-100 text-orange-700',
  low:       'bg-green-100 text-green-700',
  normal:    'bg-neutral-100 text-neutral-600',
  critical:  'bg-red-200 text-red-800',
  true:      'bg-emerald-100 text-emerald-700',
  false:     'bg-neutral-100 text-neutral-500',
};

const BADGE_COLS = new Set([
  'role', 'status', 'priority', 'risk_level', 'type',
  'audience', 'is_active', 'is_read', 'is_pinned', 'is_published',
]);

const DATE_COLS = new Set([
  'created_at', 'updated_at', 'assessed_at', 'submitted_at',
  'last_active', 'date', 'due_date', 'start_date', 'end_date',
]);

// ── Cell renderer ─────────────────────────────────────────────────────────────

function CellValue({ col, value, isVirtual }: { col: string; value: any; isVirtual?: boolean }) {
  if (value === null || value === undefined) {
    return <span className="text-neutral-300 dark:text-neutral-600 select-none">—</span>;
  }
  if (isVirtual && col.endsWith('_name')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-100">
        <UserCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
        {String(value)}
      </span>
    );
  }
  if (isVirtual && col.endsWith('_email')) {
    return <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{String(value)}</span>;
  }
  if (isVirtual) {
    return <span className="italic text-neutral-600 dark:text-neutral-400">{String(value)}</span>;
  }
  if (BADGE_COLS.has(col)) {
    const str = String(value);
    const key = str.toLowerCase();
    const cls = BADGE_COLORS[key] ?? 'bg-neutral-100 text-neutral-600';
    // Use human-readable label when available (e.g. ta → Teaching Assistant)
    const display = (col === 'role' && ROLE_LABELS[key]) ? ROLE_LABELS[key] : str;
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', cls)}>
        {display}
      </span>
    );
  }
  if (DATE_COLS.has(col)) {
    try {
      return <span className="text-neutral-500 dark:text-neutral-400 font-mono text-xs">{new Date(value).toLocaleDateString()}</span>;
    } catch { return <span>{String(value)}</span>; }
  }
  if (typeof value === 'boolean') {
    return value
      ? <Check className="w-4 h-4 text-emerald-500" />
      : <X className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />;
  }
  if (typeof value === 'number') {
    return <span className="font-mono text-xs">{value}</span>;
  }
  const str = String(value);
  return <span title={str.length > 40 ? str : undefined}>{str.length > 40 ? str.slice(0, 40) + '…' : str}</span>;
}

// ── Form field auto-generator ─────────────────────────────────────────────────

interface FormField {
  key:       string;
  label:     string;
  inputType: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'checkbox' | 'date' | 'select';
  required:  boolean;
  options?:  string[];   // present when inputType === 'select'
}

function colToFormField(col: ExtColumnMeta): FormField {
  const t = col.type.toLowerCase();

  // ── FIX: detect enum columns → render as <select> ─────────────────────────
  // Priority 1: backend explicitly sent enum_values list
  if (col.enum_values && col.enum_values.length > 0) {
    return {
      key:       col.name,
      label:     col.label ?? col.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      inputType: 'select',
      required:  !col.nullable && !col.primary_key && !col.default,
      options:   col.enum_values,
    };
  }
  // Priority 2: type string contains 'enum' (fallback for older backends)
  if (t.includes('enum')) {
    return {
      key:       col.name,
      label:     col.label ?? col.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      inputType: 'select',
      required:  !col.nullable && !col.primary_key && !col.default,
      options:   [],   // no values known — will render empty select (user sees warning)
    };
  }
  // ─────────────────────────────────────────────────────────────────────────

  let inputType: FormField['inputType'] = 'text';
  if (t.includes('int') || t.includes('float') || t.includes('numeric') || t.includes('double')) inputType = 'number';
  else if (t.includes('bool')) inputType = 'checkbox';
  else if (t.includes('date') || t.includes('timestamp')) inputType = 'date';
  else if (t.includes('text')) inputType = 'textarea';
  if (col.name === 'email') inputType = 'email';
  if (col.name.includes('password')) inputType = 'password';

  return {
    key:      col.name,
    label:    col.label ?? col.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    inputType,
    required: !col.nullable && !col.primary_key && !col.default,
  };
}

// ── Shared input class ────────────────────────────────────────────────────────
const INPUT_CLS = 'w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500';

// ── Form Modal ─────────────────────────────────────────────────────────────────

interface FormModalProps {
  title:        string;
  columns:      ColumnMeta[];
  initialData?: Record<string, any>;
  onClose:      () => void;
  onSave:       (data: Record<string, any>) => Promise<void>;
}

function FormModal({ title, columns, initialData, onClose, onSave }: FormModalProps) {
  // Pre-populate defaults: enum → first option, bool → false, then merge initialData
  const buildDefaults = () => {
    const d: Record<string, any> = {};
    for (const col of (columns as ExtColumnMeta[]).filter(c => !c.primary_key && !c.virtual && c.name !== 'created_at' && c.name !== 'updated_at')) {
      if (col.enum_values && col.enum_values.length > 0) d[col.name] = col.enum_values[0];
      else if (col.type.toLowerCase().includes('bool')) d[col.name] = false;
    }
    return { ...d, ...(initialData ?? {}) };
  };
  const editableCols = (columns as ExtColumnMeta[]).filter(
    c => !c.primary_key && !c.virtual && c.name !== 'created_at' && c.name !== 'updated_at',
  );
  const [form, setForm]   = useState<Record<string, any>>(buildDefaults);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const update = (key: string, value: any) => setForm(p => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message ?? 'An error occurred'); }
    finally { setSaving(false); }
  };

  if (editableCols.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center">
          <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">This table has no editable fields.</p>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium hover:bg-neutral-200 transition-colors">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Save className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {editableCols.map(col => {
            const field = colToFormField(col as ExtColumnMeta);
            return (
              <div key={col.name}>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  <span className="ml-2 font-normal text-neutral-400 normal-case tracking-normal">({col.type})</span>
                </label>

                {/* ── Select for ENUM columns ─────────────────────────────── */}
                {field.inputType === 'select' ? (
                  field.options && field.options.length > 0 ? (
                    <select
                      value={form[col.name] ?? ''}
                      onChange={e => update(col.name, e.target.value)}
                      className={INPUT_CLS}
                    >
                      {!field.required && <option value="">— none —</option>}
                      {field.options
                        .filter(opt => !HIDDEN_ROLE_OPTIONS.has(opt))
                        .map(opt => (
                          <option key={opt} value={opt}>
                            {ROLE_LABELS[opt] ?? opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                    </select>
                  ) : (
                    // Edge case: type is ENUM but no values known — free text with hint
                    <input
                      type="text"
                      value={form[col.name] ?? ''}
                      onChange={e => update(col.name, e.target.value)}
                      className={INPUT_CLS}
                      placeholder="Enter exact enum value"
                    />
                  )

                /* ── Textarea ────────────────────────────────────────────── */
                ) : field.inputType === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={form[col.name] ?? ''}
                    onChange={e => update(col.name, e.target.value)}
                    className={cn(INPUT_CLS, 'resize-none')}
                  />

                /* ── Checkbox ────────────────────────────────────────────── */
                ) : field.inputType === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form[col.name]}
                      onChange={e => update(col.name, e.target.checked)}
                      className="w-4 h-4 rounded accent-red-600"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Enable</span>
                  </label>

                /* ── Generic input (text / number / email / password / date) */
                ) : (
                  <input
                    type={field.inputType}
                    value={form[col.name] ?? ''}
                    onChange={e => update(
                      col.name,
                      field.inputType === 'number'
                        ? (e.target.value === '' ? '' : parseFloat(e.target.value))
                        : e.target.value,
                    )}
                    className={INPUT_CLS}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────

function DeleteModal({ onClose, onConfirm, isDeleting }: { onClose: () => void; onConfirm: () => void; isDeleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">Delete Record?</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          This action is permanent and cannot be undone. All related data will be affected.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPage(1)} disabled={page === 1} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"><ChevronsLeft className="w-3.5 h-3.5 text-neutral-500" /></button>
      <button onClick={() => onPage(page - 1)} disabled={page === 1} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-neutral-500" /></button>
      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)} className={cn('w-7 h-7 rounded text-xs font-medium transition-colors', p === page ? 'bg-red-600 text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"><ChevronRight className="w-3.5 h-3.5 text-neutral-500" /></button>
      <button onClick={() => onPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"><ChevronsRight className="w-3.5 h-3.5 text-neutral-500" /></button>
    </div>
  );
}

// ── Stats Bar ──────────────────────────────────────────────────────────────────

function StatsBar({ tables }: { tables: TableInfo[] }) {
  const top5 = [...tables].sort((a, b) => b.count - a.count).slice(0, 5);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {top5.map(t => {
        const Icon = TABLE_ICONS[t.table] ?? Hash;
        return (
          <div key={t.table} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize truncate">{tableLabel(t.table)}</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white leading-none">{t.count.toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AdminDataPanel() {
  const [tables, setTables]               = useState<TableInfo[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [activeTable, setActiveTable]     = useState<string>('users');
  const [response, setResponse]           = useState<RecordsResponse | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState('');
  const [searchInput, setSearchInput]     = useState('');
  const [sortBy, setSortBy]               = useState<string>('');
  const [sortDir, setSortDir]             = useState<'asc' | 'desc'>('desc');
  const [formModal, setFormModal]         = useState<{ mode: 'create' | 'edit'; record?: Record<string, any> } | null>(null);
  const [deleteModal, setDeleteModal]     = useState<{ id: number } | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ok = true) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    AdminPanelAPI.listTables()
      .then(r => setTables(r.tables))
      .catch(e => console.error('Failed to load tables:', e))
      .finally(() => setTablesLoading(false));
  }, []);

  const fetchRecords = useCallback(async (opts?: { resetPage?: boolean }) => {
    setLoading(true); setError('');
    const p = opts?.resetPage ? 1 : page;
    if (opts?.resetPage) setPage(1);
    try {
      const data = await AdminPanelAPI.listRecords(activeTable, {
        page: p, page_size: PAGE_SIZE,
        search: search || undefined,
        sort_by: sortBy || undefined,
        sort_dir: sortDir,
      });
      setResponse(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load records');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  }, [activeTable, page, search, sortBy, sortDir]);

  useEffect(() => { fetchRecords(); }, [activeTable, page, search, sortBy, sortDir]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const switchTable = (name: string) => {
    setActiveTable(name); setSearch(''); setSearchInput('');
    setPage(1); setSortBy(''); setSortDir('desc'); setResponse(null);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setPage(1);
  };

  const handleSave = async (data: Record<string, any>) => {
    if (formModal?.mode === 'edit' && formModal.record?.id) {
      await AdminPanelAPI.updateRecord(activeTable, formModal.record.id, data);
      showToast('Record updated successfully.');
    } else {
      await AdminPanelAPI.createRecord(activeTable, data);
      showToast('Record created successfully.');
    }
    AdminPanelAPI.listTables().then(r => setTables(r.tables)).catch(() => {});
    await fetchRecords();
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await AdminPanelAPI.deleteRecord(activeTable, deleteModal.id);
      showToast('Record deleted.');
      AdminPanelAPI.listTables().then(r => setTables(r.tables)).catch(() => {});
      await fetchRecords();
      setDeleteModal(null);
    } catch (e: any) {
      showToast(e.message ?? 'Delete failed.', false);
    } finally { setIsDeleting(false); }
  };

  const columns    = response?.columns ?? [];
  const records    = response?.records ?? [];
  const totalPages = response?.total_pages ?? 1;
  const totalCount = response?.total ?? 0;

  const virtualCols = (columns as ExtColumnMeta[]).filter(c => c.virtual);
  const realCols    = (columns as ExtColumnMeta[])
    .filter(c => !c.virtual && !['hashed_password','content','description','notes','body','options_json','answers_json','metadata_json','old_value','new_value'].includes(c.name))
    .slice(0, 8);
  const visibleCols = [...virtualCols, ...realCols];

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Administrator Data Panel</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Full CRUD access to all database tables</p>
          </div>
        </div>
        <button onClick={() => fetchRecords()} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      {!tablesLoading && tables.length > 0 && <StatsBar tables={tables} />}

      {/* Table selector */}
      {tablesLoading ? (
        <div className="flex items-center gap-2 text-neutral-400 text-sm py-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading tables…
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tables.map(t => {
            const Icon = TABLE_ICONS[t.table] ?? Hash;
            const isActive = t.table === activeTable;
            return (
              <button key={t.table} onClick={() => switchTable(t.table)} className={cn('flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border', isActive ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400')}>
                <Icon className="w-3.5 h-3.5" />
                <span>{tableLabel(t.table)}</span>
                <span className={cn('px-1.5 py-0.5 rounded-full text-xs font-bold', isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500')}>
                  {t.count >= 0 ? t.count.toLocaleString() : '?'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Data card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder={`Search ${tableLabel(activeTable)}…`} className="w-full pl-9 pr-8 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {search && <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg">{totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''}</span>}
            {columns.length > 0 && (
              <button onClick={() => setFormModal({ mode: 'create' })} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Add Record
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        {loading && records.length === 0 ? (
          <div className="flex items-center justify-center py-24 gap-3 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading {tableLabel(activeTable)}…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm text-center">{error}</p>
            <button onClick={() => fetchRecords()} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Retry</button>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-neutral-400">
            <Database className="w-8 h-8 opacity-30" />
            <p className="text-sm">{search ? 'No records match your search.' : `No records in ${tableLabel(activeTable)}.`}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className={cn('relative transition-opacity', loading ? 'opacity-60 pointer-events-none' : '')}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                    {(visibleCols as ExtColumnMeta[]).map(col => (
                      <th key={col.name} onClick={() => !col.virtual && handleSort(col.name)} className={cn('px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider select-none whitespace-nowrap', col.virtual ? 'text-red-500 dark:text-red-400 cursor-default' : 'text-neutral-500 dark:text-neutral-400 cursor-pointer hover:text-neutral-900 dark:hover:text-white')}>
                        <div className="flex items-center gap-1.5">
                          {col.virtual
                            ? <><UserCircle2 className="w-3 h-3" />{col.label ?? col.name.replace(/_/g, ' ')}</>
                            : col.name.replace(/_/g, ' ')}
                          {!col.virtual && (sortBy === col.name
                            ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-red-600" /> : <ChevronDown className="w-3 h-3 text-red-600" />
                            : <ChevronDown className="w-3 h-3 opacity-20" />)}
                        </div>
                      </th>
                    ))}
                    <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                  {records.map((row, i) => (
                    <tr key={row.id ?? i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      {(visibleCols as ExtColumnMeta[]).map(col => (
                        <td key={col.name} className={cn('px-5 py-3 whitespace-nowrap', col.virtual ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-700 dark:text-neutral-300')}>
                          <CellValue col={col.name} value={row[col.name]} isVirtual={col.virtual} />
                        </td>
                      ))}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setFormModal({ mode: 'edit', record: row })} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteModal({ id: row.id })} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!error && records.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-neutral-400">
              Page {page} of {totalPages} &bull; {totalCount.toLocaleString()} total record{totalCount !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </p>
            <Pagination page={page} totalPages={totalPages} onPage={p => setPage(p)} />
          </div>
        )}
      </div>

      {/* Modals */}
      {formModal && columns.length > 0 && (
        <FormModal
          title={formModal.mode === 'edit' ? `Edit Record — ${tableLabel(activeTable)}` : `New Record — ${tableLabel(activeTable)}`}
          columns={columns}
          initialData={formModal.mode === 'edit' ? formModal.record : undefined}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteModal && (
        <DeleteModal
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn('fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-2', toast.ok ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300')}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}