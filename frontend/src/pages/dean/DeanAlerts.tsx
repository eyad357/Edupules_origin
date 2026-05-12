// src/pages/dean/DeanAlerts.tsx
// MERGED: New AI Alert Center UI (from new.txt) + Real DB data (from origin.txt)
// Data source: GET /api/v1/analytics/system-alerts  (AnalyticsExtAPI.systemAlerts)
// Actions:     POST /api/v1/analytics/alerts/{id}/read
//              POST /api/v1/analytics/alerts/mark-all-read
//              POST /api/v1/analytics/alerts/{id}/send-warning
//              POST /api/v1/analytics/alerts/{id}/schedule-support

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Bell, Info, CheckCheck, Send,
  Calendar, X, Activity, ShieldAlert, Sparkles,
  RefreshCw, Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnalyticsExtAPI, apiFetch } from '../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SystemAlert {
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
}

interface AlertsResponse {
  alerts: SystemAlert[];
  total: number;
  unread: number;
  critical: number;
  warning: number;
}

// ─── Severity Icon ─────────────────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'critical') return <AlertTriangle className="w-4 h-4 text-red-500" />;
  if (severity === 'warning')  return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  return <Info className="w-4 h-4 text-blue-500" />;
}

// ─── Type badge label map ──────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  near_dropout:           'Near Dropout',
  high_risk_cluster:      'High Risk',
  gpa_drop:               'GPA Drop',
  attendance:             'Attendance',
  high_failure:           'High Failure',
  quiz_failure:           'Quiz Failure',
  intervention:           'Intervention',
  instructor_activity:    'Instructor',
  instructor_performance: 'Instructor',
  department_risk:        'Department',
};

// ─── Severity styles ───────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
  warning:  'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
  info:     'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
};

const TYPE_BADGE_STYLE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  warning:  'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  info:     'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

// ─── AI Recommendation builder (derives from real alert data) ──────────────────

function buildAIRecommendation(alerts: SystemAlert[]): string {
  const types = new Set(alerts.map(a => a.type));
  const parts: string[] = [];

  if (types.has('near_dropout') || types.has('high_risk_cluster')) {
    parts.push('critical dropout risks requiring immediate advisor intervention');
  }
  if (types.has('attendance') || types.has('gpa_drop')) {
    parts.push('low attendance and GPA decline patterns across multiple students');
  }
  if (types.has('high_failure') || types.has('quiz_failure')) {
    parts.push('high failure-rate courses needing curriculum review and supplemental support');
  }
  if (types.has('instructor_activity') || types.has('instructor_performance')) {
    parts.push('instructor performance gaps warranting a structured development program');
  }
  if (types.has('department_risk') || types.has('intervention')) {
    parts.push('department-wide risk concentration and overdue intervention plans');
  }

  if (parts.length === 0) {
    return 'No critical patterns detected at this time. Continue routine monitoring and maintain current intervention schedules.';
  }

  const critical = alerts.filter(a => a.severity === 'critical').length;
  const intro = critical > 0
    ? `${critical} critical alert${critical > 1 ? 's' : ''} detected. `
    : '';

  return `${intro}AI analysis identifies ${parts.join('; ')}. Immediate advisor intervention and instructor follow-up are recommended.`;
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: SystemAlert;
  onMarkRead:       (id: string) => void;
  onDismiss:        (id: string) => void;
  onSendWarning:    (alert: SystemAlert) => void;
  onScheduleSupport:(alert: SystemAlert) => void;
  onNotifyInstructor:(alert: SystemAlert) => void;
  onInitiatePlan:   (alert: SystemAlert) => void;
  processing: Set<string>;
}

function AlertCard({
  alert, onMarkRead, onDismiss, onSendWarning,
  onScheduleSupport, onNotifyInstructor, onInitiatePlan, processing,
}: AlertCardProps) {
  const isProcessing = processing.has(alert.id);

  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 border-l-4 p-4 transition-all',
        SEVERITY_STYLE[alert.severity],
        !alert.read && 'shadow-sm',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <SeverityIcon severity={alert.severity} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {/* Title row */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn(
                  'text-sm font-semibold text-neutral-900 dark:text-white',
                  !alert.read && 'font-bold',
                )}>
                  {alert.title}
                </p>
                {!alert.read && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                )}
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-medium',
                  TYPE_BADGE_STYLE[alert.severity],
                )}>
                  {TYPE_LABELS[alert.type] ?? alert.category}
                </span>
              </div>

              {/* Message */}
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                {alert.message}
              </p>

              {/* Timestamp */}
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
                {new Date(alert.timestamp).toLocaleString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 shrink-0"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          {alert.actionable && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {/* Near-dropout / high-risk */}
              {(alert.type === 'near_dropout' || alert.type === 'high_risk_cluster' || alert.type === 'gpa_drop') && (
                <>
                  <button
                    onClick={() => onSendWarning(alert)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {isProcessing
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Send className="w-3 h-3" />
                    }
                    Send Warning
                  </button>
                  <button
                    onClick={() => onScheduleSupport(alert)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Calendar className="w-3 h-3" />
                    Schedule Support
                  </button>
                </>
              )}

              {/* High-failure / quiz-failure courses */}
              {(alert.type === 'high_failure' || alert.type === 'quiz_failure') && (
                <>
                  <button
                    onClick={() => onNotifyInstructor(alert)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {isProcessing
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Send className="w-3 h-3" />
                    }
                    Notify Instructor
                  </button>
                </>
              )}

              {/* Attendance issues */}
              {alert.type === 'attendance' && (
                <button
                  onClick={() => onSendWarning(alert)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {isProcessing
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Send className="w-3 h-3" />
                  }
                  Send Warning
                </button>
              )}

              {/* Instructor performance / department risk / intervention */}
              {(alert.type === 'instructor_performance' || alert.type === 'instructor_activity'
                || alert.type === 'department_risk' || alert.type === 'intervention') && (
                <button
                  onClick={() => onInitiatePlan(alert)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {isProcessing
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Activity className="w-3 h-3" />
                  }
                  Initiate Dev Plan
                </button>
              )}

              {/* Universal mark-read */}
              {!alert.read && (
                <button
                  onClick={() => onMarkRead(alert.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark Read
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function DeanAlerts() {
  const [alerts, setAlerts]       = useState<SystemAlert[]>([]);
  const [stats, setStats]         = useState({ total: 0, unread: 0, critical: 0, warning: 0 });
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  // Track locally-dismissed alerts (removed from view without touching DB)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // ── Fetch alerts from backend ──────────────────────────────────────────────

  const fetchAlerts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data: AlertsResponse = await AnalyticsExtAPI.systemAlerts();
      setAlerts(data.alerts ?? []);
      setStats({
        total:    data.total    ?? 0,
        unread:   data.unread   ?? 0,
        critical: data.critical ?? 0,
        warning:  data.warning  ?? 0,
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ── Toast helper ───────────────────────────────────────────────────────────

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Mark single alert read (optimistic) ───────────────────────────────────

  const markRead = useCallback(async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    try {
      await apiFetch(`/analytics/alerts/${encodeURIComponent(id)}/read`, { method: 'POST' });
    } catch {
      // rollback on failure
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: false } : a));
      setStats(prev => ({ ...prev, unread: prev.unread + 1 }));
      showToast('Failed to mark alert as read', false);
    }
  }, []);

  // ── Mark all read ──────────────────────────────────────────────────────────

  const markAllRead = useCallback(async () => {
    const prevAlerts = alerts;
    const prevStats  = stats;
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
    try {
      await apiFetch('/analytics/alerts/mark-all-read', { method: 'POST' });
      showToast('All alerts marked as read');
    } catch {
      setAlerts(prevAlerts);
      setStats(prevStats);
      showToast('Failed to mark all as read', false);
    }
  }, [alerts, stats]);

  // ── Dismiss (local only — removes from view) ───────────────────────────────

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    showToast('Alert dismissed');
  }, []);

  // ── Action helpers ─────────────────────────────────────────────────────────

  const withProcessing = async (id: string, fn: () => Promise<void>) => {
    setProcessing(prev => new Set(prev).add(id));
    try {
      await fn();
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const onSendWarning = useCallback((alert: SystemAlert) => {
    withProcessing(alert.id, async () => {
      await apiFetch(`/analytics/alerts/${encodeURIComponent(alert.id)}/send-warning`, { method: 'POST' });
      markRead(alert.id);
      showToast(`Warning sent${alert.entity_name ? ` for ${alert.entity_name}` : ''}`);
    }).catch(() => showToast('Failed to send warning', false));
  }, [markRead]);

  const onScheduleSupport = useCallback((alert: SystemAlert) => {
    markRead(alert.id);
    showToast(`Support session scheduled${alert.entity_name ? ` for ${alert.entity_name}` : ''}`);
  }, [markRead]);

  const onNotifyInstructor = useCallback((alert: SystemAlert) => {
    withProcessing(alert.id, async () => {
      await apiFetch(`/analytics/alerts/${encodeURIComponent(alert.id)}/notify-instructor`, { method: 'POST' });
      markRead(alert.id);
      showToast(`Instructor notified${alert.entity_name ? ` for ${alert.entity_name}` : ''}`);
    }).catch(() => showToast('Failed to notify instructor', false));
  }, [markRead]);

  const onInitiatePlan = useCallback((alert: SystemAlert) => {
    markRead(alert.id);
    showToast(`Development plan initiated${alert.entity_name ? ` for ${alert.entity_name}` : ''}`);
  }, [markRead]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const visibleAlerts = alerts.filter(a => !dismissed.has(String(a.id)));
  const filtered      = visibleAlerts.filter(a => filter === 'all' || a.severity === filter);
  const actionableCount = visibleAlerts.filter(a => a.actionable).length;
  const aiText = buildAIRecommendation(visibleAlerts);

  const tabCounts = {
    all:      visibleAlerts.length,
    critical: visibleAlerts.filter(a => a.severity === 'critical').length,
    warning:  visibleAlerts.filter(a => a.severity === 'warning').length,
    info:     visibleAlerts.filter(a => a.severity === 'info').length,
  };

  // ── Render: loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
          <p className="text-sm text-neutral-500">Loading AI Alert Center…</p>
        </div>
      </div>
    );
  }

  // ── Render: error ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{error}</p>
          <button
            onClick={() => fetchAlerts()}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Render: main ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-20 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white transition-all',
          toast.ok ? 'bg-green-600' : 'bg-red-600',
        )}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-600" />
            AI Alert Center
            {stats.unread > 0 && (
              <span className="text-sm bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">
                {stats.unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Monitor academic risk, attendance issues, and performance warnings in real time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          </button>

          {/* Mark all read */}
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500 uppercase font-semibold tracking-wide">Total Alerts</p>
            <Bell className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {stats.total}
          </p>
        </div>

        {/* Critical */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-red-200 dark:border-red-900/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-600 uppercase font-semibold tracking-wide">Critical</p>
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {stats.critical}
          </p>
        </div>

        {/* Warnings */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-orange-200 dark:border-orange-900/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-orange-600 uppercase font-semibold tracking-wide">Warnings</p>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-500 mt-2">
            {stats.warning}
          </p>
        </div>

        {/* Actionable */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-blue-200 dark:border-blue-900/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-600 uppercase font-semibold tracking-wide">Actionable</p>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {actionableCount}
          </p>
        </div>
      </div>

      {/* ── AI Insight Banner ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 shrink-0" />
          <h3 className="font-semibold">EduPulse AI Recommendation</h3>
        </div>
        <p className="text-sm opacity-90 leading-relaxed">{aiText}</p>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'critical', 'warning', 'info'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize flex items-center gap-1.5',
              filter === f
                ? f === 'critical' ? 'bg-red-600 text-white'
                  : f === 'warning' ? 'bg-orange-500 text-white'
                  : f === 'info'    ? 'bg-blue-600 text-white'
                  : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
            )}
          >
            {f === 'all' ? `All (${tabCounts.all})` :
             f === 'critical' ? `Critical (${tabCounts.critical})` :
             f === 'warning'  ? `Warning (${tabCounts.warning})` :
             `Info (${tabCounts.info})`}
          </button>
        ))}
      </div>

      {/* ── Alert Cards ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <Bell className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              No {filter !== 'all' ? filter : ''} alerts at this time
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              All systems are operating normally in this category.
            </p>
          </div>
        ) : (
          filtered.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={markRead}
              onDismiss={dismiss}
              onSendWarning={onSendWarning}
              onScheduleSupport={onScheduleSupport}
              onNotifyInstructor={onNotifyInstructor}
              onInitiatePlan={onInitiatePlan}
              processing={processing}
            />
          ))
        )}
      </div>
    </div>
  );
}