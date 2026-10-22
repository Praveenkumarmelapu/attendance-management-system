/**
 * pages/student/MyAttendance.jsx — Student Comprehensive Attendance Log
 * Detailed roll-call session records with date range filtering
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import AttendanceTable from '../../components/AttendanceTable';
import { useAuth } from '../../context/AuthContext';
import { studentsAPI, attendanceAPI } from '../../services/api';
import { Filter, RotateCcw, ClipboardList, CheckCircle2, XCircle, Clock } from 'lucide-react';

const MyAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: '0.00' });
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    findAndFetchAttendance();
  }, [user]);

  const findAndFetchAttendance = async () => {
    setLoading(true);
    try {
      let myProfile = null;
      try {
        const profileRes = await studentsAPI.getMyProfile();
        myProfile = profileRes.data.student;
      } catch (e) {
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
        setStudentId(myProfile._id);
        fetchAttendance(myProfile._id);
      } else {
        fetchAttendance('me');
      }
    } catch (err) {
      console.error('Failed to locate profile:', err);
      fetchAttendance('me');
    }
  };

  const fetchAttendance = async (id, params = {}) => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getByStudent(id || studentId, params);
      setAttendance(res.data.attendance || []);
      setStats(res.data.stats || { total: 0, present: 0, absent: 0, late: 0, percentage: '0.00' });
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!studentId) return;
    fetchAttendance(studentId, {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '' });
    if (studentId) fetchAttendance(studentId);
  };

  const percentage = parseFloat(stats.percentage);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Attendance Records" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Personal Attendance Log</h1>
              <p className="page-subtitle">Historical records of your daily attendance across all enrolled classes</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '20px' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Compliance Rate</span>
                <div className="stat-icon-wrapper blue">
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="stat-value" style={{ color: percentage >= 75 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                {stats.percentage}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Classes</span>
                <div className="stat-icon-wrapper blue">
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="stat-value">{stats.total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Present</span>
                <div className="stat-icon-wrapper green">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="stat-value text-success">{stats.present}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Absent</span>
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

          {/* Date Filter Card */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div className="filters-bar">
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={applyFilters}
                >
                  <Filter size={14} />
                  <span>Filter Dates</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={clearFilters}
                >
                  <RotateCcw size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Session Records</h3>
                <div className="card-desc">Showing {attendance.length} entries for your student profile</div>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <span>Loading your records...</span>
              </div>
            ) : (
              <AttendanceTable records={attendance} showStudent={false} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
