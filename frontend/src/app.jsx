import { Routes, Route, Navigate } from 'react-router-dom';

import { useEffect } from 'react';

import LoginPage from './pages/login.jsx';
import SignupPage from './pages/signup.jsx';
import StudentDashboard from './pages/dashboard-student.jsx';
import TeacherDashboard from './pages/dashboard-teacher.jsx';
import AdminDashboard from './pages/dashboard-admin.jsx';

import Login from './pages/v2/Login.jsx';
import Signup from './pages/v2/Signup.jsx';
import TeacherDash from './pages/v2/TeacherDash.jsx';
import StudentDash from './pages/v2/StudentDash.jsx';
import AdminDash from './pages/v2/AdminDash.jsx';
import Course from './pages/v2/Course.jsx';

function App() {
  useEffect(() => {
    // This tells React to "call" your backend
    fetch('http://localhost:5000/')
      .then(response => response.json())
      .then(data => console.log("Connected to Backend:", data))
      .catch(error => console.error("Connection Failed:", error));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard/student" element={<StudentDashboard />} />
      <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />

      <Route path='/pages/v2/Login' element={<Login />} />
      <Route path='/pages/v2/Signup' element={<Signup />} />
      <Route path='/pages/v2/TeacherDash' element={<TeacherDash />} />
      <Route path='/pages/v2/StudentDash' element={<StudentDash />} />
      <Route path='/pages/v2/AdminDash' element={<AdminDash />} />
      <Route path='/pages/v2/Course' element={<Course />} />
    </Routes>
  );
}

export default App;