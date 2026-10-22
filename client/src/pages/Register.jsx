/**
 * pages/Register.jsx — Portal Registration Page
 * Professional user registration interface
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { ShieldCheck, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      await authAPI.register(submitData);
      setSuccess('Registration successful! Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <div className="register-header">
          <div className="register-icon-box">
            <ShieldCheck size={22} strokeWidth={2.2} />
          </div>
          <h1>Create Institutional Account</h1>
          <p>Register as a student, faculty member, or system administrator</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Full Name</label>
              <div className="input-with-icon">
                <User size={15} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  id="register-name"
                  className="form-control"
                  placeholder="Full Legal Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-role">Account Type</label>
              <select
                name="role"
                id="register-role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Faculty Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  id="register-email"
                  className="form-control"
                  placeholder="user@school.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">Contact Number</label>
              <div className="input-with-icon">
                <Phone size={15} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  id="register-phone"
                  className="form-control"
                  placeholder="+91 9999999999"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div className="input-with-icon">
                <Lock size={15} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  id="register-password"
                  className="form-control"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={15} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  id="register-confirm-password"
                  className="form-control"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="register-submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          Already have an account?{' '}
          <Link to="/login" id="login-link">Sign in here</Link>
        </div>
      </div>

      <style>{`
        .register-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-app);
          padding: 32px 20px;
        }

        .register-card {
          width: 100%;
          max-width: 560px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-xl);
          padding: 36px 32px;
          box-shadow: var(--shadow-md);
        }

        .register-header {
          text-align: center;
          margin-bottom: 26px;
        }

        .register-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--primary-subtle);
          color: var(--primary);
          border: 1px solid var(--primary-border);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .register-header h1 {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 4px;
        }

        .register-header p {
          font-size: 0.85rem;
          color: var(--text-muted);
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

        .register-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Register;
