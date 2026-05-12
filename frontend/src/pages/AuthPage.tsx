// src/pages/AuthPage.tsx
// FIX: Updated demo credentials to match the required passwords per role:
//   administrator → 1 | professor → 11 | ta → 111 | student → 1111
// FIX: handleLogin redirect now uses the role returned by the server (from
//      the AuthContext user object) instead of the local role selector state,
//      so the redirect is always correct regardless of what the user typed.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Loader2, GraduationCap, Moon, Sun, Info, AlertCircle } from 'lucide-react';

type Role = 'admin' | 'professor' | 'student' | 'ta';

// Demo accounts seeded in database/004_demo_users.sql
// Each role has a distinct simple password as required.
const CREDENTIALS = [
  { role: 'admin'     as Role, email: 'admin@eduguard.edu',         label: 'Administrator',      password: '1'    },
  { role: 'professor' as Role, email: 'j.anderson@eduguard.edu',    label: 'Professor',          password: '11'   },
  { role: 'ta'        as Role, email: 'ta.marcus@eduguard.edu',     label: 'Teaching Assistant', password: '111'  },
  { role: 'student'   as Role, email: 'alice@student.eduguard.edu', label: 'Student',            password: '1111' },
];

const ROLE_PATHS: Record<Role, string> = {
  admin:     '/admin',
  professor: '/professor',
  student:   '/student',
  ta:        '/ta',
};

export function AuthPage() {
  const navigate       = useNavigate();
  const { login, isLoading, loginError, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [email,    setEmail]    = useState('admin@eduguard.edu');
  const [password, setPassword] = useState('1');
  const [role,     setRole]     = useState<Role>('admin');

  // Auto-fill email + password when role selector changes
  const handleRoleChange = (r: Role) => {
    setRole(r);
    const match = CREDENTIALS.find(c => c.role === r);
    if (match) {
      setEmail(match.email);
      setPassword(match.password);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password, role);
    if (success) {
      // FIX: use the role from the context user (server-confirmed) for redirect
      // Fall back to the local selector if user isn't set yet (shouldn't happen)
      const confirmedRole = (user?.role ?? role) as Role;
      navigate(ROLE_PATHS[confirmedRole] ?? '/admin');
    }
  };

  const inputClass = [
    'w-full px-4 py-2.5 rounded-lg border text-sm',
    'bg-white dark:bg-neutral-800',
    'border-neutral-200 dark:border-neutral-700',
    'text-neutral-900 dark:text-white',
    'placeholder-neutral-400 dark:placeholder-neutral-500',
    'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
    'transition-all duration-150',
  ].join(' ');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black flex items-center justify-center p-4">

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-red-300 dark:hover:border-red-700 transition-all group"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark
          ? <Sun  className="w-4 h-4 text-red-500 group-hover:text-red-600" />
          : <Moon className="w-4 h-4 text-neutral-400 group-hover:text-red-600" />}
      </button>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-600 mb-4 shadow-lg shadow-red-200 dark:shadow-red-900/40">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            EduPulse <span className="text-red-600">AI</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1.5 text-sm">
            Academic Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/5 dark:shadow-black/40 p-8">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Login as
              </label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value as Role)}
                className={inputClass}
              >
                <option value="admin">Administrator</option>
                <option value="professor">Professor</option>
                <option value="ta">Teaching Assistant</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@eduguard.edu"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {loginError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{loginError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {isLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
                : 'Sign In'}
            </button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Info className="w-3.5 h-3.5 text-red-500" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Available Accounts (click to fill)
              </p>
            </div>
            <div className="space-y-1.5">
              {CREDENTIALS.map(c => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => { handleRoleChange(c.role); }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left group"
                >
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {c.label}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    pw: <strong className="text-neutral-600 dark:text-neutral-300">{c.password}</strong>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              Each role has its own password shown above.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
          © 2025 EduPulse. All rights reserved.
        </p>
      </div>
    </div>
  );
}