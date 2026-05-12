// src/pages/ta/TASchedule.tsx
import { Plus, RefreshCw, Users2, BookOpen, Coffee, Zap } from 'lucide-react';
import { taSchedule } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';

const TYPE_STYLES: Record<string, string> = {
  section: 'border-l-red-500    bg-red-50    dark:bg-red-950/20',
  lecture: 'border-l-blue-500   bg-blue-50   dark:bg-blue-950/20',
  office:  'border-l-green-500  bg-green-50  dark:bg-green-950/20',
  extra:   'border-l-amber-500  bg-amber-50  dark:bg-amber-950/20',
};

const LEGEND = [
  { type: 'section', label: 'Lab Section',    color: 'bg-red-500'   },
  { type: 'lecture', label: 'Doctor Lecture', color: 'bg-blue-500'  },
  { type: 'office',  label: 'Office Hours',   color: 'bg-green-500' },
  { type: 'extra',   label: 'Extra Session',  color: 'bg-amber-500' },
];

const ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TASchedule() {
  const activeDays = ORDER.filter(d => taSchedule.some(e => e.day === d));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Schedule</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Combined calendar — sections, lectures, office hours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => alert('Swap request sent to department!')}>
            <RefreshCw className="w-4 h-4" /> Request Swap
          </Button>
          <Button onClick={() => alert('Add event dialog')}>
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Section Hours"   value="6 hrs/wk" subtitle="Lab teaching"     icon={Users2}  color="red"    />
        <StatCard title="Lecture Hours"   value="4 hrs/wk" subtitle="Assisting doctor" icon={BookOpen} color="blue"   />
        <StatCard title="Office Hours"    value="1 hr/wk"  subtitle="Student support"  icon={Coffee}   color="green"  />
        <StatCard title="Extra Sessions"  value="3 hrs/wk" subtitle="This week"        icon={Zap}      color="orange" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {LEGEND.map(l => (
          <div key={l.type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-xs text-neutral-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Day cards */}
      <div className="space-y-4">
        {activeDays.map(day => (
          <Card key={day} title={day}>
            <div className="space-y-2">
              {taSchedule
                .filter(e => e.day === day)
                .map((e, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${TYPE_STYLES[e.type]}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{e.label}</p>
                      <p className="text-xs text-neutral-500">{e.time} · {e.room}</p>
                    </div>
                    {e.type === 'office' && (
                      <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        ⏰ 15 min reminder
                      </span>
                    )}
                  </div>
                ))
              }
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

