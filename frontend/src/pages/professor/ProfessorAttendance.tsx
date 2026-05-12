// src/pages/professor/ProfessorAttendance.tsx
// NEW: Full attendance management with QR code generation, tracking, warnings, calendar heatmap
import { useState, useEffect } from 'react';
import {
  QrCode, Users, AlertTriangle, Calendar, Download, CheckCircle,
  XCircle, Clock, Search, TrendingDown, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const arabStudents = [
  { id: 's1', name: 'Ahmed Hassan', email: 'ahmed.hassan@uni.edu' },
  { id: 's2', name: 'Fatima Ali', email: 'fatima.ali@uni.edu' },
  { id: 's3', name: 'Mohamed Ibrahim', email: 'mohamed.ibrahim@uni.edu' },
  { id: 's4', name: 'Sara Mahmoud', email: 'sara.mahmoud@uni.edu' },
  { id: 's5', name: 'Omar Khalid', email: 'omar.khalid@uni.edu' },
  { id: 's6', name: 'Nour Adel', email: 'nour.adel@uni.edu' },
  { id: 's7', name: 'Youssef Samir', email: 'youssef.samir@uni.edu' },
  { id: 's8', name: 'Layla Mostafa', email: 'layla.mostafa@uni.edu' },
  { id: 's9', name: 'Karim Nasser', email: 'karim.nasser@uni.edu' },
  { id: 's10', name: 'Hana Sayed', email: 'hana.sayed@uni.edu' },
  { id: 's11', name: 'Amr Fathy', email: 'amr.fathy@uni.edu' },
  { id: 's12', name: 'Rania Gomaa', email: 'rania.gomaa@uni.edu' },
];

type AttStatus = 'present' | 'absent' | 'late' | 'excused';

interface LectureSession {
  id: string;
  date: string;
  topic: string;
  courseCode: string;
  records: { studentId: string; status: AttStatus }[];
}

const sessions: LectureSession[] = [
  {
    id: 'ses1', date: '2025-10-01', topic: 'Introduction to Complexity', courseCode: 'CS301',
    records: arabStudents.map((s, i) => ({ studentId: s.id, status: i < 10 ? 'present' : i < 11 ? 'late' : 'absent' })),
  },
  {
    id: 'ses2', date: '2025-10-08', topic: 'Sorting Algorithms', courseCode: 'CS301',
    records: arabStudents.map((s, i) => ({ studentId: s.id, status: i < 9 ? 'present' : i < 10 ? 'excused' : 'absent' })),
  },
  {
    id: 'ses3', date: '2025-10-15', topic: 'Dynamic Programming', courseCode: 'CS301',
    records: arabStudents.map((s, i) => ({ studentId: s.id, status: i < 11 ? 'present' : 'absent' })),
  },
  {
    id: 'ses4', date: '2025-10-22', topic: 'Graph Algorithms', courseCode: 'CS301',
    records: arabStudents.map((s, i) => ({ studentId: s.id, status: i < 8 ? 'present' : i < 10 ? 'late' : 'absent' })),
  },
  {
    id: 'ses5', date: '2025-10-29', topic: 'Greedy Algorithms', courseCode: 'CS301',
    records: arabStudents.map((s, i) => ({ studentId: s.id, status: i < 10 ? 'present' : i < 11 ? 'late' : 'absent' })),
  },
  {
    id: 'ses6', date: '2025-11-05', topic: 'NP-Completeness', courseCode: 'CS301',
    records: arabStudents.map((s, i) => ({ studentId: s.id, status: i < 9 ? 'present' : 'absent' })),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getStudentAttendance(studentId: string) {
  const total = sessions.length;
  const present = sessions.filter(s => {
    const rec = s.records.find(r => r.studentId === studentId);
    return rec?.status === 'present' || rec?.status === 'late';
  }).length;
  const absent = total - present;
  const pct = Math.round((present / total) * 100);
  const absentPct = Math.round((absent / total) * 100);
  return { total, present, absent, pct, absentPct };
}

const statusStyle: Record<AttStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  absent: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  excused: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

const statusIcon = (s: AttStatus) => {
  if (s === 'present') return <CheckCircle className="w-3.5 h-3.5" />;
  if (s === 'late') return <Clock className="w-3.5 h-3.5" />;
  if (s === 'excused') return <CheckCircle className="w-3.5 h-3.5" />;
  return <XCircle className="w-3.5 h-3.5" />;
};

// ─── QR Code Generator Tab ────────────────────────────────────────────────────
function QRCodeTab() {
  const [code, setCode] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState('CS301');
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleGenerate = () => {
    if (!topic) { showMsg('Please enter a lecture topic first'); return; }
    const newCode = generateCode();
    setCode(newCode);
    setCountdown(300); // 5 minutes
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(prev => {
      if (prev <= 1) { setCode(null); return 0; }
      return prev - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-red-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Generator */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Generate Check-In Code</h3>
          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-1">Course</label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              {['CS301 – Advanced Algorithms', 'MATH201 – Linear Algebra', 'PHYS401 – Quantum Physics', 'CHEM101 – General Chemistry', 'BIO301 – Molecular Biology'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-1">Lecture Topic</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Greedy Algorithms"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {code ? 'Regenerate Code' : 'Generate Code'}
          </button>
        </div>

        {/* QR Display */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col items-center justify-center gap-4 min-h-[250px]">
          {code ? (
            <>
              {/* QR Code Representation */}
              <div className="relative">
                <div className="w-36 h-36 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-white dark:text-neutral-900" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">✓</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">6-Digit Code</p>
                <p className="text-4xl font-black text-neutral-900 dark:text-white tracking-widest">{code}</p>
                <div className={cn(
                  'mt-2 text-sm font-medium',
                  countdown > 60 ? 'text-emerald-600' : 'text-red-600 animate-pulse'
                )}>
                  Expires in {mm}:{ss}
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => { navigator.clipboard.writeText(code); showMsg('Code copied!'); }}
                  className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => showMsg('QR code downloaded')}
                  className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Download QR
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <QrCode className="w-16 h-16 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Generate a code to start check-in</p>
              <p className="text-xs text-neutral-400 mt-1">Students enter the 6-digit code or scan the QR</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">How it works</h4>
        <ol className="space-y-1 text-xs text-blue-700 dark:text-blue-400 list-decimal list-inside">
          <li>Enter the lecture topic and select your course</li>
          <li>Click "Generate Code" — a unique 6-digit code appears, valid for 5 minutes</li>
          <li>Display the QR code or announce the 6-digit code at the start of class</li>
          <li>Students scan or enter the code in their EduGuard student app</li>
          <li>Attendance is automatically recorded in the system</li>
        </ol>
      </div>
    </div>
  );
}

// ─── Tracking Tab ─────────────────────────────────────────────────────────────
function TrackingTab() {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const students = arabStudents.map(s => ({ ...s, ...getStudentAttendance(s.id) }));
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const atRisk = students.filter(s => s.absentPct >= 25);

  const sel = selectedStudent ? students.find(s => s.id === selectedStudent) : null;

  return (
    <div className="space-y-4">
      {atRisk.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {atRisk.length} student{atRisk.length > 1 ? 's' : ''} at or above 25% absence threshold
            </p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
              {atRisk.map(s => s.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800">
                  {['Student', 'Present', 'Absent', 'Rate', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStudent(selectedStudent === s.id ? null : s.id)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedStudent === s.id ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-red-700 dark:text-red-400">{s.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-neutral-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600">{s.present}/{s.total}</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">{s.absent}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', s.pct >= 75 ? 'bg-emerald-500' : s.pct >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500">{s.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {s.absentPct >= 25 ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Warning
                        </span>
                      ) : s.absentPct >= 15 ? (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">At Risk</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Good</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          {sel ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-red-700 dark:text-red-400">{sel.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{sel.name}</p>
                  <p className="text-xs text-neutral-500">{sel.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Present', value: sel.present, color: 'text-emerald-600' },
                  { label: 'Absent', value: sel.absent, color: 'text-red-600' },
                  { label: 'Rate', value: `${sel.pct}%`, color: sel.pct >= 75 ? 'text-emerald-600' : 'text-red-600' },
                  { label: 'Sessions', value: sel.total, color: 'text-neutral-900 dark:text-white' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2.5 text-center">
                    <p className={cn('text-xl font-bold', color)}>{value}</p>
                    <p className="text-xs text-neutral-500">{label}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Session History</p>
                <div className="space-y-1.5">
                  {sessions.map(ses => {
                    const rec = ses.records.find(r => r.studentId === sel.id);
                    return (
                      <div key={ses.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-neutral-900 dark:text-white">{ses.date}</p>
                          <p className="text-xs text-neutral-400 truncate max-w-[120px]">{ses.topic}</p>
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-1', statusStyle[rec?.status || 'absent'])}>
                          {statusIcon(rec?.status || 'absent')} {rec?.status || 'absent'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {sel.absentPct >= 25 && (
                <button className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Send Warning
                </button>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Click a student to view their attendance detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Session View Tab ─────────────────────────────────────────────────────────
function SessionsTab() {
  const [selectedSession, setSelectedSession] = useState<LectureSession>(sessions[sessions.length - 1]);
  const [records, setRecords] = useState<Record<string, AttStatus>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  useEffect(() => {
    const init: Record<string, AttStatus> = {};
    selectedSession.records.forEach(r => { init[r.studentId] = r.status; });
    setRecords(init);
  }, [selectedSession]);

  const presentCount = Object.values(records).filter(s => s === 'present' || s === 'late').length;
  const absentCount = Object.values(records).filter(s => s === 'absent').length;

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">
          ✓ {toast}
        </div>
      )}

      {/* Session selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {sessions.map(ses => (
          <button
            key={ses.id}
            onClick={() => setSelectedSession(ses)}
            className={cn(
              'p-2.5 rounded-xl border text-left transition-all',
              selectedSession.id === ses.id
                ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-red-300'
            )}
          >
            <p className="text-xs font-bold text-neutral-900 dark:text-white">{ses.date}</p>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{ses.topic}</p>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present / Late', value: presentCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
          { label: 'Absent', value: absentCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10' },
          { label: 'Attendance Rate', value: `${Math.round((presentCount / arabStudents.length) * 100)}%`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn('rounded-xl p-3 text-center', bg)}>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Session title */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{selectedSession.topic}</h4>
          <p className="text-xs text-neutral-400">{selectedSession.date} · {selectedSession.courseCode}</p>
        </div>
        <button
          onClick={() => showMsg('Attendance sheet saved')}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {arabStudents.map(s => {
          const status = records[s.id] || 'absent';
          const statuses: AttStatus[] = ['present', 'late', 'excused', 'absent'];
          return (
            <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{s.name[0]}</span>
                </div>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</span>
              </div>
              <div className="flex gap-1">
                {statuses.map(st => (
                  <button
                    key={st}
                    onClick={() => setRecords(prev => ({ ...prev, [s.id]: st }))}
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                      status === st ? statusStyle[st] : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    {st[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Tab = 'qr' | 'tracking' | 'sessions';

export function ProfessorAttendance() {
  const [tab, setTab] = useState<Tab>('qr');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'qr', label: 'QR Check-In', icon: QrCode },
    { id: 'tracking', label: 'Student Tracking', icon: TrendingDown },
    { id: 'sessions', label: 'Session Manager', icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Attendance Management</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Generate check-in codes, track attendance, and monitor absence thresholds</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Sessions', value: sessions.length, color: 'text-blue-600' },
          { label: 'Avg Attendance', value: '84%', color: 'text-emerald-600' },
          { label: 'Students at Risk', value: arabStudents.filter(s => getStudentAttendance(s.id).absentPct >= 25).length, color: 'text-red-600' },
          { label: 'Total Students', value: arabStudents.length, color: 'text-neutral-900 dark:text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-center">
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'qr' && <QRCodeTab />}
      {tab === 'tracking' && <TrackingTab />}
      {tab === 'sessions' && <SessionsTab />}
    </div>
  );
}