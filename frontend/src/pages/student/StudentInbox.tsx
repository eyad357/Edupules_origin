// src/pages/student/StudentInbox.tsx
// Internal messaging system with professors and admin

import { useState } from 'react';
import { Send, Search, Paperclip, ChevronLeft, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

const conversations = [
  {
    id: 1,
    with: 'Dr. Amr Hassan',
    role: 'Professor – CS301',
    avatar: 'AH',
    avatarBg: 'bg-red-600',
    unread: 2,
    messages: [
      { id: 1, from: 'them', text: 'Hello! Just a reminder that Quiz 3 on Dynamic Programming is scheduled for October 8th at 9:30 AM. Please come prepared with the chapter 7 material.', time: '10:15 AM', date: 'Today' },
      { id: 2, from: 'me', text: 'Thank you Dr. Hassan. Should we focus on the memoization approach or all DP techniques?', time: '10:42 AM', date: 'Today' },
      { id: 3, from: 'them', text: 'Focus on top-down (memoization) and bottom-up (tabulation) approaches. Also review the knapsack and LCS problems from the problem sets.', time: '11:05 AM', date: 'Today' },
      { id: 4, from: 'me', text: 'Understood! Will review those. Thank you.', time: '11:10 AM', date: 'Today' },
    ]
  },
  {
    id: 2,
    with: 'Dr. Layla Nour',
    role: 'Professor – CS310',
    avatar: 'LN',
    avatarBg: 'bg-blue-600',
    unread: 0,
    messages: [
      { id: 1, from: 'me', text: 'Dr. Nour, I had trouble understanding the page replacement algorithms in Lecture 6. Could I attend your office hours on Monday?', time: '2:30 PM', date: 'Yesterday' },
      { id: 2, from: 'them', text: 'Of course! Office hours are Monday 2-3 PM in Room 204. Bring your questions and we can go through LRU vs FIFO together.', time: '3:15 PM', date: 'Yesterday' },
    ]
  },
  {
    id: 3,
    with: 'Registrar Office',
    role: 'Administrative Staff',
    avatar: 'RO',
    avatarBg: 'bg-neutral-600',
    unread: 1,
    messages: [
      { id: 1, from: 'them', text: 'Dear Student, your enrollment certificate request (REQ-2024-089) has been processed and is ready for pickup at the Registrar\'s Office (Building A, Floor 2). Office hours: Sunday–Thursday, 9 AM–3 PM.', time: '9:00 AM', date: 'Oct 1' },
    ]
  },
  {
    id: 4,
    with: 'Ahmed Khaled (TA)',
    role: 'Teaching Assistant – CS301',
    avatar: 'AK',
    avatarBg: 'bg-emerald-600',
    unread: 0,
    messages: [
      { id: 1, from: 'me', text: 'Hi Ahmed, could you check my solution for problem set 2, question 4? I\'m getting O(n²) but I think there\'s a better approach.', time: '4:00 PM', date: 'Sep 28' },
      { id: 2, from: 'them', text: 'Sure! Send me your code and I\'ll take a look. Hint: think about using a hash map to reduce the lookup time.', time: '4:45 PM', date: 'Sep 28' },
    ]
  },
];

export function StudentInbox() {
  const [selected, setSelected] = useState<number | null>(1);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(true);

  const conv = conversations.find(c => c.id === selected);
  const filtered = conversations.filter(c =>
    c.with.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (message.trim()) setMessage('');
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Inbox</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Messages with professors, TAs, and administrative staff</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={cn('flex flex-col border-r border-neutral-100 dark:border-neutral-800 w-full md:w-72 shrink-0', !showList && selected && 'hidden md:flex')}>
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.id} onClick={() => { setSelected(c.id); setShowList(false); }}
                  className={cn('w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-50 dark:border-neutral-800/50',
                    selected === c.id && 'bg-red-50 dark:bg-red-900/10 border-l-2 border-l-red-500'
                  )}>
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0', c.avatarBg)}>{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{c.with}</p>
                      {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center shrink-0">{c.unread}</span>}
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{c.role}</p>
                    <p className="text-xs text-neutral-400 truncate">{c.messages[c.messages.length - 1].text}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className={cn('flex-1 flex flex-col', showList && 'hidden md:flex')}>
            {conv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                  <button onClick={() => setShowList(true)} className="md:hidden p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold', conv.avatarBg)}>{conv.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{conv.with}</p>
                    <p className="text-xs text-neutral-500">{conv.role}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
                    <Circle className="w-2 h-2 fill-emerald-500" />Online
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conv.messages.map(msg => (
                    <div key={msg.id} className={cn('flex', msg.from === 'me' && 'justify-end')}>
                      {msg.from === 'them' && (
                        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-0.5', conv.avatarBg)}>{conv.avatar}</div>
                      )}
                      <div>
                        <div className={cn('max-w-xs md:max-w-md rounded-2xl px-4 py-3 text-sm',
                          msg.from === 'me'
                            ? 'bg-red-600 text-white rounded-br-sm'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm'
                        )}>
                          {msg.text}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 px-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className="p-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-neutral-400" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Select a conversation</p>
                  <p className="text-xs text-neutral-400 mt-1">Choose a message thread from the sidebar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}