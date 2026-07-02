import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarDays, 
  UserCheck, 
  UserX, 
  Percent, 
  Clock, 
  Play, 
  BookOpen, 
  AlertTriangle,
  FileSpreadsheet,
  Award,
  History,
  TrendingUp,
  AwardIcon
} from 'lucide-react';
import { apiService } from '../services/api';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // PREPARE CHART DATA
  
  // 1. Line Chart: Last 7 sessions presence rate trend
  const sortedHistory = [...historyData]
    .slice(0, 7)
    .reverse();
  
  const lineChartData = {
    labels: sortedHistory.map(h => `${h.date.split('-').slice(1).join('/')} (${h.subject})`),
    datasets: [
      {
        fill: true,
        label: 'Attendance Rate (%)',
        data: sortedHistory.map(h => {
          const total = h.records.length;
          const present = h.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
          return total > 0 ? Math.round((present / total) * 100) : 0;
        }),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: { min: 40, max: 100, grid: { color: 'rgba(156,163,175,0.1)' } },
      x: { grid: { display: false } }
    }
  };

  // 2. Bar Chart: Average attendance per unique subject
  const subjectSums = {};
  const subjectCounts = {};
  historyData.forEach(h => {
    const total = h.records.length;
    const present = h.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const rate = total > 0 ? (present / total) * 100 : 0;
    
    if (!subjectSums[h.subject]) {
      subjectSums[h.subject] = 0;
      subjectCounts[h.subject] = 0;
    }
    subjectSums[h.subject] += rate;
    subjectCounts[h.subject]++;
  });

  const barChartLabels = Object.keys(subjectSums);
  const barChartValues = barChartLabels.map(sub => Math.round(subjectSums[sub] / subjectCounts[sub]));

  const barChartData = {
    labels: barChartLabels,
    datasets: [
      {
        label: 'Average Presence (%)',
        data: barChartValues,
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(34, 197, 94, 0.7)'
        ].slice(0, barChartLabels.length),
        borderRadius: 8,
        borderWidth: 0,
        barThickness: 24,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(156,163,175,0.1)' } },
      x: { grid: { display: false } }
    }
  };

  // 3. Pie Chart: Today's presence distribution
  const pieChartData = {
    labels: ['Present Today', 'Absent Today', 'Late', 'Approved Leave'],
    datasets: [
      {
        data: [stats.presentToday, stats.absentToday, stats.lateToday, stats.leaveToday],
        backgroundColor: [
          'rgba(34, 197, 94, 0.75)',  // Emerald Green
          'rgba(239, 68, 68, 0.75)',   // Rose Red
          'rgba(234, 179, 8, 0.75)',   // Amber Yellow
          'rgba(59, 130, 246, 0.75)'   // Cobalt Blue
        ],
        borderColor: 'transparent',
        borderWidth: 0,
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 11, family: 'Plus Jakarta Sans' }
        }
      }
    }
  };

  // Generate perfect attendance leaderboard from student rosters
  const mockStudents = JSON.parse(localStorage.getItem('attendance_students') || '[]');
  const leaderboardStudents = mockStudents
    .filter(s => currentTeacher.assignedClasses.some(c => c.department === s.department && c.year === s.year && c.section === s.section))
    .sort((a, b) => b.previousAttendance - a.previousAttendance)
    .slice(0, 4);

  // Generate calendar days for heatmap (last 28 days)
  const heatmapDays = [];
  const startDay = new Date();
  startDay.setDate(startDay.getDate() - 27);
  for (let i = 0; i < 28; i++) {
    const curr = new Date(startDay);
    curr.setDate(startDay.getDate() + i);
    const dateStr = curr.toISOString().split('T')[0];
    const match = historyData.find(h => h.date === dateStr);
    
    let rate = null;
    if (match) {
      const total = match.records.length;
      const present = match.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      rate = total > 0 ? (present / total) * 100 : 0;
    } else if (curr.getDay() === 0) {
      rate = -1; // Sunday (holiday)
    }

    heatmapDays.push({
      date: dateStr,
      day: curr.getDate(),
      dayOfWeek: curr.getDay(),
      rate
    });
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-card bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Welcome back, {currentTeacher.name}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            You are managing <span className="font-semibold text-indigo-500">{currentTeacher.assignedClasses.length} assigned classes</span> across your departments. Here is today's overview.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('attendance')}
          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/15 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-2 w-fit"
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
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-indigo-500" />
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
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.attendancePercentage}%</span>
            <span className="text-[10px] text-indigo-500/80 font-medium block">Monthly cumulative</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Percent className="h-6 w-6 text-indigo-500" />
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
            className="flex flex-col items-center justify-center p-4 bg-indigo-50/40 hover:bg-indigo-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-indigo-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <BookOpen className="h-6 w-6 text-indigo-500 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Mark Attendance</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')} 
            className="flex flex-col items-center justify-center p-4 bg-purple-50/40 hover:bg-purple-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-purple-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <History className="h-6 w-6 text-purple-500 mb-2 group-hover:scale-105 transition-transform" />
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
            className="flex flex-col items-center justify-center p-4 bg-cyan-50/40 hover:bg-cyan-50 dark:bg-slate-800/30 dark:hover:bg-slate-800 rounded-2xl border border-cyan-100/30 dark:border-slate-700/20 text-center transition-all group active:scale-95"
          >
            <FileSpreadsheet className="h-6 w-6 text-cyan-500 mb-2 group-hover:scale-105 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Download Reports</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance trend (Line chart) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Weekly Attendance Trend</h3>
              <p className="text-xs text-slate-400">Class-wise presence rate comparison</p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+2.4%</span>
            </div>
          </div>
          <div className="h-64 relative">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Today's status ratio (Pie chart) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Today's Distribution</h3>
            <p className="text-xs text-slate-400">Marked status shares</p>
          </div>
          <div className="h-64 relative flex items-center justify-center">
            {stats.todayRecordsCount > 0 ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <div className="text-center text-xs text-slate-400 py-10">
                <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                No attendance marked today.<br/>
                <button onClick={() => setActiveTab('attendance')} className="text-indigo-500 font-semibold hover:underline mt-1">Mark attendance now</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Comparisons, Defaulters, Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subject Comparison Bar Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4 lg:col-span-2">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Subject Comparison</h3>
            <p className="text-xs text-slate-400">Average classroom presence per subject</p>
          </div>
          <div className="h-64 relative">
            {barChartLabels.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div className="text-center text-xs text-slate-400 py-16">
                No historical records loaded.
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard & Badges */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Perfect Attendance</h3>
              <p className="text-xs text-slate-400">Top performers in your classes</p>
            </div>
            <Award className="h-5 w-5 text-amber-500 animate-bounce" />
          </div>
          <div className="space-y-3.5">
            {leaderboardStudents.map((student, i) => (
              <div key={student.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-700/10">
                <div className="flex items-center space-x-3">
                  <img 
                    src={student.photo} 
                    alt={student.name} 
                    className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{student.name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{student.year} • Sec {student.section}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    student.previousAttendance === 100 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' 
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                  }`}>
                    {student.previousAttendance}%
                  </span>
                  {student.previousAttendance === 100 && (
                    <span className="h-2.5 w-2.5 bg-amber-500 rounded-full inline-block animate-ping"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Density Calendar Heatmap */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-5">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Attendance Density Heatmap</h3>
          <p className="text-xs text-slate-400">Classroom activity rate over the last 28 days</p>
        </div>
        <div className="flex flex-wrap gap-2.5 max-w-full justify-start items-center">
          {heatmapDays.map((day, idx) => {
            let color = 'bg-slate-100 dark:bg-slate-800/80'; // No record
            let title = `${day.date}: No Session`;

            if (day.rate === -1) {
              color = 'bg-slate-200/50 dark:bg-slate-800/20'; // Sunday
              title = `${day.date}: Sunday (Holiday)`;
            } else if (day.rate !== null) {
              if (day.rate >= 90) color = 'bg-emerald-500 shadow-sm shadow-emerald-500/30';
              else if (day.rate >= 80) color = 'bg-emerald-400/80';
              else if (day.rate >= 75) color = 'bg-amber-400';
              else color = 'bg-rose-500 shadow-sm shadow-rose-500/20';
              title = `${day.date}: ${Math.round(day.rate)}% Attendance`;
            }

            return (
              <div 
                key={idx} 
                className={`h-9 w-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white cursor-help hover:scale-110 active:scale-95 transition-all ${color}`}
                title={title}
              >
                {day.day}
              </div>
            );
          })}
        </div>
        <div className="flex items-center space-x-4 text-[10px] text-slate-400 pt-1">
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded bg-slate-200 dark:bg-slate-800"></span>
            <span>No class</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded bg-rose-500"></span>
            <span>&lt;75% (Poor)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded bg-amber-400"></span>
            <span>75%-80% (Average)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded bg-emerald-400"></span>
            <span>80%-90% (Good)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded bg-emerald-500"></span>
            <span>90%+ (Excellent)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
