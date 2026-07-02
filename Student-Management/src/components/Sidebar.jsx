import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  History, 
  AlertTriangle, 
  FileSpreadsheet, 
  Award, 
  UserPlus, 
  LogOut, 
  Sun, 
  Moon, 
  BookOpen
} from 'lucide-react';

export default function Sidebar({ 
  currentTeacher, 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleDarkMode, 
  onLogout 
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare },
    { id: 'history', label: 'Attendance History', icon: History },
    { id: 'defaulters', label: 'Low Attendance', icon: AlertTriangle },
    { id: 'reports', label: 'Download Reports', icon: FileSpreadsheet },
    { id: 'certificates', label: 'Certificates Portal', icon: Award },
    { id: 'import', label: 'Bulk Student Import', icon: UserPlus },
  ];

  return (
    <aside className="w-80 h-screen fixed top-0 left-0 bg-white border-r border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between z-20 transition-all duration-300">
      {/* Brand Profile Header */}
      <div>
        <div className="p-6 flex items-center space-x-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">Apex College</h1>
            <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Attendance System</p>
          </div>
        </div>

        {/* User Card Profile */}
        <div className="p-5 mx-4 my-5 bg-gradient-to-br from-indigo-50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-800/20 rounded-2xl border border-indigo-100/50 dark:border-slate-700/30 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-lg uppercase shadow-inner">
            {currentTeacher?.name?.split(' ').pop()?.substring(0, 2) || 'TR'}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{currentTeacher?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{currentTeacher?.email}</p>
            <p className="text-[9px] uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold inline-block mt-1">
              ID: {currentTeacher?.teacherId}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="px-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-320px)]">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'attendance' && (activeTab === 'present_students' || activeTab === 'absent_students'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 transform group active:scale-[0.98] ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/15' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3 bg-white dark:bg-slate-900">
        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center space-x-2.5">
            {isDarkMode ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 flex ${
            isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
          }`}>
            <span className="w-3 h-3 bg-white rounded-full shadow-md"></span>
          </div>
        </button>

        {/* Logout Trigger */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
