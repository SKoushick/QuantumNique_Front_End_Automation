/**
 * App-wide data context — wraps all mock data stores with CRUD operations
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  mockEmployees, mockLeaves, mockAttendance, mockAnnouncements,
  mockTasks, mockProjects, mockAssets, mockDocuments, mockAuditLog,
  mockPayroll, mockReviews,
} from '../data/mockData';
import { DEPARTMENTS } from '../utils/constants';

const AppContext = createContext(null);

const INITIAL_NOTIFICATIONS = [
  { id: 'notif1', message: 'Q2 All-Hands meeting tomorrow at 10 AM', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'notif2', message: '3 leave requests pending your approval', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'notif3', message: 'June payroll processing complete', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export function AppProvider({ children }) {
  const [employees,     setEmployees]     = useState(mockEmployees);
  const [departments,   setDepartments]   = useState(() =>
    DEPARTMENTS.map((d) => ({
      ...d,
      headId: mockEmployees.find((e) => e.department === d.id && ['admin','manager'].includes(e.role))?.id || null,
      description: `${d.name} department`,
    }))
  );
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
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [clockSession,  setClockSession]  = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ems_clock_session');
      if (saved) setClockSession(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const addAuditEntry = useCallback((entry) => {
    setAuditLog((prev) => [{
      id: `aud${Date.now()}`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      severity: 'info',
      ...entry,
    }, ...prev]);
  }, []);

  const addEmployee = useCallback((emp) => {
    const newEmp = {
      ...emp,
      id: `emp${Date.now()}`,
      employeeId: `EMS-${String(employees.length + 1).padStart(3, '0')}`,
      status: emp.status || 'active',
      leaveBalance: emp.leaveBalance || { annual: 20, sick: 10, casual: 5 },
      skills: emp.skills || [],
      education: emp.education || [],
      documents: emp.documents || [],
    };
    setEmployees((prev) => [newEmp, ...prev]);
    return newEmp;
  }, [employees.length]);

  const updateEmployee = useCallback((id, updates) => {
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEmployee = useCallback((id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addDepartment = useCallback((dept) => {
    const newDept = { ...dept, id: `d${Date.now()}`, code: dept.code || dept.name.slice(0, 3).toUpperCase() };
    setDepartments((prev) => [...prev, newDept]);
    return newDept;
  }, []);

  const updateDepartment = useCallback((id, updates) => {
    setDepartments((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDepartment = useCallback((id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addLeave = useCallback((leave) => {
    const newLeave = { ...leave, id: `lv${Date.now()}`, status: 'pending', appliedOn: new Date().toISOString().split('T')[0] };
    setLeaves((prev) => [newLeave, ...prev]);
    return newLeave;
  }, []);

  const updateLeave = useCallback((id, updates) => {
    setLeaves((prev) => prev.map((l) => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const clockIn = useCallback((employeeId) => {
    const now = new Date();
    const session = {
      employeeId,
      clockIn: now.toISOString(),
      breakStart: null,
      breakEnd: null,
      status: 'working',
    };
    setClockSession(session);
    localStorage.setItem('ems_clock_session', JSON.stringify(session));
    return session;
  }, []);

  const clockOut = useCallback((employeeId) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setAttendance((prev) => [{
      id: `att${Date.now()}`,
      date: today,
      employeeId,
      clockIn: clockSession?.clockIn ? new Date(clockSession.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '9:00 AM',
      clockOut: timeStr,
      breaks: 45,
      status: 'present',
      hoursWorked: 8,
    }, ...prev]);
    setClockSession(null);
    localStorage.removeItem('ems_clock_session');
  }, [clockSession]);

  const startBreak = useCallback(() => {
    setClockSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, breakStart: new Date().toISOString(), status: 'on_break' };
      localStorage.setItem('ems_clock_session', JSON.stringify(next));
      return next;
    });
  }, []);

  const endBreak = useCallback(() => {
    setClockSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, breakEnd: new Date().toISOString(), status: 'working' };
      localStorage.setItem('ems_clock_session', JSON.stringify(next));
      return next;
    });
  }, []);

  const addTask = useCallback((task) => {
    const newTask = { ...task, id: `task${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], progress: task.progress || 0, comments: task.comments || 0 };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addProject = useCallback((project) => {
    const newProj = { ...project, id: `proj${Date.now()}`, progress: 0, tasksTotal: 0, tasksDone: 0 };
    setProjects((prev) => [newProj, ...prev]);
    return newProj;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addAnnouncement = useCallback((ann) => {
    const newAnn = { ...ann, id: `ann${Date.now()}`, publishedAt: new Date().toISOString().split('T')[0], readBy: [] };
    setAnnouncements((prev) => [newAnn, ...prev]);
    return newAnn;
  }, []);

  const deleteAnnouncement = useCallback((id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addDocument = useCallback((doc) => {
    const newDoc = { ...doc, id: `doc${Date.now()}`, uploadedAt: new Date().toISOString().split('T')[0], size: doc.size || 102400 };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addAsset = useCallback((asset) => {
    const newAsset = { ...asset, id: `ast${Date.now()}`, status: asset.status || 'available' };
    setAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  }, []);

  const updateAsset = useCallback((id, updates) => {
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAsset = useCallback((id) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addReview = useCallback((review) => {
    const newReview = { ...review, id: `rev${Date.now()}`, status: review.status || 'draft' };
    setReviews((prev) => [newReview, ...prev]);
    return newReview;
  }, []);

  const updateReview = useCallback((id, updates) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
  }, []);

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
    employees, departments, leaves, attendance, announcements, tasks, projects,
    assets, documents, auditLog, payroll, reviews, notifications, clockSession,
    addEmployee, updateEmployee, deleteEmployee,
    addDepartment, updateDepartment, deleteDepartment,
    addLeave, updateLeave,
    clockIn, clockOut, startBreak, endBreak,
    addTask, updateTask, deleteTask,
    addProject, updateProject, deleteProject,
    addAnnouncement, deleteAnnouncement,
    addDocument, deleteDocument,
    addAsset, updateAsset, deleteAsset,
    addReview, updateReview,
    addNotification, markNotificationRead, markAllNotificationsRead,
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
