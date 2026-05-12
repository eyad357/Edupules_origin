import { useState } from 'react';
import { User, Bell, Lock, Monitor, Save, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

type Tab = 'profile' | 'notifications' | 'security' | 'display';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'display', label: 'Display', icon: Monitor },
];

export function ProfessorSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Professor of Computer Science with 10+ years of experience in algorithms and data structures.');
  const [office, setOffice] = useState('Engineering Building, Room 312');

  // Notification toggles
  const [notifs, setNotifs] = useState({
    riskAlerts: true,
    quizResults: true,
    gradeDrops: true,
    systemUpdates: false,
    weeklyDigest: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your account preferences and configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-52 shrink-0">
          <nav className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-red-600 dark:text-red-400")} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card title="Profile Information" subtitle="Update your personal details">
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-700 dark:text-red-400">{user?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Change photo</button>
                    <p className="text-xs text-neutral-500 mt-0.5">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Office Location</label>
                    <input
                      type="text"
                      value={office}
                      onChange={e => setOffice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Role</label>
                    <input
                      type="text"
                      value="Professor"
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notification Preferences" subtitle="Choose what you want to be notified about">
              <div className="space-y-4">
                {[
                  { key: 'riskAlerts', label: 'Risk Alerts', desc: 'Get notified when a student reaches High or Critical risk' },
                  { key: 'quizResults', label: 'Quiz Results', desc: 'Notifications when students submit quizzes' },
                  { key: 'gradeDrops', label: 'Grade Drops', desc: 'Alert when a student\'s GPA drops significantly' },
                  { key: 'systemUpdates', label: 'System Updates', desc: 'Platform maintenance and feature updates' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your students\' progress every Monday' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-200",
                        notifs[item.key as keyof typeof notifs] ? "bg-red-600" : "bg-neutral-200 dark:bg-neutral-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                        notifs[item.key as keyof typeof notifs] ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Security" subtitle="Update your password and security settings">
              <div className="space-y-4">
                {[
                  { label: 'Current Password', placeholder: '••••••••' },
                  { label: 'New Password', placeholder: '••••••••' },
                  { label: 'Confirm New Password', placeholder: '••••••••' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">{field.label}</label>
                    <input
                      type="password"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                ))}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                  <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">Password requirements</p>
                  <ul className="text-xs text-amber-700 dark:text-amber-500 mt-2 space-y-1 list-disc list-inside">
                    <li>At least 8 characters</li>
                    <li>One uppercase and one lowercase letter</li>
                    <li>One number or special character</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'display' && (
            <Card title="Display Preferences" subtitle="Customize your dashboard appearance">
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Dark Mode</p>
                  <p className="text-xs text-neutral-500 mb-3">Toggle dark mode from the sidebar or topbar sun/moon icon.</p>
                  <div className="text-xs text-neutral-500 italic">Current preference saved automatically.</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-3">Default Dashboard View</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Overview', 'Risk Focus', 'Course Focus', 'Student List'].map(opt => (
                      <button
                        key={opt}
                        className={cn(
                          "p-3 rounded-lg border text-sm font-medium text-left transition-all",
                          opt === 'Overview'
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-red-300"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Save button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white hover:bg-red-700"
              )}
            >
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
