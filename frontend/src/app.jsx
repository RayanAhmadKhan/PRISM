import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Login from "./pages/v2/Login.jsx";

import AdminDash from "./pages/v2/Admin/AdminDash.jsx";
import TeacherDash from "./pages/v2/Instructor/TeacherDash.jsx";
import StudentDash from "./pages/v2/Student/StudentDash.jsx";

const BASE_URL = import.meta.env.VITE_API_URL || "https://prism-backend-iyo3.onrender.com"
console.log("Base URL in ProtectedRoute:", BASE_URL); // Debugging line to check the API URL being used

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
    fetch(`${BASE_URL}/`)
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