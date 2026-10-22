/**
 * components/Sidebar.jsx — Application Navigation Sidebar
 * Clean, structured navigation with role-based routing and Lucide icons
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BarChart3,
  ClipboardCheck,
  History,
  User,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const navConfig = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
    { path: '/admin/classes', label: 'Classes', icon: School },
    { path: '/admin/attendance', label: 'Attendance Reports', icon: BarChart3 },
  ],
  teacher: [
    { path: '/teacher/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/teacher/mark-attendance', label: 'Mark Attendance', icon: ClipboardCheck },
    { path: '/teacher/history', label: 'Attendance History', icon: History },
  ],
  student: [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/attendance', label: 'My Attendance', icon: BookOpen },
    { path: '/student/profile', label: 'My Profile', icon: User },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const links = navConfig[user?.role] || [];

  const roleLabel = {
    admin: 'Administrator',
    teacher: 'Faculty Member',
    student: 'Student',
  }[user?.role] || 'User';

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ShieldCheck size={20} strokeWidth={2.4} />
        </div>
        <div className="sidebar-brand-text">
          <div className="brand-title">EduAttend</div>
          <div className="brand-sub">Attendance System</div>
        </div>
      </div>

      {/* Role Pill */}
      <div className="sidebar-role-badge">
        <span className="role-dot" />
        <span className="role-text">{roleLabel}</span>
      </div>

      {/* Navigation Group */}
      <div className="sidebar-section-label">MAIN NAVIGATION</div>
      <nav className="sidebar-menu">
        {links.map((link) => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-item-icon">
                <IconComponent size={18} strokeWidth={2} />
              </span>
              <span className="sidebar-item-label">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <div className="footer-status-indicator">
            <span className="live-dot" />
            <span>Online • Verified</span>
          </div>
          <div className="footer-subtext">Enterprise Edition</div>
        </div>
      </div>

      <style>{`
        .app-sidebar {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          width: var(--sidebar-width);
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 200;
          user-select: none;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 20px 18px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sidebar-brand-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .brand-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 2px;
        }

        .sidebar-role-badge {
          margin: 14px 16px 8px;
          padding: 7px 12px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .role-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--primary);
          box-shadow: 0 0 6px var(--primary);
        }

        .role-text {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }

        .sidebar-section-label {
          padding: 16px 20px 6px;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }

        .sidebar-menu {
          flex: 1;
          padding: 6px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          overflow-y: auto;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .sidebar-item:hover {
          background-color: var(--bg-card);
          color: var(--text-primary);
        }

        .sidebar-item.active {
          background-color: var(--primary-subtle);
          color: var(--primary);
          border-color: var(--primary-border);
          font-weight: 600;
        }

        .sidebar-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 14px 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .sidebar-footer-card {
          padding: 10px 12px;
          background-color: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .footer-status-indicator {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.74rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--success);
        }

        .footer-subtext {
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        @media (max-width: 900px) {
          .app-sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
