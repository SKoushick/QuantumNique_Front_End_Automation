import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Phone, MessageSquare, Mail, SlidersHorizontal } from 'lucide-react';
import { apiService } from '../services/api';

export default function Defaulters({ currentTeacher, triggerNotification }) {
  const [defaulters, setDefaulters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterDept, setFilterDept] = useState('');

  useEffect(() => {
    loadDefaulters();
  }, [currentTeacher]);

  const loadDefaulters = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDefaulters();
      setDefaulters(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = (studentName, contact) => {
    triggerNotification(`Warning SMS Sent to ${contact}: Dear Parent, your child ${studentName} has low attendance (< 75%). Please contact class advisor.`);
  };

  const filtered = defaulters.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDept || s.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Alert Header Grid banner */}
      <div className="glass-card rounded-3xl p-6 border border-rose-500/10 bg-rose-500/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Attendance Defaulters System</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Students whose cumulative attendance falls below the <span className="font-semibold text-rose-500">75% threshold</span> are automatically flagged. Action is required to notify parent guardians.
            </p>
          </div>
        </div>
        
        <div className="text-center bg-rose-500/10 border border-rose-500/20 px-6 py-3 rounded-2xl">
          <span className="text-[10px] text-rose-500 font-bold uppercase block">Total Defaulters</span>
          <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{defaulters.length}</span>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search defaulter name or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-teal-500 dark:text-slate-200"
          />
        </div>

        {/* Filter by Department */}
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-teal-500 dark:text-slate-200 cursor-pointer"
          >
            <option value="">All Departments</option>
            {currentTeacher?.assignedDepartments?.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid listing cards */}
      {loading ? (
        <div className="text-center text-slate-400 text-sm py-12">Checking rosters...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(student => (
            <div 
              key={student.id} 
              className="glass-card rounded-3xl p-6 border border-rose-500/10 hover:border-rose-500/30 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-5"
            >
              {/* Header profile */}
              <div className="flex items-start space-x-4">
                <img 
                  src={student.photo} 
                  alt={student.name} 
                  className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 dark:text-white block truncate">{student.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{student.department}</span>
                  <span className="text-[9px] uppercase font-bold text-teal-500 block mt-1 tracking-wider">
                    {student.year} • Sec {student.section}
                  </span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-rose-500">Cumulative Attendance</span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">{student.previousAttendance}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${student.previousAttendance}%` }}
                  ></div>
                </div>
              </div>

              {/* Parent Metadata details */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-700/10 text-[10px] space-y-1.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Register No:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{student.registerNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Roll Number:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{student.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parent Contact:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{student.parentContact}</span>
                </div>
              </div>

              {/* Actions controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleNotify(student.name, student.parentContact)}
                  className="flex-1 bg-rose-500/10 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-bold text-xs py-2.5 rounded-xl border border-rose-500/25 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Alert Parent</span>
                </button>
                
                <a
                  href={`tel:${student.parentContact}`}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                  title="Call parent dialer"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No attendance defaulters matching current parameters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
