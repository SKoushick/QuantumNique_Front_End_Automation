import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Percent, 
  Clock, 
  Play, 
  BookOpen, 
  FileSpreadsheet,
  Award,
  History
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Dashboard({ currentTeacher, setActiveTab, triggerNotification }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [defaultersCount, setDefaultersCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const fetchedStats = await apiService.getDashboardStats();
        setStats(fetchedStats);

        const history = await apiService.getAttendanceHistory();
        setHistoryData(history);

        const defaulters = await apiService.getDefaulters();
        setDefaultersCount(defaulters.length);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentTeacher]);

  if (loading || !stats) {
    return (
      <div className="p-8 flex flex-col space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  // Generate perfect attendance leaderboard from student rosters
  const mockStudents = JSON.parse(localStorage.getItem('attendance_students') || '[]');
  const leaderboardStudents = mockStudents
    .filter(s => currentTeacher.assignedClasses.some(c => c.department === s.department && c.year === s.year && c.section === s.section))
    .sort((a, b) => b.previousAttendance - a.previousAttendance)
    .slice(0, 4);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-card bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent border border-teal-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Welcome back, {currentTeacher.name}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            You are managing <span className="font-semibold text-teal-500">{currentTeacher.assignedClasses.length} assigned classes</span> across your departments. Here is today's overview.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('attendance')}
          className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-teal-600/15 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-2 w-fit"
        >
          <Play className="h-4.5 w-4.5 fill-current" />
          <span>Mark Class Attendance</span>
        </button>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Assigned Students */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assigned Students</span>
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{stats.totalStudents}</span>
            <span className="text-[10px] text-slate-400 block">Across all rosters</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-teal-500" />
          </div>
        </div>

        {/* Present Today */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Present Today</span>
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.presentToday}</span>
            <span className="text-[10px] text-emerald-500/80 font-medium block">Active in class</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-emerald-500" />
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Rate</span>
            <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{stats.attendancePercentage}%</span>
            <span className="text-[10px] text-teal-500/80 font-medium block">Monthly cumulative</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
            <Percent className="h-6 w-6 text-teal-500" />
          </div>
        </div>

        {/* Pending Attendance */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
            <span className={`text-3xl font-bold ${stats.pendingAttendance > 0 ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {stats.pendingAttendance}
            </span>
            <span className="text-[10px] text-slate-400 block">Remaining schedules</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Navigation Hub</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button 
            onClick={() => setActiveTab('attendance')} 
            className="flex flex-col items-center justify-center p-4 bg-teal-50/40 hover:bg-teal-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-teal-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <BookOpen className="h-6 w-6 text-teal-500 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Mark Attendance</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')} 
            className="flex flex-col items-center justify-center p-4 bg-cyan-50/40 hover:bg-cyan-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-cyan-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <History className="h-6 w-6 text-cyan-500 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">View History</span>
          </button>

          <button 
            onClick={() => setActiveTab('present_students')} 
            className="flex flex-col items-center justify-center p-4 bg-emerald-50/40 hover:bg-emerald-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-emerald-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <UserCheck className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Present Register</span>
          </button>

          <button 
            onClick={() => setActiveTab('absent_students')} 
            className="flex flex-col items-center justify-center p-4 bg-rose-50/40 hover:bg-rose-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-rose-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <UserX className="h-6 w-6 text-rose-500 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Absent Warning</span>
          </button>

          <button 
            onClick={() => setActiveTab('reports')} 
            className="flex flex-col items-center justify-center p-4 bg-sky-50/40 hover:bg-sky-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-sky-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <FileSpreadsheet className="h-6 w-6 text-sky-500 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Download Reports</span>
          </button>
        </div>
      </div>

      {/* Perfect Attendance Leaderboard */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Perfect Attendance</h3>
            <p className="text-xs text-slate-400">Top performers in your classes</p>
          </div>
          <Award className="h-5 w-5 text-amber-500 animate-bounce" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaderboardStudents.map((student, i) => (
            <div key={student.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/10 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3 overflow-hidden">
                <img 
                  src={student.photo} 
                  alt={student.name} 
                  className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 object-cover"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{student.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{student.year} • Sec {student.section}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  student.previousAttendance === 100 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' 
                    : 'bg-teal-50 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300'
                }`}>
                  {student.previousAttendance}%
                </span>
                {student.previousAttendance === 100 && (
                  <span className="h-2 w-2 bg-amber-500 rounded-full inline-block animate-pulse"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
