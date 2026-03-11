import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const role = 'student';
    loginUser({ user: { email }, role, rememberMe: false });
    navigate('/dashboard/student');
  };

  return (
    <div className="app-shell">
      <div className="top-bar">Sign Up Page</div>
      <div className="gradient-background">
        <form onSubmit={handleSubmit} className="auth-card">
          <div className="auth-title-small">Create Account</div>
          <div className="auth-title-main">Sign Up with Email</div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email:
            </label>
            <div className="auth-input-wrapper">
              <input
                id="email"
                className="auth-input"
                type="email"
                placeholder="Type your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password:
            </label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                className="auth-input"
                type="password"
                placeholder="Type your Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="auth-primary-button">
            Sign Up
          </button>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;

