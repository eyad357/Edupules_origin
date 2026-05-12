// src/components/layout/DashboardLayout.tsx
// MERGED: New project UI/design + bundle's real auth (isInitializing guard,
//         loginError support, refreshUser). Admin sidebar extended with
//         "Data Panel" entry pointing to /admin/data-panel.

import { AIAssistant } from '../AIAssistant';
import { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, CreditCard, BookOpen, Brain, ClipboardList,
  Bell, Settings, LogOut, Menu, Shield, GraduationCap,
  BarChart3, AlertTriangle, Moon, Sun,
  Building2, CalendarDays, FileText, Megaphone, Users2,
  MessageSquare, BookMarked, Calendar, Target,
  UserCog, Wallet, Mail, FolderOpen, ClipboardCheck,
  Database, ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const roleNavItems: Record<string, { label: string; path: string; icon: React.ElementType }[]> = {
  // ── Teaching Assistant ─────────────────────────────────────────────────────
  ta: [
    { label: 'Dashboard',        path: '/ta',                  icon: LayoutDashboard },
    { label: 'Sections',         path: '/ta/sections',         icon: Users2          },
    { label: 'Attendance',       path: '/ta/attendance',       icon: CalendarDays    },
    { label: 'Grading',          path: '/ta/grading',          icon: ClipboardList   },
    { label: 'Student Tracking', path: '/ta/tracking',         icon: Target          },
    { label: 'Communication',    path: '/ta/communication',    icon: MessageSquare   },
    { label: 'Lab Materials',    path: '/ta/materials',        icon: BookMarked      },
    { label: 'Weekly Reports',   path: '/ta/reports',          icon: FileText        },
    { label: 'My Schedule',      path: '/ta/schedule',         icon: Calendar        },
    { label: 'My Students',      path: '/ta/my-students',      icon: Users           },
    { label: 'Interventions',    path: '/ta/interventions',    icon: Shield          },
    { label: 'Progress',         path: '/ta/progress',         icon: BarChart3       },
  ],

  // ── Professor ─────────────────────────────────────────────────────────────
  professor: [
    { label: 'Dashboard',       path: '/professor',                icon: LayoutDashboard },
    { label: 'My Courses',      path: '/professor/courses',        icon: BookOpen        },
    { label: 'Students',        path: '/professor/students',       icon: Users           },
    { label: 'Risk Heatmap',    path: '/professor/risk',           icon: AlertTriangle   },
    { label: 'Quizzes',         path: '/professor/quizzes',        icon: ClipboardList   },
    { label: 'Attendance',      path: '/professor/attendance',     icon: CalendarDays    },
    { label: 'Communication',   path: '/professor/communication',  icon: MessageSquare   },
    { label: 'TA Management',   path: '/professor/ta-management',  icon: UserCog         },
    { label: 'Reports',         path: '/professor/reports',        icon: FileText        },
    { label: 'Settings',        path: '/professor/settings',       icon: Settings        },
  ],

  // ── Admin / Dean ──────────────────────────────────────────────────────────
  admin: [
    { label: 'Dashboard',       path: '/admin/cmd',             icon: LayoutDashboard },
    { label: 'Students',        path: '/admin/cmd/students',    icon: Users           },
    { label: 'Instructors',     path: '/admin/cmd/instructors', icon: Users2          },
    { label: 'Admin Staff',     path: '/admin/cmd/admin-staff', icon: ShieldCheck     },
    { label: 'Courses',         path: '/admin/cmd/courses',     icon: BookOpen        },
    { label: 'Departments',     path: '/admin/cmd/departments', icon: Building2       },
    { label: 'Attendance',      path: '/admin/cmd/attendance',  icon: CalendarDays    },
    { label: 'Exams & Results', path: '/admin/cmd/exams',       icon: ClipboardList   },
    { label: 'Analytics (AI)',  path: '/admin/cmd/analytics',   icon: Brain           },
    { label: 'Alerts',          path: '/admin/cmd/alerts',      icon: Megaphone       },
    { label: 'AI Interventions', path: '/admin/cmd/interventions', icon: Brain,        },
    { label: 'Reports',         path: '/admin/cmd/reports',     icon: FileText        },
    { label: 'Settings',        path: '/admin/cmd/dsettings',   icon: Settings        },
    // ── NEW: DB-powered Data Panel from bundle ────────────────────────────────
    { label: 'Data Panel (DB)', path: '/admin/data-panel',      icon: Database        },
  ],

  // ── Student ───────────────────────────────────────────────────────────────
  student: [
    { label: 'Dashboard',     path: '/student',               icon: LayoutDashboard },
    { label: 'My Progress',   path: '/student/progress',      icon: BarChart3       },
    { label: 'Courses',       path: '/student/courses',       icon: BookOpen        },
    { label: 'Quizzes',       path: '/student/quizzes',       icon: ClipboardList   },
    { label: 'Simulation',    path: '/student/simulation',    icon: Brain           },
    { label: 'Exams',         path: '/student/exams',         icon: ClipboardCheck  },
    { label: 'Financial',     path: '/student/financial',     icon: Wallet          },
    { label: 'Payment Methods',  path: '/student/payment-methods', icon: CreditCard },
    { label: 'Inbox',         path: '/student/inbox',         icon: Mail            },
    { label: 'Documents',     path: '/student/documents',     icon: FolderOpen      },
    { label: 'Announcements', path: '/student/announcements', icon: Megaphone       },
    { label: 'Career Roadmap',path: '/student/career-roadmap',icon: Target          },
  ],
};

const notifications = [
  { id: 1, title: 'Absence Alert',   message: 'Omar Khalid reached 26% absence rate',          time: '5 min ago', priority: 'high'   },
  { id: 2, title: 'Low Grade Alert', message: 'Layla Mostafa scored below 60% on Midterm',     time: '1 hr ago',  priority: 'high'   },
  { id: 3, title: 'New Forum Post',  message: 'Youssef Samir asked about Knapsack problem',    time: '2 hr ago',  priority: 'medium' },
  { id: 4, title: 'New Message',     message: 'Ahmed Hassan sent a question about deadline',   time: '3 hr ago',  priority: 'medium' },
];

const roleLabel: Record<string, string> = {
  ta:        'Teaching Assistant',
  professor: 'Professor',
  admin:     'Administrator',
  student:   'Student',
};

export function DashboardLayout() {
  const { user, logout, isInitializing } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Wait for token validation to complete before redirecting
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const navItems       = roleNavItems[user.role] ?? roleNavItems.admin;
  const currentPath    = location.pathname;
  const currentPageLabel =
    navItems.find(n => currentPath === n.path || currentPath.startsWith(n.path + '/'))?.label
    ?? 'Dashboard';

  const handleLogout = useCallback(() => {
    logout(() => navigate('/auth', { replace: true }));
  }, [logout, navigate]);

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

    return (
      <button
        key={item.path}
        onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          isActive
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
          !sidebarOpen && 'justify-center',
        )}
        title={!sidebarOpen ? item.label : undefined}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {sidebarOpen && <span className="truncate">{item.label}</span>}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-bold text-sm text-neutral-900 dark:text-white">
            EduPulse<span className="text-red-600"> AI</span>
          </span>
        )}
      </div>

      {/* Role Badge */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-red-600 dark:text-red-400">{roleLabel[user.role] ?? user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 hidden lg:block space-y-0.5">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
        >
          <Menu className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 transition-all duration-300 shrink-0',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ───────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <h1 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
              {currentPageLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isDark
                ? <Sun  className="w-4 h-4 text-neutral-400 hover:text-red-500 transition-colors" />
                : <Moon className="w-4 h-4 text-neutral-400 hover:text-red-500 transition-colors" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Bell className="w-4 h-4 text-neutral-400" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50">
                  <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className={cn(
                            'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                            n.priority === 'high' ? 'bg-red-600' : 'bg-amber-400',
                          )} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{n.message}</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-black">
          <Outlet />
          {/* EduPulse AI Assistant — floats over all pages for all roles */}
          <AIAssistant />
        </main>
      </div>
    </div>
  );
}