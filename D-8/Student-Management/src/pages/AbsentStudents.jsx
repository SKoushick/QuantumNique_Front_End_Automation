import React, { useState, useEffect } from 'react';
import { UserX, Search, MessageSquare, PhoneCall, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';

export default function AbsentStudents({ currentTeacher, lastMarkedClass, triggerNotification }) {
  const [sessionRecord, setSessionRecord] = useState(null);
  const [absentRoster, setAbsentRoster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAbsentList() {
      const classParams = lastMarkedClass || (currentTeacher?.assignedClasses?.[0]);
      if (!classParams) return;

      setLoading(true);
      try {
        const history = await apiService.getAttendanceHistory(
          classParams.department,
          classParams.year,
          classParams.section,
          classParams.subject
        );
        
        const record = classParams.date 
          ? history.find(h => h.date === classParams.date)
          : history[0];

        if (record) {
          setSessionRecord(record);
          
          const students = await apiService.getStudents(record.department, record.year, record.section);
          
          const absent = [];
          record.records.forEach(r => {
            if (r.status === 'Absent' || r.status === 'Leave') {
              const info = students.find(s => s.id === r.studentId || s.registerNumber === r.registerNumber);
              if (info) {
                absent.push({
                  ...info,
                  status: r.status,
                  markedTime: record.time
                });
              }
            }
          });

          setAbsentRoster(absent);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAbsentList();
  }, [lastMarkedClass, currentTeacher]);

  const handleNotifyParent = (studentName, contact) => {
    triggerNotification(`SMS Alert Sent to ${contact}: Dear Parent, ${studentName} is ABSENT today.`);
  };

  const filtered = absentRoster.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading roster...</div>;
  }

  const lowAttendanceCount = absentRoster.filter(s => s.previousAttendance < 75).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {sessionRecord ? (
        <>
          {/* Header Summary Metadata */}
          <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-red-500/[0.01]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 font-bold px-2.5 py-1 rounded-lg">Absent & Leave Warning List</span>
                <span className="text-xs text-slate-400 font-medium">Recorded at {sessionRecord.time}</span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-white mt-2">
                {sessionRecord.subject} ({sessionRecord.year} - Sec {sessionRecord.section})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sessionRecord.department}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Absent Students</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{absentRoster.filter(s => s.status === 'Absent').length}</span>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-800 pl-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">On Approved Leave</span>
                <span className="text-2xl font-bold text-teal-500">{absentRoster.filter(s => s.status === 'Leave').length}</span>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-800 pl-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Defaulters Alert</span>
                <span className="text-2xl font-bold text-amber-500">{lowAttendanceCount}</span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-xs flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search absent students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-teal-500 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Register Number</th>
                    <th className="py-4 px-6">Parent Contact</th>
                    <th className="py-4 px-6">Attendance Score</th>
                    <th className="py-4 px-6">Status Type</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filtered.map(student => {
                    const isLow = student.previousAttendance < 75;
                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors ${
                          isLow ? 'bg-amber-500/[0.01]' : ''
                        }`}
                      >
                        <td className="py-3 px-6 flex items-center space-x-3">
                          <img 
                            src={student.photo} 
                            alt={student.name} 
                            className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">{student.name}</span>
                            <span className="text-[10px] text-slate-400">Roll No: {student.rollNumber} • Sec {student.section}</span>
                          </div>
                        </td>
                        
                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {student.registerNumber}
                        </td>

                        <td className="py-3 px-6 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center space-x-1">
                            <span>{student.parentContact}</span>
                          </div>
                        </td>

                        <td className="py-3 px-6">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-xs font-bold ${
                              isLow ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {student.previousAttendance}%
                            </span>
                            {isLow && (
                              <div className="flex items-center text-[8px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-extrabold uppercase space-x-0.5">
                                <AlertTriangle className="h-2 w-2" />
                                <span>Defaulter</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-6">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                            student.status === 'Absent' 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' 
                              : 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300'
                          }`}>
                            {student.status}
                          </span>
                        </td>

                        <td className="py-3 px-6 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleNotifyParent(student.name, student.parentContact)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors border border-rose-500/20 flex items-center space-x-1 text-[10px] font-bold"
                              title="Send SMS notification to parent"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Notify Parent</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching absent students found.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card bg-slate-50 dark:bg-slate-800/10 rounded-3xl p-12 border border-slate-200/50 dark:border-slate-800/50 text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <UserX className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200">No Session Marked Yet</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please navigate to the "Mark Attendance" section, choose a class and submit attendance. The list of absent students requiring warning updates will display here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
