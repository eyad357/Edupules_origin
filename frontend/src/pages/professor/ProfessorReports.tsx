// src/pages/professor/ProfessorReports.tsx
// NEW: PDF report generation, transcripts, completion certificates
import { useState } from 'react';
import {
  FileText, Download, Award, BarChart3, Users, BookOpen,
  CheckCircle, Printer, Calendar, TrendingUp, Star,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const arabStudents = [
  { id: 's1', name: 'Ahmed Hassan', id_num: '20210045', gpa: 3.75, course: 'CS301', grade: 'A', attendance: 92, status: 'Pass' },
  { id: 's2', name: 'Fatima Ali', id_num: '20210067', gpa: 3.40, course: 'CS301', grade: 'B+', attendance: 88, status: 'Pass' },
  { id: 's3', name: 'Mohamed Ibrahim', id_num: '20210089', gpa: 2.90, course: 'CS301', grade: 'B', attendance: 80, status: 'Pass' },
  { id: 's4', name: 'Sara Mahmoud', id_num: '20210112', gpa: 3.90, course: 'CS301', grade: 'A+', attendance: 97, status: 'Pass' },
  { id: 's5', name: 'Omar Khalid', id_num: '20210034', gpa: 1.80, course: 'CS301', grade: 'D', attendance: 62, status: 'Warning' },
  { id: 's6', name: 'Nour Adel', id_num: '20210156', gpa: 3.20, course: 'CS301', grade: 'B', attendance: 85, status: 'Pass' },
  { id: 's7', name: 'Youssef Samir', id_num: '20210178', gpa: 2.50, course: 'CS301', grade: 'C+', attendance: 74, status: 'Pass' },
  { id: 's8', name: 'Layla Mostafa', id_num: '20210201', gpa: 1.20, course: 'CS301', grade: 'F', attendance: 55, status: 'Fail' },
];

const reportTypes = [
  { id: 'performance', label: 'Student Performance Report', icon: BarChart3, description: 'Detailed breakdown of grades, attendance, and risk levels per student', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
  { id: 'analytics', label: 'Course Analytics Report', icon: TrendingUp, description: 'Statistical summary of course outcomes, grade distributions, and trends', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' },
  { id: 'attendance', label: 'Attendance Summary Report', icon: Calendar, description: 'Monthly attendance rates, absence patterns, and flagged students', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' },
  { id: 'transcript', label: 'Official Grade Transcript', icon: FileText, description: 'University-formatted official transcript for individual students', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' },
  { id: 'certificate', label: 'Completion Certificate', icon: Award, description: 'Generate course completion certificates for qualifying students', color: 'text-red-600 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
];

function GradeColor({ grade }: { grade: string }) {
  const color = grade.startsWith('A') ? 'text-emerald-600' : grade.startsWith('B') ? 'text-blue-600' : grade.startsWith('C') ? 'text-amber-600' : grade.startsWith('D') ? 'text-orange-600' : 'text-red-600';
  return <span className={cn('font-bold', color)}>{grade}</span>;
}

function TranscriptPreview({ student }: { student: typeof arabStudents[0] }) {
  return (
    <div className="bg-white border-2 border-neutral-800 rounded-xl overflow-hidden text-neutral-900">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-4 text-center">
        <h2 className="text-lg font-bold tracking-wide">Cairo University — Faculty of Engineering</h2>
        <p className="text-xs text-neutral-400 mt-1">Official Academic Transcript</p>
      </div>
      {/* Student info */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-neutral-200">
        <div>
          <p className="text-xs text-neutral-500">Student Name</p>
          <p className="text-sm font-semibold">{student.name}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Student ID</p>
          <p className="text-sm font-semibold">{student.id_num}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Academic Year</p>
          <p className="text-sm font-semibold">2025 / 2026 — Fall</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Cumulative GPA</p>
          <p className="text-sm font-bold text-red-600">{student.gpa.toFixed(2)} / 4.00</p>
        </div>
      </div>
      {/* Grades table */}
      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-1.5 text-xs font-semibold text-neutral-500">Course</th>
              <th className="text-left py-1.5 text-xs font-semibold text-neutral-500">Credits</th>
              <th className="text-center py-1.5 text-xs font-semibold text-neutral-500">Grade</th>
              <th className="text-right py-1.5 text-xs font-semibold text-neutral-500">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {[
              { code: 'CS301', name: 'Advanced Algorithms', credits: 3, grade: student.grade, att: student.attendance },
              { code: 'MATH201', name: 'Linear Algebra', credits: 3, grade: 'B+', att: 85 },
              { code: 'PHYS401', name: 'Quantum Physics', credits: 4, grade: 'A', att: 90 },
            ].map(c => (
              <tr key={c.code} className="border-b border-neutral-100">
                <td className="py-2">
                  <p className="font-medium">{c.code}</p>
                  <p className="text-xs text-neutral-500">{c.name}</p>
                </td>
                <td className="py-2 text-neutral-500">{c.credits}</td>
                <td className="py-2 text-center"><GradeColor grade={c.grade} /></td>
                <td className="py-2 text-right text-neutral-500">{c.att}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 pb-4 border-t border-neutral-200 pt-3 flex items-center justify-between">
        <div className="text-xs text-neutral-500">Issued: {new Date().toLocaleDateString('en-GB')}</div>
        <div className="text-xs text-neutral-400 italic">Digital signature applied</div>
      </div>
    </div>
  );
}

function CertificatePreview({ student }: { student: typeof arabStudents[0] }) {
  return (
    <div className="bg-gradient-to-br from-red-50 to-white border-4 border-red-600 rounded-2xl p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-400" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-400" />
      <Star className="w-12 h-12 text-red-600 mx-auto mb-3" />
      <p className="text-xs font-semibold text-neutral-500 tracking-widest uppercase mb-2">Certificate of Completion</p>
      <p className="text-2xl font-black text-neutral-900 mb-1">{student.name}</p>
      <p className="text-sm text-neutral-500 mb-4">has successfully completed</p>
      <p className="text-xl font-bold text-red-600 mb-1">Advanced Algorithms (CS301)</p>
      <p className="text-sm text-neutral-500 mb-6">Cairo University · Faculty of Engineering · Fall 2025</p>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-2xl font-black text-neutral-900">{student.grade}</p>
          <p className="text-xs text-neutral-500">Final Grade</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-neutral-900">{student.gpa}</p>
          <p className="text-xs text-neutral-500">GPA</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-neutral-900">{student.attendance}%</p>
          <p className="text-xs text-neutral-500">Attendance</p>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-red-200 flex items-center justify-between text-xs text-neutral-400">
        <span>Issued: {new Date().toLocaleDateString('en-GB')}</span>
        <span>Prof. Dr. Hossam El-Din</span>
      </div>
    </div>
  );
}

export function ProfessorReports() {
  const [selectedReport, setSelectedReport] = useState('performance');
  const [selectedStudent, setSelectedStudent] = useState(arabStudents[0]);
  const [toast, setToast] = useState<string | null>(null);
  const [course, setCourse] = useState('CS301');

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reports & Certificates</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Generate downloadable PDF reports, transcripts, and certificates</p>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {reportTypes.map(rt => {
          const Icon = rt.icon;
          return (
            <button
              key={rt.id}
              onClick={() => setSelectedReport(rt.id)}
              className={cn(
                'text-left p-4 rounded-xl border-2 transition-all',
                selectedReport === rt.id ? rt.color + ' border-current' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-2', selectedReport === rt.id ? '' : 'text-neutral-400')} />
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{rt.label}</p>
              <p className="text-xs text-neutral-500 mt-1">{rt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Configuration + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Config */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Report Configuration</h3>
          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-1">Course</label>
            <select value={course} onChange={e => setCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20">
              <option>CS301 – Advanced Algorithms</option>
              <option>MATH201 – Linear Algebra</option>
              <option>All Courses</option>
            </select>
          </div>

          {(selectedReport === 'transcript' || selectedReport === 'certificate') && (
            <div>
              <label className="text-xs font-medium text-neutral-500 block mb-1">Student</label>
              <select
                value={selectedStudent.id}
                onChange={e => setSelectedStudent(arabStudents.find(s => s.id === e.target.value) || arabStudents[0])}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                {arabStudents.filter(s => s.status !== 'Fail' || selectedReport !== 'certificate').map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.grade}</option>
                ))}
              </select>
              {selectedReport === 'certificate' && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Only passing students are eligible for completion certificates
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-1">Semester</label>
            <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none">
              <option>Fall 2025</option>
              <option>Spring 2025</option>
            </select>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => showMsg(`${reportTypes.find(r => r.id === selectedReport)?.label} generated and downloaded`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={() => showMsg('Report sent to printer')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Report
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Preview</h3>

          {selectedReport === 'performance' && (
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 mb-3">CS301 – Advanced Algorithms · Fall 2025</p>
              {arabStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-red-700 dark:text-red-400">{s.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-neutral-400">Att: {s.attendance}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GradeColor grade={s.grade} />
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', s.status === 'Pass' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : s.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400')}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedReport === 'transcript' && (
            <TranscriptPreview student={selectedStudent} />
          )}

          {selectedReport === 'certificate' && selectedStudent.status !== 'Fail' && (
            <CertificatePreview student={selectedStudent} />
          )}

          {selectedReport === 'certificate' && selectedStudent.status === 'Fail' && (
            <div className="text-center py-12 border-2 border-dashed border-red-200 dark:border-red-800 rounded-xl">
              <Award className="w-10 h-10 text-red-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-red-600">This student did not pass the course</p>
              <p className="text-xs text-neutral-400 mt-1">Select a passing student to generate a certificate</p>
            </div>
          )}

          {selectedReport === 'analytics' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">CS301 – Advanced Algorithms · Fall 2025</p>
              {[
                { label: 'Class Average', value: '76.5%', color: 'text-blue-600' },
                { label: 'Pass Rate', value: '87.5%', color: 'text-emerald-600' },
                { label: 'Avg Attendance', value: '81%', color: 'text-amber-600' },
                { label: 'At-Risk Students', value: '12.5%', color: 'text-red-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                  <span className={cn('text-sm font-bold', color)}>{value}</span>
                </div>
              ))}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-xs font-semibold text-neutral-500 mb-2">Grade Distribution</p>
                {[{ g: 'A', n: 3 }, { g: 'B', n: 2 }, { g: 'C', n: 2 }, { g: 'D', n: 1 }, { g: 'F', n: 1 }].map(({ g, n }) => (
                  <div key={g} className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-4 font-bold text-neutral-700 dark:text-neutral-300">{g}</span>
                    <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(n / 8) * 100}%` }} />
                    </div>
                    <span className="text-xs text-neutral-400">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'attendance' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">CS301 – Fall 2025 · 6 Sessions</p>
              {arabStudents.slice(0, 6).map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 w-28 truncate">{s.name}</p>
                  <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', s.attendance >= 80 ? 'bg-emerald-500' : s.attendance >= 65 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${s.attendance}%` }} />
                  </div>
                  <span className="text-xs text-neutral-500 w-8 text-right">{s.attendance}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}