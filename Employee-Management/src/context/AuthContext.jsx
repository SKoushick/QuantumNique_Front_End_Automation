/**
 * Authentication Context — manages login, logout, session persistence
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { mockEmployees } from '../data/mockData';

const AuthContext = createContext(null);

const DEMO_ACCOUNTS = {
  'admin@nexushr.com':    { password: 'admin123',    employeeId: 'emp001' },
  'hr@nexushr.com':       { password: 'hr123',       employeeId: 'emp002' },
  'manager@nexushr.com':  { password: 'manager123',  employeeId: 'emp003' },
  'employee@nexushr.com': { password: 'employee123', employeeId: 'emp008' },
};

const SESSION_KEY = 'ems_session';
const PASSWORD_KEY = 'ems_passwords';
const RESET_TOKENS_KEY = 'ems_reset_tokens';

function getStoredPasswords() {
  try {
    const raw = localStorage.getItem(PASSWORD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function restoreSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return mockEmployees.find((e) => e.id === saved.id) || null;
    }
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(restoreSessionUser);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const getPasswordForEmail = (email) => {
    const stored = getStoredPasswords();
    return stored[email.toLowerCase()] || DEMO_ACCOUNTS[email.toLowerCase()]?.password;
  };

  const login = useCallback(async (email, password, rememberMe = false) => {
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    const validPassword = getPasswordForEmail(email);
    if (!account || validPassword !== password) {
      setLoading(false);
      const err = 'Invalid email or password. Try: admin@nexushr.com / admin123';
      setError(err);
      throw new Error(err);
    }

    const employee = mockEmployees.find((e) => e.id === account.employeeId);
    if (!employee) throw new Error('Account not found');

    setUser(employee);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: employee.id }));
    if (!rememberMe) {
      sessionStorage.setItem('ems_session_temp', '1');
    }
    setLoading(false);
    return employee;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('ems_session_temp');
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setError(null);
    await new Promise((r) => setTimeout(r, 600));
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!account) {
      throw new Error('No account found with that email address.');
    }
    const token = `reset_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
    tokens[token] = { email: email.toLowerCase(), expires: Date.now() + 3600000 };
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
    return token;
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    setError(null);
    await new Promise((r) => setTimeout(r, 600));
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
    const entry = tokens[token];
    if (!entry || entry.expires < Date.now()) {
      throw new Error('Invalid or expired reset link. Please request a new one.');
    }
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const passwords = getStoredPasswords();
    passwords[entry.email] = newPassword;
    localStorage.setItem(PASSWORD_KEY, JSON.stringify(passwords));
    delete tokens[token];
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) throw new Error('Not authenticated');
    const email = Object.entries(DEMO_ACCOUNTS).find(([, a]) => a.employeeId === user.id)?.[0];
    if (!email) throw new Error('Account not found');
    const valid = getPasswordForEmail(email);
    if (valid !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }
    const passwords = getStoredPasswords();
    passwords[email] = newPassword;
    localStorage.setItem(PASSWORD_KEY, JSON.stringify(passwords));
  }, [user]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);
  const isAdmin   = useCallback(() => user?.role === 'admin', [user]);
  const isHR      = useCallback(() => ['admin', 'hr'].includes(user?.role), [user]);
  const isManager = useCallback(() => ['admin', 'hr', 'manager'].includes(user?.role), [user]);

  const value = {
    user, loading, error, setError,
    login, logout, forgotPassword, resetPassword, changePassword,
    updateUser, hasRole, isAdmin, isHR, isManager,
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
