// src/pages/student/StudentCareerRoadmap.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Career Compass — Student-only AI-powered career guidance page.
// Integrated into EduGuard's design system (white/red theme, Tailwind,
// Lucide icons, useAuth hook).
//
// API flow:
//   Frontend → POST http://localhost:8000/api/v1/career-roadmap/generate
//            → FastAPI (career_roadmap.py)
//            → Google Gemini 2.5 Flash
//            → JSON result back to frontend
//
// Auth: reads 'eduguard_token' from localStorage (same key used across
//       all EduGuard frontend API calls) and sends as Bearer JWT.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {
  BrainCircuit, Target, BookOpen, ExternalLink, Map,
  Trophy, RefreshCw, PenTool, Loader2, AlertTriangle,
  CheckCircle, GraduationCap, Sparkles,
  ArrowRight, ArrowLeft,
} from 'lucide-react';

// ── Base API URL — mirrors every other EduGuard frontend service call ─────────
const TOKEN_KEY   = 'eduguard_token';
const API_BASE    = (import.meta as any).env?.VITE_FASTAPI_URL ?? 'http://localhost:8000/api/v1';
const ROADMAP_URL = `${API_BASE}/career-roadmap/generate`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface StudentProfile {
  name:            string;
  academicYear:    string;
  favoriteCourses: string[];
  strongestSkills: string[];
  interests:       string[];
  workStyle:       string;
}

interface RoadmapStep {
  title:            string;
  description:      string;
  durationEstimate: string;
}

interface Resource {
  title: string;
  url:   string;
  type:  'Video' | 'Article' | 'Course' | 'Documentation';
}

interface CareerTrack {
  id:          string;
  title:       string;
  description: string;
  matchScore:  number;
  reasoning:   string;
  roadmap:     RoadmapStep[];
  resources:   Resource[];
}

interface RecommendationResponse {
  studentSummary: string;
  tracks:         CareerTrack[];
}

// ── Static option lists ───────────────────────────────────────────────────────

const COURSES_LIST = [
  { id: 'cs_intro',      en: 'Introduction to CS'      },
  { id: 'prog_fund',     en: 'Programming Fundamentals' },
  { id: 'data_struct',   en: 'Data Structures'          },
  { id: 'algo',          en: 'Algorithms'               },
  { id: 'db',            en: 'Database Systems'         },
  { id: 'os',            en: 'Operating Systems'        },
  { id: 'networks',      en: 'Computer Networks'        },
  { id: 'soft_eng',      en: 'Software Engineering'     },
  { id: 'ai',            en: 'Artificial Intelligence'  },
  { id: 'ml',            en: 'Machine Learning'         },
  { id: 'web',           en: 'Web Development'          },
  { id: 'mobile',        en: 'Mobile App Development'   },
  { id: 'graphics',      en: 'Computer Graphics'        },
  { id: 'security',      en: 'Cyber Security'           },
  { id: 'math_discrete', en: 'Discrete Mathematics'     },
  { id: 'math_linear',   en: 'Linear Algebra'           },
];

const SKILLS_LIST = [
  { id: 'python',          en: 'Python'                   },
  { id: 'cpp',             en: 'C++'                      },
  { id: 'java',            en: 'Java'                     },
  { id: 'js',              en: 'JavaScript / TypeScript'  },
  { id: 'react',           en: 'React / Web Frameworks'   },
  { id: 'sql',             en: 'SQL'                      },
  { id: 'git',             en: 'Git & GitHub'             },
  { id: 'problem_solving', en: 'Problem Solving'          },
  { id: 'research',        en: 'Academic Research'        },
  { id: 'design',          en: 'UI / UX Design'           },
  { id: 'linux',           en: 'Linux / Command Line'     },
  { id: 'communication',   en: 'Communication'            },
];

const INTERESTS_LIST = [
  { id: 'web_dev',      en: 'Web Development'       },
  { id: 'mobile_dev',   en: 'Mobile Apps'            },
  { id: 'game_dev',     en: 'Game Development'       },
  { id: 'data_science', en: 'Data Science'           },
  { id: 'ai_ml',        en: 'AI & Machine Learning'  },
  { id: 'cybersec',     en: 'Cyber Security'         },
  { id: 'cloud',        en: 'Cloud Computing'        },
  { id: 'robotics',     en: 'Robotics'               },
  { id: 'ui_ux',        en: 'Product Design (UI/UX)' },
  { id: 'management',   en: 'Project Management'     },
];

const YEAR_OPTIONS = [
  { id: 'freshman',  en: 'Freshman (Year 1)'  },
  { id: 'sophomore', en: 'Sophomore (Year 2)' },
  { id: 'junior',    en: 'Junior (Year 3)'    },
  { id: 'senior',    en: 'Senior (Year 4)'    },
  { id: 'grad',      en: 'Graduate'           },
];

const STYLE_OPTIONS = [
  { id: 'logical',    en: 'Logical & Analytical'     },
  { id: 'creative',   en: 'Creative & Visual'        },
  { id: 'research',   en: 'Research Oriented'        },
  { id: 'product',    en: 'Product Focused'          },
  { id: 'leadership', en: 'Leadership & Management'  },
];

// ── API call — routes through EduGuard FastAPI backend → Gemini ───────────────

async function generateRecommendations(
  profile: StudentProfile,
): Promise<RecommendationResponse> {
  const token = localStorage.getItem(TOKEN_KEY) ?? '';

  const response = await fetch(ROADMAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      name:            profile.name,
      academicYear:    profile.academicYear,
      favoriteCourses: profile.favoriteCourses,
      strongestSkills: profile.strongestSkills,
      interests:       profile.interests,
      workStyle:       profile.workStyle,
    }),
  });

  if (!response.ok) {
    // Try to surface the FastAPI error detail
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.detail ?? `Server returned ${response.status} — check backend logs.`,
    );
  }

  return response.json() as Promise<RecommendationResponse>;
}

// ── MultiSelect chip grid ─────────────────────────────────────────────────────

interface MultiSelectProps {
  options:  { id: string; en: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter(x => x !== id)
        : [...selected, id],
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(opt => {
        const active = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={cn(
              'relative px-3 py-2 rounded-lg text-sm border transition-all duration-200 flex items-center gap-2 text-left',
              active
                ? 'bg-red-600 border-red-700 text-white shadow-sm scale-[1.02]'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20',
            )}
          >
            {active && <CheckCircle className="w-3 h-3 shrink-0" />}
            <span className="font-medium truncate">{opt.en}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Circular match-score gauge ────────────────────────────────────────────────

function CircleScore({ score }: { score: number }) {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-neutral-100 dark:text-neutral-800"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="currentColor" strokeWidth="4"
        />
        <path
          className="text-red-600 transition-all duration-1000 ease-out"
          strokeDasharray={`${score}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="currentColor" strokeWidth="4"
        />
      </svg>
      <span className="absolute text-xs font-bold text-red-600">{score}%</span>
    </div>
  );
}

// ── Resource type icon ────────────────────────────────────────────────────────

const RESOURCE_ICON: Record<string, string> = {
  Video: '🎥', Article: '📄', Course: '🎓', Documentation: '📚',
};

// ── Career track card ─────────────────────────────────────────────────────────

function TrackCard({ track }: { track: CareerTrack }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">

      {/* ── Header ── */}
      <div className="bg-red-50 dark:bg-red-950/20 p-5 border-b border-red-100 dark:border-red-900/30 flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
            {track.title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {track.description}
          </p>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <CircleScore score={track.matchScore} />
          <span className="text-xs font-semibold text-red-600 mt-1">Match</span>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1">

        {/* ── Why it fits ── */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Why this fits you
          </h4>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 leading-relaxed">
            {track.reasoning}
          </p>
        </div>

        {/* ── Learning path ── */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-3 flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5" /> Learning Path
          </h4>
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute top-0 bottom-0 left-2.5 w-0.5 bg-red-100 dark:bg-red-900/30" />
            <div className="space-y-5">
              {track.roadmap.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 border-2 border-red-500 flex items-center justify-center z-10 shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <h5 className="font-bold text-neutral-900 dark:text-white text-sm">
                      {step.title}
                    </h5>
                    <span className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full inline-block mt-0.5 mb-1">
                      {step.durationEstimate}
                    </span>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Free resources ── */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Free Resources
          </h4>
          <div className="space-y-2">
            {track.resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center shrink-0 text-sm">
                  {RESOURCE_ICON[res.type] ?? '🔗'}
                </div>
                <div className="flex-1 ml-3 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-red-700 dark:group-hover:text-red-400 truncate">
                    {res.title}
                  </p>
                  <span className="text-xs text-neutral-400">{res.type}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-red-500 ml-2 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Multi-step form ───────────────────────────────────────────────────────────

interface FormProps {
  initialData: StudentProfile;
  onSubmit:    (data: StudentProfile) => void;
  isLoading:   boolean;
}

function RoadmapForm({ initialData, onSubmit, isLoading }: FormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StudentProfile>(initialData);

  const set = (field: keyof StudentProfile, val: any) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const step1Valid = form.name.trim() !== '' && form.academicYear !== '';
  const step2Valid = form.favoriteCourses.length > 0;
  const step3Valid = form.interests.length > 0 && form.workStyle !== '';

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">

        {/* Progress bar */}
        <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full bg-red-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center gap-2">
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs transition-all',
                  n < step   ? 'bg-red-600 text-white'
                  : n === step ? 'bg-red-100 text-red-600 ring-2 ring-red-600'
                               : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400',
                )}>
                  {n < step ? '✓' : n}
                </span>
                {n < 3 && (
                  <div className={cn(
                    'h-px w-8',
                    n < step ? 'bg-red-600' : 'bg-neutral-200 dark:bg-neutral-700',
                  )} />
                )}
              </div>
            ))}
            <span className="ml-1 font-medium text-neutral-600 dark:text-neutral-300">
              Step {step} of 3
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-5">

          {/* ── Step 1 — Personal Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Who are you?
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Tell us a bit about yourself to personalise your roadmap.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ahmed Khalid"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Academic Year
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {YEAR_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set('academicYear', opt.id)}
                      className={cn(
                        'px-4 py-2.5 rounded-lg text-sm border transition-all font-medium',
                        form.academicYear === opt.id
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20',
                      )}
                    >
                      {opt.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 — Academic Background ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Academic Background
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Which courses have you enjoyed most?
                </p>
              </div>
              <MultiSelect
                options={COURSES_LIST}
                selected={form.favoriteCourses}
                onChange={ids => set('favoriteCourses', ids)}
              />
              {form.favoriteCourses.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Select at least one course to continue.
                </p>
              )}
            </div>
          )}

          {/* ── Step 3 — Skills & Interests ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Skills & Interests
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Help us understand your strengths and passions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Your Top Skills
                </label>
                <MultiSelect
                  options={SKILLS_LIST}
                  selected={form.strongestSkills}
                  onChange={ids => set('strongestSkills', ids)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Tech Fields That Excite You
                </label>
                <MultiSelect
                  options={INTERESTS_LIST}
                  selected={form.interests}
                  onChange={ids => set('interests', ids)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Your Work Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set('workStyle', opt.id)}
                      className={cn(
                        'px-4 py-2.5 rounded-lg text-sm border transition-all text-left font-medium',
                        form.workStyle === opt.id
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20',
                      )}
                    >
                      {opt.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1 || isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                step === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20',
              )}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSubmit(form)}
                disabled={!step3Valid || isLoading}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate My Roadmap
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function StudentCareerRoadmap() {
  const { user } = useAuth();

  const defaultProfile: StudentProfile = {
    name:            user?.name ?? '',
    academicYear:    user?.year === 1 ? 'freshman'
                   : user?.year === 2 ? 'sophomore'
                   : user?.year === 3 ? 'junior'
                   : user?.year === 4 ? 'senior' : '',
    favoriteCourses: [],
    strongestSkills: [],
    interests:       [],
    workStyle:       '',
  };

  const [profile,   setProfile] = useState<StudentProfile | null>(null);
  const [results,   setResults] = useState<RecommendationResponse | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: StudentProfile) => {
    setProfile(data);
    setLoading(true);
    setError(null);
    try {
      const res = await generateRecommendations(data);
      setResults(res);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit      = () => setResults(null);
  const handleStartOver = () => { setResults(null); setProfile(null); setError(null); };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg">
            <BrainCircuit className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full animate-bounce" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
            AI is crafting your roadmap…
          </h3>
          <p className="text-sm text-neutral-500">
            Analysing your profile and finding the best career tracks
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Results view ──────────────────────────────────────────────────────────
  if (results && profile) {
    return (
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-red-600" />
              Your Career Roadmap
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              AI-generated career guidance tailored to your profile
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-red-400 hover:text-red-600 transition-all text-sm font-medium"
            >
              <PenTool className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={handleStartOver}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Start Over
            </button>
          </div>
        </div>

        {/* Summary hero */}
        <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-7 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-red-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4" />
              Profile Summary — {profile.name}
            </div>
            <p className="text-white/95 text-base leading-relaxed">
              {results.studentSummary}
            </p>
          </div>
        </div>

        {/* Career track cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {results.tracks.map(track => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 pb-2">
          These recommendations are generated by AI. Always consult your academic advisor for personalised guidance.
        </p>
      </div>
    );
  }

  // ── Intro + form ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-red-600" />
          AI Career Compass
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Discover tech career tracks perfectly matched to your academic background, skills, and interests.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Target,   title: 'Personalised Tracks',   desc: 'Career paths matched to your unique profile'     },
          { icon: Map,      title: 'Step-by-step Roadmaps', desc: 'Clear milestones from student to professional'   },
          { icon: BookOpen, title: 'Free Resources',        desc: 'Curated learning materials at no cost'           },
        ].map(f => (
          <div
            key={f.title}
            className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{f.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs underline text-red-500 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Multi-step form */}
      <RoadmapForm
        initialData={profile ?? defaultProfile}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

