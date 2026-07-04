import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Sparkles, ChevronRight } from 'lucide-react';

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
      default: return 'Teacher Workspace';
    }
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return ['Home', 'Dashboard'];
      case 'attendance': return ['Home', 'Attendance', 'Mark'];
      case 'present_students': return ['Home', 'Attendance', 'Present'];
      case 'absent_students': return ['Home', 'Attendance', 'Absent'];
      case 'history': return ['Home', 'History'];
      case 'defaulters': return ['Home', 'Defaulters'];
      case 'reports': return ['Home', 'Reports'];
      default: return ['Home'];
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50 px-6 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
        
        {/* Left: Breadcrumb + Title */}
        <div>
          {/* Breadcrumb Trail */}
          <div className="flex items-center space-x-1.5 mb-1">
            {getBreadcrumb().map((crumb, i, arr) => (
              <span key={i} className="flex items-center">
                <span className={`text-xs font-semibold ${
                  i === arr.length - 1 
                    ? 'text-teal-600 dark:text-teal-400 font-extrabold' 
                    : 'text-slate-400'
                }`}>
                  {crumb}
                </span>
                {i < arr.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-slate-350 dark:text-slate-655 mx-1" />
                )}
              </span>
            ))}
          </div>
          
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <span>{getTitle()}</span>
            {activeTab === 'dashboard' && (
              <Sparkles className="h-5 w-5 text-teal-500 animate-pulse" />
            )}
          </h2>
        </div>

        {/* Right: Clock + Notifications */}
        <div className="flex items-center space-x-5">
          {/* Live Clock Widgets */}
          <div className="hidden md:flex items-center space-x-4 text-xs text-slate-600 dark:text-slate-300 font-semibold">
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/30">
              <Calendar className="h-4 w-4 text-teal-500" />
              <span>{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-850 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/30 font-mono">
              <Clock className="h-4 w-4 text-teal-500" />
              <span>{time.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 border border-slate-200/50 dark:border-slate-700/30 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-[10px] text-white font-extrabold">{unreadCount}</span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 py-3 z-30 transition-all animate-glow">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Alerts & Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          markAllNotificationsRead();
                          setShowNotifications(false);
                        }}
                        className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase hover:underline"
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
                            !notif.read ? 'bg-teal-50/20 dark:bg-teal-950/10' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className={`text-xs ${!notif.read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                              {notif.message}
                            </p>
                            {!notif.read && <span className="h-1.5 w-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">{notif.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
