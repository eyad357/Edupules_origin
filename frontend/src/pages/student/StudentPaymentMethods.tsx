import { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  CheckCircle,
  ShieldCheck,
  Receipt,
  X,
  Upload,
} from 'lucide-react';

const paymentMethods = [
  {
    title: 'Visa / Mastercard',
    description: 'Pay tuition and university fees using your debit or credit card.',
    icon: CreditCard,
    status: 'Available',
    fee: '1.5% service fee',
    time: 'Instant confirmation',
    steps: ['Enter card details', 'Confirm OTP', 'Download receipt'],
  },
  {
    title: 'InstaPay',
    description: 'Use InstaPay for fast local transfers from your bank account.',
    icon: Smartphone,
    status: 'Recommended',
    fee: 'No extra fee',
    time: 'Within 5 minutes',
    steps: ['Open InstaPay app', 'Send to university account', 'Upload transaction reference'],
  },
  {
    title: 'Bank Transfer',
    description: 'Transfer payments directly from your bank account to the university account.',
    icon: Banknote,
    status: 'Available',
    fee: 'Depends on bank',
    time: '1–2 business days',
    steps: ['Copy bank details', 'Make transfer', 'Upload proof of payment'],
  },
];

const initialRecentPayments = [
  { id: 'PAY-1024', item: 'Tuition Fees', method: 'Visa / Mastercard', amount: 'EGP 12,500', status: 'Paid' },
  { id: 'PAY-1025', item: 'Exam Registration', method: 'InstaPay', amount: 'EGP 750', status: 'Pending Review' },
];

type PaymentMethod = typeof paymentMethods[number];

function PaymentModal({
  method,
  onClose,
  onPaymentSuccess,
}: {
  method: PaymentMethod;
  onClose: () => void;
  onPaymentSuccess: (methodTitle: string) => void;
}) {
  const [success, setSuccess] = useState(false);

  const handleConfirm = () => {
    setSuccess(true);
    onPaymentSuccess(method.title);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{method.title}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Complete your payment details
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Payment submitted successfully</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Your payment request has been recorded.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-4">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Amount Due</p>
              <p className="text-2xl font-bold text-red-600 mt-1">EGP 12,500</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Tuition Fees — Spring 2025</p>
            </div>

            {method.title === 'Visa / Mastercard' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {method.title === 'InstaPay' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">InstaPay Mobile Number</label>
                  <input
                    type="text"
                    placeholder="01xxxxxxxxx"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Transaction Reference</label>
                  <input
                    type="text"
                    placeholder="Enter transaction reference number"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-sm">
                  <p className="font-semibold text-neutral-900 dark:text-white">Send to:</p>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-1">edupulse@instapay</p>
                </div>
              </div>
            )}

            {method.title === 'Bank Transfer' && (
              <div className="space-y-3">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-3 text-sm">
                  <p><span className="font-semibold">Account Name:</span> EduPulse University</p>
                  <p><span className="font-semibold">Account Number:</span> 1234567890</p>
                  <p><span className="font-semibold">Bank:</span> National Bank of Egypt</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Transfer Reference</label>
                  <input
                    type="text"
                    placeholder="Enter bank transfer reference"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer hover:border-red-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload proof of payment
                  <input type="file" className="hidden" />
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentPaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [payments, setPayments] = useState(initialRecentPayments);

  const handlePaymentSuccess = (methodTitle: string) => {
    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      item: 'Tuition Fees',
      method: methodTitle,
      amount: 'EGP 12,500',
      status: 'Pending Review',
    };

    setPayments(prev => [newPayment, ...prev]);

    window.dispatchEvent(
      new CustomEvent('edupulse-notification', {
        detail: {
          title: 'Payment Submitted',
          message: `New payment submitted using ${methodTitle}`,
          priority: 'medium',
        },
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Payment Methods</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Manage your available payment options and track recent payments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;

          return (
            <div
              key={method.title}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>

                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  {method.status}
                </span>
              </div>

              <h3 className="font-semibold text-neutral-900 dark:text-white mt-4">{method.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{method.description}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  {method.fee}
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <Clock className="w-4 h-4 text-red-600" />
                  {method.time}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">How to pay:</p>
                <ul className="space-y-1.5">
                  {method.steps.map((step) => (
                    <li key={step} className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedMethod(method)}
                className="w-full mt-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Select Method
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-neutral-900 dark:text-white">Recent Payments</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  {['Payment ID', 'Item', 'Method', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="text-left py-3 text-xs font-semibold text-neutral-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-neutral-50 dark:border-neutral-800/50">
                    <td className="py-3 text-sm font-medium text-neutral-900 dark:text-white">{payment.id}</td>
                    <td className="py-3 text-sm text-neutral-600 dark:text-neutral-300">{payment.item}</td>
                    <td className="py-3 text-sm text-neutral-600 dark:text-neutral-300">{payment.method}</td>
                    <td className="py-3 text-sm font-semibold text-neutral-900 dark:text-white">{payment.amount}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        payment.status === 'Paid'
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/40 p-5">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Bank Account Details</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-neutral-500">Account Name</p>
              <p className="font-semibold text-neutral-900 dark:text-white">EduPulse University</p>
            </div>
            <div>
              <p className="text-neutral-500">Account Number</p>
              <p className="font-semibold text-neutral-900 dark:text-white">1234567890</p>
            </div>
            <div>
              <p className="text-neutral-500">Bank</p>
              <p className="font-semibold text-neutral-900 dark:text-white">National Bank of Egypt</p>
            </div>
          </div>

          <button className="w-full mt-5 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            Copy Bank Details
          </button>
        </div>
      </div>

      {selectedMethod && (
        <PaymentModal
          method={selectedMethod}
          onClose={() => setSelectedMethod(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}