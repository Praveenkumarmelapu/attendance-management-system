/**
 * components/StudentCard.jsx — Student Info Card Component
 */

import React from 'react';

const StudentCard = ({ student, onEdit, onDelete, onClick }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      className="student-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="student-card-header">
        <div className="avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>
          {getInitials(student.name)}
        </div>
        <div className="student-card-info">
          <h4 className="student-card-name">{student.name}</h4>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            ID: {student.studentId}
          </span>
        </div>
      </div>

      <div className="student-card-details">
        <div className="student-card-detail">
          <span className="detail-label">📚 Dept</span>
          <span className="detail-value">{student.department}</span>
        </div>
        <div className="student-card-detail">
          <span className="detail-label">📅 Year</span>
          <span className="detail-value">Year {student.year}</span>
        </div>
        {student.section && (
          <div className="student-card-detail">
            <span className="detail-label">🔤 Section</span>
            <span className="detail-value">{student.section}</span>
          </div>
        )}
        <div className="student-card-detail">
          <span className="detail-label">📧 Email</span>
          <span className="detail-value" style={{ fontSize: '0.78rem' }}>
            {student.email}
          </span>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="student-card-actions">
          {onEdit && (
            <button
              className="btn btn-outline btn-sm"
              onClick={(e) => { e.stopPropagation(); onEdit(student); }}
              id={`edit-student-${student._id}`}
            >
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={(e) => { e.stopPropagation(); onDelete(student._id); }}
              id={`delete-student-${student._id}`}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}

      <style>{`
        .student-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          transition: var(--transition-slow);
        }
        .student-card:hover {
          border-color: var(--border-light);
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }
        .student-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }
        .student-card-info { flex: 1; min-width: 0; }
        .student-card-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .student-card-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .student-card-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.83rem;
        }
        .detail-label { color: var(--text-muted); }
        .detail-value { color: var(--text-secondary); font-weight: 500; text-align: right; }
        .student-card-actions {
          display: flex;
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .student-card-actions .btn { flex: 1; }
      `}</style>
    </div>
  );
};

export default StudentCard;
