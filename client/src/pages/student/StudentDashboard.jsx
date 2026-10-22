/**
 * pages/student/StudentDashboard.jsx — Student Personal Attendance Portal
 * Real-time eligibility calculations, compliance status, and recent log
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { studentsAPI, attendanceAPI } from '../../services/api';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  AlertTriangle,
  Award,
  ArrowRight,
  GraduationCap,
  Calendar,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: '0.00',
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch personal student profile
      let myProfile = null;
      try {
        const profileRes = await studentsAPI.getMyProfile();
        myProfile = profileRes.data.student;
      } catch (e) {
        // Fallback
        const studentsRes = await studentsAPI.getAll();
        const allStudents = studentsRes.data.students || [];
        myProfile = allStudents.find(
          (s) =>
            s.email?.toLowerCase() === user?.email?.toLowerCase() ||
            s.userId === user?._id ||
            s._id === user?._id
        );
      }

      if (myProfile) {
        setStudentProfile(myProfile);
      }

      // 2. Fetch student attendance records (backend resolves 'me' or user._id)
      const attendanceRes = await attendanceAPI.getByStudent(myProfile?._id || 'me');
      setStats(
        attendanceRes.data.stats || {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          percentage: '0.00',
        }
      );
      setRecentAttendance((attendanceRes.data.attendance || []).slice(0, 8));
    } catch (err) {
      console.error('Student dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const percentage = parseFloat(stats.percentage);
  const isSafe = percentage >= 75;
  const isWarning = percentage >= 65 && percentage < 75;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Student Dashboard" />
        <div className="page-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>Loading your attendance records...</span>
            </div>
          ) : (
            <>
              {/* Welcome Card */}
              <div className="student-welcome-banner">
                <div>
                  <h1 className="student-welcome-title">
                    Hello, {studentProfile?.name || user?.name || 'Student'}!
                  </h1>
                  <p className="student-welcome-sub">
                    {studentProfile
                      ? `${studentProfile.department} • Year ${studentProfile.year} • Sec ${
                          studentProfile.section || 'General'
                        }`
                      : 'Personal attendance records and examination eligibility tracking'}
                  </p>
                </div>

                {studentProfile?.class && (
                  <div className="student-class-chip">
                    <GraduationCap size={16} />
                    <span>
                      Class Section: <strong>{studentProfile.class.className}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Attendance Progress & Compliance Card */}
              <div className="card" style={{ marginBottom: '22px' }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Attendance Compliance & Exam Eligibility</h3>
                    <div className="card-desc">
                      University statutory requirement is a minimum of 75% attendance
                    </div>
                  </div>

                  <div className="student-percentage-pill">
                    <span className="percentage-number">{stats.percentage}%</span>
                    <span
                      className={`compliance-tag ${
                        isSafe ? 'tag-safe' : isWarning ? 'tag-warn' : 'tag-danger'
                      }`}
                    >
                      {isSafe ? 'Eligible' : isWarning ? 'Shortage Risk' : 'Critical Shortage'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ margin: '14px 0 10px' }}>
                  <div className="progress-bar" style={{ height: '12px' }}>
                    <div
                      className={`progress-fill ${
                        isSafe ? 'high' : isWarning ? 'medium' : 'low'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="progress-scale-labels">
                    <span>0%</span>
                    <span className="scale-target">75% Threshold (Mandatory)</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Status Notice */}
                {!isSafe && (
                  <div className="alert alert-error" style={{ margin: '14px 0 0' }}>
                    <AlertTriangle size={16} />
                    <span>
                      Your attendance is currently below the 75% examination threshold ({stats.percentage}%). Please attend upcoming classes to avoid eligibility restrictions.
                    </span>
                  </div>
                )}

                {isSafe && percentage < 85 && (
                  <div className="alert alert-warning" style={{ margin: '14px 0 0' }}>
                    <CheckCircle2 size={16} />
                    <span>
                      Good standing ({stats.percentage}%). Maintain this rate to ensure uninterrupted exam eligibility.
                    </span>
                  </div>
                )}

                {percentage >= 85 && (
                  <div className="alert alert-success" style={{ margin: '14px 0 0' }}>
                    <Award size={16} />
                    <span>
                      Outstanding attendance ({stats.percentage}%)! You have an exemplary attendance record.
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div
                className="stats-grid"
                style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '22px' }}
              >
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Total Sessions</span>
                    <div className="stat-icon-wrapper blue">
                      <ClipboardList size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{stats.total}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Present Days</span>
                    <div className="stat-icon-wrapper green">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="stat-value text-success">{stats.present}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Absences</span>
                    <div className="stat-icon-wrapper red">
                      <XCircle size={18} />
                    </div>
                  </div>
                  <div className="stat-value text-danger">{stats.absent}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Late / Tardy</span>
                    <div className="stat-icon-wrapper amber">
                      <Clock size={18} />
                    </div>
                  </div>
                  <div className="stat-value text-warning">{stats.late}</div>
                </div>
              </div>

              {/* Recent Attendance Session Table */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Recent Session Log</h3>
                    <div className="card-desc">Your latest roll-call records</div>
                  </div>
                  <Link to="/student/attendance" className="btn btn-outline btn-sm">
                    <span>Full Attendance History</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {recentAttendance.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon-box">
                      <Calendar size={26} strokeWidth={1.8} />
                    </div>
                    <h3>No Sessions Logged Yet</h3>
                    <p>Attendance records will show here once your professors record attendance.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Class Section</th>
                          <th>Status</th>
                          <th>Faculty Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAttendance.map((rec) => (
                          <tr key={rec._id}>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {formatDate(rec.date)}
                            </td>
                            <td>{rec.class?.className || 'General'}</td>
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
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                              {rec.remarks || '—'}
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
        .student-welcome-banner {
          background-color: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .student-welcome-title {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .student-welcome-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin: 0;
        }

        .student-class-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background-color: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .student-class-chip strong {
          color: var(--text-primary);
        }

        .student-percentage-pill {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .percentage-number {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          color: var(--text-primary);
        }

        .compliance-tag {
          font-size: 0.74rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .tag-safe {
          background-color: var(--success-subtle);
          color: var(--success-text);
          border: 1px solid var(--success-border);
        }

        .tag-warn {
          background-color: var(--warning-subtle);
          color: var(--warning-text);
          border: 1px solid var(--warning-border);
        }

        .tag-danger {
          background-color: var(--danger-subtle);
          color: var(--danger-text);
          border: 1px solid var(--danger-border);
        }

        .progress-scale-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .scale-target {
          color: var(--warning-text);
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .student-welcome-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
