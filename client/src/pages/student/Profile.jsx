/**
 * pages/student/Profile.jsx — Student Personal Profile
 * Verified student credentials and enrollment information
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { studentsAPI } from '../../services/api';
import { User, ShieldCheck, Mail, Phone, BookOpen, School, Calendar, Hash } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      try {
        const res = await studentsAPI.getMyProfile();
        setProfile(res.data.student);
      } catch (e) {
        const res = await studentsAPI.getAll();
        const allStudents = res.data.students || [];
        const myProfile = allStudents.find(
          (s) =>
            s.email?.toLowerCase() === user?.email?.toLowerCase() ||
            s.userId === user?._id ||
            s._id === user?._id
        );
        setProfile(myProfile);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
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

  const profileFields = profile
    ? [
        { label: 'Student ID', value: profile.studentId, icon: Hash },
        { label: 'Official Email', value: profile.email, icon: Mail },
        { label: 'Primary Contact', value: profile.phone || 'Not provided', icon: Phone },
        { label: 'Department', value: profile.department, icon: BookOpen },
        { label: 'Academic Standing', value: `Year ${profile.year}`, icon: Calendar },
        { label: 'Assigned Section', value: profile.section || 'General', icon: School },
        { label: 'Enrolled Class', value: profile.class?.className || 'Unassigned', icon: School },
        {
          label: 'Enrollment Date',
          value: new Date(profile.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          icon: Calendar,
        },
      ]
    : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Profile" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Student Profile</h1>
              <p className="page-subtitle">Verified institutional registration and academic record</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>Loading student record...</span>
            </div>
          ) : !profile ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon-box">
                  <User size={26} strokeWidth={1.8} />
                </div>
                <h3>Profile Record Not Linked</h3>
                <p>Your student profile record has not been connected to this account yet. Please notify your department administrator.</p>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              {/* Profile Card */}
              <div className="card" style={{ textAlign: 'center', marginBottom: '20px', padding: '32px 24px' }}>
                <div className="profile-large-avatar">
                  {getInitials(profile.name)}
                </div>

                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '4px' }}>
                  {profile.name}
                </h2>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 14px' }}>
                  {profile.email}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <span className="badge badge-student">
                    <span className="badge-dot" />
                    Enrolled Student
                  </span>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    {profile.department}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Institutional Information</h3>
                    <div className="card-desc">Academic details on official file</div>
                  </div>
                  <span className="verified-badge">
                    <ShieldCheck size={14} />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="profile-fields-list">
                  {profileFields.map((field, idx) => {
                    const Icon = field.icon;
                    return (
                      <div key={idx} className="profile-field-row">
                        <div className="field-row-label">
                          <Icon size={14} className="field-icon" />
                          <span>{field.label}</span>
                        </div>
                        <div className="field-row-value">{field.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-large-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          font-size: 1.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--success-text);
          background-color: var(--success-subtle);
          border: 1px solid var(--success-border);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .profile-fields-list {
          display: flex;
          flex-direction: column;
        }

        .profile-field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.88rem;
          gap: 16px;
        }

        .profile-field-row:last-child {
          border-bottom: none;
        }

        .field-row-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }

        .field-icon {
          color: var(--text-muted);
        }

        .field-row-value {
          color: var(--text-primary);
          font-weight: 600;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default Profile;
