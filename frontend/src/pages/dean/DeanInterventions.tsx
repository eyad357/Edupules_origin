import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Send,
  TrendingUp,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const interventions = [
  {
    id: 'INT-001',
    student: 'Layla Ibrahim',
    department: 'BIO',
    riskLevel: 'Critical',
    riskScore: 96,
    priority: 'Urgent',
    status: 'In Progress',
    advisor: 'Prof. Hamed Saleh',
    plan: [
      'Immediate advisor meeting within 24 hours',
      'Assign weekly tutoring sessions',
      'Attendance monitoring every week',
      'Review course load and failed subjects',
    ],
    progress: 65,
  },
  {
    id: 'INT-002',
    student: 'Mohamed Tarek',
    department: 'BIO',
    riskLevel: 'Critical',
    riskScore: 89,
    priority: 'Urgent',
    status: 'Pending',
    advisor: 'Dr. Amira Hossam',
    plan: [
      'Schedule academic recovery meeting',
      'Create study improvement plan',
      'Send formal attendance warning',
      'Follow-up after 7 days',
    ],
    progress: 35,
  },
  {
    id: 'INT-003',
    student: 'Fatima Al-Zahra',
    department: 'CS',
    riskLevel: 'High',
    riskScore: 78,
    priority: 'High',
    status: 'Scheduled',
    advisor: 'Dr. Nour Khalid',
    plan: [
      'Bi-weekly advisor check-ins',
      'Enroll in tutoring program',
      'Monitor quiz performance',
      'Send progress report to dean',
    ],
    progress: 50,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function DeanInterventions() {
  const [selected, setSelected] = useState(interventions[0]);
  const [toast, setToast] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const runAiAction = (loadingMessage: string, successMessage: string) => {
    setAiLoading(loadingMessage);

    setTimeout(() => {
      setAiLoading(null);
      showToast(successMessage);
    }, 2200);
  };

  const urgentCount = interventions.filter(i => i.priority === 'Urgent').length;
  const avgProgress = Math.round(
    interventions.reduce((sum, i) => sum + i.progress, 0) / interventions.length
  );

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence>
        {aiLoading && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-2xl text-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="relative mx-auto w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-red-200 dark:border-red-900/40" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin" />

                <div className="absolute inset-3 rounded-full bg-red-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                EduPulse AI
              </h3>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                {aiLoading}
              </p>

              <div className="mt-5 space-y-2">
                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-red-700"
                    initial={{ width: '10%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.1 }}
                  />
                </div>

                <p className="text-xs text-neutral-400">
                  Analyzing academic behavior patterns...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium"
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Brain className="w-7 h-7 text-red-600" />
          AI Interventions
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          AI-generated intervention plans for high-risk students
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={fadeUp}
        transition={{ delay: 0.05 }}
      >
        {[
          { label: 'Active Plans', value: interventions.length, color: 'text-neutral-900 dark:text-white', border: 'border-neutral-200 dark:border-neutral-800' },
          { label: 'Urgent Cases', value: urgentCount, color: 'text-red-600', border: 'border-red-200 dark:border-red-900/40' },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-blue-600', border: 'border-blue-200 dark:border-blue-900/40' },
          { label: 'Expected Success', value: '82%', color: 'text-green-600', border: 'border-green-200 dark:border-green-900/40' },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            className={cn('bg-white dark:bg-neutral-900 rounded-xl border p-4', card.border)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <p className={cn('text-xs uppercase font-semibold', card.color)}>{card.label}</p>
            <p className={cn('text-2xl font-bold mt-2', card.color)}>{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-5 text-white"
        variants={fadeUp}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5" />
          <h3 className="font-semibold">EduPulse AI Recommendation</h3>
        </div>
        <p className="text-sm opacity-90">
          The system recommends prioritizing critical students first, assigning advisor meetings,
          and monitoring attendance weekly until risk scores decrease.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="space-y-3" variants={fadeUp}>
          {interventions.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setSelected(item)}
              className={cn(
                'w-full text-left bg-white dark:bg-neutral-900 rounded-xl border p-4 hover:shadow-md transition-all',
                selected.id === item.id
                  ? 'border-red-500 ring-2 ring-red-500/20'
                  : 'border-neutral-200 dark:border-neutral-800'
              )}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">{item.student}</p>
                  <p className="text-xs text-neutral-500">{item.department} • {item.advisor}</p>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    item.priority === 'Urgent'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                  )}
                >
                  {item.priority}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-500">Progress</span>
                  <span className="font-semibold">{item.progress}%</span>
                </div>

                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {selected.student}
                </h2>
                <p className="text-sm text-neutral-500">
                  {selected.id} • {selected.department} • Advisor: {selected.advisor}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {selected.riskLevel} Risk — {selected.riskScore}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                { icon: AlertTriangle, label: 'Priority', value: selected.priority, color: 'red' },
                { icon: Activity, label: 'Status', value: selected.status, color: 'blue' },
                { icon: TrendingUp, label: 'Recovery Chance', value: '82%', color: 'green' },
              ].map((box, index) => {
                const Icon = box.icon;
                return (
                  <motion.div
                    key={box.label}
                    className={cn(
                      'rounded-xl border p-3',
                      box.color === 'red' && 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40',
                      box.color === 'blue' && 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40',
                      box.color === 'green' && 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40'
                    )}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Icon className={cn(
                      'w-5 h-5 mb-2',
                      box.color === 'red' && 'text-red-600',
                      box.color === 'blue' && 'text-blue-600',
                      box.color === 'green' && 'text-green-600'
                    )} />
                    <p className="text-xs text-neutral-500">{box.label}</p>
                    <p className="font-bold">{box.value}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mb-5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                AI Intervention Plan
              </h3>

              <div className="space-y-2">
                {selected.plan.map((step, index) => (
                  <motion.div
                    key={step}
                    className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Action Timeline
              </h3>

              <div className="space-y-3">
                {[
                  { title: 'Risk detected by AI model', status: 'done' },
                  { title: 'Advisor assigned', status: 'done' },
                  { title: 'Support meeting scheduled', status: 'active' },
                  { title: 'Weekly progress monitoring', status: 'pending' },
                ].map((step, index) => (
                  <motion.div
                    key={step.title}
                    className="flex gap-3"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          step.status === 'done'
                            ? 'bg-green-500'
                            : step.status === 'active'
                              ? 'bg-blue-500'
                              : 'bg-neutral-300'
                        )}
                      />
                      {index !== 3 && <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 mt-1" />}
                    </div>

                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{step.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() =>
                  runAiAction(
                    `EduPulse AI is notifying advisor for ${selected.student}...`,
                    `Advisor notified for ${selected.student}`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Send className="w-4 h-4" />
                Notify Advisor
              </motion.button>

              <motion.button
                onClick={() =>
                  runAiAction(
                    'EduPulse AI is scheduling support meeting...',
                    `Support meeting scheduled for ${selected.student}`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </motion.button>

              <motion.button
                onClick={() =>
                  runAiAction(
                    'EduPulse AI is finalizing intervention plan...',
                    `Plan completed for ${selected.student}`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <CheckCircle className="w-4 h-4" />
                Mark Completed
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}