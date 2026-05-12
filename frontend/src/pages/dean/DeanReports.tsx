// src/pages/dean/DeanReports.tsx

import { useState } from 'react';
import { FileText, Download, Calendar, BarChart2, Users, GraduationCap, BookOpen, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const reportTemplates = [
  {
    id: 'r1',
    title: 'End-of-Semester Report',
    description: 'Comprehensive summary: GPA, pass/fail rates, department performance, at-risk students',
    icon: BarChart2,
    color: 'bg-red-600',
    formats: ['PDF', 'Excel'],
    estimatedPages: 12,
  },
  {
    id: 'r2',
    title: 'Student Individual Report',
    description: 'Detailed academic profile, risk assessment, attendance, course grades',
    icon: Users,
    color: 'bg-blue-600',
    formats: ['PDF'],
    estimatedPages: 3,
  },
  {
    id: 'r3',
    title: 'Instructor Performance Report',
    description: 'Success rates, student satisfaction, course outcomes, comparison vs. college average',
    icon: GraduationCap,
    color: 'bg-purple-600',
    formats: ['PDF', 'Excel'],
    estimatedPages: 6,
  },
  {
    id: 'r4',
    title: 'Course Analysis Report',
    description: 'Enrollment, grade distribution, failure rates, attendance trends per course',
    icon: BookOpen,
    color: 'bg-amber-500',
    formats: ['PDF', 'Excel'],
    estimatedPages: 8,
  },
  {
    id: 'r5',
    title: 'College Summary Report',
    description: 'Executive summary for university president: KPIs, trends, risk overview, recommendations',
    icon: Building2,
    color: 'bg-green-600',
    formats: ['PDF'],
    estimatedPages: 4,
  },
];

export function DeanReports() {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-05-31');
  const [generating, setGenerating] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const handleGenerate = (reportId: string, format: string) => {
    const report = reportTemplates.find(r => r.id === reportId);
    setGenerating(reportId + format);
    setTimeout(() => {
      setGenerating(null);
      showToast(`${report?.title} (${format}) generated and ready for download`);
    }, 2000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
          <Download className="w-4 h-4" /> {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Reports</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Generate and export academic reports</p>
      </div>

      {/* Date Range */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-red-600" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Date Range</h3>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 block">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 block">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-end gap-2">
            {[
              { label: 'This Semester', from: '2025-01-01', to: '2025-05-31' },
              { label: 'Last Semester', from: '2024-09-01', to: '2024-12-31' },
              { label: 'Full Year', from: '2024-09-01', to: '2025-05-31' },
            ].map(p => (
              <button
                key={p.label}
                onClick={() => { setDateFrom(p.from); setDateTo(p.to); }}
                className="px-3 py-2 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 text-neutral-600 dark:text-neutral-300 rounded-lg transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map(report => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', report.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{report.title}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
                <FileText className="w-3.5 h-3.5" />
                ~{report.estimatedPages} pages
                <span className="text-neutral-200 dark:text-neutral-700">•</span>
                {dateFrom} → {dateTo}
              </div>

              <div className="mt-auto flex gap-2">
                {report.formats.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => handleGenerate(report.id, fmt)}
                    disabled={generating === report.id + fmt}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all',
                      fmt === 'PDF'
                        ? 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-60'
                        : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-60',
                    )}
                  >
                    {generating === report.id + fmt ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    {generating === report.id + fmt ? 'Generating...' : fmt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Recent Reports</h3>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {[
            { name: 'End-of-Semester Report — Fall 2024', date: '2025-01-15', size: '2.4 MB', fmt: 'PDF' },
            { name: 'Course Analysis — Fall 2024', date: '2025-01-10', size: '1.8 MB', fmt: 'Excel' },
            { name: 'College Summary — Q4 2024', date: '2025-01-05', size: '0.9 MB', fmt: 'PDF' },
            { name: 'Instructor Performance — S1 2024', date: '2024-07-20', size: '1.2 MB', fmt: 'PDF' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white', r.fmt === 'PDF' ? 'bg-red-600' : 'bg-green-600')}>
                  {r.fmt}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-neutral-400">{r.date} • {r.size}</p>
                </div>
              </div>
              <button
                onClick={() => showToast(`${r.name} downloaded`)}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

