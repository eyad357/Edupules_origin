 // src/types/index.ts
// MODIFIED: Removed 'advisor' from the User role union type.
//           Academic Advisor functionality is now fully merged into the 'ta' (Teaching Assistant) role.

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor' | 'admin' | 'ta';
  avatar?: string;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  major: string;
  year: number;
  gpa: number;
  enrollment_date: string;
  avatar?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor_id: string;
  credits: number;
  semester: string;
  year: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  grade?: number;
  status: 'active' | 'dropped' | 'completed';
}

export interface Attendance {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface ActivityLog {
  id: string;
  student_id: string;
  action: string;
  duration_minutes: number;
  timestamp: string;
}

export interface RiskAssessment {
  id: string;
  student_id: string;
  risk_level: 'Normal' | 'Low' | 'High' | 'Critical';
  probability: number;
  grades_impact: number;
  attendance_impact: number;
  activity_impact: number;
  dropout_probability: number;
  graduation_delay_likelihood: number;
  scholarship_eligibility: number;
  trend: 'stable' | 'improving' | 'declining' | 'sudden_drop';
  assessed_at: string;
}

export interface InterventionPlan {
  id: string;
  student_id: string;
  advisor_id: string;
  title: string;
  description: string;
  actions: InterventionAction[];
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  deadline?: string;
}

export interface InterventionAction {
  id: string;
  description: string;
  completed: boolean;
  completed_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  type: 'risk_alert' | 'intervention' | 'quiz' | 'grade' | 'system';
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  course_id: string;
  duration_minutes: number;
  attempts_limit: number;
  start_time: string;
  end_time: string;
  shuffle_questions: boolean;
  randomize_options: boolean;
  status: 'draft' | 'published' | 'closed';
}

export interface Question {
  id: string;
  quiz_id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  text: string;
  options?: string[];
  correct_answer?: string;
  points: number;
  order_index: number;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  max_score: number;
  submitted_at: string;
  attempt_number: number;
}

export interface DashboardStats {
  total_students: number;
  at_risk_count: number;
  critical_count: number;
  avg_gpa: number;
  attendance_rate: number;
  intervention_count: number;
}

export interface TimeSeriesPoint {
  date: string;
  gpa: number;
  attendance_rate: number;
  activity_score: number;
  risk_score: number;
}

export interface SimulationResult {
  current_gpa: number;
  projected_gpa: number;
  current_risk: RiskAssessment;
  projected_risk: RiskAssessment;
  changes: {
    gpa_change: number;
    risk_change: number;
    dropout_change: number;
  };
}