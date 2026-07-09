import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  History, 
  AlertTriangle, 
  FileSpreadsheet, 
  LogOut, 
  Sun, 
  Moon, 
  GraduationCap,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({ 
  currentTeacher, 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleDarkMode, 
  onLogout 
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare },
    { id: 'history', label: 'Attendance History', icon: History },
    { id: 'defaulters', label: 'Low Attendance', icon: AlertTriangle },
    { id: 'reports', label: 'Download Reports', icon: FileSpreadsheet },
  ];

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-30 transition-all duration-300">
      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-3.5 flex-shrink-0">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 leading-tight tracking-tight">Murugesan College</h1>
            <p className="text-[10px] uppercase font-bold text-teal-500 tracking-widest -mt-0.5">Attendance System</p>
          </div>
        </div>

        {/* Center: Navigation Pills */}
        <div className="flex items-center bg-slate-100/70 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-700/30 space-x-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || 
              (item.id === 'attendance' && (activeTab === 'present_students' || activeTab === 'absent_students'));

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 group active:scale-[0.97] ${
                  isActive 
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md shadow-slate-200/40 dark:shadow-black/30' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${
                  isActive ? 'text-teal-500' : 'text-slate-400 group-hover:text-slate-500'
                }`} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 border border-slate-200/50 dark:border-slate-700/30"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Moon className="h-5 w-5 text-teal-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-2.5 pr-4 py-2 rounded-xl bg-slate-100/60 hover:bg-slate-200/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/30 transition-all active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-600 dark:text-teal-400 text-xs uppercase">
                {currentTeacher?.name?.split(' ').pop()?.substring(0, 2) || 'TR'}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block leading-tight">{currentTeacher?.name}</span>
                <span className="text-xs text-slate-400 block leading-tight mt-0.5">{currentTeacher?.teacherId}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 py-2.5 z-50 animate-glow">
                  {/* User Info */}
                  <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentTeacher?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{currentTeacher?.email}</p>
                    <span className="text-[10px] uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-lg font-bold inline-block mt-2">
                      ID: {currentTeacher?.teacherId}
                    </span>
                  </div>

                  {/* Sign Out */}
                  <div className="px-2 pt-2.5">
                    <button
                      onClick={() => { setShowUserMenu(false); onLogout(); }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-all"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      <span>Sign Out Workspace</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gradient Accent Line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />
    </nav>
  );
}
