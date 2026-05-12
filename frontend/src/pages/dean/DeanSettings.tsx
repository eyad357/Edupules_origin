// src/pages/dean/DeanSettings.tsx
// UPGRADE: Replaced static deanDepartments mock with live data from
//          GET /api/v1/analytics/departments.  Department list now reflects
//          the real database; add/remove operations are local-state only
//          (a write endpoint can be wired in later).

import { useState, useEffect } from 'react';
import { Save, Building2, Plus, Trash2, Shield, Bell, Info, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnalyticsExtAPI } from '../../lib/api';

// ── Minimal department shape needed for Settings ──────────────────────────────
interface SettingsDept {
  id: string;          // synthetic — name used as stable key from API
  name: string;
  head: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
        <Icon className="w-4 h-4 text-red-600" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}

export function DeanSettings() {
  const [toast, setToast]               = useState<string | null>(null);
  const [collegeName, setCollegeName]   = useState('College of Sciences');
  const [deanName, setDeanName]         = useState('Prof. Ahmed Al-Mansouri');
  const [deanEmail, setDeanEmail]       = useState('dean@college.edu');

  // ── Department list — seeded from real API ────────────────────────────────
  const [departments, setDepts]         = useState<SettingsDept[]>([]);
  const [deptLoading, setDeptLoading]   = useState(true);
  const [newDept, setNewDept]           = useState('');

  // ── Risk / notification state ─────────────────────────────────────────────
  const [gpaThreshold,        setGpaThreshold]        = useState('2.0');
  const [attendanceThreshold, setAttendanceThreshold] = useState('75');
  const [dropoutThreshold,    setDropoutThreshold]    = useState('80');
  const [notifs, setNotifs] = useState({ email: true, sms: false, critical: true, warning: true, weekly: true });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load departments from the real API on mount
  useEffect(() => {
    AnalyticsExtAPI.departments()
      .then(data => {
        const depts: SettingsDept[] = (data.departments ?? []).map((d: any) => ({
          id:   d.name,          // use name as stable key
          name: d.name,
          head: d.head ?? '—',
        }));
        setDepts(depts);
      })
      .catch(() => { /* leave list empty — user can add manually */ })
      .finally(() => setDeptLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          ✓ {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">College configuration and preferences</p>
      </div>

      {/* College Profile */}
      <Section title="College Profile" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="College Name"     value={collegeName} onChange={setCollegeName} />
          <InputField label="Dean Name"        value={deanName}    onChange={setDeanName} />
          <InputField label="Dean Email"       value={deanEmail}   onChange={setDeanEmail} type="email" />
          <InputField label="Current Semester" value="Spring 2025" onChange={() => {}} />
        </div>
        <button
          onClick={() => showToast('College profile saved')}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </Section>

      {/* Department Management — live from DB */}
      <Section title="Department Management" icon={Building2}>
        {deptLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading departments…
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {departments.length === 0 && (
              <p className="text-sm text-neutral-400 py-2">No departments found in database.</p>
            )}
            {departments.map(d => (
              <div
                key={d.id}
                className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2.5"
              >
                <div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{d.name}</span>
                  <span className="text-xs text-neutral-400 ml-2">Head: {d.head}</span>
                </div>
                <button
                  onClick={() => {
                    setDepts(prev => prev.filter(x => x.id !== d.id));
                    showToast(`${d.name} removed`);
                  }}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new department (local state only — wire to POST endpoint when ready) */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newDept}
            onChange={e => setNewDept(e.target.value)}
            placeholder="New department name…"
            className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => {
              if (!newDept.trim()) return;
              const name = newDept.trim();
              setDepts(prev => [
                ...prev,
                {
                  id:   `local-${Date.now()}`,
                  name,
                  head: 'TBD',
                },
              ]);
              setNewDept('');
              showToast('Department added (local)');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </Section>

      {/* Risk Thresholds */}
      <Section title="Risk Threshold Configuration" icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'GPA At-Risk Threshold', value: gpaThreshold, onChange: setGpaThreshold, step: '0.1', min: '0', max: '4', unit: '/ 4.0', hint: 'Students below this GPA are flagged at-risk' },
            { label: 'Attendance Threshold',  value: attendanceThreshold, onChange: setAttendanceThreshold, step: '1', min: '0', max: '100', unit: '%', hint: 'Alert when attendance falls below this' },
            { label: 'Dropout Risk Score',    value: dropoutThreshold, onChange: setDropoutThreshold, step: '1', min: '0', max: '100', unit: '/ 100', hint: 'Trigger critical alert above this score' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 block">{f.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step={f.step}
                  min={f.min}
                  max={f.max}
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-xs text-neutral-400">{f.unit}</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">{f.hint}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => showToast('Risk thresholds updated')}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Save Thresholds
        </button>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences" icon={Bell}>
        <div className="space-y-3">
          {[
            { key: 'email',    label: 'Email Notifications', desc: 'Receive alerts via email' },
            { key: 'sms',      label: 'SMS Notifications',   desc: 'Receive critical alerts via SMS' },
            { key: 'critical', label: 'Critical Alerts',     desc: 'Students near dropout, course failures' },
            { key: 'warning',  label: 'Warning Alerts',      desc: 'Attendance issues, performance drops' },
            { key: 'weekly',   label: 'Weekly Digest',       desc: 'Weekly summary report every Sunday' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{n.label}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                className={cn(
                  'relative inline-flex h-5 w-9 rounded-full transition-colors',
                  notifs[n.key as keyof typeof notifs] ? 'bg-red-600' : 'bg-neutral-200 dark:bg-neutral-700',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                  notifs[n.key as keyof typeof notifs] ? 'translate-x-4' : 'translate-x-0',
                )} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => showToast('Notification preferences saved')}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </Section>

      {/* System Info */}
      <Section title="System Information" icon={Info}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Platform',  value: 'EduGuard AI' },
            { label: 'Version',   value: 'v2.5.1' },
            { label: 'Last Sync', value: '5 min ago' },
            { label: 'Data As Of', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
          ].map(item => (
            <div key={item.label} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
              <p className="text-xs text-neutral-400 mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}