// src/pages/professor/MyCourses.tsx
// MODIFIED: Added New Course modal, Course Detail navigation, and working Create Quiz button.
// All original functionality preserved.

import { useState } from 'react';
import { BookOpen, Users, Clock, Award, Search, Plus, ChevronRight, BarChart3 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NewCourseModal, type NewCourseData } from '../../components/professor/NewCourseModal';
import { QuizBuilderModal } from '../../components/professor/QuizBuilderModal';
import { CourseDetail } from './CourseDetail';
import { profCourses, type ProfCourse } from '../../lib/professorMockData';

// ─── Static data (same as original) ──────────────────────────────────────────

const courseStats = [
  { course: 'CS301', enrolled: 32, avgGrade: 78, passRate: 91 },
  { course: 'MATH201', enrolled: 28, avgGrade: 72, passRate: 85 },
  { course: 'PHYS401', enrolled: 18, avgGrade: 81, passRate: 94 },
  { course: 'CHEM101', enrolled: 45, avgGrade: 68, passRate: 80 },
  { course: 'BIO301', enrolled: 22, avgGrade: 75, passRate: 88 },
];

const gradeDistribution = [
  { grade: 'A (90-100)', count: 12 },
  { grade: 'B (80-89)', count: 18 },
  { grade: 'C (70-79)', count: 22 },
  { grade: 'D (60-69)', count: 8 },
  { grade: 'F (<60)', count: 5 },
];

export function MyCourses() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<ProfCourse[]>(profCourses);
  const [openCourse, setOpenCourse] = useState<ProfCourse | null>(null);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleNewCourse = (data: NewCourseData) => {
    const newCourse: ProfCourse = {
      ...data,
      id: `c-${Date.now()}`,
      year: 2025,
      enrolled: 0,
    };
    setCourses(prev => [...prev, newCourse]);
    showToast(`Course "${data.name}" created successfully`);
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  // If a course is open, show detail view
  if (openCourse) {
    return <CourseDetail course={openCourse} onBack={() => setOpenCourse(null)} />;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all">
          ✓ {toast}
        </div>
      )}

      {/* Modals */}
      {showNewCourse && (
        <NewCourseModal
          onClose={() => setShowNewCourse(false)}
          onSave={handleNewCourse}
        />
      )}
      {showQuizBuilder && (
        <QuizBuilderModal
          onClose={() => setShowQuizBuilder(false)}
          onSave={(draft) => {
            showToast(`Quiz "${draft.title}" ${draft.status === 'published' ? 'published' : 'saved as draft'}`);
            setShowQuizBuilder(false);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Courses</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Fall 2025 — {courses.length} active courses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuizBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Award className="w-4 h-4" /> Create Quiz
          </button>
          <button
            onClick={() => setShowNewCourse(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Course
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        />
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const stats = courseStats.find(s => s.course === course.code);
          return (
            <div
              key={course.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 group"
              onClick={() => setOpenCourse(course)}
            >
              {/* Color strip with icon */}
              <div className={cn('h-12 flex items-center px-4 gap-3', course.color)}>
                <span className="text-xl">{course.coverIcon}</span>
                <span className="text-white font-bold text-sm opacity-90">{course.code}</span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">{course.name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{course.description}</p>
                  </div>
                  <Badge variant="info">{course.credits} cr</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-neutral-400 mb-0.5">
                      <Users className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats?.enrolled ?? course.enrolled}</p>
                    <p className="text-xs text-neutral-500">Students</p>
                  </div>
                  <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-neutral-400 mb-0.5">
                      <BarChart3 className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats?.avgGrade ?? '—'}%</p>
                    <p className="text-xs text-neutral-500">Avg Grade</p>
                  </div>
                  <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-neutral-400 mb-0.5">
                      <Award className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-bold text-emerald-600">{stats?.passRate ?? '—'}%</p>
                    <p className="text-xs text-neutral-500">Pass Rate</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.semester} {course.year}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.credits} credits</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state / Add new */}
        <button
          onClick={() => setShowNewCourse(true)}
          className="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all min-h-[200px] group"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/20 transition-colors">
            <Plus className="w-5 h-5 text-neutral-400 group-hover:text-red-600 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Add New Course</p>
            <p className="text-xs text-neutral-400 mt-0.5">Create and configure a new course</p>
          </div>
        </button>
      </div>

      {/* Grade Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Grade Distribution</h3>
            <p className="text-xs text-neutral-500 mt-0.5">All courses combined</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="grade" type="category" width={90} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Course Performance</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Average grade by course</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgGrade" fill="#ef4444" radius={[4, 4, 0, 0]} name="Avg Grade" />
                <Bar dataKey="passRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: courses.reduce((s, c) => s + (courseStats.find(x => x.course === c.code)?.enrolled ?? c.enrolled), 0), color: 'text-blue-600' },
          { label: 'Active Courses', value: courses.length, color: 'text-red-600' },
          { label: 'Avg Pass Rate', value: `${Math.round(courseStats.reduce((s, c) => s + c.passRate, 0) / courseStats.length)}%`, color: 'text-emerald-600' },
          { label: 'Avg Grade', value: `${Math.round(courseStats.reduce((s, c) => s + c.avgGrade, 0) / courseStats.length)}%`, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-center">
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
