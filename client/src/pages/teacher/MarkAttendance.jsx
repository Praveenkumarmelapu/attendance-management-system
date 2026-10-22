/**
 * pages/teacher/MarkAttendance.jsx — Roll Call & Attendance Marking
 *
 * Allows Faculty and Administrators to mark or update daily attendance
 * with bulk toggles, status pills, and safe synchronization.
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { classesAPI, attendanceAPI, teachersAPI } from '../../services/api';
import {
  Calendar,
  School,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';

const MarkAttendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { [studentId]: { status, remarks } }
  const [teacherId, setTeacherId] = useState('');

  const [classesLoading, setClassesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Initial load: Fetch classes and teacher ID
  useEffect(() => {
    fetchClassesAndTeacher();
  }, [user]);

  const fetchClassesAndTeacher = async () => {
    setClassesLoading(true);
    try {
      // 1. Fetch available classes
      if (user?.role === 'admin') {
        const res = await classesAPI.getAll();
        setClasses(res.data.classes || []);
      } else {
        const res = await classesAPI.getByTeacher(user?._id || 'me');
        setClasses(res.data.classes || []);
      }

      // 2. Identify teacher ID if teacher
      const teachersRes = await teachersAPI.getAll();
      const allTeachers = teachersRes.data.teachers || [];
      const matchedTeacher = allTeachers.find(
        (t) =>
          t.userId === user?._id ||
          t._id === user?._id ||
          (t.email && user?.email && t.email.toLowerCase() === user.email.toLowerCase())
      );

      if (matchedTeacher) {
        setTeacherId(matchedTeacher._id);
      } else if (allTeachers.length > 0) {
        setTeacherId(allTeachers[0]._id);
      }

      // Check for route state navigation
      if (location.state?.selectedClass?._id) {
        setSelectedClass(location.state.selectedClass._id);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setClassesLoading(false);
    }
  };

  // When selected class or date changes, load students and existing attendance
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudentsAndAttendance();
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClass, selectedDate]);

  const loadStudentsAndAttendance = async () => {
    setStudentsLoading(true);
    setErrorMsg('');
    try {
      // 1. Load class info with enrolled students
      const classRes = await classesAPI.getById(selectedClass);
      const classData = classRes.data.class || {};
      const enrolledStudents = classData.students || [];
      setStudents(enrolledStudents);

      // 2. Default state: mark all as present
      const initialMap = {};
      enrolledStudents.forEach((st) => {
        initialMap[st._id] = { status: 'present', remarks: '' };
      });

      // 3. Query if attendance already exists for this date
      const existingRes = await attendanceAPI.getByClass(selectedClass, {
        date: selectedDate,
      });
      const existingRecords = existingRes.data.attendance || [];

      // 4. Merge existing records over defaults
      existingRecords.forEach((record) => {
        const stId = record.student?._id || record.student;
        if (stId && initialMap[stId]) {
          initialMap[stId] = {
            status: record.status || 'present',
            remarks: record.remarks || '',
          };
        }
      });

      setAttendance(initialMap);
    } catch (err) {
      console.error('Failed to load roster:', err);
      setErrorMsg('Could not load student roster for this class section.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStatusSelect = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        remarks,
      },
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = {
        status,
        remarks: attendance[s._id]?.remarks || '',
      };
    });
    setAttendance(updated);
    const capitalized = status.charAt(0).toUpperCase() + status.slice(1);
    toast.info(`Marked all ${students.length} students as ${capitalized}.`, 'Batch Updated');
  };

  const handleSave = async () => {
    if (!selectedClass) {
      toast.warning('Please select a class section before saving.', 'Section Required');
      setErrorMsg('Please select a class section.');
      return;
    }
    if (students.length === 0) {
      toast.warning('There are no students enrolled in this class to mark.', 'Empty Roster');
      setErrorMsg('There are no students enrolled in this class to mark.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const attendanceData = students.map((s) => ({
      studentId: s._id,
      status: attendance[s._id]?.status || 'present',
      remarks: attendance[s._id]?.remarks || '',
    }));

    try {
      const res = await attendanceAPI.mark({
        classId: selectedClass,
        teacherId: teacherId || undefined,
        date: selectedDate,
        attendanceData,
      });

      toast.success(
        `Roll call saved successfully for ${attendanceData.length} students.`,
        'Attendance Recorded'
      );
      setSuccessMsg(
        `Attendance recorded successfully for ${attendanceData.length} students.`
      );
      setTimeout(() => setSuccessMsg(''), 4500);

      // Re-fetch to ensure sync
      loadStudentsAndAttendance();
    } catch (err) {
      console.error('Save attendance error:', err);
      const msg = err.response?.data?.message || 'Failed to record attendance. Please try again.';
      toast.error(msg, 'Save Error');
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((a) => a.status === 'present').length;
  const absentCount = Object.values(attendance).filter((a) => a.status === 'absent').length;
  const lateCount = Object.values(attendance).filter((a) => a.status === 'late').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Mark Roll Call" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Take Class Attendance</h1>
              <p className="page-subtitle">
                Select your class and session date, review student attendance, and submit roll call
              </p>
            </div>
          </div>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

          {/* Session Selection Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div>
                <h3 className="card-title">Session Configuration</h3>
                <div className="card-desc">Choose the class section and calendar date</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="select-class">
                  Class Section *
                </label>
                {classesLoading ? (
                  <div className="form-control" style={{ color: 'var(--text-muted)' }}>
                    Loading classes...
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    id="select-class"
                  >
                    <option value="">-- Choose a class section --</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} — {cls.department} (Year {cls.year}, Sec {cls.section})
                      </option>
                    ))}
                  </select>
                )}
                {classes.length === 0 && !classesLoading && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--warning-text)', marginTop: '6px' }}>
                    No classes available. Make sure you are assigned to a class or create one as admin.
                  </p>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="select-date">
                  Session Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  id="select-date"
                />
              </div>
            </div>
          </div>

          {/* Roll Call Roster Card */}
          {selectedClass ? (
            <div className="card">
              <div className="card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 className="card-title">
                    <span>Enrolled Roster</span>
                    {students.length > 0 && (
                      <span className="roster-count-badge">
                        {students.length} students
                      </span>
                    )}
                  </h3>
                  <div className="card-desc">
                    Mark status per student or use quick actions
                  </div>
                </div>

                {students.length > 0 && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => markAll('present')}
                      id="mark-all-present"
                    >
                      <CheckCircle2 size={13} className="text-success" />
                      <span>All Present</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => markAll('absent')}
                      id="mark-all-absent"
                    >
                      <XCircle size={13} className="text-danger" />
                      <span>All Absent</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => markAll('late')}
                      id="mark-all-late"
                    >
                      <Clock size={13} className="text-warning" />
                      <span>All Late</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Roster Live Stat Counters */}
              {students.length > 0 && (
                <div className="live-roster-summary">
                  <div className="summary-pill">
                    <span className="badge-dot" style={{ backgroundColor: 'var(--success)' }} />
                    <span>Present: <strong>{presentCount}</strong></span>
                  </div>
                  <div className="summary-pill">
                    <span className="badge-dot" style={{ backgroundColor: 'var(--danger)' }} />
                    <span>Absent: <strong>{absentCount}</strong></span>
                  </div>
                  <div className="summary-pill">
                    <span className="badge-dot" style={{ backgroundColor: 'var(--warning)' }} />
                    <span>Late: <strong>{lateCount}</strong></span>
                  </div>
                </div>
              )}

              {studentsLoading ? (
                <div className="loading-container">
                  <div className="spinner" />
                  <span>Loading student roster...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon-box">
                    <Users size={26} strokeWidth={1.8} />
                  </div>
                  <h3>No Students in this Class</h3>
                  <p>Assign students to this class in the administration panel to mark roll call.</p>
                </div>
              ) : (
                <>
                  <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: '46px', textAlign: 'center' }}>#</th>
                          <th>Student</th>
                          <th>ID Code</th>
                          <th>Year / Dept</th>
                          <th style={{ textAlign: 'center' }}>Attendance Status</th>
                          <th>Notes / Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, idx) => {
                          const currentStatus = attendance[student._id]?.status || 'present';

                          return (
                            <tr key={student._id}>
                              <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                {idx + 1}
                              </td>

                              <td>
                                <div className="flex items-center gap-1">
                                  <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.72rem' }}>
                                    {student.name?.charAt(0) || '?'}
                                  </div>
                                  <span className="student-name">{student.name}</span>
                                </div>
                              </td>

                              <td>
                                <code style={{
                                  background: 'var(--bg-input)',
                                  border: '1px solid var(--border)',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.78rem',
                                  color: 'var(--text-primary)',
                                  fontWeight: 600,
                                }}>
                                  {student.studentId}
                                </code>
                              </td>

                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Yr {student.year} • {student.department}
                              </td>

                              <td style={{ textAlign: 'center' }}>
                                <div className="attendance-status-toggle">
                                  <button
                                    type="button"
                                    className={`status-btn ${currentStatus === 'present' ? 'active-present' : ''}`}
                                    onClick={() => handleStatusSelect(student._id, 'present')}
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>Present</span>
                                  </button>

                                  <button
                                    type="button"
                                    className={`status-btn ${currentStatus === 'absent' ? 'active-absent' : ''}`}
                                    onClick={() => handleStatusSelect(student._id, 'absent')}
                                  >
                                    <XCircle size={12} />
                                    <span>Absent</span>
                                  </button>

                                  <button
                                    type="button"
                                    className={`status-btn ${currentStatus === 'late' ? 'active-late' : ''}`}
                                    onClick={() => handleStatusSelect(student._id, 'late')}
                                  >
                                    <Clock size={12} />
                                    <span>Late</span>
                                  </button>
                                </div>
                              </td>

                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Optional remarks"
                                  value={attendance[student._id]?.remarks || ''}
                                  onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                                  style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Submit Bar */}
                  <div className="attendance-submit-bar">
                    <div className="submit-meta-info">
                      <span>Session Date:</span>
                      <strong>{new Date(selectedDate).toDateString()}</strong>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleSave}
                      disabled={saving}
                      id="save-attendance-btn"
                    >
                      {saving ? (
                        <>
                          <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          <span>Saving Roll Call...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Attendance</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon-box">
                  <School size={26} strokeWidth={1.8} />
                </div>
                <h3>Choose a Class to Begin</h3>
                <p>Select an academic class and date above to load the student roster and take attendance.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .roster-count-badge {
          margin-left: 10px;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background-color: var(--bg-elevated);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
        }

        .live-roster-summary {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 18px;
          background-color: var(--bg-elevated);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .summary-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .summary-pill strong {
          color: var(--text-primary);
        }

        .attendance-submit-bar {
          padding: 18px 22px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-card);
        }

        .submit-meta-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.86rem;
          color: var(--text-muted);
        }

        .submit-meta-info strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default MarkAttendance;
