const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// @route   GET api/students
// @desc    Get students filtered by department, year, and section
// @access  Private
router.get('/', auth, async (req, res) => {
  const { department, year, section } = req.query;

  if (!department || !year || !section) {
    return res.status(400).json({ message: 'Missing class parameters (department, year, section)' });
  }

  try {
    const students = await Student.find({ department, year, section }).sort({ rollNumber: 1 });
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/students/defaulters
// @desc    Get students with attendance < 75% in teacher's assigned classes
// @access  Private
router.get('/defaulters', auth, async (req, res) => {
  try {
    const teacherClasses = req.teacher.assignedClasses;
    
    // Find all students matching any class in teacher's classes
    const orQuery = teacherClasses.map(c => ({
      department: c.department,
      year: c.year,
      section: c.section
    }));

    if (orQuery.length === 0) {
      return res.json([]);
    }

    const students = await Student.find({
      $and: [
        { $or: orQuery },
        { previousAttendance: { $lt: 75 } }
      ]
    }).sort({ previousAttendance: 1 });

    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/students/bulk-import
// @desc    Import students roster
// @access  Private
router.post('/bulk-import', auth, async (req, res) => {
  const { students, department, year, section } = req.body;

  if (!students || !Array.isArray(students) || !department || !year || !section) {
    return res.status(400).json({ message: 'Invalid body parameters.' });
  }

  try {
    // Delete existing students of this class to prevent duplicates during testing re-seed
    await Student.deleteMany({ department, year, section });

    const studentDocs = students.map((s, idx) => ({
      name: s.name,
      rollNumber: s.rollNumber || (idx + 1).toString(),
      registerNumber: s.registerNumber,
      department,
      year,
      section,
      photo: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(s.name)}`,
      parentContact: s.parentContact || '+91 9999999999',
      previousAttendance: s.previousAttendance || 100
    }));

    const result = await Student.insertMany(studentDocs);
    res.json({ success: true, count: result.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
