// src/pages/student/StudentFinancial.tsx
// Financial module: tuition, payments, scholarships, receipts

import { useState } from 'react';
import { CreditCard, Download, CheckCircle2, Clock, AlertCircle, TrendingDown, Gift, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { cn } from '../../lib/utils';

type FinTab = 'overview' | 'payments' | 'scholarships' | 'receipts';

const paymentHistory = [
  { id: 'PAY-2024-001', desc: 'Fall 2024 Tuition – 1st Installment', amount: 8500, date: 'Sep 1, 2024', status: 'paid', method: 'Bank Transfer' },
  { id: 'PAY-2024-002', desc: 'Fall 2024 Tuition – 2nd Installment', amount: 8500, date: 'Oct 1, 2024', status: 'paid', method: 'Online Payment' },
  { id: 'PAY-2024-003', desc: 'Fall 2024 Tuition – 3rd Installment', amount: 8500, date: 'Nov 1, 2024', status: 'upcoming', method: null },
  { id: 'PAY-2023-004', desc: 'Spring 2024 Tuition – Full', amount: 25500, date: 'Feb 1, 2024', status: 'paid', method: 'Bank Transfer' },
  { id: 'PAY-2023-005', desc: 'Fall 2023 Tuition – Full', amount: 25500, date: 'Sep 1, 2023', status: 'paid', method: 'Bank Transfer' },
];

const installments = [
  { label: '1st Installment', amount: 8500, due: 'Sep 1, 2024', paid: true },
  { label: '2nd Installment', amount: 8500, due: 'Oct 1, 2024', paid: true },
  { label: '3rd Installment', amount: 8500, due: 'Nov 1, 2024', paid: false },
];

const scholarships = [
  {
    name: 'Academic Excellence Scholarship',
    amount: 5000,
    status: 'awarded',
    semester: 'Spring 2024',
    criteria: 'GPA ≥ 3.5, Full-time enrollment',
    notes: 'Automatically renewed each semester if criteria are met.'
  },
  {
    name: 'STEM Achievement Grant',
    amount: 3000,
    status: 'pending',
    semester: 'Fall 2024',
    criteria: 'CS/Engineering majors, GPA ≥ 3.2',
    notes: 'Application under review. Expected decision by Oct 15.'
  },
  {
    name: 'Need-Based Financial Aid',
    amount: 7500,
    status: 'ineligible',
    semester: 'Fall 2024',
    criteria: 'Family income < $40,000/yr',
    notes: 'Not eligible based on current financial profile.'
  },
];

export function StudentFinancial() {
  const [tab, setTab] = useState<FinTab>('overview');
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const totalAnnual = 25500;
  const paidSoFar = 17000;
  const remaining = totalAnnual - paidSoFar;
  const nextDue = 'November 1, 2024';

  const tabs: { id: FinTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'payments', label: 'Payment History' },
    { id: 'scholarships', label: 'Scholarships' },
    { id: 'receipts', label: 'Receipts' },
  ];

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); setPaid(true); }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Financial Account</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage tuition payments, scholarships, and financial records</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Balance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Annual Tuition', value: `EGP ${totalAnnual.toLocaleString()}`, icon: DollarSign, color: 'text-neutral-700 dark:text-neutral-300', bg: 'bg-neutral-50 dark:bg-neutral-800' },
              { label: 'Amount Paid', value: `EGP ${paidSoFar.toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
              { label: 'Remaining Balance', value: `EGP ${remaining.toLocaleString()}`, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={cn('rounded-xl border border-neutral-200 dark:border-neutral-800 p-5', item.bg)}>
                  <div className="flex items-center gap-2 mb-3"><Icon className={cn('w-5 h-5', item.color)} /><span className="text-sm text-neutral-500">{item.label}</span></div>
                  <p className={cn('text-2xl font-bold', item.color)}>{item.value}</p>
                </div>
              );
            })}
          </div>

          {/* Payment Progress */}
          <Card title="Tuition Payment Progress" subtitle={`Fall 2024 – Due ${nextDue}`}>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600 dark:text-neutral-400">Paid: EGP {paidSoFar.toLocaleString()}</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{Math.round(paidSoFar / totalAnnual * 100)}%</span>
              </div>
              <ProgressBar value={paidSoFar} max={totalAnnual} size="lg" color="bg-emerald-500" />
            </div>

            <div className="space-y-3">
              {installments.map((inst, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center',
                      inst.paid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                    )}>
                      {inst.paid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{inst.label}</p>
                      <p className="text-xs text-neutral-500">Due: {inst.due}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">EGP {inst.amount.toLocaleString()}</p>
                    {inst.paid ? (
                      <span className="text-xs text-emerald-600 font-medium">Paid</span>
                    ) : paid ? (
                      <span className="text-xs text-emerald-600 font-medium">✅ Just Paid!</span>
                    ) : (
                      <button onClick={handlePay} disabled={paying}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
                        {paying ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">Next payment of <strong>EGP 8,500</strong> is due on <strong>November 1, 2024</strong>. Late payment incurs a 2% penalty.</p>
            </div>
          </Card>
        </div>
      )}

      {tab === 'payments' && (
        <Card title="Payment History" subtitle="All transactions on your account">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paymentHistory.map(p => (
              <div key={p.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                    p.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
                  )}>
                    {p.status === 'paid' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{p.desc}</p>
                    <p className="text-xs text-neutral-500">{p.id} · {p.date}{p.method && ` · ${p.method}`}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">EGP {p.amount.toLocaleString()}</p>
                  <Badge variant={p.status === 'paid' ? 'normal' : 'warning'}>{p.status === 'paid' ? 'Paid' : 'Upcoming'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'scholarships' && (
        <div className="space-y-4">
          {scholarships.map((s, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-neutral-500">{s.semester}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">EGP {s.amount.toLocaleString()}</p>
                  <Badge variant={s.status === 'awarded' ? 'normal' : s.status === 'pending' ? 'warning' : 'critical'}>
                    {s.status === 'awarded' ? '✅ Awarded' : s.status === 'pending' ? '⏳ Pending' : '❌ Ineligible'}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-400">
                <div><span className="font-semibold text-neutral-700 dark:text-neutral-300">Criteria: </span>{s.criteria}</div>
                <div><span className="font-semibold text-neutral-700 dark:text-neutral-300">Notes: </span>{s.notes}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'receipts' && (
        <Card title="Payment Receipts" subtitle="Download official receipts for paid transactions">
          <div className="space-y-3">
            {paymentHistory.filter(p => p.status === 'paid').map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{p.desc}</p>
                  <p className="text-xs text-neutral-500">{p.id} · {p.date} · EGP {p.amount.toLocaleString()}</p>
                </div>
                <button className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Download className="w-4 h-4" />Download
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}