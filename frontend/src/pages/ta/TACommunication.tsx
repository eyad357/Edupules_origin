// src/pages/ta/TACommunication.tsx
import { useState } from 'react';
import { Send, MessageCircle, Plus } from 'lucide-react';
import { taStudents, taAnnouncements } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

type Tab = 'announcements' | 'forum' | 'dm';

const FORUM = [
  { id: 'f1', author: 'Ahmed Hassan', section: 'Sec 1', question: 'Can you explain tree traversal again?', date: '2025-10-14', replies: 2 },
  { id: 'f2', author: 'Nadia Sami',   section: 'Sec 2', question: 'When is the next quiz?',               date: '2025-10-13', replies: 1 },
];

export function TACommunication() {
  const [tab, setTab]           = useState<Tab>('announcements');
  const [newTitle, setNewTitle] = useState('');
  const [newMsg, setNewMsg]     = useState('');
  const [newSec, setNewSec]     = useState('Both');
  const [dmSearch, setDmSearch] = useState('');

  const priorityStyle: Record<string, string> = {
    high:   'border-red-500   bg-red-50   dark:bg-red-950/20',
    medium: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
    low:    'border-blue-500  bg-blue-50  dark:bg-blue-950/20',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Communication</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Announcements, Q&A forum, and direct messaging</p>
      </div>

      {/* Tab row */}
      <div className="flex gap-2">
        {([['announcements', 'Announcements'], ['forum', 'Q&A Forum'], ['dm', 'Direct Messages']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Announcements ── */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <Card title="Send Announcement">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Target Section</label>
                <select
                  value={newSec}
                  onChange={e => setNewSec(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                >
                  <option value="Both">Both Sections</option>
                  <option value="Sec 1">Sec 1 Only</option>
                  <option value="Sec 2">Sec 2 Only</option>
                </select>
              </div>
              <Input label="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Announcement title…" />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Message</label>
                <textarea
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  rows={4}
                  placeholder="Write your message…"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                />
              </div>
              <Button onClick={() => { alert('Announcement sent!'); setNewTitle(''); setNewMsg(''); }}>
                <Send className="w-4 h-4" /> Send Announcement
              </Button>
            </div>
          </Card>

          <Card title="Recent Announcements">
            <div className="space-y-3">
              {taAnnouncements.map(a => (
                <div key={a.id} className={`p-4 rounded-lg border-l-4 ${priorityStyle[a.priority]}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{a.date} · {a.section}</p>
                    </div>
                    <Badge variant={a.priority === 'high' ? 'critical' : a.priority === 'medium' ? 'warning' : 'info'}>
                      {a.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Forum ── */}
      {tab === 'forum' && (
        <Card title="Section Q&A Forum" subtitle="Students ask questions anonymously without sharing contact info">
          <div className="space-y-3">
            {FORUM.map(q => (
              <div key={q.id} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700">{q.author.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{q.author}</p>
                      <p className="text-xs text-neutral-500">{q.section} · {q.date}</p>
                    </div>
                  </div>
                  <Badge variant="info">{q.replies} replies</Badge>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{q.question}</p>
                <button className="mt-2 text-xs text-red-600 font-medium hover:text-red-700 transition-colors">
                  Reply →
                </button>
              </div>
            ))}
            <Button variant="secondary" className="w-full justify-center">
              <Plus className="w-4 h-4" /> Post to Forum
            </Button>
          </div>
        </Card>
      )}

      {/* ── Direct Messages ── */}
      {tab === 'dm' && (
        <Card title="Direct Messages" subtitle="Message students without sharing phone numbers">
          <div className="mb-4">
            <Input
              placeholder="Search student…"
              value={dmSearch}
              onChange={e => setDmSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            {taStudents
              .filter(s => s.name.toLowerCase().includes(dmSearch.toLowerCase()))
              .map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-red-700">{s.name.charAt(0)}</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-neutral-500">{s.section}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              ))
            }
          </div>
        </Card>
      )}
    </div>
  );
}

