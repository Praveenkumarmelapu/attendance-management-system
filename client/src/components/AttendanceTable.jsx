/**
 * components/AttendanceTable.jsx — Reusable Attendance Record Table
 * High-clarity data table with refined status indicators and action controls
 */

import React from 'react';
import { Pencil, Trash2, ClipboardList, User } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const configs = {
    present: { label: 'Present', className: 'badge-present' },
    absent: { label: 'Absent', className: 'badge-absent' },
    late: { label: 'Late', className: 'badge-late' },
  };

  const current = configs[status] || configs.present;

  return (
    <span className={`badge ${current.className}`}>
      <span className="badge-dot" />
      {current.label}
    </span>
  );
};

const AttendanceTable = ({
  records = [],
  onUpdate,
  onDelete,
  showStudent = true,
  showClass = true,
  isAdmin = false,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!records || records.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon-box">
          <ClipboardList size={26} strokeWidth={1.8} />
        </div>
        <h3>No Attendance Records Found</h3>
        <p>There are no attendance sessions logged for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '48px', textAlign: 'center' }}>#</th>
            {showStudent && <th>Student</th>}
            {showClass && <th>Class</th>}
            <th>Date</th>
            <th>Status</th>
            <th>Remarks</th>
            {(onUpdate || onDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const studentObj = record.student || {};
            const classObj = record.class || {};

            return (
              <tr key={record._id || index}>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  {index + 1}
                </td>

                {showStudent && (
                  <td>
                    <div className="flex items-center gap-1">
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.72rem' }}>
                        {studentObj.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="student-name">{studentObj.name || 'Unknown Student'}</div>
                        {studentObj.studentId && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {studentObj.studentId}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                )}

                {showClass && (
                  <td>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {classObj.className || 'General'}
                    </span>
                    {classObj.department && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        {classObj.department}
                      </span>
                    )}
                  </td>
                )}

                <td style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}>
                  {formatDate(record.date)}
                </td>

                <td>
                  <StatusBadge status={record.status} />
                </td>

                <td>
                  <span
                    style={{
                      color: record.remarks ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontSize: '0.82rem',
                    }}
                  >
                    {record.remarks || '—'}
                  </span>
                </td>

                {(onUpdate || onDelete) && (
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
                      {onUpdate && (
                        <button
                          type="button"
                          className="btn btn-outline btn-icon btn-sm"
                          onClick={() => onUpdate(record)}
                          title="Edit attendance"
                          id={`edit-attendance-${record._id}`}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {onDelete && isAdmin && (
                        <button
                          type="button"
                          className="btn btn-danger-outline btn-icon btn-sm"
                          onClick={() => onDelete(record._id)}
                          title="Delete attendance"
                          id={`delete-attendance-${record._id}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
