/**
 * frontend/src/lib/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised API client for EduGuard.
 * ENHANCED v4.0:
 *   - Added examAnalytics() → GET /analytics/exam-analytics
 *   - Added systemAlerts()  → GET /analytics/system-alerts
 *   - Added adminOverview() → GET /analytics/admin-overview
 *   - Added AlertsAPI       → Alert action endpoints for AI Alert Center
 */

const BASE_URL = '/api/v1';
const TOKEN_KEY = 'eduguard_token';

// ─── Core fetch helper ────────────────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('eduguard_user');
    window.location.href = '/auth';
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// Convenience wrappers
const get  = <T>(path: string)               => apiFetch<T>(path);
const post = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const AuthAPI = {
  login: (email: string, password: string) =>
    apiFetch<{ success: boolean; data?: { token: string; user: any }; message?: string }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  me: () =>
    apiFetch<{ success: boolean; data?: any }>('/auth/me'),
  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {}),
};

// ─── Students API ─────────────────────────────────────────────────────────────

export const StudentsAPI = {
  list: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return apiFetch<any>(`/students/${qs}`);
  },
  get:   (id: number) => apiFetch<any>(`/students/${id}`),
  stats: ()           => apiFetch<any>('/students/stats/overview'),
};

// ─── Courses API ──────────────────────────────────────────────────────────────

export const CoursesAPI = {
  list: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return apiFetch<any>(`/courses/${qs}`);
  },
  get:      (id: number)                    => apiFetch<any>(`/courses/${id}`),
  students: (courseId: number)              => apiFetch<any>(`/courses/${courseId}/students`),
  create:   (body: Record<string, any>)     => apiFetch<any>('/courses/', { method: 'POST', body: JSON.stringify(body) }),
  update:   (id: number, body: Record<string, any>) =>
    apiFetch<any>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:   (id: number)                    => apiFetch<any>(`/courses/${id}`, { method: 'DELETE' }),
};

// ─── Analytics Extended API  (real-data endpoints) ───────────────────────────

export const AnalyticsExtAPI = {
  /** Full platform KPIs — used by DeanDashboard, AdminAnalytics */
  overview:          () => get<any>('/analytics/overview'),

  /** Extended admin-specific KPIs including quiz stats */
  adminOverview:     () => get<any>('/analytics/admin-overview'),

  /** Per-department analytics */
  departments:       () => get<any>('/analytics/departments'),

  /** All instructors: professors + TAs combined */
  instructors: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return get<any>(`/analytics/instructors${qs}`);
  },

  /** All professors with performance metrics */
  professors: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return get<any>(`/analytics/professors${qs}`);
  },

  /** All students with risk & attendance */
  students: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return get<any>(`/analytics/students${qs}`);
  },

  /** Courses with fail/pass rates */
  courses: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return get<any>(`/analytics/courses${qs}`);
  },

  /** Attendance summary & absentee list */
  attendanceSummary: () => get<any>('/analytics/attendance-summary'),

  /** Rich system alerts from real database activity (used by AI Alert Center) */
  systemAlerts:      () => get<any>('/analytics/system-alerts'),

  /** Legacy alerts (backward compat) */
  alerts:            () => get<any>('/analytics/alerts'),

  /** Full exam & quiz analytics from real DB */
  examAnalytics:     () => get<any>('/analytics/exam-analytics'),

  /** GPA trend */
  gpaTrend:          (months = 6) => get<any>(`/analytics/gpa-trend?months=${months}`),

  /** Risk level weekly trends */
  riskTrends:        (weeks = 6)  => get<any>(`/analytics/risk-trends?weeks=${weeks}`),

  /** Enrollment trend */
  enrollmentTrend:   ()            => get<any>('/analytics/enrollment-trend'),

  /** Professor dashboard (for logged-in professor) */
  professorDashboard: () => get<any>('/analytics/professor-dashboard'),

  /** Student self-dashboard */
  studentDashboard:   () => get<any>('/analytics/student-dashboard'),

  /** TA/Advisor dashboard */
  taDashboard:        () => get<any>('/analytics/ta-dashboard'),

  /** Intervention plans */
  interventions: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return get<any>(`/analytics/interventions${qs}`);
  },
};

// ─── Alerts Action API ────────────────────────────────────────────────────────
// Used by DeanAlerts.tsx (AI Alert Center) for all action buttons.

export const AlertsAPI = {
  /**
   * Fetch all system alerts from real database.
   * Returns: { alerts[], total, unread, critical, warning }
   */
  list: () => apiFetch<{
    alerts: Array<{
      id: string;
      type: string;
      category: string;
      severity: 'critical' | 'warning' | 'info';
      priority: number;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      actionable: boolean;
      entity_id: string | null;
      entity_name: string | null;
    }>;
    total: number;
    unread: number;
    critical: number;
    warning: number;
  }>('/analytics/system-alerts'),

  /** Mark a single system alert as read. */
  markRead: (alertId: string) =>
    apiFetch<{ success: boolean }>(
      `/analytics/alerts/${encodeURIComponent(alertId)}/read`,
      { method: 'POST' },
    ),

  /** Mark all system alerts as read for the current user. */
  markAllRead: () =>
    apiFetch<{ success: boolean; message: string }>(
      '/analytics/alerts/mark-all-read',
      { method: 'POST' },
    ),

  /** Send a warning notification for the entity in the alert. */
  sendWarning: (alertId: string) =>
    apiFetch<{ success: boolean; action: string }>(
      `/analytics/alerts/${encodeURIComponent(alertId)}/send-warning`,
      { method: 'POST' },
    ),

  /** Notify the relevant instructor for a course-level alert. */
  notifyInstructor: (alertId: string) =>
    apiFetch<{ success: boolean; action: string }>(
      `/analytics/alerts/${encodeURIComponent(alertId)}/notify-instructor`,
      { method: 'POST' },
    ),
};

// ─── Real Notifications API ───────────────────────────────────────────────────

export const NotificationsRealAPI = {
  list: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return get<any>(`/analytics/notifications${qs}`);
  },
  markRead:    (id: number) => post<any>(`/analytics/notifications/${id}/read`, {}),
  markAllRead: ()            => post<any>('/analytics/notifications/mark-all-read', {}),
};

// ─── Legacy Analytics API (kept for backward-compat with existing pages) ──────

export const AnalyticsAPI = {
  overview:         () => apiFetch<any>('/analytics/overview'),
  riskTrends:       () => apiFetch<any>('/analytics/risk-trends'),
  departments:      () => apiFetch<any>('/analytics/departments'),
  riskDistribution: () => apiFetch<any>('/analytics/risk-distribution'),
  topAtRisk:        (limit = 10) => apiFetch<any>(`/analytics/top-at-risk?limit=${limit}`),
  attendanceTrends: (weeks = 8)  => apiFetch<any>(`/analytics/attendance-trends?weeks=${weeks}`),
  gpaDistribution:  ()            => apiFetch<any>('/analytics/gpa-distribution'),
};

// ─── AI API ───────────────────────────────────────────────────────────────────

export const AIAPI = {
  riskDistribution: () => apiFetch<any>('/analytics/risk-distribution'),
  topAtRisk:        (limit = 10) => apiFetch<any>(`/analytics/top-at-risk?limit=${limit}`),
  attendanceTrends: (weeks = 8)  => apiFetch<any>(`/analytics/attendance-trends?weeks=${weeks}`),
  gpaDistribution:  ()            => apiFetch<any>('/analytics/gpa-distribution'),
  assess:           (studentId: number) => apiFetch<any>(`/ai/assess/${studentId}`),
  simulate:         (studentId: number, body: unknown) =>
    apiFetch<any>(`/ai/simulate/${studentId}`, { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Quizzes API ──────────────────────────────────────────────────────────────

export const QuizzesAPI = {
  list: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return apiFetch<any>(`/ai/quizzes${qs}`);
  },
  get:    (id: number)         => apiFetch<any>(`/ai/quizzes/${id}`),
  create: (body: unknown)      => apiFetch<any>('/ai/quizzes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: unknown) =>
    apiFetch<any>(`/ai/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number)         => apiFetch<any>(`/ai/quizzes/${id}`, { method: 'DELETE' }),
  submit: (id: number, body: unknown) =>
    apiFetch<any>(`/ai/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Interventions API ────────────────────────────────────────────────────────

export const InterventionsAPI = {
  list: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return apiFetch<any>(`/analytics/interventions${qs}`);
  },
  get:    (id: number)         => apiFetch<any>(`/ai/interventions/${id}`),
  create: (body: unknown)      => apiFetch<any>('/ai/interventions', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: unknown) =>
    apiFetch<any>(`/ai/interventions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── Legacy API aliases (kept for backward-compat with existing pages) ─────────

export const NotificationsAPI = {
  list:        (params?: Record<string, any>) => NotificationsRealAPI.list(params),
  unreadCount: () => NotificationsRealAPI.list({ page_size: 1 }).then((r: any) => ({ data: { count: r.unread ?? 0 } })),
};

export const AttendanceAPI = {
  list: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return apiFetch<any>(`/ai/attendance${qs}`);
  },
  byStudent: (studentId: number) => apiFetch<any>(`/ai/attendance/student/${studentId}`),
};

export const DashboardAPI = {
  get:   () => AnalyticsExtAPI.overview(),
  stats: () => AnalyticsExtAPI.overview(),
};

// ─── TA API ───────────────────────────────────────────────────────────────────

export const TAAPI = {
  fullDashboard: () => apiFetch<any>('/analytics/ta-full-dashboard'),
  sections:      () => apiFetch<any>('/analytics/ta-sections'),
  announcements: () => apiFetch<any>('/analytics/ta-announcements'),
  createAnnouncement: (body: { title: string; content: string; section: string }) =>
    apiFetch<any>('/analytics/ta-announcements', { method: 'POST', body: JSON.stringify(body) }),
  saveAttendance: (records: { student_id: number; present: boolean; course_id?: number }[], date: string, course_id?: number) =>
    apiFetch<any>('/analytics/ta-attendance', {
      method: 'POST',
      body: JSON.stringify({ records, date, course_id }),
    }),
  saveGrades: (records: { student_id: number; grade: number; course_id?: number }[]) =>
    apiFetch<any>('/analytics/ta-grades', {
      method: 'POST',
      body: JSON.stringify({ records }),
    }),
  report: (weeksBack = 0) => apiFetch<any>(`/analytics/ta-report?weeks_back=${weeksBack}`),
};