const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1]; // "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_apex_college_attendance_jwt');
    req.teacher = decoded.teacher;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token signature is not valid.' });
  }
};
