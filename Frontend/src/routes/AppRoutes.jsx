import { Route, Routes } from "react-router-dom";

import { Dashboard } from "../pages/Dashboard";
import { Home } from "../pages/Home";

import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";

import { StudentDashboard } from "../pages/student/StudentDashboard";
import { StudentProfile } from "../pages/student/StudentProfile";
import { StudentReports } from "../pages/student/StudentReports";
import { StudentTests } from "../pages/student/StudentTests";
import { TakeTest } from "../pages/student/TakeTest";

import { CreateTest } from "../pages/teacher/CreateTest";
import { TeacherDashboard } from "../pages/teacher/TeacherDashboard";
import { TestReport } from "../pages/teacher/TestReport";
import { AIPlayground } from "../pages/student/AIPlayground";

import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role redirect */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Teacher */}
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/tests/create" element={<CreateTest />} />
        <Route path="/teacher/tests/:testId/report" element={<TestReport />} />
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/tests" element={<StudentTests />} />
        <Route path="/student/tests/:testId" element={<TakeTest />} />
        <Route path="/student/reports" element={<StudentReports />} />
      </Route>
      <Route path="/student/ai" element={<AIPlayground />} />
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/tests" element={<StudentTests />} />
        <Route path="/student/tests/:testId" element={<TakeTest />} />
        <Route path="/student/reports" element={<StudentReports />} />
        <Route path="/student/ai" element={<AIPlayground />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
