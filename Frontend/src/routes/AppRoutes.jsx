import { Route, Routes } from "react-router-dom";

import { Dashboard } from "../pages/Dashboard";
import { Home } from "../pages/Home";

import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";

import { AIPlayground } from "../pages/student/AIPlayground";
import { AttemptMistakes } from "../pages/student/AttemptMistakes";
import { StudentDashboard } from "../pages/student/StudentDashboard";
import { StudentProfile } from "../pages/student/StudentProfile";
import { StudentReports } from "../pages/student/StudentReports";
import { StudentTests } from "../pages/student/StudentTests";
import { TakeTest } from "../pages/student/TakeTest";

import { AIGenerateTest } from "../pages/teacher/AIGenerateTest";
import { CreateTest } from "../pages/teacher/CreateTest";
import { TeacherDashboard } from "../pages/teacher/TeacherDashboard";
import { TestReport } from "../pages/teacher/TestReport";

import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/tests/create" element={<CreateTest />} />
        <Route path="/teacher/tests/ai-generate" element={<AIGenerateTest />} />
        <Route path="/teacher/tests/:testId/report" element={<TestReport />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/tests" element={<StudentTests />} />
        <Route path="/student/tests/:testId" element={<TakeTest />} />
        <Route path="/student/reports" element={<StudentReports />} />
        <Route
          path="/student/reports/:attemptId"
          element={<AttemptMistakes />}
        />
        <Route path="/student/ai" element={<AIPlayground />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
