/**
 * Reusable data-fetching hooks — replace direct mock data usage
 * throughout all dashboard pages.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StudentsAPI, CoursesAPI, QuizzesAPI, InterventionsAPI,
  NotificationsAPI, AnalyticsAPI, AIAPI, DashboardAPI, AttendanceAPI,
} from './api';

// ── Generic useQuery hook ─────────────────────────────────────
export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  options: { enabled?: boolean } = {},
) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const mountedRef            = useRef(true);

  const enabled = options.enabled !== false;

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err: any) {
      if (mountedRef.current) setError(err.message ?? 'An error occurred');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── Generic useMutation hook ──────────────────────────────────
export function useMutation<TArgs, TResult>(
  mutator: (args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const mutate = useCallback(async (args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutator(args);
      return result;
    } catch (err: any) {
      setError(err.message ?? 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutator]);

  return { mutate, loading, error };
}

// ── Domain-specific hooks ─────────────────────────────────────

export function useDashboard() {
  return useQuery(() => DashboardAPI.get().then(r => r.data), []);
}

export function useDashboardStats() {
  return useQuery(() => DashboardAPI.stats().then(r => r.data), []);
}

export function useStudents(params?: Record<string, any>) {
  return useQuery(
    () => StudentsAPI.list(params).then(r => ({ students: r.data, meta: r.meta })),
    [JSON.stringify(params)],
  );
}

export function useStudent(id: number | null) {
  return useQuery(
    () => StudentsAPI.get(id!).then(r => r.data),
    [id],
    { enabled: id !== null },
  );
}

export function useStudentStats() {
  return useQuery(() => StudentsAPI.stats().then(r => r.data), []);
}

export function useCourses(params?: Record<string, any>) {
  return useQuery(
    () => CoursesAPI.list(params).then(r => ({ courses: r.data, meta: r.meta })),
    [JSON.stringify(params)],
  );
}

export function useCourse(id: number | null) {
  return useQuery(
    () => CoursesAPI.get(id!).then(r => r.data),
    [id],
    { enabled: id !== null },
  );
}

export function useCourseStudents(courseId: number | null) {
  return useQuery(
    () => CoursesAPI.students(courseId!).then(r => r.data),
    [courseId],
    { enabled: courseId !== null },
  );
}

export function useQuizzes(params?: Record<string, any>) {
  return useQuery(
    () => QuizzesAPI.list(params).then(r => ({ quizzes: r.data, meta: r.meta })),
    [JSON.stringify(params)],
  );
}

export function useQuiz(id: number | null) {
  return useQuery(
    () => QuizzesAPI.get(id!).then(r => r.data),
    [id],
    { enabled: id !== null },
  );
}

export function useInterventions(params?: Record<string, any>) {
  return useQuery(
    () => InterventionsAPI.list(params).then(r => ({ plans: r.data, meta: r.meta })),
    [JSON.stringify(params)],
  );
}

export function useIntervention(id: number | null) {
  return useQuery(
    () => InterventionsAPI.get(id!).then(r => r.data),
    [id],
    { enabled: id !== null },
  );
}

export function useNotifications(params?: Record<string, any>) {
  return useQuery(
    () => NotificationsAPI.list(params).then(r => ({ notifications: r.data, meta: r.meta })),
    [JSON.stringify(params)],
  );
}

export function useUnreadCount() {
  return useQuery(() => NotificationsAPI.unreadCount().then(r => r.data?.count ?? 0), []);
}

export function useAnalyticsOverview() {
  return useQuery(() => AnalyticsAPI.overview().then(r => r.data), []);
}

export function useRiskTrends() {
  return useQuery(() => AnalyticsAPI.riskTrends().then(r => r.data), []);
}

export function useDepartmentAnalytics() {
  return useQuery(() => AnalyticsAPI.departments().then(r => r.data), []);
}

export function useAIRiskDistribution() {
  return useQuery(() => AIAPI.riskDistribution().then(r => r), []);
}

export function useTopAtRisk(limit = 10) {
  return useQuery(() => AIAPI.topAtRisk(limit).then(r => r.students), [limit]);
}

export function useAttendanceTrends(weeks = 8) {
  return useQuery(() => AIAPI.attendanceTrends(weeks).then(r => r.trends), [weeks]);
}

export function useGpaDistribution() {
  return useQuery(() => AIAPI.gpaDistribution().then(r => r.distribution), []);
}

export function useAttendance(params?: Record<string, any>) {
  return useQuery(
    () => AttendanceAPI.list(params).then(r => r.data),
    [JSON.stringify(params)],
  );
}

export function useStudentAttendance(studentId: number | null) {
  return useQuery(
    () => AttendanceAPI.byStudent(studentId!).then(r => r.data),
    [studentId],
    { enabled: studentId !== null },
  );
}


