const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/login
// @desc    Authenticate teacher & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    // Find user by Teacher ID or Email
    const user = await User.findOne({
      $or: [
        { teacherId: identifier },
        { email: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Teacher ID/Email or Password' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Teacher ID/Email or Password' });
    }

    // Payload for JWT token
    const payload = {
      teacher: {
        id: user.id,
        teacherId: user.teacherId,
        name: user.name,
        email: user.email,
        assignedDepartments: user.assignedDepartments,
        assignedClasses: user.assignedClasses
      }
    };

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'super_secret_key_apex_college_attendance_jwt',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          teacher: payload.teacher
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
