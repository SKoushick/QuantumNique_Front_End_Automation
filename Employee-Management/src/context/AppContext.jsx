/**
 * App-wide data context — wraps all mock data stores with CRUD operations
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  mockEmployees, mockLeaves, mockAttendance, mockAnnouncements,
  mockTasks, mockProjects, mockAssets, mockDocuments, mockAuditLog,
  mockPayroll, mockReviews,
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [employees,     setEmployees]     = useState(mockEmployees);
  const [leaves,        setLeaves]        = useState(mockLeaves);
  const [attendance,    setAttendance]    = useState(mockAttendance);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [tasks,         setTasks]         = useState(mockTasks);
  const [projects,      setProjects]      = useState(mockProjects);
  const [assets,        setAssets]        = useState(mockAssets);
  const [documents,     setDocuments]     = useState(mockDocuments);
  const [auditLog,      setAuditLog]      = useState(mockAuditLog);
  const [payroll,       setPayroll]       = useState(mockPayroll);
  const [reviews,       setReviews]       = useState(mockReviews);
  const [notifications, setNotifications] = useState([]);

  // ── Audit helper ──────────────────────────────────────────────────────────
  const addAuditEntry = useCallback((entry) => {
    setAuditLog((prev) => [{
      id: `aud${Date.now()}`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      severity: 'info',
      ...entry,
    }, ...prev]);
  }, []);

  // ── Employee CRUD ─────────────────────────────────────────────────────────
  const addEmployee = useCallback((emp) => {
    const newEmp = { ...emp, id: `emp${Date.now()}`, employeeId: `EMS-${String(employees.length + 1).padStart(3,'0')}` };
    setEmployees((prev) => [newEmp, ...prev]);
    return newEmp;
  }, [employees]);

  const updateEmployee = useCallback((id, updates) => {
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEmployee = useCallback((id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── Leave CRUD ────────────────────────────────────────────────────────────
  const addLeave = useCallback((leave) => {
    const newLeave = { ...leave, id: `lv${Date.now()}`, status: 'pending', appliedOn: new Date().toISOString().split('T')[0] };
    setLeaves((prev) => [newLeave, ...prev]);
    return newLeave;
  }, []);

  const updateLeave = useCallback((id, updates) => {
    setLeaves((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
  }, []);

  // ── Task CRUD ─────────────────────────────────────────────────────────────
  const addTask = useCallback((task) => {
    const newTask = { ...task, id: `task${Date.now()}`, createdAt: new Date().toISOString(), progress: 0, comments: 0 };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Announcement CRUD ──────────────────────────────────────────────────────
  const addAnnouncement = useCallback((ann) => {
    const newAnn = { ...ann, id: `ann${Date.now()}`, publishedAt: new Date().toISOString().split('T')[0], readBy: [] };
    setAnnouncements((prev) => [newAnn, ...prev]);
    return newAnn;
  }, []);

  // ── Document CRUD ─────────────────────────────────────────────────────────
  const addDocument = useCallback((doc) => {
    const newDoc = { ...doc, id: `doc${Date.now()}`, uploadedAt: new Date().toISOString().split('T')[0] };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ── Asset CRUD ────────────────────────────────────────────────────────────
  const addAsset = useCallback((asset) => {
    const newAsset = { ...asset, id: `ast${Date.now()}` };
    setAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  }, []);

  const updateAsset = useCallback((id, updates) => {
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, ...updates } : a));
  }, []);

  // ── In-app notifications ──────────────────────────────────────────────────
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [{
      id: `notif${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif,
    }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = {
    // Data
    employees, leaves, attendance, announcements, tasks, projects,
    assets, documents, auditLog, payroll, reviews, notifications,
    // Employee ops
    addEmployee, updateEmployee, deleteEmployee,
    // Leave ops
    addLeave, updateLeave,
    // Task ops
    addTask, updateTask, deleteTask,
    // Announcement ops
    addAnnouncement,
    // Document ops
    addDocument, deleteDocument,
    // Asset ops
    addAsset, updateAsset,
    // Notification ops
    addNotification, markNotificationRead, markAllNotificationsRead,
    // Audit
    addAuditEntry,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export default AppContext;
