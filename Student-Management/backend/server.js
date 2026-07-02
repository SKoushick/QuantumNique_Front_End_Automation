require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-attendance')
  .then(() => console.log('MongoDB database connected successfully.'))
  .catch((err) => {
    console.error('MongoDB database connection error:', err.message);
    console.log('Server is running, but database connection is unavailable.');
  });

// Health check endpoint for dual-mode fallback
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Express REST server running on port ${PORT}`);
});
