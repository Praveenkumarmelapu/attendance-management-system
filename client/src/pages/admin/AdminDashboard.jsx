/**
 * pages/admin/AdminDashboard.jsx — Institutional Administrator Dashboard
 * Executive view of students, faculty, classes, and real-time attendance stats
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { attendanceAPI, studentsAPI, teachersAPI, classesAPI } from '../../services/api';
import {
  Users,
  GraduationCap,
  School,
  CheckCircle2,
  BarChart3,
  UserPlus,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAttendance: 0,
    todayPresent: 0,
    overallPercentage: '0.00',
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, studentsRes, teachersRes, classesRes] = await Promise.all([
        attendanceAPI.getStats(),
        studentsAPI.getAll(),
        teachersAPI.getAll(),
        classesAPI.getAll(),
      ]);

      setStats({
        ...statsRes.data.stats,
        totalStudents: studentsRes.data.count,
        totalTeachers: teachersRes.data.count,
        totalClasses: classesRes.data.count,
      });
      setRecentAttendance(statsRes.data.recentAttendance || []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const metricCards = [
    {
      label: 'Enrolled Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'blue',
      action: () => navigate('/admin/students'),
    },
    {
      label: 'Teaching Faculty',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'cyan',
      action: () => navigate('/admin/teachers'),
    },
    {
      label: 'Academic Classes',
      value: stats.totalClasses,
      icon: School,
      color: 'amber',
      action: () => navigate('/admin/classes'),
    },
    {
      label: "Today's Present",
      value: stats.todayPresent,
      icon: CheckCircle2,
      color: 'green',
      action: () => navigate('/admin/attendance'),
    },
    {
      label: 'Institution Rate',
      value: `${stats.overallPercentage}%`,
      icon: BarChart3,
      color: 'blue',
      action: () => navigate('/admin/attendance'),
    },
  ];

  const quickActions = [
    { label: 'Register Student', icon: UserPlus, path: '/admin/students' },
    { label: 'Add Faculty', icon: GraduationCap, path: '/admin/teachers' },
    { label: 'Create Class', icon: PlusCircle, path: '/admin/classes' },
    { label: 'Audit Reports', icon: FileSpreadsheet, path: '/admin/attendance' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Administrator Overview" />
        <div className="page-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>Loading institutional metrics...</span>
            </div>
          ) : (
            <>
              {/* Header greeting banner */}
              <div className="admin-welcome-card">
                <div>
                  <h1 className="welcome-heading">Campus Operations Overview</h1>
                  <p className="welcome-subtext">
                    Monitoring live attendance metrics, department rosters, and student compliance.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/admin/attendance')}
                >
                  <span>View Full Reports</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                {metricCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={i}
                      className="stat-card"
                      onClick={card.action}
                      style={{ cursor: card.action ? 'pointer' : 'default' }}
                    >
                      <div className="stat-card-header">
                        <span className="stat-label">{card.label}</span>
                        <div className={`stat-icon-wrapper ${card.color}`}>
                          <Icon size={18} strokeWidth={2.2} />
                        </div>
                      </div>
                      <div className="stat-value">{card.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Analytics & Actions Grid */}
              <div className="admin-grid-layout">
                {/* Quick Shortcuts */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Operations & Management</h3>
                      <div className="card-desc">Quick navigation to key administration tasks</div>
                    </div>
                  </div>
                  <div className="action-buttons-grid">
                    {quickActions.map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          className="action-button-tile"
                          onClick={() => navigate(action.path)}
                          id={`quick-action-${i}`}
                        >
                          <div className="action-tile-icon">
                            <Icon size={20} strokeWidth={2} />
                          </div>
                          <span className="action-tile-label">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Institution Attendance Rate Breakdown */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Overall Attendance Compliance</h3>
                      <div className="card-desc">Calculated across all historical sessions</div>
                    </div>
                    <span className="compliance-percentage-badge">
                      <TrendingUp size={14} />
                      <span>{stats.overallPercentage}%</span>
                    </span>
                  </div>

                  <div className="compliance-body">
                    <div className="progress-bar" style={{ height: '10px' }}>
                      <div
                        className={`progress-fill ${
                          parseFloat(stats.overallPercentage) >= 75
                            ? 'high'
                            : parseFloat(stats.overallPercentage) >= 50
                            ? 'medium'
                            : 'low'
                        }`}
                        style={{ width: `${Math.min(parseFloat(stats.overallPercentage), 100)}%` }}
                      />
                    </div>

                    <div className="compliance-stats-row">
                      <div className="compliance-stat">
                        <span className="compliance-stat-label">Total Logged</span>
                        <span className="compliance-stat-val">{stats.totalAttendance || 0}</span>
                      </div>
                      <div className="compliance-stat">
                        <span className="compliance-stat-label">Today's Logged</span>
                        <span className="compliance-stat-val">{stats.todayAttendance || 0}</span>
                      </div>
                      <div className="compliance-stat">
                        <span className="compliance-stat-label">Present Today</span>
                        <span className="compliance-stat-val text-success">
                          {stats.todayPresent || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Recent Attendance Activity</h3>
                    <div className="card-desc">Latest submissions recorded by academic faculty</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/admin/attendance')}
                  >
                    <span>View Audit Log</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {recentAttendance.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Recent Attendance</h3>
                    <p>Attendance records will show up here in real time as sessions are marked.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Class</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAttendance.map((rec) => (
                          <tr key={rec._id}>
                            <td>
                              <div className="flex items-center gap-1">
                                <div
                                  className="avatar"
                                  style={{ width: 28, height: 28, fontSize: '0.74rem' }}
                                >
                                  {rec.student?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div className="student-name">{rec.student?.name || 'N/A'}</div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                    {rec.student?.studentId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {rec.class?.className || 'N/A'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.84rem' }}>{formatDate(rec.date)}</td>
                            <td>
                              <span
                                className={`badge ${
                                  rec.status === 'present'
                                    ? 'badge-present'
                                    : rec.status === 'absent'
                                    ? 'badge-absent'
                                    : 'badge-late'
                                }`}
                              >
                                <span className="badge-dot" />
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .admin-welcome-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .welcome-heading {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 4px;
        }

        .welcome-subtext {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin: 0;
        }

        .admin-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .action-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .action-button-tile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background-color: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: inherit;
          text-align: left;
        }

        .action-button-tile:hover {
          border-color: var(--border-focus);
          background-color: var(--bg-card-hover);
          transform: translateY(-1px);
        }

        .action-tile-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background-color: var(--primary-subtle);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-tile-label {
          font-size: 0.86rem;
          font-weight: 600;
        }

        .compliance-percentage-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          background-color: var(--primary-subtle);
          color: var(--primary);
          font-size: 0.85rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .compliance-body {
          padding-top: 10px;
        }

        .compliance-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .compliance-stat {
          display: flex;
          flex-direction: column;
        }

        .compliance-stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .compliance-stat-val {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 2px;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 900px) {
          .admin-grid-layout {
            grid-template-columns: 1fr;
          }
          .admin-welcome-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
