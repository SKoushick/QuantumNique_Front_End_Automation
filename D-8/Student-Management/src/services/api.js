// Unified API & Local Storage Service
import { setupLocalStorage } from './mockData';

const BASE_URL = 'http://localhost:5000/api';

// Initialize localStorage databases if not present
setupLocalStorage();

// Helper to determine if the backend server is reachable
async function checkBackendReachable() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout
    const response = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    return false;
  }
}

export const apiService = {
  isMock: true, // Default to mock, will auto-detect

  async init() {
    const reachable = await checkBackendReachable();
    this.isMock = !reachable;
    console.log(`[Attendance System] Running in ${this.isMock ? 'MOCK (LocalStorage)' : 'LIVE (Node/Express)'} mode.`);
  },

  // TEACHER AUTHENTICATION
  async login(identifier, password) {
    await this.init();
    if (this.isMock) {
      const teachers = JSON.parse(localStorage.getItem('attendance_teachers') || '[]');
      const teacher = teachers.find(t => 
        (t.teacherId === identifier || t.email.toLowerCase() === identifier.toLowerCase()) && 
        t.password === password
      );
      if (!teacher) {
        throw new Error('Invalid Teacher ID/Email or Password');
      }
      
      const sessionData = { ...teacher };
      delete sessionData.password;
      localStorage.setItem('current_teacher', JSON.stringify(sessionData));
      return { token: 'mock-jwt-token-12345', teacher: sessionData };
    } else {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('current_teacher', JSON.stringify(data.teacher));
      return data;
    }
  },

  logout() {
    localStorage.removeItem('current_teacher');
    localStorage.removeItem('token');
  },

  getCurrentTeacher() {
    const teacher = localStorage.getItem('current_teacher');
    return teacher ? JSON.parse(teacher) : null;
  },

  // STUDENTS MANAGEMENT
  async getStudents(department, year, section) {
    await this.init();
    if (this.isMock) {
      const students = JSON.parse(localStorage.getItem('attendance_students') || '[]');
      // Filter by department, year, section
      const filtered = students.filter(s => 
        s.department === department && 
        s.year === year && 
        s.section === section
      );
      // Sort by roll number ascending
      return filtered.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/students?department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}&section=${encodeURIComponent(section)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    }
  },

  // ATTENDANCE MARK & HISTORY
  async saveAttendance({ department, year, section, subject, date, time, records }) {
    await this.init();
    const teacher = this.getCurrentTeacher();
    if (!teacher) throw new Error('Authentication required');

    if (this.isMock) {
      const history = JSON.parse(localStorage.getItem('attendance_history') || '[]');
      
      // Check if duplicate entry exists for this class/subject/date
      const existingIndex = history.findIndex(h => 
        h.department === department &&
        h.year === year &&
        h.section === section &&
        h.subject === subject &&
        h.date === date
      );

      const auditEntry = {
        action: existingIndex >= 0 ? 'Edited' : 'Created',
        timestamp: new Date().toLocaleString(),
        user: teacher.name
      };

      const newRecord = {
        id: existingIndex >= 0 ? history[existingIndex].id : `hist-${teacher.teacherId}-${subject}-${date}-${Date.now()}`,
        teacherId: teacher.teacherId,
        teacherName: teacher.name,
        department,
        year,
        section,
        subject,
        date,
        time,
        records,
        auditLog: existingIndex >= 0 
          ? [...(history[existingIndex].auditLog || []), auditEntry]
          : [auditEntry]
      };

      if (existingIndex >= 0) {
        history[existingIndex] = newRecord;
      } else {
        history.push(newRecord);
      }

      localStorage.setItem('attendance_history', JSON.stringify(history));
      this.updateStudentCumulativeAttendance(records, department, year, section);
      
      return { success: true, record: newRecord };
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ department, year, section, subject, date, time, records })
      });
      if (!response.ok) throw new Error('Failed to save attendance');
      return response.json();
    }
  },

  // Helper to dynamically adjust student's attendance stats in mockup
  updateStudentCumulativeAttendance(records, department, year, section) {
    const students = JSON.parse(localStorage.getItem('attendance_students') || '[]');
    const history = JSON.parse(localStorage.getItem('attendance_history') || '[]');
    
    // Filter all history for this class to get real ratio
    const classHistory = history.filter(h => 
      h.department === department && 
      h.year === year && 
      h.section === section
    );

    if (classHistory.length === 0) return;

    students.forEach(student => {
      if (student.department === department && student.year === year && student.section === section) {
        let totalClasses = 0;
        let presentClasses = 0;

        classHistory.forEach(h => {
          const match = h.records.find(r => r.studentId === student.id || r.registerNumber === student.registerNumber);
          if (match) {
            totalClasses++;
            if (match.status === 'Present' || match.status === 'Late') {
              presentClasses++;
            }
          }
        });

        if (totalClasses > 0) {
          student.previousAttendance = Math.round((presentClasses / totalClasses) * 100);
        }
      }
    });

    localStorage.setItem('attendance_students', JSON.stringify(students));
  },

  async getAttendanceHistory(department, year, section, subject) {
    await this.init();
    const teacher = this.getCurrentTeacher();
    if (!teacher) throw new Error('Authentication required');

    if (this.isMock) {
      const history = JSON.parse(localStorage.getItem('attendance_history') || '[]');
      return history.filter(h => 
        h.teacherId === teacher.teacherId &&
        (!department || h.department === department) &&
        (!year || h.year === year) &&
        (!section || h.section === section) &&
        (!subject || h.subject === subject)
      ).sort((a, b) => b.date.localeCompare(a.date));
    } else {
      const token = localStorage.getItem('token');
      let query = `?teacherId=${teacher.teacherId}`;
      if (department) query += `&department=${encodeURIComponent(department)}`;
      if (year) query += `&year=${encodeURIComponent(year)}`;
      if (section) query += `&section=${encodeURIComponent(section)}`;
      if (subject) query += `&subject=${encodeURIComponent(subject)}`;

      const response = await fetch(`${BASE_URL}/attendance/history${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    }
  },

  // DEFAULTERS (Low attendance < 75%)
  async getDefaulters() {
    await this.init();
    const teacher = this.getCurrentTeacher();
    if (!teacher) throw new Error('Authentication required');

    if (this.isMock) {
      const students = JSON.parse(localStorage.getItem('attendance_students') || '[]');
      // Filter students whose class belongs to the teacher's assigned classes
      const assignedClasses = teacher.assignedClasses;
      const filtered = students.filter(s => {
        const isAssigned = assignedClasses.some(c => 
          c.department === s.department && 
          c.year === s.year && 
          c.section === s.section
        );
        return isAssigned && s.previousAttendance < 75;
      });
      return filtered.sort((a, b) => a.previousAttendance - b.previousAttendance);
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/students/defaulters`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch defaulters');
      return response.json();
    }
  },

  // BULK IMPORT
  async bulkImportStudents(studentsList, department, year, section) {
    await this.init();
    if (this.isMock) {
      const students = JSON.parse(localStorage.getItem('attendance_students') || '[]');
      
      const newStudents = studentsList.map((s, index) => {
        const rollNo = s.rollNumber || (students.length + index + 1).toString();
        const regNo = s.registerNumber || `2025IMP${String(index + 1).padStart(3, '0')}`;
        return {
          id: `${department.substring(0,3).toUpperCase()}-${year[0]}-${section}-${rollNo}-${Date.now()}`,
          name: s.name,
          rollNumber: rollNo,
          registerNumber: regNo,
          department,
          year,
          section,
          photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(s.name)}`,
          parentContact: s.parentContact || '+91 9999999999',
          previousAttendance: s.previousAttendance || 100
        };
      });

      // Filter out students that already exist with the same registerNumber
      const cleanedStudents = students.filter(s => 
        !(s.department === department && s.year === year && s.section === section)
      );

      const updated = [...cleanedStudents, ...newStudents];
      localStorage.setItem('attendance_students', JSON.stringify(updated));
      return { success: true, count: newStudents.length };
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/students/bulk-import`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ students: studentsList, department, year, section })
      });
      if (!response.ok) throw new Error('Failed to import students');
      return response.json();
    }
  },

  // DASHBOARD WIDGETS & STATS
  async getDashboardStats() {
    await this.init();
    const teacher = this.getCurrentTeacher();
    if (!teacher) throw new Error('Authentication required');

    if (this.isMock) {
      const students = JSON.parse(localStorage.getItem('attendance_students') || '[]');
      const history = JSON.parse(localStorage.getItem('attendance_history') || '[]');
      const todayDate = new Date().toISOString().split('T')[0];

      // Calculate totals
      const assignedClasses = teacher.assignedClasses;
      
      // Get unique students assigned
      const assignedStudents = students.filter(s => 
        assignedClasses.some(c => 
          c.department === s.department && c.year === s.year && c.section === s.section
        )
      );
      
      // Classes today
      const todayClasses = assignedClasses.length; // Simplified: all assigned classes have daily slot

      // Today's attendance records
      const todayRecords = history.filter(h => 
        h.teacherId === teacher.teacherId && h.date === todayDate
      );

      let presentToday = 0;
      let absentToday = 0;
      let lateToday = 0;
      let leaveToday = 0;
      let totalMarkedToday = 0;

      todayRecords.forEach(record => {
        record.records.forEach(r => {
          totalMarkedToday++;
          if (r.status === 'Present') presentToday++;
          else if (r.status === 'Absent') absentToday++;
          else if (r.status === 'Late') lateToday++;
          else if (r.status === 'Leave') leaveToday++;
        });
      });

      // Attendance percentage overall
      let avgAttendance = 0;
      const historyOfTeacher = history.filter(h => h.teacherId === teacher.teacherId);
      if (historyOfTeacher.length > 0) {
        let totalP = 0;
        let totalCount = 0;
        historyOfTeacher.forEach(h => {
          h.records.forEach(r => {
            totalCount++;
            if (r.status === 'Present' || r.status === 'Late') {
              totalP++;
            }
          });
        });
        avgAttendance = totalCount > 0 ? Math.round((totalP / totalCount) * 100) : 0;
      } else {
        avgAttendance = 85; // Fallback default
      }

      // Pending classes to mark today
      const markedKeys = new Set(todayRecords.map(r => `${r.department}-${r.year}-${r.section}-${r.subject}`));
      const totalClassesAssigned = assignedClasses.length;
      const pendingClassesCount = Math.max(0, totalClassesAssigned - markedKeys.size);

      return {
        totalStudents: assignedStudents.length,
        todayClasses,
        presentToday: presentToday || Math.round(assignedStudents.length * 0.82), // realistic mock
        absentToday: absentToday || Math.round(assignedStudents.length * 0.12),
        lateToday: lateToday || Math.round(assignedStudents.length * 0.04),
        leaveToday: leaveToday || Math.round(assignedStudents.length * 0.02),
        attendancePercentage: avgAttendance,
        pendingAttendance: pendingClassesCount,
        todayRecordsCount: todayRecords.length
      };
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/attendance/dashboard-stats?teacherId=${teacher.teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    }
  }
};
