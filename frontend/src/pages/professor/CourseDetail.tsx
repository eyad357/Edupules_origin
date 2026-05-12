// src/pages/professor/CourseDetail.tsx
import { useState } from 'react';
import {
  ArrowLeft, BookOpen, Users, BarChart3, Settings, FileText,
  Plus, Upload, File, Video, Presentation, Trash2, ChevronDown,
  ChevronRight, Bell, Send, AlertTriangle, Download, Edit2,
  CheckCircle, XCircle, Clock, Search, Mail, Megaphone, TrendingUp,
  TrendingDown, Minus as MinusIcon, Award,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { QuizBuilderModal, type QuizDraft } from '../../components/professor/QuizBuilderModal';
import {
  courseModules, assessments, assignments, gradebookEntries, announcements,
  type ProfCourse, type Assessment, type Announcement,
} from '../../lib/professorMockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

type Tab = 'content' | 'students' | 'assessments' | 'gradebook' | 'assignments' | 'announcements' | 'settings';

interface Props {
  course: ProfCourse;
  onBack: () => void;
}

// ─── Mock enrolled students ───────────────────────────────────────────────────
const enrolledStudents = [
  { id: 's1', name: 'Alice Johnson', email: 'alice.j@uni.edu', gpa: 3.8, attendance: 95, risk: 'Normal' },
  { id: 's2', name: 'Bob Smith', email: 'bob.s@uni.edu', gpa: 2.4, attendance: 68, risk: 'High' },
  { id: 's3', name: 'Carol White', email: 'carol.w@uni.edu', gpa: 1.9, attendance: 55, risk: 'Critical' },
  { id: 's4', name: 'David Brown', email: 'david.b@uni.edu', gpa: 3.2, attendance: 88, risk: 'Low' },
  { id: 's5', name: 'Emma Wilson', email: 'emma.w@uni.edu', gpa: 3.9, attendance: 98, risk: 'Normal' },
  { id: 's6', name: 'Frank Davis', email: 'frank.d@uni.edu', gpa: 2.7, attendance: 72, risk: 'Low' },
  { id: 's7', name: 'Grace Martinez', email: 'grace.m@uni.edu', gpa: 3.5, attendance: 91, risk: 'Normal' },
  { id: 's8', name: 'Henry Taylor', email: 'henry.t@uni.edu', gpa: 2.1, attendance: 60, risk: 'High' },
];

const riskColor: Record<string, string> = {
  Normal: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
  Low: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  High: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
  Critical: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
};

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────

function ContentTab({ courseId }: { courseId: string }) {
  const modules = courseModules.filter(m => m.courseId === courseId);
  const [expanded, setExpanded] = useState<string[]>([modules[0]?.id || '']);
  const [toast, setToast] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const fileIcon = (type: string) => {
    if (type === 'pdf') return <File className="w-4 h-4 text-red-500" />;
    if (type === 'ppt') return <Presentation className="w-4 h-4 text-orange-500" />;
    if (type === 'video') return <Video className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">✓ {toast}</div>}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Course Modules</h3>
        <div className="flex gap-2">
          <button onClick={() => showToast('Upload dialog opened')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
          <button onClick={() => showToast('New module created')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Module
          </button>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
          <Upload className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">No modules yet. Add your first module to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {modules.map(mod => (
            <div key={mod.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(mod.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{mod.title}</p>
                    <p className="text-xs text-neutral-500">{mod.files.length} file{mod.files.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {expanded.includes(mod.id) ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
              </button>
              {expanded.includes(mod.id) && (
                <div className="px-4 pb-4 space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  {mod.files.map(file => (
                    <div key={file.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group">
                      {fileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-neutral-400">{file.size} · {file.uploadedAt}</p>
                      </div>
                      <button onClick={() => showToast(`Deleted ${file.name}`)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-500 text-neutral-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => showToast('File uploaded to module')} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-neutral-400 hover:text-red-600 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-red-400 dark:hover:border-red-600 transition-all">
                    <Plus className="w-3 h-3" /> Add file to this module
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentsTab({ courseId: _courseId }: { courseId: string }) {
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filtered = enrolledStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">✓ {toast}</div>}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
        </div>
        <button onClick={() => showToast('Warning sent to all at-risk students')} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
          <AlertTriangle className="w-4 h-4" /> Send Warning to At-Risk
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                {['Student', 'GPA', 'Attendance', 'Risk', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">{s.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-neutral-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm font-bold', s.gpa < 2 ? 'text-red-600' : s.gpa < 2.5 ? 'text-orange-600' : s.gpa < 3 ? 'text-amber-600' : 'text-emerald-600')}>{s.gpa.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', s.attendance < 60 ? 'bg-red-500' : s.attendance < 75 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', riskColor[s.risk])}>{s.risk}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => showToast(`Email sent to ${s.name}`)} title="Send Email" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-400 hover:text-blue-600 transition-colors"><Mail className="w-3.5 h-3.5" /></button>
                      <button onClick={() => showToast(`Warning sent to ${s.name}`)} title="Send Warning" className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 text-neutral-400 hover:text-orange-600 transition-colors"><AlertTriangle className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AssessmentsTab({ courseId }: { courseId: string }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [quizzes, setQuizzes] = useState<Assessment[]>(assessments.filter(a => a.courseId === courseId && a.type !== 'assignment'));
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSaveQuiz = (draft: QuizDraft) => {
    const newA: Assessment = {
      id: `a-${Date.now()}`, courseId, title: draft.title, type: 'quiz',
      status: draft.status, deadline: draft.deadline, duration: draft.duration,
      attempts: draft.attempts, totalPoints: draft.questions.reduce((s, q) => s + q.points, 0),
      submissions: 0, questions: draft.questions,
    };
    setQuizzes(prev => [newA, ...prev]);
    showToast(`Quiz "${draft.title}" ${draft.status === 'published' ? 'published' : 'saved as draft'}`);
  };

  const statusStyle = (s: string) => {
    if (s === 'published') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    if (s === 'draft') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800';
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">✓ {toast}</div>}
      {showBuilder && <QuizBuilderModal courseId={courseId} onClose={() => setShowBuilder(false)} onSave={d => { handleSaveQuiz(d); setShowBuilder(false); }} />}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Quizzes & Exams</h3>
        <button onClick={() => setShowBuilder(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create Quiz
        </button>
      </div>
      <div className="space-y-3">
        {quizzes.map(a => (
          <div key={a.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{a.title}</h4>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusStyle(a.status))}>{a.status}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">{a.type}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                  {a.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.duration} min</span>}
                  {a.attempts && <span>{a.attempts} attempt{a.attempts !== 1 ? 's' : ''}</span>}
                  <span>Deadline: {a.deadline}</span>
                  <span>{a.totalPoints} pts</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{a.submissions}</p>
                <p className="text-xs text-neutral-400">submissions</p>
                {a.avgScore !== undefined && a.avgScore > 0 && <p className="text-xs font-medium text-emerald-600 mt-0.5">Avg: {a.avgScore}%</p>}
              </div>
            </div>

            {a.questions && a.questions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 mb-2">{a.questions.length} questions</p>
                <div className="flex gap-2 flex-wrap">
                  {['multiple_choice', 'true_false', 'short_answer', 'code', 'matching'].map(type => {
                    const count = a.questions!.filter(q => q.type === type).length;
                    return count > 0 ? <span key={type} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{count} {type.replace('_', ' ')}</span> : null;
                  })}
                </div>
              </div>
            )}

            {/* Item Analysis (for published with submissions) */}
            {a.status !== 'draft' && a.submissions > 0 && a.questions && a.questions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Question Analysis</p>
                <div className="space-y-1">
                  {a.questions.slice(0, 3).map((q, i) => {
                    const correctRate = Math.floor(Math.random() * 50) + 40;
                    return (
                      <div key={q.id} className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400 w-4">Q{i+1}</span>
                        <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', correctRate >= 70 ? 'bg-emerald-500' : correctRate >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${correctRate}%` }} />
                        </div>
                        <span className="text-xs text-neutral-500 w-10 text-right">{correctRate}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GradebookTab({ courseId: _courseId }: { courseId: string }) {
  const [search, setSearch] = useState('');
  const [editingCell, setEditingCell] = useState<{ studentId: string; col: string } | null>(null);
  const [entries, setEntries] = useState(gradebookEntries);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const columns = ['Quiz #1', 'Midterm', 'Assignment', 'Final'];
  const filtered = entries.filter(e => e.studentName.toLowerCase().includes(search.toLowerCase()));

  const gradeColor = (g: string) => {
    if (g === 'A') return 'text-emerald-600';
    if (g === 'B') return 'text-blue-600';
    if (g === 'C') return 'text-amber-600';
    if (g === 'D') return 'text-orange-600';
    return 'text-red-600';
  };

  const avg = (col: string) => Math.round(entries.map(e => e.scores[col] ?? 0).reduce((a, b) => a + b, 0) / entries.length);
  const high = (col: string) => Math.max(...entries.map(e => e.scores[col] ?? 0));
  const low = (col: string) => Math.min(...entries.map(e => e.scores[col] ?? 0));

  const distribution = ['A', 'B', 'C', 'D', 'F'].map(g => ({ grade: g, count: entries.filter(e => e.letterGrade === g).length }));

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">✓ {toast}</div>}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {columns.map(col => (
          <div key={col} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3">
            <p className="text-xs text-neutral-500 truncate">{col}</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{avg(col)}%</p>
            <p className="text-xs text-neutral-400">↑{high(col)} ↓{low(col)}</p>
          </div>
        ))}
      </div>

      {/* Distribution */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Grade Distribution</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((d, i) => (
                  <Cell key={i} fill={d.grade === 'A' ? '#10b981' : d.grade === 'B' ? '#3b82f6' : d.grade === 'C' ? '#f59e0b' : d.grade === 'D' ? '#f97316' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => showToast('Exported to Excel')} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
          <button onClick={() => showToast('Exported to PDF')} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider sticky left-0 bg-neutral-50 dark:bg-neutral-800/50">Student</th>
                {columns.map(col => (
                  <th key={col} className="text-center px-3 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                ))}
                <th className="text-center px-3 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.map(entry => (
                <tr key={entry.studentId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white dark:bg-neutral-900">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{entry.studentName}</p>
                      <p className="text-xs text-neutral-400">{entry.email}</p>
                    </div>
                  </td>
                  {columns.map(col => {
                    const isEditing = editingCell?.studentId === entry.studentId && editingCell?.col === col;
                    return (
                      <td key={col} className="px-3 py-3 text-center">
                        {isEditing ? (
                          <input
                            autoFocus
                            type="number" min={0} max={100}
                            defaultValue={entry.scores[col] ?? ''}
                            onBlur={e => {
                              const val = parseInt(e.target.value);
                              setEntries(prev => prev.map(en => en.studentId === entry.studentId ? {
                                ...en, scores: { ...en.scores, [col]: isNaN(val) ? null : val },
                                total: calcTotal({ ...en.scores, [col]: isNaN(val) ? null : val }),
                                letterGrade: calcLetter(calcTotal({ ...en.scores, [col]: isNaN(val) ? null : val })),
                              } : en));
                              setEditingCell(null);
                            }}
                            className="w-16 text-center text-sm border border-red-400 rounded-lg py-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCell({ studentId: entry.studentId, col })}
                            className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 group"
                          >
                            {entry.scores[col] ?? <span className="text-neutral-300">—</span>}
                            <Edit2 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 inline" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center font-bold text-sm text-neutral-900 dark:text-white">{entry.total}%</td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn('text-lg font-black', gradeColor(entry.letterGrade))}>{entry.letterGrade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function calcTotal(scores: Record<string, number | null>): number {
  const vals = Object.values(scores).filter((v): v is number => v !== null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}
function calcLetter(t: number): string {
  if (t >= 90) return 'A'; if (t >= 80) return 'B'; if (t >= 70) return 'C'; if (t >= 60) return 'D'; return 'F';
}

function AssignmentsTab({ courseId }: { courseId: string }) {
  const courseAssignments = assignments.filter(a => a.courseId === courseId);
  const [selectedAsgn, setSelectedAsgn] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const statusIcon = (s: string) => {
    if (s === 'submitted') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (s === 'late') return <Clock className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">✓ {toast}</div>}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Assignments</h3>
        <button onClick={() => showToast('Create assignment dialog opened')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Create Assignment
        </button>
      </div>

      {courseAssignments.map(asgn => {
        const submitted = asgn.submissions.filter(s => s.status === 'submitted').length;
        const late = asgn.submissions.filter(s => s.status === 'late').length;
        const missing = asgn.submissions.filter(s => s.status === 'missing').length;
        const isOpen = selectedAsgn === asgn.id;

        return (
          <div key={asgn.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{asgn.title}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{asgn.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                    <span>Due: {asgn.deadline}</span>
                    <span className="capitalize">{asgn.submissionType}</span>
                    <span>{asgn.totalPoints} pts</span>
                    <span>Max {asgn.maxFileSizeMB}MB</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => showToast('All submissions downloaded as ZIP')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <Download className="w-3 h-3" /> ZIP
                  </button>
                  <button onClick={() => setSelectedAsgn(isOpen ? null : asgn.id)} className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                    {isOpen ? 'Collapse' : 'View Submissions'}
                  </button>
                </div>
              </div>

              {/* Summary counters */}
              <div className="flex gap-3 mt-3">
                {[
                  { label: 'Submitted', count: submitted, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                  { label: 'Late', count: late, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                  { label: 'Missing', count: missing, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                ].map(({ label, count, color }) => (
                  <div key={label} className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold', color)}>
                    {count} {label}
                  </div>
                ))}
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-neutral-100 dark:border-neutral-800">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                        {['Student', 'Status', 'Submitted At', 'File', 'Score', 'Feedback', ''].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {asgn.submissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                          <td className="px-4 py-2.5 text-sm font-medium text-neutral-900 dark:text-white">{sub.studentName}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium capitalize">
                              {statusIcon(sub.status)} {sub.status}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-neutral-400">{sub.submittedAt || '—'}</td>
                          <td className="px-4 py-2.5 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate max-w-[120px]">{sub.fileName || '—'}</td>
                          <td className="px-4 py-2.5">
                            {sub.status !== 'missing' ? (
                              <input type="number" min={0} max={asgn.totalPoints} defaultValue={sub.score ?? ''} placeholder="—" className="w-14 text-center text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg py-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                            ) : <span className="text-xs text-neutral-300">—</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            {sub.status !== 'missing' ? (
                              <input defaultValue={sub.feedback ?? ''} placeholder="Add feedback..." className="w-40 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                            ) : <span className="text-xs text-neutral-300">—</span>}
                          </td>
                          <td className="px-4 py-2.5">
                            {sub.status !== 'missing' && (
                              <button onClick={() => showToast(`Grade saved for ${sub.studentName}`)} className="text-xs text-red-600 hover:text-red-700 font-medium">Save</button>
                            )}
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
      })}
    </div>
  );
}

function AnnouncementsTab({ courseId }: { courseId: string }) {
  const [anns, setAnns] = useState<Announcement[]>(announcements.filter(a => a.courseId === courseId));
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSend = () => {
    if (!newTitle || !newBody) return;
    setAnns(prev => [{ id: `an-${Date.now()}`, courseId, title: newTitle, body: newBody, createdAt: new Date().toISOString().split('T')[0], hasAttachment: false }, ...prev]);
    setNewTitle(''); setNewBody(''); setShowForm(false);
    showToast('Announcement sent to all enrolled students');
  };

  return (
    <div className="space-y-4">
      {toast && <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">✓ {toast}</div>}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Announcements</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
          <Megaphone className="w-3.5 h-3.5" /> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Announcement title..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          <textarea rows={3} value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Write your announcement..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">Cancel</button>
            <button onClick={() => showToast('Saved as draft')} className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Save Draft</button>
            <button onClick={handleSend} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"><Send className="w-3.5 h-3.5" /> Send Now</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {anns.map(ann => (
          <div key={ann.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{ann.title}</h4>
                  <p className="text-xs text-neutral-400">{ann.createdAt}{ann.hasAttachment ? ' · 📎 Attachment' : ''}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">{ann.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ course, onSave }: { course: ProfCourse; onSave: () => void }) {
  const [form, setForm] = useState({ name: course.name, description: course.description, credits: course.credits, semester: course.semester });
  const [breakdown, setBreakdown] = useState({ ...course.gradeBreakdown });
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Course Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-xs font-medium text-neutral-500 block mb-1">Course Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" /></div>
          <div><label className="text-xs font-medium text-neutral-500 block mb-1">Credits</label><input type="number" value={form.credits} onChange={e => setForm(p => ({ ...p, credits: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" /></div>
          <div className="sm:col-span-2"><label className="text-xs font-medium text-neutral-500 block mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" /></div>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Grade Weights</h3>
        {(Object.entries(breakdown) as [keyof typeof breakdown, number][]).map(([key, val]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm capitalize text-neutral-700 dark:text-neutral-300 w-28">{key}</span>
            <input type="number" min={0} max={100} value={val} onChange={e => setBreakdown(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))} className="w-20 px-3 py-1.5 text-sm text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
            <span className="text-sm text-neutral-400">%</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={onSave} className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Save Changes</button>
      </div>
    </div>
  );
}

// ─── Main Course Detail ────────────────────────────────────────────────────────

export function CourseDetail({ course, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'gradebook', label: 'Gradebook', icon: BarChart3 },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-5">
      {toast && <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">✓ {toast}</div>}

      {/* Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-red-600 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" /> My Courses
        </button>
        <div className="flex items-center gap-4 flex-wrap">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shrink-0', course.color)}>
            {course.coverIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{course.name}</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{course.code}</span>
            </div>
            <p className="text-sm text-neutral-500 mt-0.5">{course.semester} {course.year} · {course.credits} credits · {course.enrolled} students</p>
          </div>
          <div className="flex gap-3">
            {[
              { icon: TrendingUp, label: 'Analytics', color: 'text-blue-600' },
              { icon: Send, label: 'Message All', color: 'text-neutral-600' },
            ].map(({ icon: Icon, label, color }) => (
              <button key={label} onClick={() => showToast(`${label} opened`)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors', color, 'dark:text-neutral-300')}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grade breakdown quick view */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(course.gradeBreakdown).map(([key, val]) => (
          <div key={key} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-red-600">{val}%</p>
            <p className="text-xs text-neutral-500 capitalize">{key}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === 'content' && <ContentTab courseId={course.id} />}
        {activeTab === 'students' && <StudentsTab courseId={course.id} />}
        {activeTab === 'assessments' && <AssessmentsTab courseId={course.id} />}
        {activeTab === 'gradebook' && <GradebookTab courseId={course.id} />}
        {activeTab === 'assignments' && <AssignmentsTab courseId={course.id} />}
        {activeTab === 'announcements' && <AnnouncementsTab courseId={course.id} />}
        {activeTab === 'settings' && <SettingsTab course={course} onSave={() => showToast('Course settings saved')} />}
      </div>
    </div>
  );
}