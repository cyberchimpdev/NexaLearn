import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "teacher") {
    return <Navigate to="/teacher" replace />;
  }

  if (user?.role === "student") {
    return <Navigate to="/student" replace />;
  }

  return <Navigate to="/login" replace />;
}
