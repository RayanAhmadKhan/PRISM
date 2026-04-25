import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Login from "./pages/v2/Login.jsx";

import AdminDash from "./pages/v2/Admin/AdminDash.jsx";
import TeacherDash from "./pages/v2/Instructor/TeacherDash.jsx";
import StudentDash from "./pages/v2/Student/StudentDash.jsx";

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.json())
      .then(data => console.log("Backend Connected:", data))
      .catch(err => console.log("Backend Error:", err));
  }, []);

  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Admin */}
      <Route
        path="/pages/v2/AdminDash"
        element={
          <ProtectedRoute role="admin">
            <AdminDash />
          </ProtectedRoute>
        }
      />

      {/* Teacher */}
      <Route
        path="/pages/v2/TeacherDash"
        element={
          <ProtectedRoute role="instructor">
            <TeacherDash />
          </ProtectedRoute>
        }
      />

      {/* Student */}
      <Route
        path="/pages/v2/StudentDash"
        element={
          <ProtectedRoute role="student">
            <StudentDash />
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;