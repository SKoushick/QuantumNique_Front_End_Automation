const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  registerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  photo: {
    type: String,
    default: ''
  },
  parentContact: {
    type: String,
    required: true
  },
  previousAttendance: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

// Compound index to quicken class roster lookups
StudentSchema.index({ department: 1, year: 1, section: 1 });

module.exports = mongoose.model('Student', StudentSchema);
