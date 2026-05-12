// src/pages/student/StudentQuizzes.tsx
// Enhanced quizzes: history, upcoming, practice mode, proctored quiz simulation

import { useState, useEffect, useRef } from 'react';
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, Eye, Trophy,
  Calendar, ChevronRight, RefreshCcw, Maximize2, Shield
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { cn } from '../../lib/utils';

type QuizView = 'list' | 'taking' | 'review';

const quizHistory = [
  { id: 'q1', course: 'CS301', title: 'Quiz 1 – Big O Notation', score: 18, max: 20, date: 'Sep 10', time: '14 min', status: 'passed' },
  { id: 'q2', course: 'CS310', title: 'Quiz 1 – Process Management', score: 14, max: 20, date: 'Sep 12', time: '18 min', status: 'passed' },
  { id: 'q3', course: 'MATH301', title: 'Quiz 1 – Descriptive Stats', score: 11, max: 20, date: 'Sep 15', time: '22 min', status: 'failed' },
  { id: 'q4', course: 'CS301', title: 'Quiz 2 – Sorting Algorithms', score: 16, max: 20, date: 'Sep 24', time: '17 min', status: 'passed' },
  { id: 'q5', course: 'CS320', title: 'Quiz 1 – Logic Gates', score: 12, max: 20, date: 'Sep 28', time: '19 min', status: 'passed' },
];

const upcomingQuizzes = [
  { course: 'CS301', title: 'Quiz 3 – Dynamic Programming', date: 'Oct 8', time: '09:30', duration: 20, room: 'Online' },
  { course: 'CS310', title: 'Quiz 2 – Memory Management', date: 'Oct 10', time: '11:00', duration: 25, room: 'Lab 3' },
  { course: 'MATH301', title: 'Midterm Quiz', date: 'Oct 15', time: '09:00', duration: 45, room: 'Hall C-302' },
];

const practiceQuestions = [
  {
    id: 1,
    text: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correct: 1,
    explanation: 'Binary search divides the search space in half each iteration, giving O(log n) complexity.'
  },
  {
    id: 2,
    text: 'Which data structure uses LIFO (Last In First Out)?',
    options: ['Queue', 'Linked List', 'Stack', 'Tree'],
    correct: 2,
    explanation: 'A Stack follows the LIFO principle — the last element added is the first one removed.'
  },
  {
    id: 3,
    text: 'What is the worst-case time complexity of Quick Sort?',
    options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
    correct: 2,
    explanation: 'Quick sort has O(n²) worst-case when the pivot is always the smallest or largest element.'
  },
  {
    id: 4,
    text: 'Which sorting algorithm is stable?',
    options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'],
    correct: 2,
    explanation: 'Merge Sort is a stable sorting algorithm — equal elements maintain their relative order.'
  },
  {
    id: 5,
    text: 'The space complexity of Merge Sort is:',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 2,
    explanation: 'Merge Sort requires O(n) extra space to store the divided subarrays during merging.'
  },
];

export function StudentQuizzes() {
  const [view, setView] = useState<QuizView>('list');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer for practice quiz
  useEffect(() => {
    if (practiceMode && !quizDone) {
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setQuizDone(true); return 0; }
        return t - 1;
      }), 1000);
      return () => clearInterval(timerRef.current!);
    }
  }, [practiceMode, quizDone]);

  // Tab-switch detection
  useEffect(() => {
    if (!practiceMode) return;
    const handler = () => { if (document.hidden) setTabWarnings(w => w + 1); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [practiceMode]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const score = Object.entries(answers).filter(([qi, ai]) => practiceQuestions[Number(qi)].correct === ai).length;

  const startPractice = () => {
    setCurrentQ(0);
    setAnswers({});
    setShowAnswer(false);
    setQuizDone(false);
    setTimeLeft(20 * 60);
    setTabWarnings(0);
    setPracticeMode(true);
  };

  const exitPractice = () => {
    setPracticeMode(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (practiceMode) {
    return (
      <div className={cn('space-y-4', isFullscreen && 'fixed inset-0 z-50 bg-white dark:bg-neutral-950 p-6 overflow-y-auto')}>
        {/* Proctoring Header */}
        <div className="flex items-center justify-between p-4 bg-neutral-900 dark:bg-neutral-800 rounded-xl text-white">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-sm">CS301 Practice Quiz — Proctored Mode</span>
            {tabWarnings > 0 && (
              <span className="flex items-center gap-1 text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3" />
                {tabWarnings} tab switch warning{tabWarnings > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className={cn('font-mono text-lg font-bold', timeLeft < 120 ? 'text-red-400' : 'text-emerald-400')}>
              <Clock className="w-4 h-4 inline mr-1" />{formatTime(timeLeft)}
            </div>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded bg-neutral-700 hover:bg-neutral-600">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={exitPractice} className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-sm">Exit</button>
          </div>
        </div>

        {!quizDone ? (
          <>
            {/* Progress */}
            <div className="flex items-center gap-2">
              {practiceQuestions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentQ(i); setShowAnswer(false); }}
                  className={cn(
                    'w-8 h-8 rounded-full text-sm font-semibold transition-colors',
                    i === currentQ ? 'bg-red-600 text-white' :
                    answers[i] !== undefined ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  )}
                >{i + 1}</button>
              ))}
              <div className="flex-1 ml-4">
                <ProgressBar value={Object.keys(answers).length} max={practiceQuestions.length} size="sm" color="bg-red-500" />
              </div>
            </div>

            {/* Question */}
            <Card>
              <div className="mb-6">
                <p className="text-xs text-neutral-500 mb-3">Question {currentQ + 1} of {practiceQuestions.length}</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">{practiceQuestions[currentQ].text}</p>
              </div>

              <div className="space-y-3">
                {practiceQuestions[currentQ].options.map((opt, i) => {
                  const selected = answers[currentQ] === i;
                  const isCorrect = practiceQuestions[currentQ].correct === i;
                  let cls = 'border-neutral-200 dark:border-neutral-700 hover:border-red-300';
                  if (showAnswer) {
                    if (isCorrect) cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
                    else if (selected) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20';
                  } else if (selected) {
                    cls = 'border-red-400 bg-red-50 dark:bg-red-900/20';
                  }
                  return (
                    <button
                      key={i}
                      disabled={showAnswer}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: i }))}
                      className={cn('w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all', cls)}
                    >
                      <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        selected ? 'bg-red-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      )}>{String.fromCharCode(65 + i)}</span>
                      <span className="text-sm text-neutral-800 dark:text-neutral-200">{opt}</span>
                      {showAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto" />}
                      {showAnswer && selected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 ml-auto" />}
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Explanation</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{practiceQuestions[currentQ].explanation}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  {!showAnswer && answers[currentQ] !== undefined && (
                    <Button variant="secondary" onClick={() => setShowAnswer(true)}>Show Answer</Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {currentQ > 0 && <Button variant="secondary" onClick={() => { setCurrentQ(c => c - 1); setShowAnswer(false); }}>Previous</Button>}
                  {currentQ < practiceQuestions.length - 1
                    ? <Button variant="primary" onClick={() => { setCurrentQ(c => c + 1); setShowAnswer(false); }}>Next</Button>
                    : <Button variant="primary" onClick={() => setQuizDone(true)}>Submit Quiz</Button>
                  }
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card title="Quiz Completed! 🎉">
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-red-600">{Math.round((score / practiceQuestions.length) * 100)}%</span>
              </div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mb-1">You scored {score} / {practiceQuestions.length}</p>
              <p className="text-neutral-500 text-sm mb-6">{score >= 4 ? 'Excellent work! You mastered this topic.' : 'Keep practicing — review the explanations carefully.'}</p>
              <div className="flex justify-center gap-3">
                <Button variant="secondary" onClick={() => { setQuizDone(false); setAnswers({}); setCurrentQ(0); setTimeLeft(20 * 60); }}>
                  <RefreshCcw className="w-4 h-4" />Retry
                </Button>
                <Button variant="primary" onClick={exitPractice}>Back to Quizzes</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quizzes & Assessments</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Track your quiz performance and practice upcoming topics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quizzes Taken', value: quizHistory.length, icon: '📝', color: 'text-red-600' },
          { label: 'Average Score', value: `${Math.round(quizHistory.reduce((a, q) => a + (q.score / q.max * 100), 0) / quizHistory.length)}%`, icon: '⭐', color: 'text-amber-600' },
          { label: 'Best Score', value: `${Math.max(...quizHistory.map(q => Math.round(q.score / q.max * 100)))}%`, icon: '🏆', color: 'text-emerald-600' },
          { label: 'Upcoming', value: upcomingQuizzes.length, icon: '📅', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
            <span className="text-2xl">{s.icon}</span>
            <p className={cn('text-2xl font-bold mt-2', s.color)}>{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* History */}
        <Card title="Quiz History" subtitle="Past attempts and scores">
          <div className="space-y-3">
            {quizHistory.map(q => {
              const pct = Math.round((q.score / q.max) * 100);
              return (
                <div key={q.id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold', pct >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{q.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-red-600 font-medium">{q.course}</span>
                      <span className="text-xs text-neutral-400">{q.date} · {q.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{q.score}/{q.max}</p>
                    <button className="text-xs text-red-600 hover:underline flex items-center gap-1 mt-1">
                      <Eye className="w-3 h-3" />Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming */}
        <div className="space-y-4">
          <Card title="Upcoming Quizzes" subtitle="Scheduled assessments">
            <div className="space-y-3">
              {upcomingQuizzes.map((q, i) => (
                <div key={i} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-red-600">{q.course}</span>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{q.title}</p>
                    </div>
                    <Badge variant="normal">{q.duration} min</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{q.date} at {q.time}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{q.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Practice Mode CTA */}
          <div className="p-5 bg-gradient-to-br from-red-600 to-red-700 rounded-xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <h3 className="font-bold">Practice Mode</h3>
            </div>
            <p className="text-sm text-red-100 mb-4">Simulate a real proctored quiz with timer and tab-switch detection. Practice CS301 – Algorithms.</p>
            <button
              onClick={startPractice}
              className="w-full py-2.5 bg-white text-red-700 font-semibold text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />Start Practice Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}