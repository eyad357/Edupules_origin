// src/components/professor/QuizBuilderModal.tsx
import { useState } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Save, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { QuizQuestion } from '../../lib/professorMockData';

interface Props {
  courseId?: string;
  onClose: () => void;
  onSave: (quiz: QuizDraft) => void;
}

export interface QuizDraft {
  title: string;
  description: string;
  duration: number;
  attempts: number;
  deadline: string;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  passingScore: number;
  questions: QuizQuestion[];
  status: 'draft' | 'published';
}

type QuestionType = QuizQuestion['type'];

const questionTypeLabels: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  short_answer: 'Short Answer / Essay',
  matching: 'Matching',
  code: 'Code',
};

const questionTypeIcons: Record<QuestionType, string> = {
  multiple_choice: '⊙',
  true_false: '◐',
  short_answer: '✏️',
  matching: '↔️',
  code: '</>', 
};

function QuestionEditor({ q, index, onChange, onRemove }: { q: QuizQuestion; index: number; onChange: (q: QuizQuestion) => void; onRemove: () => void }) {
  const [collapsed, setCollapsed] = useState(false);

  const addOption = () => onChange({ ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] });
  const removeOption = (i: number) => onChange({ ...q, options: q.options?.filter((_, idx) => idx !== i) });
  const updateOption = (i: number, val: string) => onChange({ ...q, options: q.options?.map((o, idx) => idx === i ? val : o) });

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800">
        <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab" />
        <span className="text-xs font-bold text-neutral-500 w-5">{index + 1}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium">
          {questionTypeLabels[q.type]}
        </span>
        <span className="text-xs text-neutral-400 flex-1 truncate">{q.text || 'Untitled question'}</span>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <input
              type="number" min={1} max={100}
              value={q.points}
              onChange={e => onChange({ ...q, points: parseInt(e.target.value) || 1 })}
              className="w-12 text-center text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <span className="text-xs text-neutral-400">pts</span>
          </div>
          <button onClick={() => setCollapsed(c => !c)} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400">
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onRemove} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-1">Question Text</label>
            <textarea
              rows={2}
              value={q.text}
              onChange={e => onChange({ ...q, text: e.target.value })}
              placeholder="Enter your question..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
            />
          </div>

          {q.type === 'multiple_choice' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-500">Options (check correct answer)</label>
              {(q.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt) : q.correctAnswer === opt}
                    onChange={e => {
                      const current = Array.isArray(q.correctAnswer) ? q.correctAnswer : (q.correctAnswer ? [q.correctAnswer] : []);
                      onChange({ ...q, correctAnswer: e.target.checked ? [...current, opt] : current.filter(a => a !== opt) });
                    }}
                    className="accent-red-600"
                  />
                  <input
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button onClick={() => removeOption(i)} className="text-neutral-300 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={addOption} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium">
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>
          )}

          {q.type === 'true_false' && (
            <div className="flex gap-3">
              {['true', 'false'].map(val => (
                <button
                  key={val}
                  onClick={() => onChange({ ...q, correctAnswer: val })}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize', q.correctAnswer === val ? 'bg-red-600 text-white border-red-600' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-red-300')}
                >
                  {val}
                </button>
              ))}
            </div>
          )}

          {(q.type === 'short_answer' || q.type === 'essay') && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600">
              <p className="text-xs text-neutral-400 italic">Students will type their answer in a text area. Manual grading required.</p>
            </div>
          )}

          {q.type === 'code' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-500">Expected Solution (for reference)</label>
              <textarea
                rows={4}
                value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''}
                onChange={e => onChange({ ...q, correctAnswer: e.target.value })}
                placeholder="// Write expected solution here..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-900 text-green-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
            </div>
          )}

          {q.type === 'matching' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-500">Matching Pairs</label>
              {(q.matchPairs || [{ left: '', right: '' }]).map((pair, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={pair.left} onChange={e => { const p = [...(q.matchPairs || [])]; p[i] = { ...p[i], left: e.target.value }; onChange({ ...q, matchPairs: p }); }} placeholder="Left" className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                  <span className="text-neutral-400 text-xs">↔</span>
                  <input value={pair.right} onChange={e => { const p = [...(q.matchPairs || [])]; p[i] = { ...p[i], right: e.target.value }; onChange({ ...q, matchPairs: p }); }} placeholder="Right" className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                  <button onClick={() => onChange({ ...q, matchPairs: q.matchPairs?.filter((_, idx) => idx !== i) })} className="text-neutral-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => onChange({ ...q, matchPairs: [...(q.matchPairs || []), { left: '', right: '' }] })} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"><Plus className="w-3.5 h-3.5" /> Add Pair</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuizBuilderModal({ onClose, onSave }: Props) {
  const [draft, setDraft] = useState<QuizDraft>({
    title: '', description: '', duration: 45, attempts: 2, deadline: '', shuffleQuestions: false,
    showAnswers: true, passingScore: 60, questions: [], status: 'draft',
  });

  const addQuestion = (type: QuestionType) => {
    const q: QuizQuestion = {
      id: `q-${Date.now()}`, type, text: '', points: 10,
      options: type === 'multiple_choice' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: type === 'true_false' ? 'true' : undefined,
      matchPairs: type === 'matching' ? [{ left: '', right: '' }] : undefined,
    };
    setDraft(prev => ({ ...prev, questions: [...prev.questions, q] }));
  };

  const updateQuestion = (index: number, q: QuizQuestion) => {
    setDraft(prev => ({ ...prev, questions: prev.questions.map((x, i) => i === index ? q : x) }));
  };

  const removeQuestion = (index: number) => {
    setDraft(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  };

  const totalPoints = draft.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 w-full max-w-3xl my-6 mx-4 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Quiz Builder</h2>
            <p className="text-xs text-neutral-500">{draft.questions.length} questions · {totalPoints} total points</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onSave({ ...draft, status: 'draft' })} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <button onClick={() => onSave({ ...draft, status: 'published' })} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
              <Send className="w-3.5 h-3.5" /> Publish
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quiz Settings */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Quiz Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Title *</label>
                <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} placeholder="Quiz title..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Duration (minutes)</label>
                <input type="number" value={draft.duration} onChange={e => setDraft(p => ({ ...p, duration: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Attempts Allowed</label>
                <input type="number" min={1} max={10} value={draft.attempts} onChange={e => setDraft(p => ({ ...p, attempts: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Deadline</label>
                <input type="datetime-local" value={draft.deadline} onChange={e => setDraft(p => ({ ...p, deadline: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">Passing Score (%)</label>
                <input type="number" min={0} max={100} value={draft.passingScore} onChange={e => setDraft(p => ({ ...p, passingScore: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { key: 'shuffleQuestions' as const, label: 'Shuffle Questions' },
                { key: 'showAnswers' as const, label: 'Show Correct Answers After Submission' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <button
                    onClick={() => setDraft(p => ({ ...p, [key]: !p[key] }))}
                    className={cn('relative w-9 h-5 rounded-full transition-colors', draft[key] ? 'bg-red-600' : 'bg-neutral-200 dark:bg-neutral-700')}
                  >
                    <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', draft[key] ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Questions</h3>
            </div>
            <div className="space-y-3">
              {draft.questions.map((q, i) => (
                <QuestionEditor key={q.id} q={q} index={i} onChange={nq => updateQuestion(i, nq)} onRemove={() => removeQuestion(i)} />
              ))}
            </div>

            {/* Add Question */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(questionTypeLabels) as [QuestionType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => addQuestion(type)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-all text-sm font-medium"
                >
                  <span>{questionTypeIcons[type]}</span>
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
