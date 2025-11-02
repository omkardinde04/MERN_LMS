import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import { initializeMockData } from './utils/mockData';

// Pages
import Login from './pages/Login';
import EnrollPage from './pages/EnrollPage';

// Student Pages
import StudentLayout from './pages/student/StudentLayout';
import StudentHome from './pages/student/HomePage';
import StudentCourses from './pages/student/CoursesPage';
import StudentAssignments from './pages/student/AssignmentsPage';
import StudentCodingZone from './pages/student/CodingZonePage';
import StudentGrades from './pages/student/GradesPage';
import StudentCalendar from './pages/student/CalendarPage';
import StudentFeedback from './pages/student/FeedbackPage';
import StudentQuizzes from './pages/student/QuizzesPage';
import StudentSettings from './pages/student/SettingsPage';
import StudentTimetable from './pages/student/TimetablePage';

// Faculty Pages
import FacultyLayout from './pages/faculty/FacultyLayout';
import FacultyHome from './pages/faculty/HomePage';
import FacultyCourses from './pages/faculty/CoursesPage';
import FacultyTimetable from './pages/faculty/TimetablePage';
import FacultyStudents from './pages/faculty/StudentsPage';
import FacultyAssignments from './pages/faculty/AssignmentsPage';
import FacultyFeedback from './pages/faculty/FeedbackPage';
import FacultyAIQuiz from './pages/faculty/AIQuizPage';
import FacultySettings from './pages/faculty/SettingsPage';
import FacultyCodeSubmissions from './pages/faculty/CodeSubmissionsPage';
import FacultyCreateAssignment from './pages/faculty/CreateAssignmentPage';

function App() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/enroll/:enrollmentCode" element={<EnrollPage />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentHome />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="coding-zone" element={<StudentCodingZone />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="feedback" element={<StudentFeedback />} />
            <Route path="quizzes" element={<StudentQuizzes />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>

          {/* Faculty Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FacultyHome />} />
            <Route path="courses" element={<FacultyCourses />} />
            <Route path="timetable" element={<FacultyTimetable />} />
            <Route path="students" element={<FacultyStudents />} />
            <Route path="assignments" element={<FacultyAssignments />} />
            <Route path="feedback" element={<FacultyFeedback />} />
            <Route path="ai-quiz" element={<FacultyAIQuiz />} />
            <Route path="code-submissions" element={<FacultyCodeSubmissions />} />
            <Route path="create-assignment" element={<FacultyCreateAssignment />} />
            <Route path="settings" element={<FacultySettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
