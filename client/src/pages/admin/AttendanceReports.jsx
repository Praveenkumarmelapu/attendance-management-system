/**
 * pages/admin/AttendanceReports.jsx — Attendance Reports & Audit Logs
 * Comprehensive administrative reporting, filtering, and record corrections
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import AttendanceTable from '../../components/AttendanceTable';
import { useToast } from '../../context/ToastContext';
import { attendanceAPI, classesAPI } from '../../services/api';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RotateCcw,
  X,
  ClipboardList,
} from 'lucide-react';

const AttendanceReports = () => {
  const { toast, confirm } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ classId: '', date: '', status: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', remarks: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchClasses();
  }, []);

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

  const fetchClasses = async () => {
    try {
      const res = await classesAPI.getAll();
      setClasses(res.data.classes || []);
    } catch (err) {}
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
      toast.success('Attendance record corrected successfully.', 'Entry Corrected');
      setSuccessMsg('Attendance record corrected successfully.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', 'Correction Failed');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Attendance Record',
      message: 'Are you sure you want to delete this attendance record permanently from the institutional audit log?',
      confirmText: 'Delete Record',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await attendanceAPI.delete(id);
          setAttendance((prev) => prev.filter((a) => a._id !== id));
          toast.success('Attendance record permanently deleted.', 'Record Deleted');
          setSuccessMsg('Record removed from audit log.');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Delete failed', 'Delete Failed');
        }
      },
    });
  };

  // Stats calculation
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const late = attendance.filter((a) => a.status === 'late').length;
  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Attendance Audit Reports" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Attendance Audit & Reports</h1>
              <p className="page-subtitle">Inspect historical logs, review compliance rates, and perform corrections</p>
            </div>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {/* Metric Overview Strip */}
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Logged</span>
                <div className="stat-icon-wrapper blue">
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="stat-value">{total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Present Sessions</span>
                <div className="stat-icon-wrapper green">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="stat-value text-success">{present}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Absences</span>
                <div className="stat-icon-wrapper red">
                  <XCircle size={18} />
                </div>
              </div>
              <div className="stat-value text-danger">{absent}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Tardy / Late</span>
                <div className="stat-icon-wrapper amber">
                  <Clock size={18} />
                </div>
              </div>
              <div className="stat-value text-warning">{late}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div className="filters-bar">
              <select
                name="classId"
                className="form-control"
                style={{ maxWidth: '240px' }}
                value={filters.classId}
                onChange={handleFilterChange}
              >
                <option value="">All Class Sections</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className} ({c.department})
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="date"
                className="form-control"
                style={{ maxWidth: '180px' }}
                value={filters.date}
                onChange={handleFilterChange}
              />

              <select
                name="status"
                className="form-control"
                style={{ maxWidth: '160px' }}
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
                <option value="late">Late Only</option>
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
                <h3 className="card-title">Attendance Records</h3>
                <div className="card-desc">
                  Showing {attendance.length} entries • Overall Attendance Rate: {percentage}%
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <span>Loading report entries...</span>
              </div>
            ) : (
              <AttendanceTable
                records={attendance}
                onUpdate={handleEdit}
                onDelete={handleDelete}
                isAdmin={true}
              />
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
              <h3 className="modal-title">Correct Attendance Entry</h3>
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
                <label className="form-label">Attendance Status *</label>
                <select
                  className="form-control"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late / Tardy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Remarks</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Medical leave, verified note"
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
                  {editLoading ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;
