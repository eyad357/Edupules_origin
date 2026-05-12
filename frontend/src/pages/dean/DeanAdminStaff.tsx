import { useState } from 'react';
import { Star, Users, ClipboardList, TrendingUp, AlertTriangle, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';

type AdminStaff = {
  id: number;
  name: string;
  title: string;
  department: string;
  tasks: number;
  requests: number;
  rating: number;
  performanceRate: number;
  avgPerformanceRate: number;
};

const adminStaff: AdminStaff[] = [
  { id: 1, name: 'Mr. Ahmed Hassan',   title: 'Registrar Officer',         department: 'Student Affairs',  tasks: 42, requests: 156, rating: 4.6, performanceRate: 91, avgPerformanceRate: 82 },
  { id: 2, name: 'Ms. Sara Mohamed',   title: 'Academic Coordinator',      department: 'Academic Affairs', tasks: 38, requests: 129, rating: 4.4, performanceRate: 87, avgPerformanceRate: 82 },
  { id: 3, name: 'Mr. Omar Adel',      title: 'IT Support Officer',        department: 'IT Department',    tasks: 51, requests: 184, rating: 4.2, performanceRate: 82, avgPerformanceRate: 82 },
  { id: 4, name: 'Ms. Nada Ali',       title: 'Finance Officer',           department: 'Finance',          tasks: 29, requests: 97,  rating: 4.5, performanceRate: 89, avgPerformanceRate: 82 },
  { id: 5, name: 'Mr. Karim Youssef',  title: 'HR Specialist',             department: 'Human Resources',  tasks: 34, requests: 88,  rating: 3.8, performanceRate: 63, avgPerformanceRate: 82 },
  { id: 6, name: 'Ms. Mariam Adel',    title: 'Library Administrator',     department: 'Library',          tasks: 27, requests: 72,  rating: 4.1, performanceRate: 76, avgPerformanceRate: 82 },
  { id: 7, name: 'Mr. Youssef Samir',  title: 'Admissions Officer',        department: 'Admissions',       tasks: 45, requests: 142, rating: 3.6, performanceRate: 61, avgPerformanceRate: 82 },
  { id: 8, name: 'Ms. Rana Hany',      title: 'Quality Assurance Officer', department: 'Quality Unit',     tasks: 31, requests: 65,  rating: 4.7, performanceRate: 93, avgPerformanceRate: 82 },
];

function PerformanceBar({ value, avg }: { value: number; avg: number }) {
  const isBelow = value < 65;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
        <div className="absolute top-0 h-full w-0.5 bg-blue-400 z-10" style={{ left: `${avg}%` }} />
        <div
          className={cn('h-full rounded-full transition-all', isBelow ? 'bg-red-500' : value >= 80 ? 'bg-green-500' : 'bg-amber-500')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn('text-xs font-bold w-8 text-right', isBelow ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-300')}>
        {value}%
      </span>
    </div>
  );
}

function AdminStaffCard({ staff, onToast }: { staff: AdminStaff; onToast: (msg: string) => void }) {
  const needsSupport = staff.performanceRate < 65;
  return (
    <div className={cn(
      'bg-white dark:bg-neutral-900 rounded-xl border p-5 hover:shadow-md transition-all',
      needsSupport ? 'border-red-200 dark:border-red-900/50' : 'border-neutral-200 dark:border-neutral-800',
    )}>
      {needsSupport && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2.5 py-1 mb-3">
          <AlertTriangle className="w-3 h-3" /> Needs Administrative Support
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
          <span className="text-base font-black text-pink-700 dark:text-pink-400">{staff.name.split(' ').pop()![0]}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{staff.name}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{staff.title}</p>
          <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">{staff.department}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
          <ClipboardList className="w-4 h-4 text-neutral-400 mx-auto mb-0.5" />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">{staff.tasks}</p>
          <p className="text-xs text-neutral-400">Tasks</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
          <Users className="w-4 h-4 text-neutral-400 mx-auto mb-0.5" />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">{staff.requests}</p>
          <p className="text-xs text-neutral-400">Requests</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
          <Star className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">{staff.rating}</p>
          <p className="text-xs text-neutral-400">Rating</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Performance Rate</span>
          <span className="text-xs text-blue-500">avg {staff.avgPerformanceRate}%</span>
        </div>
        <PerformanceBar value={staff.performanceRate} avg={staff.avgPerformanceRate} />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onToast(`Email sent to ${staff.name}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <Mail className="w-3.5 h-3.5" /> Contact
        </button>
        {needsSupport && (
          <button
            onClick={() => onToast(`Support plan initiated for ${staff.name}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Support Plan
          </button>
        )}
      </div>
    </div>
  );
}

export function DeanAdminStaff() {
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView]   = useState<'cards' | 'table'>('cards');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const needingSupport = adminStaff.filter(s => s.performanceRate < 65);
  const sorted         = [...adminStaff].sort((a, b) => b.performanceRate - a.performanceRate);

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          ✓ {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Admin Staff</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{adminStaff.length} administrative staff members</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('cards')}
            className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', view === 'cards' ? 'bg-red-600 text-white' : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50')}
          >Cards</button>
          <button
            onClick={() => setView('table')}
            className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', view === 'table' ? 'bg-red-600 text-white' : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50')}
          >Table</button>
        </div>
      </div>

      {needingSupport.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              {needingSupport.length} admin staff member{needingSupport.length > 1 ? 's' : ''} below performance threshold
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {needingSupport.map(s => s.name).join(', ')} — performance rate below 65%
            </p>
          </div>
        </div>
      )}

      {view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {adminStaff.map(staff => (
            <AdminStaffCard key={staff.id} staff={staff} onToast={showToast} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                  {['Admin Staff', 'Department', 'Tasks', 'Requests', 'Performance Rate', 'vs. Average', 'Rating', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {sorted.map(staff => {
                  const diff         = staff.performanceRate - staff.avgPerformanceRate;
                  const needsSupport = staff.performanceRate < 65;
                  return (
                    <tr key={staff.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-pink-700 dark:text-pink-400">{staff.name.split(' ').pop()![0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{staff.name}</p>
                            <p className="text-xs text-neutral-400">{staff.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-300">{staff.department}</td>
                      <td className="py-3 px-4 text-sm font-medium text-neutral-900 dark:text-white">{staff.tasks}</td>
                      <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-300">{staff.requests}</td>
                      <td className="py-3 px-4">
                        <span className={cn('text-sm font-bold', needsSupport ? 'text-red-600' : staff.performanceRate >= 80 ? 'text-green-600' : 'text-amber-600')}>
                          {staff.performanceRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('text-sm font-medium', diff >= 0 ? 'text-green-600' : 'text-red-600')}>
                          {diff >= 0 ? '+' : ''}{diff}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{staff.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {needsSupport ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">Needs Support</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Good</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeanAdminStaff;