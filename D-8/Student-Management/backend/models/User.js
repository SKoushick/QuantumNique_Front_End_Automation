const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  assignedDepartments: [{
    type: String
  }],
  assignedClasses: [{
    department: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
