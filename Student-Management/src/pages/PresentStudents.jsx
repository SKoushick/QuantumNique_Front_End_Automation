import React, { useState, useEffect } from 'react';
import { UserCheck, Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';

export default function PresentStudents({ currentTeacher, lastMarkedClass }) {
  const [sessionRecord, setSessionRecord] = useState(null);
  const [presentRoster, setPresentRoster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('roll'); // roll, name
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPresentList() {
      // Use the last marked class info, or find the most recent attendance session in history
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
        
        // Match by date
        const record = classParams.date 
          ? history.find(h => h.date === classParams.date)
          : history[0];

        if (record) {
          setSessionRecord(record);
          
          // Get all students in this class
          const students = await apiService.getStudents(record.department, record.year, record.section);
          
          // Map attendance status to student objects
          const present = [];
          record.records.forEach(r => {
            if (r.status === 'Present' || r.status === 'Late') {
              const info = students.find(s => s.id === r.studentId || s.registerNumber === r.registerNumber);
              if (info) {
                present.push({
                  ...info,
                  status: r.status,
                  markedTime: record.time
                });
              }
            }
          });

          setPresentRoster(present);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPresentList();
  }, [lastMarkedClass, currentTeacher]);

  // Filters
  const filtered = presentRoster.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return parseInt(a.rollNumber) - parseInt(b.rollNumber);
    }
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading roster...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {sessionRecord ? (
        <>
          {/* Header Metadata Summary */}
          <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg">Live Session Record</span>
                <span className="text-xs text-slate-400 font-medium">Recorded at {sessionRecord.time}</span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-white mt-2">
                {sessionRecord.subject} ({sessionRecord.year} - Sec {sessionRecord.section})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sessionRecord.department}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Present Students</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentRoster.length}</span>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-800 pl-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance Rate</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {sessionRecord.records.length > 0 
                    ? Math.round((presentRoster.length / sessionRecord.records.length) * 100)
                    : 0}%
                </span>
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
                placeholder="Search present students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-indigo-500 dark:text-slate-200"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">Sort:</span>
              <button 
                onClick={() => setSortBy('roll')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === 'roll' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Roll No
              </button>
              <button 
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === 'name' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Name
              </button>
            </div>
          </div>

          {/* Present Students Grid Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Register Number</th>
                    <th className="py-4 px-6">Roll No</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Marked Time</th>
                    <th className="py-4 px-6">Teacher Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {sorted.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-6 flex items-center space-x-3">
                        <img 
                          src={student.photo} 
                          alt={student.name} 
                          className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                        />
                        <div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">{student.name}</span>
                          <span className="text-[10px] text-slate-400">{student.department}</span>
                        </div>
                      </td>
                      
                      <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {student.registerNumber}
                      </td>

                      <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {student.rollNumber}
                      </td>

                      <td className="py-3 px-6">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          student.status === 'Present' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}>
                          {student.status}
                        </span>
                      </td>

                      <td className="py-3 px-6 text-xs text-slate-500">
                        {student.markedTime}
                      </td>

                      <td className="py-3 px-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {sessionRecord.teacherName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sorted.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching present students found.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card bg-slate-50 dark:bg-slate-800/10 rounded-3xl p-12 border border-slate-200/50 dark:border-slate-800/50 text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200">No Session Marked Yet</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please navigate to the "Mark Attendance" section, choose a class and submit attendance. The register of present students will display here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
