import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MarkAttendance from './pages/MarkAttendance';
import PresentStudents from './pages/PresentStudents';
import AbsentStudents from './pages/AbsentStudents';
import History from './pages/History';
import Defaulters from './pages/Defaulters';
import Reports from './pages/Reports';

import { apiService } from './services/api';

export default function App() {
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastMarkedClass, setLastMarkedClass] = useState(null); // shared stats data
  
  // Real-time animated Toast State
  const [toasts, setToasts] = useState([]);
  
  // Header Notification Alerts State
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Class reminder: DBMS today at 11:30 AM.', time: '09:00 AM', read: false },
    { id: 2, message: 'Low Attendance Alert: 4 students are currently below 75% in AI & DS.', time: 'Yesterday', read: false },
    { id: 3, message: 'Welcome to Murugesan College Student Attendance System portal.', time: '2 days ago', read: true }
  ]);

  // Check login and theme on mount
  useEffect(() => {
    const teacher = apiService.getCurrentTeacher();
    if (teacher) {
      setCurrentTeacher(teacher);
    }

    const savedTheme = localStorage.getItem('attendance_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []);

  // Theme Toggler
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.body.classList.add('dark');
      localStorage.setItem('attendance_theme', 'dark');
      triggerNotification('Dark Mode enabled');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('attendance_theme', 'light');
      triggerNotification('Light Mode enabled');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    apiService.logout();
    setCurrentTeacher(null);
    setActiveTab('dashboard');
    triggerNotification('Logged out successfully.');
  };

  // Add animated Toast
  const triggerNotification = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Add to notification panel alerts
    const newNotif = {
      id,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Auto remove toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    triggerNotification('All notifications cleared');
  };

  const handleLoginSuccess = (teacher) => {
    setCurrentTeacher(teacher);
    triggerNotification(`Signed in as ${teacher.name}!`);
  };

  // Switch Subpages
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            currentTeacher={currentTeacher} 
            setActiveTab={setActiveTab} 
            triggerNotification={triggerNotification} 
          />
        );
      case 'attendance':
        return (
          <MarkAttendance 
            currentTeacher={currentTeacher} 
            setActiveTab={setActiveTab} 
            setLastMarkedClass={setLastMarkedClass} 
            triggerNotification={triggerNotification} 
          />
        );
      case 'present_students':
        return (
          <PresentStudents 
            currentTeacher={currentTeacher} 
            lastMarkedClass={lastMarkedClass} 
          />
        );
      case 'absent_students':
        return (
          <AbsentStudents 
            currentTeacher={currentTeacher} 
            lastMarkedClass={lastMarkedClass} 
            triggerNotification={triggerNotification} 
          />
        );
      case 'history':
        return (
          <History 
            currentTeacher={currentTeacher} 
            triggerNotification={triggerNotification} 
          />
        );
      case 'defaulters':
        return (
          <Defaulters 
            currentTeacher={currentTeacher} 
            triggerNotification={triggerNotification} 
          />
        );
      case 'reports':
        return (
          <Reports 
            currentTeacher={currentTeacher} 
            triggerNotification={triggerNotification} 
          />
        );
      default:
        return (
          <Dashboard 
            currentTeacher={currentTeacher} 
            setActiveTab={setActiveTab} 
            triggerNotification={triggerNotification} 
          />
        );
    }
  };

  // If not logged in, render the login card view
  if (!currentTeacher) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <Sidebar 
        currentTeacher={currentTeacher} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        onLogout={handleLogout} 
      />

      {/* Sub-Header Panel */}
      <Header 
        activeTab={activeTab} 
        notifications={notifications} 
        markAllNotificationsRead={markAllNotificationsRead} 
      />

      {/* Full-Width Content Area */}
      <main className="flex-1 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <footer className="py-5 px-8 text-center text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-950/20 backdrop-blur-sm">
        Murugesan College Student Attendance Management System • Developed for Faculty Workspace • © 2026 All Rights Reserved
      </footer>

      {/* Floating Animated Toasts Panel */}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="pointer-events-auto bg-slate-900/95 dark:bg-white text-slate-100 dark:text-slate-900 px-4.5 py-3 rounded-2xl shadow-xl border border-slate-800/40 dark:border-slate-200/30 flex items-center space-x-3 backdrop-blur-md"
            >
              <div className="h-6 w-6 bg-teal-500/10 dark:bg-teal-500/20 rounded-lg flex items-center justify-center text-teal-500 dark:text-teal-600 flex-shrink-0">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-semibold tracking-tight">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
