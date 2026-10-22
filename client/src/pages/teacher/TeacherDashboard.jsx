/**
 * pages/teacher/TeacherDashboard.jsx — Faculty Overview Dashboard
 * Real-time summary of assigned classes and attendance status
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { classesAPI, attendanceAPI, teachersAPI } from '../../services/api';
import {
  School,
  Users,
  CheckCircle2,
  ClipboardCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myClasses, setMyClasses] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, todayMarked: 0, totalClasses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, [user]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      // 1. Fetch classes for this teacher (backend handles user._id or teacher profile)
      const classRes = await classesAPI.getByTeacher(user?._id || 'me');
      const classes = classRes.data.classes || [];
      setMyClasses(classes);

      const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);

      // 2. Fetch today's records
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await attendanceAPI.getAll({ date: today });
      const todayRecords = attendanceRes.data.attendance || [];

      setStats({
        totalStudents,
        todayMarked: todayRecords.length,
        totalClasses: classes.length,
      });
    } catch (err) {
      console.error('Teacher dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Faculty Workspace" />
        <div className="page-content">
          {/* Welcome Card */}
          <div className="faculty-welcome-banner">
            <div>
              <h1 className="faculty-welcome-title">
                Welcome back, {user?.name || 'Professor'}
              </h1>
              <p className="faculty-welcome-sub">
                Select an assigned class to take roll-call or review attendance compliance.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/teacher/mark-attendance')}
              id="go-mark-attendance"
            >
              <ClipboardCheck size={16} />
              <span>Take Attendance</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Assigned Classes</span>
                <div className="stat-icon-wrapper cyan">
                  <School size={18} />
                </div>
              </div>
              <div className="stat-value">{stats.totalClasses}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Students Enrolled</span>
                <div className="stat-icon-wrapper blue">
                  <Users size={18} />
                </div>
              </div>
              <div className="stat-value">{stats.totalStudents}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Today's Sessions Logged</span>
                <div className="stat-icon-wrapper green">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="stat-value text-success">{stats.todayMarked}</div>
            </div>
          </div>

          {/* Assigned Classes Grid */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Teaching Assignments</h3>
                <div className="card-desc">Classes currently allocated to your schedule</div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/teacher/mark-attendance')}
              >
                <span>Mark Roll Call</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <span>Loading assigned classes...</span>
              </div>
            ) : myClasses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon-box">
                  <School size={26} strokeWidth={1.8} />
                </div>
                <h3>No Classes Assigned</h3>
                <p>You have not been assigned as the faculty advisor for any classes yet. Please reach out to your administrator.</p>
              </div>
            ) : (
              <div className="classes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {myClasses.map((cls) => (
                  <div
                    key={cls._id}
                    className="faculty-class-card"
                    onClick={() => navigate('/teacher/mark-attendance', { state: { selectedClass: cls } })}
                  >
                    <div className="faculty-class-header">
                      <div className="faculty-class-icon">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <div className="faculty-class-title">{cls.className}</div>
                        <div className="faculty-class-sub">{cls.department}</div>
                      </div>
                    </div>

                    <div className="faculty-class-info">
                      <span>Year {cls.year} • Section {cls.section}</span>
                      <span className="faculty-student-count">
                        <Users size={13} />
                        <span>{cls.students?.length || 0} students</span>
                      </span>
                    </div>

                    <div className="faculty-action-hint">
                      <span>Click to mark attendance</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .faculty-welcome-banner {
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

        .faculty-welcome-title {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .faculty-welcome-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin: 0;
        }

        .faculty-class-card {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 18px;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
        }

        .faculty-class-card:hover {
          border-color: var(--border-focus);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .faculty-class-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .faculty-class-icon {
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

        .faculty-class-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .faculty-class-sub {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .faculty-class-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }

        .faculty-student-count {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .faculty-action-hint {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
          font-size: 0.78rem;
          color: var(--primary);
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .faculty-welcome-banner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
