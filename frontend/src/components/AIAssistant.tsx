// src/components/AIAssistant.tsx
// NEW: EduPulse AI Assistant floating chat widget.
// Merged from new.txt into the original project.
// Integrated via DashboardLayout — rendered globally for all roles.

import { useState } from 'react';
import { Brain, Send, X, Sparkles } from 'lucide-react';

const starterMessages = [
  {
    role: 'ai',
    text: 'Hi, I am EduPulse AI. Ask me about risks, students, departments, or interventions.',
  },
];

function getAIResponse(message: string) {
  const text = message.toLowerCase();

  if (text.includes('critical') || text.includes('risk')) {
    return 'The highest critical-risk students are Layla Ibrahim and Mohamed Tarek. Both need immediate advisor intervention, tutoring, and weekly attendance monitoring.';
  }

  if (text.includes('layla')) {
    return 'Layla Ibrahim is classified as Critical Risk because her GPA is 1.7, attendance is 48%, and she has 3 failed courses. Recommended action: advisor meeting within 24 hours.';
  }

  if (text.includes('department')) {
    return 'The departments needing attention are AIS and AIE because their pass rates are lower than the college target. BIO and CE are performing better.';
  }

  if (text.includes('intervention')) {
    return 'Recommended intervention: schedule advisor meeting, assign tutoring, monitor attendance weekly, and generate a follow-up report after 7 days.';
  }

  if (text.includes('report')) {
    return 'You can generate an AI Academic Report from the Reports page. It includes KPIs, high-risk students, failing courses, and AI recommendations.';
  }

  return 'EduPulse AI suggests checking risk scores, attendance, GPA trend, failed courses, and department performance before taking action.';
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const [typing, setTyping] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: getAIResponse(userMessage) },
      ]);
      setTyping(false);
    }, 1200);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center justify-center transition-all hover:scale-105"
          title="Open EduPulse AI Assistant"
        >
          <Brain className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">EduPulse AI Assistant</h3>
                <p className="text-xs opacity-80">Academic decision support</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Close AI Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-neutral-950">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-3 py-2 text-sm text-neutral-500">
                  EduPulse AI is typing...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Ask EduPulse AI..."
                className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <button
                onClick={sendMessage}
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Suggestion Buttons */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {['Show critical students', 'Why is Layla critical?', 'Generate intervention'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}