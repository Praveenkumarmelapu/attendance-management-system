/**
 * pages/admin/Students.jsx — Student Roster & Enrollment Management
 * Full CRUD for student accounts, class assignment, and filters
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import { studentsAPI, classesAPI } from '../../services/api';
import { UserPlus, Search, Pencil, Trash2, Users, X, Check } from 'lucide-react';

const Students = () => {
  const { toast, confirm } = useToast();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    section: '',
    classId: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async (params = {}) => {
    setLoading(true);
    try {
      const res = await studentsAPI.getAll(params);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Fetch students error:', err);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents({
        search: search || undefined,
        department: filterDept || undefined,
        year: filterYear || undefined,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, filterDept, filterYear]);

  const openAddModal = () => {
    setEditStudent(null);
    setFormData({
      studentId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      year: '',
      section: '',
      classId: '',
      password: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      department: student.department,
      year: student.year,
      section: student.section || '',
      classId: student.class?._id || '',
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
      if (editStudent) {
        await studentsAPI.update(editStudent._id, formData);
        toast.success(`Profile updated for ${formData.name}.`, 'Student Updated');
        setSuccessMsg('Student profile updated successfully.');
      } else {
        await studentsAPI.create(formData);
        toast.success(`Student ${formData.name} enrolled successfully.`, 'Enrollment Completed');
        setSuccessMsg('Student enrolled successfully.');
      }
      setShowModal(false);
      fetchStudents();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please review the form.';
      toast.error(msg, 'Enrollment Error');
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Student Record',
      message: 'Are you sure you want to delete this student record? This will permanently remove their credentials and attendance history.',
      confirmText: 'Delete Student',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await studentsAPI.delete(id);
          setStudents((prev) => prev.filter((s) => s._id !== id));
          toast.success('Student record removed from system.', 'Student Deleted');
          setSuccessMsg('Student removed from system.');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete student.', 'Delete Error');
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
        <Navbar title="Student Directory" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Student Roster</h1>
              <p className="page-subtitle">Manage student enrollments, academic details, and class assignments</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal} id="add-student-btn">
              <UserPlus size={16} />
              <span>Enroll Student</span>
            </button>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {/* Search & Filter Bar */}
          <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div className="filters-bar">
              <div className="search-bar">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search students by name, ID, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="student-search"
                />
              </div>

              <input
                type="text"
                className="form-control"
                placeholder="Filter department..."
                style={{ maxWidth: '200px' }}
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                id="filter-department"
              />

              <select
                className="form-control"
                style={{ maxWidth: '160px' }}
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                id="filter-year"
              >
                <option value="">All Academic Years</option>
                {['1', '2', '3', '4'].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Enrolled Students</h3>
                <div className="card-desc">Showing {students.length} student records</div>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <span>Loading student records...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon-box">
                  <Users size={26} strokeWidth={1.8} />
                </div>
                <h3>No Students Found</h3>
                <p>No student profiles match your search criteria. Click "Enroll Student" to create a new profile.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '46px', textAlign: 'center' }}>#</th>
                      <th>Student</th>
                      <th>ID Number</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Section</th>
                      <th>Class Assignment</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, i) => (
                      <tr key={student._id}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {i + 1}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <div className="student-name">{student.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {student.email}
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
                            {student.studentId}
                          </code>
                        </td>
                        <td>{student.department}</td>
                        <td>
                          <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                            Year {student.year}
                          </span>
                        </td>
                        <td>{student.section || '—'}</td>
                        <td>
                          {student.class ? (
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {student.class.className}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-icon btn-sm"
                              onClick={() => openEditModal(student)}
                              title="Edit student"
                              id={`edit-student-${student._id}`}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-icon btn-sm"
                              onClick={() => handleDelete(student._id)}
                              title="Delete student"
                              id={`delete-student-${student._id}`}
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

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editStudent ? 'Edit Student Profile' : 'Enroll New Student'}
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

            <form onSubmit={handleSubmit} id="student-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Student ID Number *</label>
                  <input
                    type="text"
                    name="studentId"
                    className="form-control"
                    placeholder="e.g., STU-2024-001"
                    value={formData.studentId}
                    onChange={handleFormChange}
                    required
                    disabled={!!editStudent}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Legal name"
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
                    placeholder="student@school.com"
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

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year *</label>
                  <select
                    name="year"
                    className="form-control"
                    value={formData.year}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Year</option>
                    {['1', '2', '3', '4'].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    name="section"
                    className="form-control"
                    placeholder="e.g., A"
                    value={formData.section}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Class</label>
                  <select
                    name="classId"
                    className="form-control"
                    value={formData.classId}
                    onChange={handleFormChange}
                  >
                    <option value="">No Class Assignment</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className} ({c.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editStudent && (
                <div className="form-group">
                  <label className="form-label">Portal Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Leave blank for default (student123)"
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
                  id="student-submit-btn"
                >
                  {formLoading ? 'Saving...' : editStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
