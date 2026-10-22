/**
 * components/Navbar.jsx — Top Navigation Bar
 * Sleek, distraction-free top bar with live session info and user controls
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, UserCheck, Menu } from 'lucide-react';
import { useNav } from '../context/NavContext';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const { toggleMobileNav } = useNav();
  const { confirm, toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to end your current session and sign out?',
      confirmText: 'Sign Out',
      isDestructive: true,
      onConfirm: () => {
        logout();
        toast.info('You have been signed out successfully.', 'Session Closed');
        navigate('/login');
      },
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-menu-btn"
          onClick={toggleMobileNav}
          aria-label="Open navigation menu"
          id="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>
        <h2 className="navbar-title">{title || 'Dashboard'}</h2>
      </div>

      <div className="navbar-right">
        {/* Date Display */}
        <div className="navbar-date-chip">
          <Calendar size={14} className="navbar-date-icon" />
          <span>{todayStr}</span>
        </div>

        {/* User Identity Chip */}
        <div className="navbar-user-chip">
          <div className="navbar-avatar">{getInitials(user?.name)}</div>
          <div className="navbar-user-details">
            <span className="navbar-user-name">{user?.name || 'Authorized User'}</span>
            <span className="navbar-user-role">{user?.role}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-outline btn-sm navbar-logout-btn"
          onClick={handleLogout}
          id="logout-btn"
          title="Sign out of system"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .app-navbar {
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          height: var(--navbar-height);
          background-color: var(--bg-navbar);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 100;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .navbar-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-primary);
          cursor: pointer;
          flex-shrink: 0;
        }

        .navbar-menu-btn:hover {
          border-color: var(--border-focus);
        }

        .navbar-title {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.015em;
          color: var(--text-primary);
          margin: 0;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .navbar-date-chip {
          display: flex;
          align-items: center;
          gap: 7px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .navbar-date-icon {
          color: var(--text-muted);
        }

        .navbar-user-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 4px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
        }

        .navbar-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .navbar-user-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .navbar-user-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .navbar-user-role {
          font-size: 0.68rem;
          color: var(--primary);
          text-transform: capitalize;
          font-weight: 600;
        }

        .navbar-logout-btn {
          border-color: var(--border);
          color: var(--text-secondary);
        }

        .navbar-logout-btn:hover {
          border-color: var(--danger-border);
          color: var(--danger-text);
          background-color: var(--danger-subtle);
        }

        @media (max-width: 900px) {
          .app-navbar {
            left: 0;
            padding: 0 12px;
          }

          .navbar-menu-btn {
            display: flex;
          }

          .navbar-title {
            font-size: 1rem;
          }

          .navbar-date-chip {
            display: none;
          }

          .navbar-right {
            gap: 8px;
          }

          .navbar-user-details {
            display: none;
          }

          .navbar-user-chip {
            padding: 4px;
            border-radius: 50%;
          }

          .navbar-logout-btn span {
            display: none;
          }

          .navbar-logout-btn {
            padding: 6px 9px;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
