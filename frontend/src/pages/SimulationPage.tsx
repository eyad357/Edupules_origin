import { useState } from 'react';
import { Brain, ArrowRight, TrendingUp, TrendingDown, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { mockStudents, mockRiskAssessments, simulateWhatIf } from '../lib/mockData';
import { cn } from '../lib/utils';
import type { SimulationResult } from '../types';

export function SimulationPage() {
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[1].id); // Bob Smith
  const [newGrade, setNewGrade] = useState(80);
  const [newAttendance, setNewAttendance] = useState(85);
  const [newActivity, setNewActivity] = useState(70);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const student = mockStudents.find(s => s.id === selectedStudent);
  const currentRisk = mockRiskAssessments.find(r => r.student_id === selectedStudent);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const sim = simulateWhatIf(selectedStudent, newGrade);
      // Adjust for attendance and activity
      const attendanceBoost = (newAttendance - 68) * 0.3;
      const activityBoost = (newActivity - 52) * 0.2;
      const totalBoost = attendanceBoost + activityBoost;

      sim.projected_risk.probability = Math.max(5, sim.projected_risk.probability - totalBoost);
      sim.projected_risk.dropout_probability = Math.max(2, sim.projected_risk.dropout_probability - totalBoost * 0.8);
      sim.projected_risk.graduation_delay_likelihood = Math.max(5, sim.projected_risk.graduation_delay_likelihood - totalBoost * 0.7);
      sim.projected_risk.scholarship_eligibility = Math.min(100, sim.projected_risk.scholarship_eligibility + totalBoost * 1.2);
      sim.projected_risk.risk_level = sim.projected_risk.probability < 25 ? 'Normal' : 
        sim.projected_risk.probability < 50 ? 'Low' : 
        sim.projected_risk.probability < 75 ? 'High' : 'Critical';

      setResult(sim);
      setIsSimulating(false);
    }, 1200);
  };

  const resetSimulation = () => {
    setResult(null);
    setNewGrade(80);
    setNewAttendance(85);
    setNewActivity(70);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-600';
    if (change < 0) return 'text-red-600';
    return 'text-neutral-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-full border border-red-100 dark:border-red-900/20 mb-4">
          <Brain className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">What-If Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Simulation Mode</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-lg mx-auto">
          Adjust hypothetical values to see how they would impact a student's risk profile, GPA, and predictions.
        </p>
      </div>

      {/* Input Panel */}
      <Card title="Simulation Parameters" subtitle="Adjust values to predict outcomes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Selector */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => { setSelectedStudent(e.target.value); setResult(null); }}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              {mockStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name} — {s.major} (GPA: {s.gpa})</option>
              ))}
            </select>
          </div>

          {/* Current Stats */}
          <div className="md:col-span-2 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-neutral-500">Current GPA</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{student?.gpa.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Current Risk</p>
                <p className={cn("text-xl font-bold", currentRisk?.probability && currentRisk.probability > 50 ? 'text-red-600' : 'text-neutral-900 dark:text-white')}>
                  {currentRisk?.probability}%
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Risk Level</p>
                <Badge variant={currentRisk?.risk_level.toLowerCase() as any || 'normal'} className="mt-1">
                  {currentRisk?.risk_level}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Projected Grade</label>
              <span className="text-sm font-bold text-red-600">{newGrade}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={newGrade}
              onChange={(e) => { setNewGrade(Number(e.target.value)); setResult(null); }}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Attendance Rate</label>
              <span className="text-sm font-bold text-red-600">{newAttendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={newAttendance}
              onChange={(e) => { setNewAttendance(Number(e.target.value)); setResult(null); }}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Activity Score</label>
              <span className="text-sm font-bold text-red-600">{newActivity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={newActivity}
              onChange={(e) => { setNewActivity(Number(e.target.value)); setResult(null); }}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="btn-primary flex items-center gap-2 px-6"
          >
            {isSimulating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Run Simulation
          </button>
          <button
            onClick={resetSimulation}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Simulation Results</h2>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current */}
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-neutral-400" />
                <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">Current State</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">GPA</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{result.current_gpa.toFixed(2)}</span>
                  </div>
                  <ProgressBar value={result.current_gpa} max={4} size="sm" color="bg-neutral-400" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Risk Probability</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{result.current_risk.probability}%</span>
                  </div>
                  <ProgressBar value={result.current_risk.probability} size="sm" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Dropout Risk</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{result.current_risk.dropout_probability}%</span>
                  </div>
                  <ProgressBar value={result.current_risk.dropout_probability} size="sm" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={result.current_risk.risk_level.toLowerCase() as any}>
                    {result.current_risk.risk_level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Projected */}
            <div className="p-6 rounded-xl border-2 border-red-500 bg-red-50/50 dark:bg-red-900/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-red-700 dark:text-red-400">Projected State</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">GPA</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">{result.projected_gpa.toFixed(2)}</span>
                      <span className={cn("text-xs flex items-center gap-0.5", getChangeColor(result.changes.gpa_change))}>
                        {getChangeIcon(result.changes.gpa_change)}
                        {result.changes.gpa_change >= 0 ? '+' : ''}{result.changes.gpa_change.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={result.projected_gpa} max={4} size="sm" color="bg-red-500" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Risk Probability</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">{result.projected_risk.probability.toFixed(1)}%</span>
                      <span className={cn("text-xs flex items-center gap-0.5", getChangeColor(result.changes.risk_change))}>
                        {getChangeIcon(result.changes.risk_change)}
                        {result.changes.risk_change >= 0 ? '+' : ''}{result.changes.risk_change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={result.projected_risk.probability} size="sm" color="bg-red-500" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500">Dropout Risk</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">{result.projected_risk.dropout_probability.toFixed(1)}%</span>
                      <span className={cn("text-xs flex items-center gap-0.5", getChangeColor(result.changes.dropout_change))}>
                        {getChangeIcon(result.changes.dropout_change)}
                        {result.changes.dropout_change >= 0 ? '+' : ''}{result.changes.dropout_change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar value={result.projected_risk.dropout_probability} size="sm" color="bg-red-500" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={result.projected_risk.risk_level.toLowerCase() as any}>
                    {result.projected_risk.risk_level}
                  </Badge>
                  {result.projected_risk.risk_level !== result.current_risk.risk_level && (
                    <span className="text-xs text-red-600 font-medium">
                      Changed from {result.current_risk.risk_level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Impact Breakdown */}
          <Card title="Impact Breakdown" subtitle="How each factor contributes">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Grades Impact</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{result.projected_risk.grades_impact.toFixed(1)}%</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {result.projected_risk.grades_impact < (result.current_risk.grades_impact || 0) ? '↓ Improved' : '→ Stable'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Attendance Impact</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{result.projected_risk.attendance_impact.toFixed(1)}%</p>
                <p className="text-xs text-neutral-500 mt-1">Based on {newAttendance}% rate</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Activity Impact</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{result.projected_risk.activity_impact.toFixed(1)}%</p>
                <p className="text-xs text-neutral-500 mt-1">Based on {newActivity}% score</p>
              </div>
            </div>
          </Card>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">AI Recommendation</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                If {student?.name} achieves a {newGrade}% grade with {newAttendance}% attendance and {newActivity}% activity score, 
                the risk level would change from <strong>{result.current_risk.risk_level}</strong> to <strong>{result.projected_risk.risk_level}</strong>. 
                {result.projected_risk.risk_level === 'Normal' || result.projected_risk.risk_level === 'Low' 
                  ? 'This represents significant improvement. Recommend maintaining this trajectory.' 
                  : 'While improved, continued intervention is recommended to reach Normal risk levels.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
