const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  registerNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Leave'],
    required: true
  }
});

const AuditLogEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  }
});

const AttendanceSchema = new mongoose.Schema({
  teacherId: {
    type: String, // Matches the teacher's teacherId string
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Format: HH:MM:SS
    required: true
  },
  records: [AttendanceRecordSchema],
  auditLog: [AuditLogEntrySchema]
}, {
  timestamps: true
});

// Ensure uniqueness per class-subject-date
AttendanceSchema.index({ department: 1, year: 1, section: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
