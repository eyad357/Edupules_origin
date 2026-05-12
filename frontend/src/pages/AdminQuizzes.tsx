// src/pages/AdminQuizzes.tsx
// MODIFIED: Wired the "Create Quiz" button to the QuizBuilderModal.
// All original quiz listing and filtering functionality preserved.

import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { QuizBuilderModal } from '../components/professor/QuizBuilderModal';
import type { QuizDraft } from '../components/professor/QuizBuilderModal';

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface MockQuiz {
  id: string;
  title: string;
  course: string;
  status: string;
  students: number;
  avgScore: number;
  duration: number;
  attempts: number;
  startDate: string;
  endDate: string;
  submissions: number;
}

const initialQuizzes: MockQuiz[] = [
  {
    id: 'q1',
    title: 'Advanced Algorithms Quiz #3',
    course: 'CS301',
    status: 'Published',
    students: 120,
    avgScore: 78.5,
    duration: 60,
    attempts: 2,
    startDate: '2025-04-25',
    endDate: '2025-04-30',
    submissions: 118,
  },
  {
    id: 'q2',
    title: 'Linear Algebra Midterm',
    course: 'MATH201',
    status: 'Published',
    students: 95,
    avgScore: 72.3,
    duration: 90,
    attempts: 1,
    startDate: '2025-05-05',
    endDate: '2025-05-05',
    submissions: 92,
  },
  {
    id: 'q3',
    title: 'Chemistry Lab Assessment',
    course: 'CHEM101',
    status: 'Draft',
    students: 110,
    avgScore: 0,
    duration: 45,
    attempts: 3,
    startDate: '2025-05-10',
    endDate: '2025-05-12',
    submissions: 0,
  },
  {
    id: 'q4',
    title: 'Physics Concepts Quiz',
    course: 'PHYS401',
    status: 'Published',
    students: 65,
    avgScore: 81.2,
    duration: 75,
    attempts: 2,
    startDate: '2025-04-20',
    endDate: '2025-04-27',
    submissions: 64,
  },
  {
    id: 'q5',
    title: 'Biology Fundamentals',
    course: 'BIO301',
    status: 'Archived',
    students: 88,
    avgScore: 79.8,
    duration: 60,
    attempts: 1,
    startDate: '2025-03-15',
    endDate: '2025-03-20',
    submissions: 88,
  },
];

// ─── Badge ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Published: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    Draft:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    Archived:  'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminQuizzes() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<MockQuiz[]>(initialQuizzes);
  const [showBuilder, setShowBuilder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSaveQuiz = (draft: QuizDraft) => {
    const newQuiz: MockQuiz = {
      id: `q-${Date.now()}`,
      title: draft.title || 'Untitled Quiz',
      course: 'CS301',
      status: draft.status === 'published' ? 'Published' : 'Draft',
      students: 0,
      avgScore: 0,
      duration: draft.duration,
      attempts: draft.attempts,
      startDate: draft.deadline ? draft.deadline.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: draft.deadline ? draft.deadline.split('T')[0] : new Date().toISOString().split('T')[0],
      submissions: 0,
    };
    setQuizzes(prev => [newQuiz, ...prev]);
    showToast(`Quiz "${newQuiz.title}" ${draft.status === 'published' ? 'published' : 'saved as draft'}`);
    setShowBuilder(false);
  };

  const handleDelete = (id: string, title: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
    showToast(`Deleted "${title}"`);
  };

  const filtered = quizzes.filter((q) => {
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    const matchSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.course.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalSubmissions = quizzes.reduce((sum, q) => sum + q.submissions, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          ✓ {toast}
        </div>
      )}

      {/* Quiz Builder Modal */}
      {showBuilder && (
        <QuizBuilderModal
          onClose={() => setShowBuilder(false)}
          onSave={handleSaveQuiz}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Quizzes Management</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Create and manage quizzes and assessments</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{quiz.course}</p>
                </div>
                <StatusBadge status={quiz.status} />
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase mb-1">Students</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{quiz.students}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{quiz.submissions} submitted</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase mb-1">Avg Score</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {quiz.avgScore > 0 ? quiz.avgScore.toFixed(1) : '—'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">out of 100</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{quiz.duration} minutes · {quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{quiz.startDate} → {quiz.endDate}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
              <button
                onClick={() => showToast(`Viewing "${quiz.title}"`)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => showToast(`Editing "${quiz.title}"`)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(quiz.id, quiz.title)}
                className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400">No quizzes match your search.</p>
            <button onClick={() => setShowBuilder(true)} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" /> Create Your First Quiz
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Total Quizzes</p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{quizzes.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Published</p>
          <p className="text-3xl font-bold text-green-600">
            {quizzes.filter((q) => q.status === 'Published').length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Drafts</p>
          <p className="text-3xl font-bold text-yellow-600">
            {quizzes.filter((q) => q.status === 'Draft').length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Total Submissions</p>
          <p className="text-3xl font-bold text-blue-600">{totalSubmissions}</p>
        </div>
      </div>
    </div>
  );
}

