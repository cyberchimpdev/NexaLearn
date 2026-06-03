import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentTests from "./pages/student/StudentTests";
import TakeTest from "./pages/student/TakeTest";
import StudentReports from "./pages/student/StudentReports";
import AttemptMistakes from "./pages/student/AttemptMistakes";
import StudentAI from "./pages/student/StudentAI";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateTest from "./pages/teacher/CreateTest";
import TestReport from "./pages/teacher/TestReport";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/tests" element={<StudentTests />} />
      <Route path="/student/tests/:testId" element={<TakeTest />} />
      <Route path="/student/reports" element={<StudentReports />} />
      <Route
        path="/student/reports/:attemptId/mistakes"
        element={<AttemptMistakes />}
      />
      <Route path="/student/ai" element={<StudentAI />} />

      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/tests/create" element={<CreateTest />} />
      <Route path="/teacher/tests/:testId/report" element={<TestReport />} />

      <Route path="/dashboard" element={<Navigate to="/student" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
