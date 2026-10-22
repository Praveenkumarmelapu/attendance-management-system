/**
 * pages/teacher/AttendanceHistory.jsx — Faculty Attendance Log & Records
 * Review past session logs and make necessary corrections
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import AttendanceTable from '../../components/AttendanceTable';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { attendanceAPI, classesAPI } from '../../services/api';
import { Filter, RotateCcw, X, History } from 'lucide-react';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ classId: '', date: '', status: '' });

  // Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', remarks: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAttendance();
    fetchMyClasses();
  }, [user]);

  const fetchAttendance = async (params = {}) => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getAll(params);
      setAttendance(res.data.attendance || []);
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClasses = async () => {
    try {
      const res = await classesAPI.getByTeacher(user?._id || 'me');
      setClasses(res.data.classes || []);
    } catch (err) {}
  };

  const applyFilters = () => {
    fetchAttendance({
      classId: filters.classId || undefined,
      date: filters.date || undefined,
      status: filters.status || undefined,
    });
  };

  const clearFilters = () => {
    setFilters({ classId: '', date: '', status: '' });
    fetchAttendance();
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setEditForm({ status: record.status, remarks: record.remarks || '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await attendanceAPI.update(editRecord._id, editForm);
      setShowEditModal(false);
      fetchAttendance({
        classId: filters.classId || undefined,
        date: filters.date || undefined,
        status: filters.status || undefined,
      });
      toast.success('Attendance record updated successfully.', 'Record Updated');
      setSuccessMsg('Attendance record updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', 'Update Error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Attendance History" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Session History & Logs</h1>
              <p className="page-subtitle">Inspect historical attendance logs and make status corrections</p>
            </div>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {/* Filters Bar */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div className="filters-bar">
              <select
                className="form-control"
                style={{ maxWidth: '240px' }}
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              >
                <option value="">All My Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className} ({c.department})
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="form-control"
                style={{ maxWidth: '180px' }}
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />

              <select
                className="form-control"
                style={{ maxWidth: '160px' }}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={applyFilters}
              >
                <Filter size={14} />
                <span>Filter</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearFilters}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Records Table Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Session Records</h3>
                <div className="card-desc">Showing {attendance.length} logged records</div>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <span>Loading session records...</span>
              </div>
            ) : (
              <AttendanceTable records={attendance} onUpdate={handleEdit} />
            )}
          </div>
        </div>
      </div>

      {/* Edit Record Modal */}
      {showEditModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
        >
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Attendance Status</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-control"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Remarks</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Optional note"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
