// src/pages/ta/TAMaterials.tsx
import { useState } from 'react';
import { Upload, Download, Trash2, FileText, Video, X } from 'lucide-react';
import { taMaterials } from '../../lib/taMockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatCard } from '../../components/ui/StatCard';

export function TAMaterials() {
  const [showUpload, setShowUpload] = useState(false);

  const pdfs   = taMaterials.filter(m => m.type === 'pdf');
  const videos = taMaterials.filter(m => m.type === 'video');
  const weeks  = [...new Set(taMaterials.map(m => m.week))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Lab Materials</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manuals, solutions, recordings — organized by week</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4" /> Upload Material
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="PDFs"          value={pdfs.length}   subtitle="Lab documents"   icon={FileText} color="red"   />
        <StatCard title="Videos"        value={videos.length} subtitle="Screen recordings"icon={Video}    color="blue"  />
        <StatCard title="Weeks Covered" value={weeks.length}  subtitle="of 14 total"      icon={FileText} color="green" />
      </div>

      {[1, 2, 3].map(week => {
        const mats = taMaterials.filter(m => m.week === week);
        return (
          <Card key={week} title={`Week ${week}`} subtitle={`${mats.length} material${mats.length !== 1 ? 's' : ''}`}>
            {mats.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">No materials for this week</p>
            ) : (
              <div className="space-y-2">
                {mats.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        m.type === 'video' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {m.type === 'video'
                          ? <Video   className="w-4 h-4 text-blue-600" />
                          : <FileText className="w-4 h-4 text-red-600"  />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{m.title}</p>
                        <p className="text-xs text-neutral-500">Uploaded {m.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{m.type.toUpperCase()}</Badge>
                      <button
                        onClick={() => alert(`Downloading ${m.title}…`)}
                        className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Download className="w-4 h-4 text-neutral-500" />
                      </button>
                      <button
                        onClick={() => alert(`Deleted ${m.title}`)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Upload Material</h3>
              <button onClick={() => setShowUpload(false)}>
                <X className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
              </button>
            </div>
            <div className="space-y-4">
              <Input label="Title" placeholder="e.g. Lab 4 – Graphs" />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Week</label>
                <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none">
                  {Array.from({ length: 14 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Type</label>
                <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none">
                  <option value="pdf">PDF Document</option>
                  <option value="video">Screen Recording</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-red-400 rounded-lg p-8 text-center cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Click to upload or drag & drop</p>
                <p className="text-xs text-neutral-400 mt-1">PDF, MP4 up to 50MB</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 justify-center" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 justify-center" onClick={() => { alert('Uploaded!'); setShowUpload(false); }}>
                  Upload
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

