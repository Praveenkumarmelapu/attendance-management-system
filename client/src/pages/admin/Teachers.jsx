/**
 * pages/admin/Teachers.jsx — Teaching Faculty Directory & Management
 * Full CRUD for faculty profiles and user accounts
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import { teachersAPI } from '../../services/api';
import { UserPlus, Search, Pencil, Trash2, GraduationCap, X } from 'lucide-react';

const Teachers = () => {
  const { toast, confirm } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await teachersAPI.getAll(params);
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error('Fetch teachers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers({ search: search || undefined });
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setEditTeacher(null);
    setFormData({
      teacherId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      password: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setEditTeacher(teacher);
    setFormData({
      teacherId: teacher.teacherId,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      department: teacher.department,
      password: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editTeacher) {
        await teachersAPI.update(editTeacher._id, formData);
        toast.success(`Faculty profile updated for ${formData.name}.`, 'Faculty Updated');
        setSuccessMsg('Faculty profile updated successfully.');
      } else {
        await teachersAPI.create(formData);
        toast.success(`Faculty member ${formData.name} registered.`, 'Faculty Added');
        setSuccessMsg('Faculty member added successfully.');
      }
      setShowModal(false);
      fetchTeachers();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please review the inputs.';
      toast.error(msg, 'Faculty Error');
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Remove Faculty Member',
      message: 'Are you sure you want to remove this faculty member? They will lose access to classes and attendance management.',
      confirmText: 'Remove Faculty',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await teachersAPI.delete(id);
          setTeachers((prev) => prev.filter((t) => t._id !== id));
          toast.success('Faculty member removed from directory.', 'Faculty Removed');
          setSuccessMsg('Faculty member removed.');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete faculty member.', 'Delete Error');
        }
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

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Faculty Directory" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Teaching Faculty</h1>
              <p className="page-subtitle">Manage faculty records, department assignments, and credentials</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal} id="add-teacher-btn">
              <UserPlus size={16} />
              <span>Add Faculty</span>
            </button>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {/* Search Filter Bar */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search faculty by name, ID number, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="teacher-search"
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Academic Faculty Staff</h3>
                <div className="card-desc">Showing {teachers.length} active faculty profiles</div>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <span>Loading faculty profiles...</span>
              </div>
            ) : teachers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon-box">
                  <GraduationCap size={26} strokeWidth={1.8} />
                </div>
                <h3>No Faculty Profiles Found</h3>
                <p>No faculty members match your criteria. Add your first faculty member above.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '46px', textAlign: 'center' }}>#</th>
                      <th>Faculty Member</th>
                      <th>Teacher ID</th>
                      <th>Department</th>
                      <th>Contact Phone</th>
                      <th>Joined Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, i) => (
                      <tr key={teacher._id}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {i + 1}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                              {getInitials(teacher.name)}
                            </div>
                            <div>
                              <div className="student-name">{teacher.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                          }}>
                            {teacher.teacherId}
                          </code>
                        </td>
                        <td>{teacher.department}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{teacher.phone || '—'}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {new Date(teacher.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-icon btn-sm"
                              onClick={() => openEditModal(teacher)}
                              title="Edit faculty profile"
                              id={`edit-teacher-${teacher._id}`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-icon btn-sm"
                              onClick={() => handleDelete(teacher._id)}
                              title="Delete faculty member"
                              id={`delete-teacher-${teacher._id}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editTeacher ? 'Edit Faculty Member' : 'Add New Faculty Member'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSubmit} id="teacher-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Teacher ID *</label>
                  <input
                    type="text"
                    name="teacherId"
                    className="form-control"
                    placeholder="e.g., TCH-012"
                    value={formData.teacherId}
                    onChange={handleFormChange}
                    required
                    disabled={!!editTeacher}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Prof. / Dr. Full Name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="teacher@school.com"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+91 9999999999"
                    value={formData.phone}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  placeholder="e.g., Computer Science & Engineering"
                  value={formData.department}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {!editTeacher && (
                <div className="form-group">
                  <label className="form-label">Portal Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Leave blank for default (teacher123)"
                    value={formData.password}
                    onChange={handleFormChange}
                  />
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                  id="teacher-submit-btn"
                >
                  {formLoading ? 'Saving...' : editTeacher ? 'Save Changes' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
