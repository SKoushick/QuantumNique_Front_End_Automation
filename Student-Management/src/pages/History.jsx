import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  List, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Edit2, 
  Check, 
  X, 
  Clock, 
  RotateCcw,
  SlidersHorizontal,
  Save
} from 'lucide-react';
import { apiService } from '../services/api';

export default function History({ currentTeacher, triggerNotification }) {
  const [viewMode, setViewMode] = useState('calendar'); // calendar, timeline, table
  const [historyRecords, setHistoryRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Selected date details (Calendar view)
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Edit Mode state
  const [editRecord, setEditRecord] = useState(null);
  const [editRoster, setEditRoster] = useState([]);
  const [editSheet, setEditSheet] = useState({});

  useEffect(() => {
    loadHistory();
  }, [currentTeacher]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAttendanceHistory();
      setHistoryRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // CALENDAR HELPER CONSTRUCTIONS
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get status color for calendar day based on attendance rate
  const getDayStatusColor = (dateString, dayOfWeek) => {
    if (dayOfWeek === 0) return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200 dark:border-purple-800/30'; // Sunday

    const sessions = historyRecords.filter(r => r.date === dateString);
    if (sessions.length === 0) return 'bg-slate-50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-600 border-transparent';

    // Calculate average rate for sessions on this day
    let totalP = 0;
    let totalRecords = 0;

    sessions.forEach(s => {
      s.records.forEach(r => {
        totalRecords++;
        if (r.status === 'Present' || r.status === 'Late') totalP++;
      });
    });

    const rate = totalRecords > 0 ? (totalP / totalRecords) * 100 : 0;
    
    if (rate >= 85) return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/10';
    if (rate >= 75) return 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm shadow-amber-400/10';
    return 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/10'; // Defaulter rate
  };

  const selectCalendarDate = (dateString, hasSessions) => {
    if (!hasSessions) {
      setSelectedCalendarDate(null);
      return;
    }
    const sessions = historyRecords.filter(r => r.date === dateString);
    setSelectedCalendarDate({ date: dateString, sessions });
  };

  // EDIT ATTENDANCE LOGIC
  const startEditing = async (record) => {
    setLoading(true);
    try {
      const roster = await apiService.getStudents(record.department, record.year, record.section);
      setEditRoster(roster);
      setEditRecord(record);
      
      const sheet = {};
      record.records.forEach(r => {
        sheet[r.studentId] = r.status;
      });
      setEditSheet(sheet);
    } catch (err) {
      alert('Failed to load edit details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatusChange = (studentId, status) => {
    setEditSheet({ ...editSheet, [studentId]: status });
  };

  const saveEditChanges = async () => {
    setLoading(true);
    try {
      const updatedRecords = editRoster.map(s => ({
        studentId: s.id,
        registerNumber: s.registerNumber,
        status: editSheet[s.id] || 'Present'
      }));

      const payload = {
        department: editRecord.department,
        year: editRecord.year,
        section: editRecord.section,
        subject: editRecord.subject,
        date: editRecord.date,
        time: editRecord.time,
        records: updatedRecords
      };

      await apiService.saveAttendance(payload);
      triggerNotification(`Edited session attendance for ${editRecord.subject}`);
      
      setEditRecord(null);
      setSelectedCalendarDate(null);
      loadHistory();
    } catch (e) {
      alert('Failed to modify record.');
    } finally {
      setLoading(false);
    }
  };

  // RENDER SEPARATE VIEWS

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weeksDays = [...blanks, ...days];

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const fullYear = currentMonth.getFullYear();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Grid */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 dark:text-white text-base">
              {monthName} {fullYear}
            </h4>
            <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d}</span>
            ))}
            
            {weeksDays.map((d, index) => {
              if (d === null) return <div key={`blank-${index}`} className="h-12"></div>;
              
              const dayStr = `${fullYear}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayOfWeek = new Date(fullYear, currentMonth.getMonth(), d).getDay();
              
              const sessionsOnDay = historyRecords.filter(r => r.date === dayStr);
              const colorClass = getDayStatusColor(dayStr, dayOfWeek);
              
              return (
                <button
                  key={`day-${d}`}
                  onClick={() => selectCalendarDate(dayStr, sessionsOnDay.length > 0)}
                  disabled={sessionsOnDay.length === 0 && dayOfWeek === 0}
                  className={`h-12 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${colorClass} ${
                    sessionsOnDay.length > 0 ? 'hover:scale-[1.06] active:scale-95 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4 text-[10px] text-slate-400 pt-2 justify-center border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Present &gt;85%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              <span>Present 75%-85%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>Poor &lt;75%</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-purple-200 dark:bg-purple-500/20"></span>
              <span>Sunday Holiday</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-5">
          <h4 className="font-bold text-slate-800 dark:text-white text-base">Date details</h4>
          
          {selectedCalendarDate ? (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-700/10">
                <span className="text-[10px] text-slate-400 font-bold block">Selected Date</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {new Date(selectedCalendarDate.date).toLocaleDateString('en-US', { dateStyle: 'full' })}
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {selectedCalendarDate.sessions.map((session, sidx) => {
                  const presents = session.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
                  const rate = Math.round((presents / session.records.length) * 100);
                  
                  return (
                    <div key={sidx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{session.subject}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            rate >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>{rate}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{session.year} - Sec {session.section}</span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>P: {presents} | A: {session.records.length - presents}</span>
                        <span>{session.time}</span>
                      </div>

                      <button
                        onClick={() => startEditing(session)}
                        className="w-full flex items-center justify-center space-x-1 py-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit Attendance</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              Click any active date with color markings on the calendar to view its session records.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    return (
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6 max-w-2xl mx-auto">
        <h4 className="font-bold text-slate-800 dark:text-white text-base">Activity Audit Timeline</h4>
        
        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-8 py-2">
          {historyRecords.slice(0, 10).map((record, index) => {
            const audit = record.auditLog?.[record.auditLog.length - 1] || { action: 'Submitted', timestamp: `${record.date} ${record.time}`, user: record.teacherName };
            const presents = record.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
            const absents = record.records.length - presents;

            return (
              <div key={index} className="relative">
                {/* Bullet */}
                <span className="absolute left-[-30px] top-1.5 h-4 w-4 bg-indigo-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"></span>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {audit.action} Attendance Registry
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({audit.timestamp})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Faculty <span className="font-semibold text-indigo-500">{audit.user}</span> saved attendance for <span className="font-semibold text-slate-700 dark:text-slate-300">{record.subject}</span> ({record.year} - Sec {record.section}).
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-100/50 dark:border-slate-800/50 w-fit">
                    Statistics: <span className="text-emerald-500 font-semibold">{presents} Present</span>, <span className="text-rose-500 font-semibold">{absents} Absent</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    const filteredRecords = historyRecords.filter(r => 
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.year.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Table Search */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div className="relative w-full max-w-xs flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search historical subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Class details</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Present Count</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRecords.map((record, index) => {
                const presents = record.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
                return (
                  <tr key={index} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{record.date}</span>
                      <span className="text-[10px] text-slate-400">{record.time}</span>
                    </td>
                    <td className="py-3.5 px-6 text-sm text-slate-800 dark:text-slate-200 font-semibold">
                      {record.subject}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500 font-medium">
                      {record.year} - Sec {record.section}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500 font-medium truncate max-w-xs">
                      {record.department}
                    </td>
                    <td className="py-3.5 px-6 text-xs font-semibold">
                      <span className="text-emerald-500">{presents}</span> / <span className="text-slate-400">{record.records.length}</span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => startEditing(record)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all inline-flex items-center space-x-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* View Switch Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/30">
          <button
            onClick={() => { setViewMode('calendar'); setEditRecord(null); }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'calendar' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Interactive Calendar</span>
          </button>
          
          <button
            onClick={() => { setViewMode('timeline'); setEditRecord(null); }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'timeline' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Audit Timeline</span>
          </button>

          <button
            onClick={() => { setViewMode('table'); setEditRecord(null); }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'table' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="h-4 w-4" />
            <span>Classic Roster Grid</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && <div className="text-center text-slate-400 text-sm">Synchronizing Database...</div>}

      {/* Editing Workspace Panel */}
      {editRecord ? (
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold px-2.5 py-1 rounded-lg">Attendance Editor</span>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mt-2">
                Modifying {editRecord.subject} ({editRecord.date})
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">{editRecord.year} - Sec {editRecord.section} • {editRecord.department}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setEditRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveEditChanges}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Edits</span>
              </button>
            </div>
          </div>

          <div className="max-h-[450px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
            {editRoster.map(s => {
              const currentStatus = editSheet[s.id];
              return (
                <div key={s.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-all">
                  <div className="flex items-center space-x-3">
                    <img src={s.photo} alt={s.name} className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{s.name}</span>
                      <span className="text-[9px] text-slate-400">Reg: {s.registerNumber} • Roll: {s.rollNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {['Present', 'Absent', 'Late', 'Leave'].map(st => {
                      const isActive = currentStatus === st;
                      let color = '';
                      if (st === 'Present') color = isActive ? 'bg-emerald-500 text-white border-emerald-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800';
                      else if (st === 'Absent') color = isActive ? 'bg-rose-500 text-white border-rose-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800';
                      else if (st === 'Late') color = isActive ? 'bg-amber-500 text-white border-amber-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800';
                      else color = isActive ? 'bg-indigo-500 text-white border-indigo-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800';

                      return (
                        <button
                          key={st}
                          onClick={() => handleEditStatusChange(s.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-800 transition-all ${color}`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'calendar' && renderCalendar()}
          {viewMode === 'timeline' && renderTimeline()}
          {viewMode === 'table' && renderTable()}
        </>
      )}
    </div>
  );
}
