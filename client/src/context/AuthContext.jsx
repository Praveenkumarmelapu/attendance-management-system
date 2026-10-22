/**
 * context/AuthContext.jsx — Global Authentication State
 *
 * React Context is a way to share state across the entire app
 * without passing props through every component (prop drilling).
 *
 * AuthContext provides:
 * - user: Current logged-in user object
 * - token: JWT token
 * - login: Function to login
 * - logout: Function to logout
 * - loading: Whether auth state is being checked
 *
 * Any component can use: const { user, login, logout } = useAuth()
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// 1. Create the Context (like a global store)
const AuthContext = createContext(null);

// 2. Create the Provider (wraps our entire app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // When the app starts, check if there's a saved token
  // If yes, fetch the current user from the backend
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid or expired — clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function — called from the Login page
  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, user } = response.data;

    // Save token to localStorage (persists across page refreshes)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    setToken(token);
    setUser(user);

    return user; // Return user so caller can redirect based on role
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom hook — easy way to use auth in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
