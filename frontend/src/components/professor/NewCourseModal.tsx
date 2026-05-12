// src/components/professor/NewCourseModal.tsx
import { useState } from 'react';
import { X, BookOpen, Plus, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  onClose: () => void;
  onSave: (course: NewCourseData) => void;
}

export interface NewCourseData {
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: string;
  color: string;
  coverIcon: string;
  gradeBreakdown: { midterm: number; assignments: number; quizzes: number; final: number };
}

const colorOptions = [
  { label: 'Red', value: 'bg-red-500', preview: 'bg-red-500' },
  { label: 'Blue', value: 'bg-blue-500', preview: 'bg-blue-500' },
  { label: 'Emerald', value: 'bg-emerald-500', preview: 'bg-emerald-500' },
  { label: 'Orange', value: 'bg-orange-500', preview: 'bg-orange-500' },
  { label: 'Purple', value: 'bg-purple-500', preview: 'bg-purple-500' },
  { label: 'Indigo', value: 'bg-indigo-500', preview: 'bg-indigo-500' },
];

const iconOptions = ['📚', '⚡', '📐', '⚛️', '🧪', '🧬', '💻', '🔬', '🌍', '🎯'];

export function NewCourseModal({ onClose, onSave }: Props) {
  const [form, setForm] = useState<NewCourseData>({
    code: '', name: '', description: '', credits: 3, semester: 'Fall',
    color: 'bg-red-500', coverIcon: '📚',
    gradeBreakdown: { midterm: 25, assignments: 25, quizzes: 25, final: 25 },
  });
  const [step, setStep] = useState<1 | 2>(1);

  const totalWeight = Object.values(form.gradeBreakdown).reduce((a, b) => a + b, 0);

  const update = (key: keyof NewCourseData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const updateBreakdown = (key: keyof typeof form.gradeBreakdown, value: number) =>
    setForm(prev => ({ ...prev, gradeBreakdown: { ...prev.gradeBreakdown, [key]: value } }));

  const handleSave = () => {
    if (!form.code || !form.name) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Create New Course</h2>
              <p className="text-xs text-neutral-500">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex h-1">
          <div className="h-full bg-red-600 transition-all duration-300" style={{ width: step === 1 ? '50%' : '100%' }} />
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-800" />
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-1.5">Course Code *</label>
                  <input
                    value={form.code}
                    onChange={e => update('code', e.target.value.toUpperCase())}
                    placeholder="e.g. CS301"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-1.5">Credits</label>
                  <input
                    type="number" min={1} max={6}
                    value={form.credits}
                    onChange={e => update('credits', parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-1.5">Course Name *</label>
                <input
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Advanced Algorithms"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Brief course description..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-1.5">Semester</label>
                <select
                  value={form.semester}
                  onChange={e => update('semester', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  {['Fall', 'Spring', 'Summer'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Cover Color */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-2">Course Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map(c => (
                    <button
                      key={c.value}
                      onClick={() => update('color', c.value)}
                      className={cn('w-8 h-8 rounded-lg transition-all', c.preview, form.color === c.value ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-110' : 'hover:scale-105')}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide block mb-2">Course Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => update('coverIcon', icon)}
                      className={cn('w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all', form.coverIcon === icon ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-500' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20')}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xl', form.color)}>
                  {form.coverIcon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white">{form.name || 'Course Name'}</p>
                  <p className="text-xs text-neutral-500">{form.code} · {form.credits} credits · {form.semester}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">Grade Breakdown</label>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', totalWeight === 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400')}>
                    {totalWeight}% / 100%
                  </span>
                </div>
                <div className="space-y-3">
                  {(Object.entries(form.gradeBreakdown) as [keyof typeof form.gradeBreakdown, number][]).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize w-28">{key}</span>
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => updateBreakdown(key, Math.max(0, val - 5))}
                          className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 text-neutral-600 dark:text-neutral-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${val}%` }} />
                        </div>
                        <button
                          onClick={() => updateBreakdown(key, Math.min(100, val + 5))}
                          className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 text-neutral-600 dark:text-neutral-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white w-10 text-right">{val}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                {totalWeight !== 100 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">Grade weights must sum to exactly 100%</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          {step === 2 ? (
            <button onClick={() => setStep(1)} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">← Back</button>
          ) : <div />}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Cancel
            </button>
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!form.code || !form.name}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={totalWeight !== 100}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
