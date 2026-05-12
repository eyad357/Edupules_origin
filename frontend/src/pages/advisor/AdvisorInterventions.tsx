 // src/pages/advisor/AdvisorInterventions.tsx
import { useState } from 'react';
import { Plus, Edit, Trash2, X, User, Tag, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Intervention {
  id: string;
  student: string;
  type: string;
  status: 'active' | 'pending' | 'completed';
  date: string;
  priority: 'high' | 'medium' | 'low';
  note: string;
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL: Intervention[] = [
  { id: 'i1', student: 'Fatima Al-Zahra', type: 'Academic Counseling', status: 'active',    date: '2025-09-15', priority: 'high',   note: 'Weekly check-ins scheduled' },
  { id: 'i2', student: 'Layla Ibrahim',   type: 'Emergency Support',   status: 'active',    date: '2025-09-20', priority: 'high',   note: 'Family counselor involved' },
  { id: 'i3', student: 'Omar Mahmoud',    type: 'Study Plan',          status: 'completed', date: '2025-08-30', priority: 'medium', note: 'Improved 0.4 GPA points' },
  { id: 'i4', student: 'Fatima Al-Zahra', type: 'Tutoring Referral',   status: 'pending',   date: '2025-10-01', priority: 'medium', note: 'Waiting for tutor assignment' },
];

const STUDENTS   = ['Ahmed Hassan', 'Fatima Al-Zahra', 'Omar Mahmoud', 'Layla Ibrahim', 'Kareem Fathy', 'Nadia Sami'];
const TYPES      = ['Academic Counseling', 'Emergency Support', 'Study Plan', 'Tutoring Referral', 'Mental Health Support', 'Financial Aid Referral', 'Career Guidance'];
const PRIORITIES = ['high', 'medium', 'low'] as const;
const STATUSES   = ['active', 'pending', 'completed'] as const;
type StatusFilter = 'all' | 'active' | 'pending' | 'completed';

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  student:  '',
  type:     '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  status:   'active'  as 'active' | 'pending' | 'completed',
  date:     new Date().toISOString().split('T')[0],
  note:     '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdvisorInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>(INITIAL);
  const [filter, setFilter]               = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen]         = useState(false);
  const [editTarget, setEditTarget]       = useState<Intervention | null>(null);
  const [form, setForm]                   = useState({ ...EMPTY_FORM });
  const [errors, setErrors]               = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg]       = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? interventions
    : interventions.filter(i => i.status === filter);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const priorityVariant: Record<string, string> = { high: 'critical', medium: 'warning', low: 'info' };
  const statusVariant:   Record<string, string> = { active: 'active',  completed: 'completed', pending: 'pending' };

  const priorityBorder: Record<string, string> = {
    high:   'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-amber-500',
    low:    'border-l-4 border-l-blue-400',
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.student.trim())  e.student  = 'Please select a student';
    if (!form.type.trim())     e.type     = 'Please select an intervention type';
    if (!form.date)            e.date     = 'Please pick a date';
    if (!form.note.trim())     e.note     = 'Please add a note';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openNew() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(item: Intervention) {
    setEditTarget(item);
    setForm({
      student:  item.student,
      type:     item.type,
      priority: item.priority,
      status:   item.status,
      date:     item.date,
      note:     item.note,
    });
    setErrors({});
    setModalOpen(true);
  }

  function handleSave() {
    if (!validate()) return;

    if (editTarget) {
      // Edit existing
      setInterventions(prev =>
        prev.map(i => i.id === editTarget.id ? { ...i, ...form } : i)
      );
      flash('Intervention updated successfully');
    } else {
      // Create new
      const newItem: Intervention = {
        id:       `i${Date.now()}`,
        ...form,
      };
      setInterventions(prev => [newItem, ...prev]);
      flash('New intervention created successfully');
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setInterventions(prev => prev.filter(i => i.id !== id));
    setDeleteConfirm(null);
    flash('Intervention deleted');
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Interventions</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {interventions.filter(i => i.status === 'active').length} active ·&nbsp;
            {interventions.filter(i => i.status === 'pending').length} pending ·&nbsp;
            {interventions.filter(i => i.status === 'completed').length} completed
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" /> New Intervention
        </Button>
      </div>

      {/* ── Toast ── */}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm font-medium animate-pulse">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* ── Status filter tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'pending', 'completed'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-red-300'
            }`}
          >
            {s}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              filter === s ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
            }`}>
              {s === 'all' ? interventions.length : interventions.filter(i => i.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Intervention cards ── */}
      <div className="space-y-3">
        {filtered.map(i => (
          <div
            key={i.id}
            className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 ${priorityBorder[i.priority]} transition-shadow hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">

                {/* Student + badges row */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-red-700 dark:text-red-400">{i.student.charAt(0)}</span>
                  </div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{i.student}</p>
                  <Badge variant={priorityVariant[i.priority]}>{i.priority} priority</Badge>
                  <Badge variant={statusVariant[i.status]}>{i.status}</Badge>
                </div>

                {/* Type + date */}
                <div className="flex items-center gap-3 text-sm text-neutral-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> {i.type}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">·</span>
                  <span>{i.date}</span>
                </div>

                {/* Note */}
                <p className="text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2">
                  {i.note}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(i)}
                  className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors group"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(i.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">No {filter !== 'all' ? filter : ''} interventions found</p>
              <p className="text-neutral-400 text-sm mt-1">Click "New Intervention" to create one</p>
            </div>
          </Card>
        )}
      </div>

      {/* ══ New / Edit Modal ══════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    {editTarget ? 'Edit Intervention' : 'New Intervention'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {editTarget ? `Editing plan for ${editTarget.student}` : 'Create a new support plan'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Student */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <User className="w-3.5 h-3.5 inline mr-1" /> Student *
                </label>
                <select
                  value={form.student}
                  onChange={e => setForm(f => ({ ...f, student: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors ${
                    errors.student ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <option value="">Select student…</option>
                  {STUDENTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.student && <p className="text-xs text-red-500 mt-1">{errors.student}</p>}
              </div>

              {/* Intervention Type */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <Tag className="w-3.5 h-3.5 inline mr-1" /> Intervention Type *
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors ${
                    errors.type ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <option value="">Select type…</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
              </div>

              {/* Priority + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Priority
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, priority: p }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          form.priority === p
                            ? p === 'high'   ? 'bg-red-600    text-white border-red-600'
                            : p === 'medium' ? 'bg-amber-500  text-white border-amber-500'
                            :                  'bg-blue-500   text-white border-blue-500'
                            : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  >
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-colors ${
                    errors.date ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <FileText className="w-3.5 h-3.5 inline mr-1" /> Notes *
                </label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  rows={3}
                  placeholder="Describe the action plan, observations, or next steps…"
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none transition-colors placeholder:text-neutral-400 ${
                    errors.note ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                />
                {errors.note && <p className="text-xs text-red-500 mt-1">{errors.note}</p>}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {editTarget ? 'Save Changes' : 'Create Intervention'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Confirm Dialog ═════════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">Delete Intervention?</p>
                <p className="text-sm text-neutral-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}