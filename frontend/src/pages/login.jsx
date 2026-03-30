import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const role = 'student';
    loginUser({ user: { email }, role, rememberMe });
    navigate('/dashboard/student');
  };

  return (
    <div className="app-shell">
      <div className="top-bar">Login Page</div>
      <div className="gradient-background">
        <form onSubmit={handleSubmit} className="auth-card">
          <div className="auth-title-small">Welcome Back to PRISM</div>
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

          <div className="auth-row">
            <label className="checkbox-label">
              <input
                className="checkbox-input"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button type="submit" className="auth-primary-button">
            Login
          </button>

          <div className="auth-secondary-link">Forget Password?</div>

          <div className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

