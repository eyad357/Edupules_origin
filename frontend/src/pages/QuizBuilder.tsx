import { useState } from 'react';
import { 
  Plus, Trash2, GripVertical, Clock, Calendar, Shuffle,
  Settings, Save, Eye, CheckCircle2, XCircle, FileText
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockQuizzes, mockQuizSubmissions } from '../lib/mockData';
import { cn } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  text: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export function QuizBuilder() {
  const [activeTab, setActiveTab] = useState<'builder' | 'analytics'>('builder');
  const [quizTitle, setQuizTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [attempts, setAttempts] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type,
      text: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : type === 'true_false' ? ['True', 'False'] : undefined,
      correctAnswer: '',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateOption = (qId: string, index: number, value: string) => {
    const q = questions.find(q => q.id === qId);
    if (q && q.options) {
      const newOptions = [...q.options];
      newOptions[index] = value;
      updateQuestion(qId, { options: newOptions });
    }
  };

  // Analytics data
  const scoreDistribution = [
    { range: '90-100', count: 2, color: '#10B981' },
    { range: '80-89', count: 1, color: '#3B82F6' },
    { range: '70-79', count: 0, color: '#F59E0B' },
    { range: '60-69', count: 0, color: '#F97316' },
    { range: '0-59', count: 1, color: '#DC2626' },
  ];

  const questionStats = [
    { question: 'Q1', correct: 75, incorrect: 25 },
    { question: 'Q2', correct: 50, incorrect: 50 },
    { question: 'Q3', correct: 100, incorrect: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quiz Builder</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Create and manage assessments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('builder')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'builder' 
                ? "bg-red-600 text-white" 
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
            )}
          >
            Builder
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'analytics' 
                ? "bg-red-600 text-white" 
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
            )}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'builder' ? (
        <div className="space-y-6">
          {/* Quiz Settings */}
          <Card title="Quiz Settings" subtitle="Configure your assessment">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Quiz Title</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Attempts Limit</label>
                <input
                  type="number"
                  value={attempts}
                  onChange={(e) => setAttempts(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">Course</label>
                <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                  <option>Advanced Algorithms</option>
                  <option>Linear Algebra</option>
                  <option>Quantum Mechanics</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Shuffle className="w-3.5 h-3.5" />
                  Shuffle Questions
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomizeOptions}
                  onChange={(e) => setRandomizeOptions(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" />
                  Randomize Options
                </span>
              </label>
            </div>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Questions ({questions.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addQuestion('multiple_choice')}
                  className="btn-secondary text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Multiple Choice
                </button>
                <button
                  onClick={() => addQuestion('true_false')}
                  className="btn-secondary text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  True/False
                </button>
                <button
                  onClick={() => addQuestion('short_answer')}
                  className="btn-secondary text-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Short Answer
                </button>
              </div>
            </div>

            {questions.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
                <p className="text-sm text-neutral-500 mt-2">No questions yet. Add your first question above.</p>
              </div>
            )}

            {questions.map((question, index) => (
              <div key={question.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-1">
                    <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab" />
                    <span className="text-sm font-medium text-neutral-400">{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" className="text-xs">
                        {question.type === 'multiple_choice' ? 'MCQ' : question.type === 'true_false' ? 'T/F' : 'Short'}
                      </Badge>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(question.id, { points: Number(e.target.value) })}
                        className="w-16 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-xs"
                        min={1}
                      />
                      <span className="text-xs text-neutral-500">points</span>
                    </div>

                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Enter your question..."
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                      rows={2}
                    />

                    {question.type === 'multiple_choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === String.fromCharCode(65 + optIndex)}
                              onChange={() => updateQuestion(question.id, { correctAnswer: String.fromCharCode(65 + optIndex) })}
                              className="w-4 h-4 text-red-600"
                            />
                            <span className="text-sm text-neutral-500 w-4">{String.fromCharCode(65 + optIndex)}.</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              className="flex-1 px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'true_false' && (
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === 'True'}
                            onChange={() => updateQuestion(question.id, { correctAnswer: 'True' })}
                            className="w-4 h-4 text-red-600"
                          />
                          <span className="text-sm">True</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === 'False'}
                            onChange={() => updateQuestion(question.id, { correctAnswer: 'False' })}
                            className="w-4 h-4 text-red-600"
                          />
                          <span className="text-sm">False</span>
                        </label>
                      </div>
                    )}

                    {question.type === 'short_answer' && (
                      <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        <p className="text-xs text-neutral-500 mb-1">Model Answer (for grading reference)</p>
                        <textarea
                          value={question.correctAnswer || ''}
                          onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                          placeholder="Enter model answer..."
                          className="w-full px-3 py-2 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {questions.length > 0 && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Quiz
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Analytics Tab */
        <div className="space-y-6">
          {/* Quiz Selector */}
          <Card title="Quiz Analytics" subtitle="Performance overview">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-center">
                <p className="text-2xl font-bold text-red-600">4</p>
                <p className="text-xs text-neutral-500">Submissions</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-center">
                <p className="text-2xl font-bold text-blue-600">75%</p>
                <p className="text-xs text-neutral-500">Average Score</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-center">
                <p className="text-2xl font-bold text-emerald-600">62.5%</p>
                <p className="text-xs text-neutral-500">Pass Rate</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-center">
                <p className="text-2xl font-bold text-orange-600">0.72</p>
                <p className="text-xs text-neutral-500">Difficulty Index</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card title="Score Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="range" stroke="#737373" fontSize={12} />
                    <YAxis stroke="#737373" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Question Performance */}
            <Card title="Question Performance">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="question" stroke="#737373" fontSize={12} />
                    <YAxis stroke="#737373" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                    <Bar dataKey="correct" fill="#10B981" radius={[4, 4, 0, 0]} name="Correct %" />
                    <Bar dataKey="incorrect" fill="#DC2626" radius={[4, 4, 0, 0]} name="Incorrect %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Submissions Table */}
          <Card title="Student Submissions" subtitle="Individual results">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Student</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Score</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Percentage</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Attempt</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockQuizSubmissions.map((sub, i) => {
                    const percentage = (sub.score / sub.max_score) * 100;
                    return (
                      <tr key={sub.id} className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-4 text-sm text-neutral-900 dark:text-white">Student {i + 1}</td>
                        <td className="py-3 px-4 text-sm font-medium">{sub.score}/{sub.max_score}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={percentage} size="sm" className="w-20" color={percentage >= 70 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'} />
                            <span className="text-xs text-neutral-500">{percentage.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-500">{sub.attempt_number}</td>
                        <td className="py-3 px-4">
                          <Badge variant={percentage >= 70 ? 'normal' : percentage >= 50 ? 'warning' : 'critical'}>
                            {percentage >= 70 ? 'Passed' : 'Needs Review'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
