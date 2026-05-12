// src/pages/professor/TAManagement.tsx
// NEW: Teaching Assistant management with role permissions and task assignment
import { useState } from 'react';
import {
  UserPlus, Users, Shield, ShieldX, ClipboardList, CheckCircle,
  XCircle, Edit2, Trash2, Plus, BookOpen, GraduationCap, Mail,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TA {
  id: string;
  name: string;
  email: string;
  course: string;
  sections: string[];
  permissions: { gradeAssignments: boolean; uploadMaterials: boolean; answerDiscussions: boolean; modifyFinalGrades: boolean; deleteContent: boolean; accessSettings: boolean };
  tasksAssigned: string[];
  status: 'active' | 'inactive';
}

const mockTAs: TA[] = [
  {
    id: 'ta1', name: 'Dr. Khaled Mansour', email: 'k.mansour@uni.edu',
    course: 'CS301 – Advanced Algorithms', sections: ['Section A', 'Section B'],
    permissions: { gradeAssignments: true, uploadMaterials: true, answerDiscussions: true, modifyFinalGrades: false, deleteContent: false, accessSettings: false },
    tasksAssigned: ['Grade Assignment #1', 'Upload Week 5 Materials', 'Monitor Section A Forum'],
    status: 'active',
  },
  {
    id: 'ta2', name: 'Eng. Mariam Fouad', email: 'm.fouad@uni.edu',
    course: 'CS301 – Advanced Algorithms', sections: ['Section C'],
    permissions: { gradeAssignments: true, uploadMaterials: false, answerDiscussions: true, modifyFinalGrades: false, deleteContent: false, accessSettings: false },
    tasksAssigned: ['Grade Quiz #2 Section C', 'Answer student questions'],
    status: 'active',
  },
  {
    id: 'ta3', name: 'Eng. Ali Hamza', email: 'a.hamza@uni.edu',
    course: 'MATH201 – Linear Algebra', sections: ['Section A'],
    permissions: { gradeAssignments: true, uploadMaterials: true, answerDiscussions: true, modifyFinalGrades: false, deleteContent: false, accessSettings: false },
    tasksAssigned: ['Prepare Linear Algebra tutorial materials'],
    status: 'inactive',
  },
];

const permissionLabels: Record<keyof TA['permissions'], { label: string; allowed: boolean }> = {
  gradeAssignments: { label: 'Grade Assignments', allowed: true },
  uploadMaterials: { label: 'Upload Materials', allowed: true },
  answerDiscussions: { label: 'Answer Discussions', allowed: true },
  modifyFinalGrades: { label: 'Modify Final Grades', allowed: false },
  deleteContent: { label: 'Delete Course Content', allowed: false },
  accessSettings: { label: 'Access Settings', allowed: false },
};

function AddTAModal({ onClose, onAdd }: { onClose: () => void; onAdd: (ta: Omit<TA, 'id'>) => void }) {
  const [form, setForm] = useState({
    name: '', email: '', course: 'CS301 – Advanced Algorithms',
    sections: [] as string[], tasksAssigned: [] as string[], status: 'active' as const,
    permissions: { gradeAssignments: true, uploadMaterials: true, answerDiscussions: true, modifyFinalGrades: false, deleteContent: false, accessSettings: false },
  });
  const [sectionInput, setSectionInput] = useState('');
  const [taskInput, setTaskInput] = useState('');

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    onAdd(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-4">Add Teaching Assistant</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-500 block mb-1">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Ahmed El-Sayed" className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-neutral-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 block mb-1">Email</label>
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ta@uni.edu" className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-neutral-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-1">Assigned Course</label>
            <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 text-neutral-900 dark:text-white">
              {['CS301 – Advanced Algorithms', 'MATH201 – Linear Algebra', 'PHYS401 – Quantum Physics'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-1">Sections</label>
            <div className="flex gap-2">
              <input value={sectionInput} onChange={e => setSectionInput(e.target.value)} placeholder="e.g. Section A"
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none text-neutral-900 dark:text-white" />
              <button onClick={() => { if (sectionInput) { setForm(p => ({ ...p, sections: [...p.sections, sectionInput] })); setSectionInput(''); } }}
                className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {form.sections.map(s => (
                <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-xs font-medium text-blue-700 dark:text-blue-400">
                  {s}
                  <button onClick={() => setForm(p => ({ ...p, sections: p.sections.filter(x => x !== s) }))}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 block mb-2">Permissions</label>
            <div className="space-y-2">
              {(Object.entries(permissionLabels) as [keyof TA['permissions'], typeof permissionLabels[keyof TA['permissions']]][]).map(([key, meta]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {meta.allowed ? <Shield className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldX className="w-3.5 h-3.5 text-red-400" />}
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{meta.label}</span>
                    {!meta.allowed && <span className="text-xs text-red-500">(Restricted)</span>}
                  </div>
                  <button
                    disabled={!meta.allowed}
                    onClick={() => setForm(p => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } }))}
                    className={cn('w-10 h-5 rounded-full transition-colors', form.permissions[key] ? 'bg-emerald-500' : 'bg-neutral-200 dark:bg-neutral-700', !meta.allowed && 'opacity-40 cursor-not-allowed')}
                  >
                    <div className={cn('w-4 h-4 rounded-full bg-white transition-transform mx-0.5', form.permissions[key] ? 'translate-x-5' : 'translate-x-0')} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">Cancel</button>
          <button onClick={handleAdd} className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Add TA</button>
        </div>
      </div>
    </div>
  );
}

export function TAManagement() {
  const [tas, setTas] = useState<TA[]>(mockTAs);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<TA | null>(null);
  const [newTask, setNewTask] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleAddTA = (ta: Omit<TA, 'id'>) => {
    setTas(prev => [...prev, { ...ta, id: `ta-${Date.now()}` }]);
    showMsg(`${ta.name} added as TA`);
  };

  const handleAddTask = (taId: string) => {
    if (!newTask) return;
    setTas(prev => prev.map(t => t.id === taId ? { ...t, tasksAssigned: [...t.tasksAssigned, newTask] } : t));
    if (selected?.id === taId) setSelected(prev => prev ? { ...prev, tasksAssigned: [...prev.tasksAssigned, newTask] } : null);
    setNewTask('');
    showMsg('Task assigned');
  };

  const handleRemoveTask = (taId: string, task: string) => {
    setTas(prev => prev.map(t => t.id === taId ? { ...t, tasksAssigned: t.tasksAssigned.filter(x => x !== task) } : t));
    if (selected?.id === taId) setSelected(prev => prev ? { ...prev, tasksAssigned: prev.tasksAssigned.filter(x => x !== task) } : null);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}
      {showAdd && <AddTAModal onClose={() => setShowAdd(false)} onAdd={handleAddTA} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">TA Management</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Manage teaching assistants, permissions, and task assignments</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add TA
        </button>
      </div>

      {/* Permission legend */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wider">Permission Policy</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {(Object.entries(permissionLabels) as [keyof TA['permissions'], typeof permissionLabels[keyof TA['permissions']]][]).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              {meta.allowed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
              <span className={cn(meta.allowed ? 'text-blue-700 dark:text-blue-400' : 'text-red-600 dark:text-red-400')}>
                {meta.label} — {meta.allowed ? 'Can be granted' : 'Always restricted'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* TA list */}
        <div className="lg:col-span-1 space-y-3">
          {tas.map(ta => (
            <button
              key={ta.id}
              onClick={() => setSelected(selected?.id === ta.id ? null : ta)}
              className={cn(
                'w-full text-left bg-white dark:bg-neutral-900 border rounded-xl p-4 transition-all',
                selected?.id === ta.id ? 'border-red-400 dark:border-red-600 shadow-md' : 'border-neutral-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-700'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-red-700 dark:text-red-400">{ta.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{ta.name}</p>
                    <span className={cn('shrink-0 w-1.5 h-1.5 rounded-full', ta.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-300')} />
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{ta.email}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">{ta.course.split('–')[0].trim()}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {ta.sections.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">{s}</span>
                ))}
              </div>
              <div className="mt-2 text-xs text-neutral-400">{ta.tasksAssigned.length} task{ta.tasksAssigned.length !== 1 ? 's' : ''} assigned</div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-red-700 dark:text-red-400">{selected.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{selected.name}</h3>
                    <p className="text-xs text-neutral-500">{selected.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{selected.course}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => showMsg(`Email sent to ${selected.name}`)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setTas(prev => prev.filter(t => t.id !== selected.id)); setSelected(null); showMsg('TA removed'); }}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Permissions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.entries(selected.permissions) as [keyof TA['permissions'], boolean][]).map(([key, val]) => {
                    const meta = permissionLabels[key];
                    return (
                      <div key={key} className={cn(
                        'flex items-center justify-between p-2.5 rounded-lg border',
                        val ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
                      )}>
                        <div className="flex items-center gap-1.5">
                          {val ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-neutral-400" />}
                          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{meta.label}</span>
                        </div>
                        {meta.allowed && (
                          <button
                            onClick={() => {
                              const updated = { ...selected, permissions: { ...selected.permissions, [key]: !val } };
                              setSelected(updated);
                              setTas(prev => prev.map(t => t.id === selected.id ? updated : t));
                            }}
                            className="text-xs text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task assignment */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Assigned Tasks</p>
                <div className="space-y-2 mb-3">
                  {selected.tasksAssigned.map((task, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{task}</span>
                      </div>
                      <button onClick={() => handleRemoveTask(selected.id, task)} className="text-neutral-300 hover:text-red-500 transition-colors">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {selected.tasksAssigned.length === 0 && (
                    <p className="text-xs text-neutral-400 text-center py-3">No tasks assigned yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTask(selected.id); }}
                    placeholder="Assign a new task..."
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <button
                    onClick={() => handleAddTask(selected.id)}
                    className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col items-center justify-center py-20">
              <GraduationCap className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-400">Select a TA to view and edit their permissions and tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}