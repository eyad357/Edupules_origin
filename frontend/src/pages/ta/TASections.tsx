// src/pages/ta/TASections.tsx
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { taStudents, taSections } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function TASections() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Section Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage lab sections and student assignments</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Create Section
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {taSections.map(sec => {
          const students = taStudents.filter(s => s.section === sec.name);
          return (
            <Card key={sec.id} title={sec.name} subtitle={sec.course}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ['Day & Time', `${sec.day} ${sec.time}`],
                  ['Room', sec.room],
                  ['Enrolled / Cap', `${students.length} / ${sec.capacity}`],
                  ['Status', null],
                ].map(([label, value], i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                    <p className="text-xs text-neutral-500">{label}</p>
                    {value
                      ? <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{value}</p>
                      : <Badge variant="active" className="mt-1">Active</Badge>
                    }
                  </div>
                ))}
              </div>

              <ProgressBar value={(students.length / sec.capacity) * 100} />
              <p className="text-xs text-neutral-500 mt-1">
                {Math.round((students.length / sec.capacity) * 100)}% capacity
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Students</p>
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-700">{s.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-neutral-500">{s.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.status}>{s.absencePct}%</Badge>
                      <button className="text-xs text-neutral-400 hover:text-red-600 transition-colors">
                        Transfer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Section Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Create New Section</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
              </button>
            </div>
            <div className="space-y-4">
              <Input label="Section Name" placeholder="e.g. Sec 3" />
              <Input label="Course" placeholder="e.g. CS201 – Data Structures" />
              <Input label="Day & Time" placeholder="e.g. Mon/Wed 13:00" />
              <Input label="Room" placeholder="e.g. Lab 7" />
              <Input label="Capacity" type="number" placeholder="20" />
              <Select label="Enrollment Mode">
                <option>Auto-assign</option>
                <option>Manual only</option>
              </Select>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1 justify-center" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 justify-center" onClick={() => setShowModal(false)}>
                  Create Section
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

