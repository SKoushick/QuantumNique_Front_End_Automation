import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  CalendarDays, 
  ChevronRight, 
  RotateCcw, 
  Save, 
  Users, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';

export default function MarkAttendance({ currentTeacher, setActiveTab, setLastMarkedClass, triggerNotification }) {
  // Cascading Selection State
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({}); // { studentId: status }
  const [previousSheet, setPreviousSheet] = useState({}); // for Undo
  const [loading, setLoading] = useState(false);
  const [classLoaded, setClassLoaded] = useState(false);

  // Derive dropdown options dynamically based on teacher's assignments
  const departments = currentTeacher?.assignedDepartments || [];
  
  const years = currentTeacher?.assignedClasses
    ?.filter(c => c.department === selectedDept)
    ?.map(c => c.year)
    ?.filter((val, idx, self) => self.indexOf(val) === idx) || [];

  const sections = currentTeacher?.assignedClasses
    ?.filter(c => c.department === selectedDept && c.year === selectedYear)
    ?.map(c => c.section)
    ?.filter((val, idx, self) => self.indexOf(val) === idx) || [];

  const subjects = currentTeacher?.assignedClasses
    ?.filter(c => c.department === selectedDept && c.year === selectedYear && c.section === selectedSection)
    ?.map(c => c.subject)
    ?.filter((val, idx, self) => self.indexOf(val) === idx) || [];

  // Reset dependent fields on parent changes
  useEffect(() => {
    setSelectedYear('');
    setSelectedSection('');
    setSelectedSubject('');
    setClassLoaded(false);
  }, [selectedDept]);

  useEffect(() => {
    setSelectedSection('');
    setSelectedSubject('');
    setClassLoaded(false);
  }, [selectedYear]);

  useEffect(() => {
    setSelectedSubject('');
    setClassLoaded(false);
  }, [selectedSection]);

  useEffect(() => {
    setClassLoaded(false);
  }, [selectedSubject]);

  // Load Auto-Saved Draft from LocalStorage if it exists
  const getDraftKey = () => {
    return `draft-${currentTeacher.teacherId}-${selectedDept}-${selectedYear}-${selectedSection}-${selectedSubject}-${selectedDate}`;
  };

  const loadClassRoster = async () => {
    if (!selectedDept || !selectedYear || !selectedSection || !selectedSubject) {
      alert('Please select all filters to load the class list.');
      return;
    }

    setLoading(true);
    try {
      const roster = await apiService.getStudents(selectedDept, selectedYear, selectedSection);
      setStudents(roster);
      
      // Check for drafts or existing records
      const draftKey = getDraftKey();
      const savedDraft = localStorage.getItem(draftKey);
      
      // Check if attendance was already submitted for this key in history
      const history = await apiService.getAttendanceHistory(selectedDept, selectedYear, selectedSection, selectedSubject);
      const todayRecord = history.find(h => h.date === selectedDate);

      const initialSheet = {};
      if (todayRecord) {
        // Load existing attendance
        todayRecord.records.forEach(r => {
          initialSheet[r.studentId] = r.status;
        });
        triggerNotification(`Loaded previously submitted attendance for ${selectedSubject}`);
      } else if (savedDraft) {
        // Load draft
        Object.assign(initialSheet, JSON.parse(savedDraft));
        triggerNotification('Restored draft attendance sheet');
      } else {
        // Default to unmarked
        roster.forEach(s => {
          initialSheet[s.id] = '';
        });
      }

      setAttendanceSheet(initialSheet);
      setPreviousSheet({ ...initialSheet });
      setClassLoaded(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load roster.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle student attendance status
  const handleStatusChange = (studentId, status) => {
    const updated = { ...attendanceSheet, [studentId]: status };
    setPreviousSheet({ ...attendanceSheet }); // save for undo
    setAttendanceSheet(updated);
    
    // Auto-Save Draft
    localStorage.setItem(getDraftKey(), JSON.stringify(updated));
  };

  // Bulk Marking actions
  const markAllPresent = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = 'Present';
    });
    setPreviousSheet({ ...attendanceSheet });
    setAttendanceSheet(updated);
    localStorage.setItem(getDraftKey(), JSON.stringify(updated));
  };

  const markAllAbsent = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = 'Absent';
    });
    setPreviousSheet({ ...attendanceSheet });
    setAttendanceSheet(updated);
    localStorage.setItem(getDraftKey(), JSON.stringify(updated));
  };

  const undoAttendance = () => {
    setAttendanceSheet({ ...previousSheet });
    localStorage.setItem(getDraftKey(), JSON.stringify(previousSheet));
    triggerNotification('Reverted last attendance action');
  };

  const resetAttendance = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = '';
    });
    setAttendanceSheet(updated);
    localStorage.removeItem(getDraftKey());
  };

  // Calculate live statistics
  const totalStudentsCount = students.length;
  const presentCount = Object.values(attendanceSheet).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendanceSheet).filter(s => s === 'Absent').length;
  const lateCount = Object.values(attendanceSheet).filter(s => s === 'Late').length;
  const leaveCount = Object.values(attendanceSheet).filter(s => s === 'Leave').length;
  const unmarkedCount = Object.values(attendanceSheet).filter(s => s === '').length;
  
  const presencePercentage = totalStudentsCount > 0 
    ? Math.round(((presentCount + lateCount) / totalStudentsCount) * 100) 
    : 0;

  // Submit and Save
  const saveAttendance = async () => {
    if (unmarkedCount > 0) {
      alert(`Please mark attendance for all students. ${unmarkedCount} remaining.`);
      return;
    }

    setLoading(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        registerNumber: s.registerNumber,
        status: attendanceSheet[s.id]
      }));

      const payload = {
        department: selectedDept,
        year: selectedYear,
        section: selectedSection,
        subject: selectedSubject,
        date: selectedDate,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        records
      };

      await apiService.saveAttendance(payload);
      
      // Store reference of marked class for pages
      setLastMarkedClass({
        department: selectedDept,
        year: selectedYear,
        section: selectedSection,
        subject: selectedSubject,
        date: selectedDate,
        total: totalStudentsCount,
        present: presentCount,
        absent: absentCount,
        rate: presencePercentage
      });

      // Clear draft
      localStorage.removeItem(getDraftKey());
      triggerNotification(`Attendance successfully saved for ${selectedSubject}!`);
      
      // Auto redirect to Present Students view
      setActiveTab('present_students');
    } catch (err) {
      alert('Failed to save attendance record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Dropdown Filters Portal */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <SlidersHorizontal className="h-5 w-5 text-teal-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Select Assigned Target Class</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none transition-all cursor-pointer dark:text-slate-200"
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Year</label>
            <select
              value={selectedYear}
              disabled={!selectedDept}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none transition-all cursor-pointer dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Year</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Section</label>
            <select
              value={selectedSection}
              disabled={!selectedYear}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none transition-all cursor-pointer dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Section</option>
              {sections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</label>
            <select
              value={selectedSubject}
              disabled={!selectedSection}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none transition-all cursor-pointer dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none transition-all cursor-pointer dark:text-slate-200"
            />
          </div>
        </div>

        <button
          onClick={loadClassRoster}
          disabled={!selectedSubject || loading}
          className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Initializing Roster...' : 'Load Student Roster'}
        </button>
      </div>

      {/* Main Mark Section */}
      {classLoaded && (
        <div className="space-y-6">
          
          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
            <div className="text-center md:border-r border-slate-100 dark:border-slate-800/50 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Class Size</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalStudentsCount}</span>
            </div>
            
            <div className="text-center md:border-r border-slate-100 dark:border-slate-800/50 py-1">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">Present (✅)</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</span>
            </div>
            
            <div className="text-center md:border-r border-slate-100 dark:border-slate-800/50 py-1">
              <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">Absent (❌)</span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{absentCount}</span>
            </div>
            
            <div className="text-center md:border-r border-slate-100 dark:border-slate-800/50 py-1">
              <span className="text-[10px] uppercase font-bold text-amber-500 block mb-1">Late (🟡)</span>
              <span className="text-2xl font-bold text-amber-500">{lateCount}</span>
            </div>

            <div className="text-center md:border-r border-slate-100 dark:border-slate-800/50 py-1">
              <span className="text-[10px] uppercase font-bold text-teal-500 block mb-1">Leave (🔵)</span>
              <span className="text-2xl font-bold text-teal-500">{leaveCount}</span>
            </div>

            <div className="text-center py-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Presence Ratio</span>
              <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{presencePercentage}%</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-100/50 dark:bg-slate-800/20 px-6 py-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={markAllPresent} 
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-emerald-500/20 transition-colors"
              >
                Mark All Present
              </button>
              
              <button 
                onClick={markAllAbsent} 
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-500/20 transition-colors"
              >
                Mark All Absent
              </button>

              <button 
                onClick={undoAttendance} 
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Undo</span>
              </button>

              <button 
                onClick={resetAttendance} 
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-medium px-3 py-2.5"
              >
                Clear Sheet
              </button>
            </div>

            <button
              onClick={saveAttendance}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-all active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>Save Attendance</span>
            </button>
          </div>

          {/* Student Roster Table Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Register Number</th>
                    <th className="py-4 px-6">Roll No</th>
                    <th className="py-4 px-6">Previous Score</th>
                    <th className="py-4 px-6 text-center">Status Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {students.map(student => {
                    const status = attendanceSheet[student.id];
                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors ${
                          status === 'Absent' ? 'bg-red-500/[0.02]' : ''
                        }`}
                      >
                        {/* Student Name + Photo */}
                        <td className="py-3 px-6 flex items-center space-x-3">
                          <img 
                            src={student.photo} 
                            alt={student.name} 
                            className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">{student.name}</span>
                            <span className="text-[10px] text-slate-400">Class: {student.year} • Sec {student.section}</span>
                          </div>
                        </td>

                        {/* Register Number */}
                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {student.registerNumber}
                        </td>

                        {/* Roll Number */}
                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {student.rollNumber}
                        </td>

                        {/* Previous Attendance Score */}
                        <td className="py-3 px-6">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold ${
                              student.previousAttendance < 75 ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {student.previousAttendance}%
                            </span>
                            {student.previousAttendance < 75 && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 px-1 py-0.5 rounded font-extrabold uppercase">Defaulter</span>
                            )}
                          </div>
                        </td>

                        {/* Select Status Buttons */}
                        <td className="py-3 px-6">
                          <div className="flex justify-center items-center gap-1.5">
                            {/* Present */}
                            <button
                              onClick={() => handleStatusChange(student.id, 'Present')}
                              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                status === 'Present'
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                  : 'bg-transparent border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Absent */}
                            <button
                              onClick={() => handleStatusChange(student.id, 'Absent')}
                              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                status === 'Absent'
                                  ? 'bg-red-500 border-red-500 text-white shadow-sm shadow-red-500/20'
                                  : 'bg-transparent border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Absent</span>
                            </button>

                            {/* Late */}
                            <button
                              onClick={() => handleStatusChange(student.id, 'Late')}
                              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                status === 'Late'
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/20'
                                  : 'bg-transparent border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              <span>Late</span>
                            </button>

                            {/* Leave */}
                            <button
                              onClick={() => handleStatusChange(student.id, 'Leave')}
                              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                status === 'Leave'
                                  ? 'bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-500/20'
                                  : 'bg-transparent border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>Leave</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roster Unloaded Welcome Details */}
      {!classLoaded && (
        <div className="glass-card bg-slate-50 dark:bg-slate-800/10 rounded-3xl p-12 border border-slate-200/50 dark:border-slate-800/50 text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400">
            <Info className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200">Load Class Attendance Sheet</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please choose the target Department, Academic Year, Section, and Subject in the filters above, and select the date of the session to fetch the student checklist.
          </p>
        </div>
      )}
    </div>
  );
}
