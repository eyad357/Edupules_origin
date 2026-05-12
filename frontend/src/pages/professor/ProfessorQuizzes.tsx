import { useState } from 'react';
import { Plus, Clock, Users, CheckCircle, XCircle, Eye, Edit, ClipboardList } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockQuizzes, mockQuizSubmissions, mockCourses, mockStudents } from '../../lib/mockData';
import { cn } from '../../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatDateTime } from '../../lib/utils';

const statusVariant = (status: string) => {
  if (status === 'published') return 'info';
  if (status === 'closed') return 'normal';
  return 'warning';
};

export function ProfessorQuizzes() {
  const [activeTab, setActiveTab] = useState<'overview' | 'results'>('overview');

  const quizzesWithCourse = mockQuizzes.map(q => ({
    ...q,
    course: mockCourses.find(c => c.id === q.course_id),
    submissions: mockQuizSubmissions.filter(s => s.quiz_id === q.id),
  }));

  const scoreData = quizzesWithCourse.map(q => ({
    name: q.title.length > 18 ? q.title.slice(0, 18) + '…' : q.title,
    avgScore: q.submissions.length
      ? Math.round(q.submissions.reduce((acc, s) => acc + s.score, 0) / q.submissions.length)
      : 0,
    submissions: q.submissions.length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quizzes</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">{mockQuizzes.length} quizzes across your courses</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" /> Create Quiz
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
        {(['overview', 'results'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
              activeTab === tab
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Quiz Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {quizzesWithCourse.map(quiz => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <Badge variant={statusVariant(quiz.status) as 'info' | 'normal' | 'warning'}>
                    {quiz.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm leading-snug">{quiz.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">{quiz.course?.code} — {quiz.course?.name}</p>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">{quiz.duration_minutes}m</p>
                  </div>
                  <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-neutral-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">{quiz.submissions.length}</p>
                  </div>
                  <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 text-neutral-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">{quiz.attempts_limit}x</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500">
                    Starts: {new Date(quiz.start_time).toLocaleDateString()} · 
                    Ends: {new Date(quiz.end_time).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}

            {/* Add Quiz CTA */}
            <button className="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/5 transition-all group min-h-[200px]">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/20 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-neutral-400 group-hover:text-red-600 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-500 group-hover:text-red-600 transition-colors">Create New Quiz</p>
                <p className="text-xs text-neutral-400 mt-0.5">Add questions and configure settings</p>
              </div>
            </button>
          </div>

          {/* Score chart */}
          <Card title="Quiz Performance" subtitle="Average scores across all quizzes">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="name" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                  <Bar dataKey="avgScore" fill="#DC2626" radius={[4, 4, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      ) : (
        /* Results tab */
        <Card title="Submission Results" subtitle="All student quiz submissions">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {['Student', 'Quiz', 'Score', 'Submitted', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {mockQuizSubmissions.map(sub => {
                  const student = mockStudents.find(s => s.id === sub.student_id);
                  const quiz = mockQuizzes.find(q => q.id === sub.quiz_id);
                  const pct = Math.round((sub.score / sub.max_score) * 100);
                  return (
                    <tr key={sub.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">{student?.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm text-neutral-900 dark:text-white">{student?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-[160px] truncate">{quiz?.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-semibold", pct >= 70 ? "text-emerald-600" : "text-red-600")}>
                            {sub.score}/{sub.max_score}
                          </span>
                          <span className="text-xs text-neutral-400">({pct}%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{formatDateTime(sub.submitted_at)}</td>
                      <td className="px-4 py-3">
                        {pct >= 70
                          ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Pass</span>
                          : <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><XCircle className="w-3.5 h-3.5" /> Fail</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
