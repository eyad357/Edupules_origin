// src/pages/professor/ProfessorCommunication.tsx
// NEW: Internal messaging inbox, announcements board, discussion forums, automated alerts
import { useState } from 'react';
import {
  MessageSquare, Bell, Users, Send, Search, Plus, ChevronRight,
  AlertTriangle, Paperclip, CheckCircle, Megaphone, MessagesSquare,
  BookOpen, Star, MoreHorizontal,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const inbox = [
  { id: 'm1', from: 'Ahmed Hassan', course: 'CS301', subject: 'Question about assignment deadline', preview: 'Professor, I was wondering if the deadline for the algorithm analysis report could be extended...', time: '10 min ago', read: false, avatar: 'A' },
  { id: 'm2', from: 'Fatima Ali', course: 'CS301', subject: 'Midterm clarification', preview: 'Could you clarify what topics will be covered in the midterm exam? Specifically regarding graph algorithms...', time: '1 hr ago', read: false, avatar: 'F' },
  { id: 'm3', from: 'Mohamed Ibrahim', course: 'MATH201', subject: 'Office hours request', preview: 'I would like to schedule an office hours meeting to go over my last quiz results...', time: '3 hr ago', read: true, avatar: 'M' },
  { id: 'm4', from: 'Sara Mahmoud', course: 'CS301', subject: 'Code submission issue', preview: 'I am having trouble submitting my code for the graph implementation project. The file upload...', time: '1 day ago', read: true, avatar: 'S' },
  { id: 'm5', from: 'Omar Khalid', course: 'BIO301', subject: 'Lab report format', preview: 'Dear Professor, I need clarification on the format required for the molecular biology lab report...', time: '2 days ago', read: true, avatar: 'O' },
  { id: 'm6', from: 'Nour Adel', course: 'CS301', subject: 'Re: DP homework solution', preview: 'Thank you for your feedback on my dynamic programming solutions. I have revised the approach...', time: '3 days ago', read: true, avatar: 'N' },
];

const forumPosts = [
  {
    id: 'f1', course: 'CS301 – Advanced Algorithms', title: 'How to approach Knapsack problem?',
    author: 'Youssef Samir', time: '2 hr ago', replies: 5, solved: false,
    preview: 'I understand the concept but I am confused about the recursive vs iterative approach...',
  },
  {
    id: 'f2', course: 'CS301 – Advanced Algorithms', title: 'BFS vs DFS — when to use which?',
    author: 'Layla Mostafa', time: '5 hr ago', replies: 8, solved: true,
    preview: 'After the lecture I am still not sure which algorithm to use in which situation...',
  },
  {
    id: 'f3', course: 'MATH201 – Linear Algebra', title: 'Eigenvalues interpretation in real life?',
    author: 'Karim Nasser', time: '1 day ago', replies: 3, solved: false,
    preview: 'Can anyone explain the practical applications of eigenvalues beyond what was covered?',
  },
  {
    id: 'f4', course: 'CS301 – Advanced Algorithms', title: 'Dijkstra implementation — am I correct?',
    author: 'Hana Sayed', time: '2 days ago', replies: 12, solved: true,
    preview: 'I have implemented Dijkstra using a min-heap. Can you verify if my approach is optimal?',
  },
];

const alertTemplates = [
  { id: 'a1', type: 'absence', label: '25% Absence Warning', color: 'text-red-600 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800', icon: AlertTriangle, count: 2 },
  { id: 'a2', type: 'grade', label: 'Low Grade Alert (<60%)', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800', icon: AlertTriangle, count: 3 },
  { id: 'a3', type: 'exam', label: 'Upcoming Exam Reminder', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800', icon: Bell, count: 32 },
  { id: 'a4', type: 'assignment', label: 'Assignment Due Reminder', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800', icon: Bell, count: 28 },
];

// ─── Inbox Tab ─────────────────────────────────────────────────────────────────
function InboxTab() {
  const [selectedMsg, setSelectedMsg] = useState(inbox[0]);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [msgs, setMsgs] = useState(inbox);

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filtered = msgs.filter(m =>
    m.from.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!reply.trim()) return;
    showMsg(`Reply sent to ${selectedMsg.from}`);
    setReply('');
    setMsgs(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, read: true } : m));
  };

  return (
    <div className="flex gap-4 h-[600px]">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}

      {/* Message list */}
      <div className="w-80 shrink-0 flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
          {filtered.map(msg => (
            <button
              key={msg.id}
              onClick={() => setSelectedMsg(msg)}
              className={cn(
                'w-full text-left p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                selectedMsg.id === msg.id && 'bg-red-50 dark:bg-red-900/10',
                !msg.read && 'border-l-2 border-red-500'
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400">{msg.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn('text-xs font-semibold', !msg.read ? 'text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400')}>{msg.from}</p>
                    <span className="text-xs text-neutral-400">{msg.time}</span>
                  </div>
                  <p className={cn('text-xs truncate mt-0.5', !msg.read ? 'font-medium text-neutral-800 dark:text-neutral-200' : 'text-neutral-500')}>{msg.subject}</p>
                  <p className="text-xs text-neutral-400 truncate">{msg.preview}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message detail */}
      <div className="flex-1 flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{selectedMsg.subject}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">From: {selectedMsg.from} · {selectedMsg.course} · {selectedMsg.time}</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{selectedMsg.preview} Please advise when you are available. Thank you for your time and patience, Professor.</p>
          </div>
        </div>
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <textarea
                rows={3}
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder={`Reply to ${selectedMsg.from}...`}
                className="w-full px-3 pt-3 text-sm text-neutral-900 dark:text-white bg-transparent focus:outline-none resize-none"
              />
              <div className="px-3 py-2 flex items-center gap-2">
                <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              className="p-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Forum Tab ─────────────────────────────────────────────────────────────────
function ForumTab() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const courses = ['all', 'CS301 – Advanced Algorithms', 'MATH201 – Linear Algebra', 'BIO301 – Molecular Biology'];
  const filtered = selectedCourse === 'all' ? forumPosts : forumPosts.filter(p => p.course === selectedCourse);

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {courses.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCourse(c)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              selectedCourse === c ? 'bg-red-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            {c === 'all' ? 'All Courses' : c.split('–')[0].trim()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(post => (
          <div key={post.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{post.author[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{post.title}</h4>
                      {post.solved && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Answered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{post.author} · {post.course} · {post.time}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{post.preview}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
                  <MessagesSquare className="w-3.5 h-3.5" /> {post.replies}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setReplyId(replyId === post.id ? null : post.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Reply as Professor
                </button>
                {!post.solved && (
                  <button
                    onClick={() => showMsg('Post marked as answered')}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Mark as Answered
                  </button>
                )}
              </div>
            </div>
            {replyId === post.id && (
              <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setReplyId(null)} className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700">Cancel</button>
                  <button
                    onClick={() => { showMsg('Reply posted'); setReplyId(null); setReplyText(''); }}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <Send className="w-3 h-3" /> Post Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Alerts Tab ────────────────────────────────────────────────────────────────
function AlertsTab() {
  const [toast, setToast] = useState<string | null>(null);
  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const [customMsg, setCustomMsg] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [targetCourse, setTargetCourse] = useState('CS301');

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">✓ {toast}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {alertTemplates.map(a => {
          const Icon = a.icon;
          return (
            <div key={a.id} className={cn('border rounded-xl p-4', a.color)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{a.count} students will receive this</p>
                  </div>
                </div>
                <button
                  onClick={() => showMsg(`${a.label} sent to ${a.count} students`)}
                  className="px-3 py-1 rounded-lg bg-white/80 dark:bg-neutral-900/50 text-xs font-medium hover:bg-white dark:hover:bg-neutral-900 transition-colors"
                >
                  Send Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom alert */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Send Custom Alert</h3>
        <div>
          <label className="text-xs font-medium text-neutral-500 block mb-1">Target Course</label>
          <select
            value={targetCourse}
            onChange={e => setTargetCourse(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none"
          >
            {['CS301 – Advanced Algorithms', 'MATH201 – Linear Algebra', 'All Courses'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 block mb-1">Alert Title</label>
          <input
            value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
            placeholder="e.g. Important: Quiz Postponed"
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 block mb-1">Message</label>
          <textarea
            rows={4}
            value={customMsg}
            onChange={e => setCustomMsg(e.target.value)}
            placeholder="Write your alert message..."
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
          />
        </div>
        <button
          onClick={() => { if (customTitle && customMsg) { showMsg('Custom alert sent to all students in ' + targetCourse); setCustomTitle(''); setCustomMsg(''); } }}
          className="w-full py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <Megaphone className="w-4 h-4" /> Send Alert
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Tab = 'inbox' | 'forum' | 'alerts';

export function ProfessorCommunication() {
  const [tab, setTab] = useState<Tab>('inbox');
  const unread = inbox.filter(m => !m.read).length;

  const tabs = [
    { id: 'inbox' as Tab, label: 'Inbox', icon: MessageSquare, badge: unread },
    { id: 'forum' as Tab, label: 'Discussion Forum', icon: MessagesSquare },
    { id: 'alerts' as Tab, label: 'Alerts & Automation', icon: Bell },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Communication</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">Messaging, discussion forums, and automated student alerts</p>
      </div>

      <div className="flex gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all relative',
                tab === t.id ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <Icon className="w-4 h-4" /> {t.label}
              {t.badge ? (
                <span className="ml-1 w-4 h-4 rounded-full bg-white text-red-600 text-xs font-bold flex items-center justify-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === 'inbox' && <InboxTab />}
      {tab === 'forum' && <ForumTab />}
      {tab === 'alerts' && <AlertsTab />}
    </div>
  );
}