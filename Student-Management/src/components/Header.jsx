import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Sparkles } from 'lucide-react';

export default function Header({ activeTab, notifications, markAllNotificationsRead }) {
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'attendance': return 'Mark Student Attendance';
      case 'present_students': return 'Present Students Register';
      case 'absent_students': return 'Absent Students Warning List';
      case 'history': return 'Attendance Logs & Calendar';
      case 'defaulters': return 'Attendance Defaulters List (< 75%)';
      case 'reports': return 'Reports Generation Center';
      case 'certificates': return 'Student Excellence Portal';
      case 'import': return 'Bulk Class Roster Import';
      default: return 'Teacher Portal';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-10 transition-all">
      {/* Active Tab Heading */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
          <span>{getTitle()}</span>
          {activeTab === 'dashboard' && (
            <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
          )}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Apex College Teacher Workspace</p>
      </div>

      {/* Date, Live Clock & Notification Controls */}
      <div className="flex items-center space-x-6">
        {/* Live Clock Widget */}
        <div className="flex items-center space-x-5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/30">
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            <span>{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/30 font-mono">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span>{time.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Notifications Center Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 transform active:scale-95 border border-slate-200/50 dark:border-slate-700/30 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-bounce"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 py-3 z-30 transition-all animate-glow">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Alerts & Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      markAllNotificationsRead();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No active notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors border-b border-slate-100/50 dark:border-slate-700/30 last:border-b-0 ${
                        !notif.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className={`text-xs ${!notif.read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                          {notif.message}
                        </p>
                        {!notif.read && <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
