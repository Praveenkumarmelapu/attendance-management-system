/**
 * pages/admin/Classes.jsx — Class Roster & Section Management
 * Manage classes, faculty assignments, and section enrollment
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import { classesAPI, teachersAPI } from '../../services/api';
import { PlusCircle, School, Pencil, Trash2, Users, GraduationCap, X, Calendar } from 'lucide-react';

const Classes = () => {
  const { toast, confirm } = useToast();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    department: '',
    year: '',
    section: '',
    teacherId: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await classesAPI.getAll();
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error('Fetch classes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await teachersAPI.getAll();
      setTeachers(res.data.teachers || []);
    } catch (err) {}
  };

  const openAddModal = () => {
    setEditClass(null);
    setFormData({ className: '', department: '', year: '', section: '', teacherId: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setEditClass(cls);
    setFormData({
      className: cls.className,
      department: cls.department,
      year: cls.year,
      section: cls.section,
      teacherId: cls.teacher?._id || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editClass) {
        await classesAPI.update(editClass._id, formData);
        toast.success(`Class section ${formData.className} updated.`, 'Class Updated');
        setSuccessMsg('Class record updated successfully.');
      } else {
        await classesAPI.create(formData);
        toast.success(`Class section ${formData.className} created.`, 'Class Created');
        setSuccessMsg('Class created successfully.');
      }
      setShowModal(false);
      fetchClasses();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed.';
      toast.error(msg, 'Class Error');
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Delete Class Section',
      message: 'Are you sure you want to delete this class section? Students currently enrolled will be unassigned.',
      confirmText: 'Delete Section',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await classesAPI.delete(id);
          setClasses((prev) => prev.filter((c) => c._id !== id));
          toast.success('Class section removed.', 'Class Deleted');
          setSuccessMsg('Class removed.');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Delete failed', 'Delete Error');
        }
      },
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Class Management" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Classes & Sections</h1>
              <p className="page-subtitle">Configure academic classes, assigned professors, and student quotas</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal} id="add-class-btn">
              <PlusCircle size={16} />
              <span>Create Class</span>
            </button>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>Loading classes...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon-box">
                  <School size={26} strokeWidth={1.8} />
                </div>
                <h3>No Classes Created Yet</h3>
                <p>Create your first class section to begin enrolling students and assigning faculty.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openAddModal}
                  style={{ marginTop: '16px' }}
                >
                  <PlusCircle size={16} />
                  <span>Create First Class</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="classes-grid-container">
              {classes.map((cls) => (
                <div key={cls._id} className="clean-class-card">
                  <div className="class-card-top">
                    <div className="class-icon-chip">
                      <School size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="class-title-text">{cls.className}</h3>
                      <span className="class-dept-text">{cls.department}</span>
                    </div>
                  </div>

                  <div className="class-meta-list">
                    <div className="class-meta-row">
                      <span className="meta-row-label">
                        <Calendar size={13} />
                        <span>Academic Year</span>
                      </span>
                      <span className="meta-row-value">Year {cls.year} • Sec {cls.section}</span>
                    </div>

                    <div className="class-meta-row">
                      <span className="meta-row-label">
                        <GraduationCap size={13} />
                        <span>Faculty Advisor</span>
                      </span>
                      <span className="meta-row-value">
                        {cls.teacher ? (
                          cls.teacher.name
                        ) : (
                          <span style={{ color: 'var(--warning-text)', fontSize: '0.78rem' }}>
                            Unassigned
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="class-meta-row">
                      <span className="meta-row-label">
                        <Users size={13} />
                        <span>Enrolled Students</span>
                      </span>
                      <span className="meta-row-value" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cls.students?.length || 0} students
                      </span>
                    </div>
                  </div>

                  <div className="class-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openEditModal(cls)}
                      id={`edit-class-${cls._id}`}
                      style={{ flex: 1 }}
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => handleDelete(cls._id)}
                      id={`delete-class-${cls._id}`}
                      style={{ flex: 1 }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Class Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editClass ? 'Edit Class Details' : 'Create New Class Section'}
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

            <form onSubmit={handleSubmit} id="class-form">
              <div className="form-group">
                <label className="form-label">Class Name / Section Code *</label>
                <input
                  type="text"
                  name="className"
                  className="form-control"
                  placeholder="e.g., CS-2A or MEC-4B"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    placeholder="Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year *</label>
                  <select
                    name="year"
                    className="form-control"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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
                  <label className="form-label">Section Identifier *</label>
                  <input
                    type="text"
                    name="section"
                    className="form-control"
                    placeholder="e.g., A, B, or C"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Teacher</label>
                  <select
                    name="teacherId"
                    className="form-control"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  >
                    <option value="">No Teacher Assigned</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                  id="class-submit-btn"
                >
                  {formLoading ? 'Saving...' : editClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .classes-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 18px;
        }

        .clean-class-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-lg);
          padding: 22px;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
        }

        .clean-class-card:hover {
          border-color: var(--border-focus);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .class-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .class-icon-chip {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background-color: var(--primary-subtle);
          color: var(--primary);
          border: 1px solid var(--primary-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .class-title-text {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .class-dept-text {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: block;
          margin-top: 3px;
        }

        .class-meta-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          margin-bottom: 18px;
        }

        .class-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.83rem;
        }

        .meta-row-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
        }

        .meta-row-value {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .class-card-actions {
          display: flex;
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
        }
      `}</style>
    </div>
  );
};

export default Classes;
