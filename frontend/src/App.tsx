// src/App.tsx
// MERGED: New project UI + bundle's Admin/Auth integration
// Added: AdminDataPanel, StudentCareerRoadmap from bundle

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

// ── Dean / Admin ──────────────────────────────────────────────────────────────
import { DeanDashboard }    from './pages/dean/DeanDashboard';
import { DeanStudents }     from './pages/dean/DeanStudents';
import { DeanInstructors }  from './pages/dean/DeanInstructors';
import { DeanAdminStaff }   from './pages/dean/DeanAdminStaff';
import { DeanCourses }      from './pages/dean/DeanCourses';
import { DeanDepartments }  from './pages/dean/DeanDepartments';
import { DeanAttendance }   from './pages/dean/DeanAttendance';
import { DeanExams }        from './pages/dean/DeanExams';
import { DeanAnalytics }    from './pages/dean/DeanAnalytics';
import { DeanAlerts }       from './pages/dean/DeanAlerts';
import { DeanReports }      from './pages/dean/DeanReports';
import { DeanSettings }     from './pages/dean/DeanSettings';
import { DeanInterventions } from './pages/dean/DeanInterventions';
// ── Admin Data Panel (from bundle — DB-powered) ───────────────────────────────
import { AdminDataPanel }   from './pages/AdminDataPanel';

// ── Professor ─────────────────────────────────────────────────────────────────
import { ProfessorDashboard }    from './pages/ProfessorDashboard';
import { MyCourses }             from './pages/professor/MyCourses';
import { ProfessorStudents }     from './pages/professor/ProfessorStudents';
import { RiskHeatmap }           from './pages/professor/RiskHeatmap';
import { ProfessorQuizzes }      from './pages/professor/ProfessorQuizzes';
import { ProfessorSettings }     from './pages/professor/ProfessorSettings';
import { ProfessorAttendance }    from './pages/professor/ProfessorAttendance';
import { ProfessorCommunication } from './pages/professor/ProfessorCommunication';
import { TAManagement }           from './pages/professor/TAManagement';
import { ProfessorReports }       from './pages/professor/ProfessorReports';

// ── Teaching Assistant (+ Advisor merged) ─────────────────────────────────────
import { TADashboard }     from './pages/ta/TADashboard';
import { TASections }      from './pages/ta/TASections';
import { TAAttendance }    from './pages/ta/TAAttendance';
import { TAGrading }       from './pages/ta/TAGrading';
import { TATracking }      from './pages/ta/TATracking';
import { TACommunication } from './pages/ta/TACommunication';
import { TAMaterials }     from './pages/ta/TAMaterials';
import { TAReports }       from './pages/ta/TAReports';
import { TASchedule }      from './pages/ta/TASchedule';

// Advisor inside TA
import { AdvisorStudents }      from './pages/advisor/AdvisorStudents';
import { AdvisorInterventions } from './pages/advisor/AdvisorInterventions';
import { AdvisorProgress }      from './pages/advisor/AdvisorProgress';

// ── Student (FULL SYSTEM) ─────────────────────────────────────────────────────
import { StudentDashboard }     from './pages/StudentDashboard';
import { StudentProgress }      from './pages/student/StudentProgress';
import { StudentCourses }       from './pages/student/StudentCourses';
import { StudentQuizzes }       from './pages/student/StudentQuizzes';
import { StudentSimulation }    from './pages/student/StudentSimulation';
import { StudentFinancial }     from './pages/student/StudentFinancial';
import { StudentInbox }         from './pages/student/StudentInbox';
import { StudentDocuments }     from './pages/student/StudentDocuments';
import { StudentExams }         from './pages/student/StudentExams';
import { StudentAnnouncements } from './pages/student/StudentAnnouncements';
import { StudentPaymentMethods } from './pages/student/StudentPaymentMethods';
// Career Roadmap (from bundle)
import { StudentCareerRoadmap } from './pages/student/StudentCareerRoadmap';

// ── Other ─────────────────────────────────────────────────────────────────────
import { QuizBuilder }    from './pages/QuizBuilder';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound }       from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public ── */}
            <Route path="/auth" element={<AuthPage />} />

            {/* ── Protected ── */}
            <Route element={<DashboardLayout />}>

              {/* ── TA ── */}
              <Route path="/ta"                       element={<TADashboard />} />
              <Route path="/ta/sections"              element={<TASections />} />
              <Route path="/ta/attendance"            element={<TAAttendance />} />
              <Route path="/ta/grading"               element={<TAGrading />} />
              <Route path="/ta/tracking"              element={<TATracking />} />
              <Route path="/ta/communication"         element={<TACommunication />} />
              <Route path="/ta/materials"             element={<TAMaterials />} />
              <Route path="/ta/reports"               element={<TAReports />} />
              <Route path="/ta/schedule"              element={<TASchedule />} />
              <Route path="/ta/my-students"           element={<AdvisorStudents />} />
              <Route path="/ta/interventions"         element={<AdvisorInterventions />} />
              <Route path="/ta/progress"              element={<AdvisorProgress />} />

              {/* ── Admin / Dean ── */}
              <Route path="/admin" element={<Navigate to="/admin/cmd" replace />} />
              <Route path="/admin/cmd"             element={<DeanDashboard />} />
              <Route path="/admin/cmd/students"    element={<DeanStudents />} />
              <Route path="/admin/cmd/instructors" element={<DeanInstructors />} />
              <Route path="/admin/cmd/admin-staff" element={<DeanAdminStaff />} />
              <Route path="/admin/cmd/courses"     element={<DeanCourses />} />
              <Route path="/admin/cmd/departments" element={<DeanDepartments />} />
              <Route path="/admin/cmd/attendance"  element={<DeanAttendance />} />
              <Route path="/admin/cmd/exams"       element={<DeanExams />} />
              <Route path="/admin/cmd/analytics"   element={<DeanAnalytics />} />
              <Route path="/admin/cmd/alerts"      element={<DeanAlerts />} />
              <Route path="/admin/cmd/reports"     element={<DeanReports />} />
              <Route path="/admin/cmd/interventions" element={<DeanInterventions />}/>
              <Route path="/admin/cmd/dsettings"   element={<DeanSettings />} />

              {/* ── Admin Data Panel (DB-powered from bundle) ── */}
              <Route path="/admin/data-panel"      element={<AdminDataPanel />} />

              {/* ── Professor ── */}
              <Route path="/professor"               element={<ProfessorDashboard />} />
              <Route path="/professor/courses"       element={<MyCourses />} />
              <Route path="/professor/students"      element={<ProfessorStudents />} />
              <Route path="/professor/risk"          element={<RiskHeatmap />} />
              <Route path="/professor/quizzes"       element={<ProfessorQuizzes />} />
              <Route path="/professor/settings"      element={<ProfessorSettings />} />
              <Route path="/professor/attendance"    element={<ProfessorAttendance />} />
              <Route path="/professor/communication" element={<ProfessorCommunication />} />
              <Route path="/professor/ta-management" element={<TAManagement />} />
              <Route path="/professor/reports"       element={<ProfessorReports />} />

              {/* ── Student (FULL) ── */}
              <Route path="/student"                element={<StudentDashboard />} />
              <Route path="/student/progress"       element={<StudentProgress />} />
              <Route path="/student/courses"        element={<StudentCourses />} />
              <Route path="/student/quizzes"        element={<StudentQuizzes />} />
              <Route path="/student/simulation"     element={<StudentSimulation />} />
              <Route path="/student/financial"      element={<StudentFinancial />} />
              <Route path="/student/inbox"          element={<StudentInbox />} />
              <Route path="/student/documents"      element={<StudentDocuments />} />
              <Route path="/student/exams"          element={<StudentExams />} />
              <Route path="/student/announcements"  element={<StudentAnnouncements />} />
              <Route path="/student/career-roadmap" element={<StudentCareerRoadmap />} />
              <Route path="/student/payment-methods" element={<StudentPaymentMethods />} />
              {/* legacy */}
              <Route path="/simulation"    element={<StudentSimulation />} />
              <Route path="/quiz/builder"  element={<QuizBuilder />} />
              <Route path="/admin-legacy"  element={<AdminDashboard />} />

            </Route>

            {/* ── Fallback ── */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;