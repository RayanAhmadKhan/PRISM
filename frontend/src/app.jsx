import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login.jsx';
import SignupPage from './pages/signup.jsx';
import StudentDashboard from './pages/dashboard-student.jsx';
import TeacherDashboard from './pages/dashboard-teacher.jsx';
import AdminDashboard from './pages/dashboard-admin.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard/student" element={<StudentDashboard />} />
      <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;