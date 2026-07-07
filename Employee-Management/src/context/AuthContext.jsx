/**
 * Authentication Context — manages login, logout, session persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockEmployees } from '../data/mockData';

const AuthContext = createContext(null);

// ── Demo credentials ──────────────────────────────────────────────────────────
const DEMO_ACCOUNTS = {
  'admin@nexushr.com':    { password: 'admin123',    employeeId: 'emp001' },
  'hr@nexushr.com':       { password: 'hr123',       employeeId: 'emp002' },
  'manager@nexushr.com':  { password: 'manager123',  employeeId: 'emp003' },
  'employee@nexushr.com': { password: 'employee123', employeeId: 'emp008' },
};

const SESSION_KEY = 'ems_session';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Restore session from localStorage ────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const emp = mockEmployees.find((e) => e.id === saved.id);
        if (emp) setUser(emp);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, rememberMe = false) => {
    setError(null);
    setLoading(true);
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 800));

    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account || account.password !== password) {
      setLoading(false);
      const err = 'Invalid email or password. Try: admin@nexushr.com / admin123';
      setError(err);
      throw new Error(err);
    }

    const employee = mockEmployees.find((e) => e.id === account.employeeId);
    if (!employee) throw new Error('Account not found');

    setUser(employee);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id: employee.id }));
    }
    setLoading(false);
    return employee;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  // ── Update current user profile ───────────────────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  // ── Permission helpers ────────────────────────────────────────────────────
  const hasRole = useCallback((...roles) => {
    return roles.includes(user?.role);
  }, [user]);

  const isAdmin   = useCallback(() => user?.role === 'admin',   [user]);
  const isHR      = useCallback(() => ['admin','hr'].includes(user?.role), [user]);
  const isManager = useCallback(() => ['admin','hr','manager'].includes(user?.role), [user]);

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isHR,
    isManager,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
