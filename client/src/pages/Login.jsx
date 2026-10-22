/**
 * pages/Login.jsx — Portal Authentication Page
 * Professional, clean institutional sign-in interface
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);

      const redirectMap = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      };
      navigate(redirectMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@school.com', password: 'admin123', label: 'Admin Access' },
    { role: 'Teacher', email: 'teacher@school.com', password: 'teacher123', label: 'Faculty Portal' },
    { role: 'Student', email: 'student@school.com', password: 'student123', label: 'Student Portal' },
  ];

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  return (
    <div className="auth-page">
      {/* Brand Hero Panel (Left) */}
      <div className="auth-brand-panel">
        <div className="brand-hero-content">
          <div className="brand-hero-badge">
            <ShieldCheck size={18} strokeWidth={2.4} />
            <span>EduAttend Platform</span>
          </div>

          <h1 className="brand-hero-title">
            Smart, accurate attendance management for modern institutions.
          </h1>

          <p className="brand-hero-description">
            Streamlined daily roll-call, real-time analytics, and automated compliance records
            tailored for university departments and academic staff.
          </p>

          <div className="brand-hero-features">
            {[
              'One-click multi-student attendance logging',
              'Automated eligibility & 75% threshold tracking',
              'Role-segregated administrative audit controls',
            ].map((text, i) => (
              <div key={i} className="feature-item">
                <CheckCircle2 size={16} className="feature-check" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="brand-hero-footer">
          <span>Enterprise Campus Security • 256-bit Encrypted Session</span>
        </div>
      </div>

      {/* Login Card Panel (Right) */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Please enter your institutional credentials to sign in</p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="demo-credentials-box">
            <div className="demo-header-label">Quick Sign-in (Demo Accounts)</div>
            <div className="demo-chips-grid">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  className="demo-chip-btn"
                  onClick={() => fillDemo(account.email, account.password)}
                >
                  <span className="demo-chip-role">{account.role}</span>
                  <span className="demo-chip-sub">{account.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Institutional Email
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  className="form-control"
                  placeholder="name@school.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  id="login-password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary w-full"
              style={{ marginTop: '12px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-prompt">
            Don't have an account registered?{' '}
            <Link to="/register" id="register-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          background-color: var(--bg-app);
        }

        .auth-brand-panel {
          flex: 1.1;
          background: linear-gradient(180deg, #0e1526 0%, #090d16 100%);
          border-right: 1px solid var(--border);
          padding: 64px 56px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .brand-hero-content {
          max-width: 500px;
          margin-top: auto;
          margin-bottom: auto;
        }

        .brand-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--primary-subtle);
          color: var(--primary);
          border: 1px solid var(--primary-border);
          border-radius: var(--radius-full);
          padding: 5px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-bottom: 24px;
        }

        .brand-hero-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1.22;
          margin-bottom: 16px;
        }

        .brand-hero-description {
          font-size: 0.98rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .brand-hero-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .feature-check {
          color: var(--success);
          flex-shrink: 0;
        }

        .brand-hero-footer {
          font-size: 0.74rem;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }

        .auth-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background-color: var(--bg-app);
        }

        .auth-form-wrapper {
          width: 100%;
          max-width: 410px;
        }

        .auth-form-header {
          margin-bottom: 24px;
        }

        .auth-form-header h2 {
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 6px;
        }

        .auth-form-header p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .demo-credentials-box {
          background-color: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-lg);
          padding: 14px;
          margin-bottom: 22px;
        }

        .demo-header-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .demo-chips-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .demo-chip-btn {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 6px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all var(--transition-fast);
          font-family: inherit;
        }

        .demo-chip-btn:hover {
          border-color: var(--border-focus);
          background-color: var(--bg-card-hover);
        }

        .demo-chip-role {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .demo-chip-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 1px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon .form-control {
          padding-left: 36px;
        }

        .auth-footer-prompt {
          text-align: center;
          margin-top: 24px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .auth-brand-panel {
            display: none;
          }
          .auth-form-panel {
            padding: 32px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
