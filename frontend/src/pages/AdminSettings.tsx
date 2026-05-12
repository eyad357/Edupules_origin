// src/pages/admin/AdminSettings.tsx
// صفحة جديدة - ضعها في src/pages/admin/AdminSettings.tsx

import { useState } from 'react';
import { Save, Bell, Shield, Database, Users, Palette } from 'lucide-react';
import { Card } from '../components/ui/Card';

export function AdminSettings() {
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    weeklyReports: true,
    interventionUpdates: false,
    systemUpdates: true,
  });

  const [thresholds, setThresholds] = useState({
    criticalGpa: '1.5',
    highRiskGpa: '2.0',
    attendanceWarning: '75',
    dropoutRisk: '80',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5 text-sm">
            Configure platform settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card title="Notifications" subtitle="Configure alert preferences">
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => {
              const labels: Record<string, string> = {
                criticalAlerts: 'Critical Risk Alerts',
                weeklyReports: 'Weekly Performance Reports',
                interventionUpdates: 'Intervention Updates',
                systemUpdates: 'System Updates',
              };
              const descriptions: Record<string, string> = {
                criticalAlerts: 'Get notified when a student reaches critical risk',
                weeklyReports: 'Receive weekly academic performance summaries',
                interventionUpdates: 'Updates on intervention plan progress',
                systemUpdates: 'Platform maintenance and feature announcements',
              };
              return (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{labels[key]}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{descriptions[key]}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors shrink-0 ${
                      value ? 'bg-red-600' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  >
                    <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Risk Thresholds */}
        <Card title="Risk Thresholds" subtitle="Set GPA and attendance thresholds">
          <div className="space-y-4">
            {Object.entries(thresholds).map(([key, value]) => {
              const labels: Record<string, string> = {
                criticalGpa: 'Critical GPA Threshold',
                highRiskGpa: 'High Risk GPA Threshold',
                attendanceWarning: 'Attendance Warning (%)',
                dropoutRisk: 'Dropout Risk Alert (%)',
              };
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                    {labels[key]}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setThresholds(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    step="0.1"
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* System Info */}
        <Card title="System Information" subtitle="Platform details and version">
          <div className="space-y-3">
            {[
              { label: 'Platform Version', value: 'EduGuard AI v2.1.0' },
              { label: 'AI Model', value: 'Risk Predictor v3.2' },
              { label: 'Database', value: 'PostgreSQL 15.2' },
              { label: 'Last Updated', value: 'May 1, 2026' },
              { label: 'Total Storage Used', value: '24.3 GB / 100 GB' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{item.label}</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Admin Account */}
        <Card title="Admin Account" subtitle="Manage administrator profile">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Email</label>
              <input
                type="email"
                defaultValue="admin@university.edu"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

