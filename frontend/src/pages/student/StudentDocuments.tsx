// src/pages/student/StudentDocuments.tsx
// Document requests, administrative requests, and student profile

import { useState } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Plus, Download, User, Bell } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

type DocTab = 'documents' | 'requests' | 'profile';

const documentRequests = [
  { id: 'DOC-2024-089', type: 'Enrollment Certificate', status: 'ready', requested: 'Oct 1, 2024', completed: 'Oct 3, 2024', note: 'Available for pickup at Registrar, Room A-201' },
  { id: 'DOC-2024-072', type: 'Official Transcript', status: 'processing', requested: 'Sep 28, 2024', completed: null, note: 'Processing in progress. Expected by Oct 7.' },
  { id: 'DOC-2024-051', type: 'Grade Statement – Spring 2024', status: 'ready', requested: 'Sep 10, 2024', completed: 'Sep 12, 2024', note: 'Digital copy available for download.' },
];

const adminRequests = [
  { id: 'REQ-2024-012', type: 'Grade Appeal – MATH101', status: 'under_review', submitted: 'Sep 20', updated: 'Sep 25', priority: 'medium' },
  { id: 'REQ-2024-008', type: 'Course Withdrawal – ENG301', status: 'approved', submitted: 'Sep 5', updated: 'Sep 8', priority: 'high' },
  { id: 'REQ-2024-003', type: 'Semester Study Plan Change', status: 'rejected', submitted: 'Aug 30', updated: 'Sep 2', priority: 'low' },
];

const docTypes = ['Enrollment Certificate', 'Official Transcript', 'Grade Statement', 'Student ID Replacement', 'Graduation Certificate', 'Medical Leave Letter'];
const reqTypes = ['Course Withdrawal', 'Grade Appeal', 'Semester Postponement', 'Department Transfer', 'Complaint / Grievance', 'Accommodation Request'];

const statusMap = {
  ready: { label: 'Ready', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Clock },
  pending: { label: 'Pending', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: Clock },
  under_review: { label: 'Under Review', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Clock },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
};

const studentProfile = {
  personal: {
    fullName: 'Bob Smith',
    arabicName: 'بوب سميث',
    nationalId: '29801234567890',
    dob: 'January 15, 2000',
    nationality: 'Egyptian',
    gender: 'Male',
    phone: '+20 100 234 5678',
    email: 'bob.smith@university.edu',
    address: '45 Tahrir St, Cairo, Egypt',
  },
  academic: {
    studentId: 'STU-20240078',
    major: 'Computer Science',
    faculty: 'Faculty of Engineering',
    year: '3rd Year',
    enrollment: 'Fall 2022',
    advisor: 'Dr. Amr Hassan',
    creditHours: '78 / 130',
    gpa: '3.15',
    status: 'Active',
  },
  emergency: {
    name: 'Mary Smith',
    relation: 'Mother',
    phone: '+20 100 987 6543',
    email: 'mary.smith@gmail.com',
  }
};

export function StudentDocuments() {
  const [tab, setTab] = useState<DocTab>('documents');
  const [showDocForm, setShowDocForm] = useState(false);
  const [showReqForm, setShowReqForm] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedReqType, setSelectedReqType] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowDocForm(false); setShowReqForm(false); setSelectedDocType(''); setSelectedReqType(''); setReqNote(''); }, 2000);
  };

  const tabs: { id: DocTab; label: string }[] = [
    { id: 'documents', label: 'Document Requests' },
    { id: 'requests', label: 'Admin Requests' },
    { id: 'profile', label: 'Student Profile' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Documents & Requests</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Request documents, submit administrative requests, and manage your profile</p>
      </div>

      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}>{t.label}</button>
        ))}
      </div>

      {tab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowDocForm(!showDocForm)}>
              <Plus className="w-4 h-4" />Request Document
            </Button>
          </div>

          {showDocForm && (
            <Card title="New Document Request">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Document Type</label>
                  <select value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                    <option value="">Select a document...</option>
                    {docTypes.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Purpose / Notes (optional)</label>
                  <textarea rows={3} value={reqNote} onChange={e => setReqNote(e.target.value)}
                    placeholder="e.g., Required for bank account opening..."
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" onClick={() => setShowDocForm(false)}>Cancel</Button>
                  <Button variant="primary" disabled={!selectedDocType} onClick={handleSubmit}>
                    {submitted ? '✅ Submitted!' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card title="Your Document Requests">
            <div className="space-y-4">
              {documentRequests.map(req => {
                const cfg = statusMap[req.status as keyof typeof statusMap];
                const Icon = cfg.icon;
                return (
                  <div key={req.id} className="flex items-start justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                        <Icon className={cn('w-5 h-5', cfg.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{req.type}</p>
                        <p className="text-xs text-neutral-500">{req.id} · Requested {req.requested}</p>
                        <p className="text-xs text-neutral-500 mt-1">{req.note}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={req.status === 'ready' ? 'normal' : 'warning'}>{cfg.label}</Badge>
                      {req.status === 'ready' && (
                        <button className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                          <Download className="w-3 h-3" />Download
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowReqForm(!showReqForm)}>
              <Plus className="w-4 h-4" />New Request
            </Button>
          </div>

          {showReqForm && (
            <Card title="New Administrative Request">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Request Type</label>
                  <select value={selectedReqType} onChange={e => setSelectedReqType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
                    <option value="">Select a request type...</option>
                    {reqTypes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Details & Justification</label>
                  <textarea rows={4} value={reqNote} onChange={e => setReqNote(e.target.value)}
                    placeholder="Explain your request in detail..."
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" onClick={() => setShowReqForm(false)}>Cancel</Button>
                  <Button variant="primary" disabled={!selectedReqType} onClick={handleSubmit}>
                    {submitted ? '✅ Submitted!' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card title="Administrative Requests" subtitle="Track status of your submitted requests">
            <div className="space-y-4">
              {adminRequests.map(req => {
                const cfg = statusMap[req.status as keyof typeof statusMap];
                const Icon = cfg.icon;
                return (
                  <div key={req.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{req.type}</p>
                        <p className="text-xs text-neutral-500">{req.id} · Submitted {req.submitted} · Updated {req.updated}</p>
                      </div>
                      <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium', cfg.bg, cfg.color)}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </div>
                    </div>
                    {/* Status Timeline */}
                    <div className="flex items-center gap-1 mt-4">
                      {['Submitted', 'Under Review', req.status === 'rejected' ? 'Rejected' : 'Approved'].map((step, i) => {
                        const done = i === 0 || (i === 1 && ['under_review', 'approved', 'rejected'].includes(req.status)) || (i === 2 && ['approved', 'rejected'].includes(req.status));
                        return (
                          <div key={step} className="flex items-center gap-1 flex-1">
                            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                              done ? (step === 'Rejected' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white') : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                            )}>{done ? (step === 'Rejected' ? '✗' : '✓') : i + 1}</div>
                            <div className={cn('text-xs', done ? 'text-neutral-700 dark:text-neutral-300 font-medium' : 'text-neutral-400')}>{step}</div>
                            {i < 2 && <div className={cn('flex-1 h-px mx-1', done && i < 1 ? 'bg-emerald-400' : 'bg-neutral-200 dark:bg-neutral-700')} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: 'Personal Information', icon: User, data: studentProfile.personal },
            { title: 'Academic Information', icon: FileText, data: studentProfile.academic },
          ].map(section => {
            const Icon = section.icon;
            return (
              <Card key={section.title} title={section.title}>
                <div className="space-y-3">
                  {Object.entries(section.data).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between py-2 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                      <span className="text-xs text-neutral-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 text-right max-w-48">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <Button variant="secondary" className="w-full justify-center text-sm">Edit Information</Button>
                </div>
              </Card>
            );
          })}

          <Card title="Emergency Contact">
            <div className="space-y-3">
              {Object.entries(studentProfile.emergency).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-neutral-50 dark:border-neutral-800 last:border-0">
                  <span className="text-xs text-neutral-500 capitalize">{key}</span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button variant="secondary" className="w-full justify-center text-sm">Update Emergency Contact</Button>
            </div>
          </Card>

          <Card title="Notifications Preferences">
            <div className="space-y-4">
              {[
                { label: 'New grade posted', enabled: true },
                { label: 'Assignment due reminders', enabled: true },
                { label: 'Class cancellation alerts', enabled: true },
                { label: 'Payment due reminders', enabled: true },
                { label: 'University announcements', enabled: false },
                { label: 'Quiz reminders (24hr before)', enabled: true },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{pref.label}</span>
                  <div className={cn('w-10 h-5 rounded-full transition-colors cursor-pointer relative', pref.enabled ? 'bg-red-600' : 'bg-neutral-300 dark:bg-neutral-600')}>
                    <div className={cn('w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform', pref.enabled ? 'translate-x-5' : 'translate-x-0.5')} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}