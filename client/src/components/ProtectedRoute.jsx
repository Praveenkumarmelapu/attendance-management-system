/**
 * components/ProtectedRoute.jsx — Route Guard Component
 *
 * This component wraps around pages that require authentication.
 * If user is not logged in → redirect to /login
 * If user doesn't have the right role → redirect to their dashboard
 * If user is authenticated with correct role → show the page
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Wait for auth to be checked before redirecting
  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  // Not logged in → go to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check the user's role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard
    const dashboards = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={dashboards[user.role] || '/login'} replace />;
  }

  // All checks passed — render the child component
  return children;
};

export default ProtectedRoute;
