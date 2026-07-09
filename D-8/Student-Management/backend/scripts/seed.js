require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Aditya', 'Diya', 'Ishaan', 'Kavya', 'Rahul', 'Riya', 'Sai', 'Siddharth',
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia',
  'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper',
  'Dev', 'Priya', 'Arjun', 'Neha', 'Rohan', 'Tanvi', 'Kabir', 'Meera', 'Vikram', 'Shreya'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller',
  'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore',
  'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis',
  'Joshi', 'Mehta', 'Sen', 'Nair', 'Rao', 'Das', 'Roy', 'Choudhury', 'Pillai', 'Gupta'
];

const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getAvatarUrl = (name) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`;

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/student-attendance';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Starting database seeding...');

    // Clear old data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing database records.');

    // 1. Seed Teachers
    const hashedPassword = await bcrypt.hash('password123', 10);
    const teachers = [
      {
        teacherId: 'T1001',
        email: 'john@college.edu',
        name: 'Mr. John',
        password: hashedPassword,
        assignedDepartments: ['Artificial Intelligence & Data Science', 'Computer Science Engineering'],
        assignedClasses: [
          { department: 'Artificial Intelligence & Data Science', year: 'I Year', section: 'A', subject: 'Python' },
          { department: 'Artificial Intelligence & Data Science', year: 'II Year', section: 'B', subject: 'DBMS' },
          { department: 'Artificial Intelligence & Data Science', year: 'III Year', section: 'A', subject: 'Machine Learning' },
          { department: 'Artificial Intelligence & Data Science', year: 'III Year', section: 'A', subject: 'AI' },
          { department: 'Computer Science Engineering', year: 'II Year', section: 'A', subject: 'Java' }
        ]
      },
      {
        teacherId: 'T1002',
        email: 'sarah@college.edu',
        name: 'Mrs. Sarah',
        password: hashedPassword,
        assignedDepartments: ['Computer Science Engineering', 'Information Technology'],
        assignedClasses: [
          { department: 'Computer Science Engineering', year: 'II Year', section: 'A', subject: 'Java' },
          { department: 'Computer Science Engineering', year: 'IV Year', section: 'C', subject: 'Operating Systems' },
          { department: 'Information Technology', year: 'III Year', section: 'B', subject: 'Web Technology' }
        ]
      }
    ];

    const seededTeachers = await User.insertMany(teachers);
    console.log(`Successfully seeded ${seededTeachers.length} teacher accounts.`);

    // 2. Seed Students
    const classes = [
      { department: 'Artificial Intelligence & Data Science', year: 'I Year', section: 'A' },
      { department: 'Artificial Intelligence & Data Science', year: 'II Year', section: 'B' },
      { department: 'Artificial Intelligence & Data Science', year: 'III Year', section: 'A' },
      { department: 'Computer Science Engineering', year: 'II Year', section: 'A' },
      { department: 'Computer Science Engineering', year: 'IV Year', section: 'C' },
      { department: 'Information Technology', year: 'III Year', section: 'B' }
    ];

    const studentDocs = [];
    classes.forEach(cls => {
      const deptCode = cls.department.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
      const yearNum = cls.year === 'I Year' ? '1' : cls.year === 'II Year' ? '2' : cls.year === 'III Year' ? '3' : '4';
      
      for (let i = 1; i <= 40; i++) {
        const name = `${FIRST_NAMES[(i * 3) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`;
        const regNo = `202${5 - parseInt(yearNum)}${deptCode}${String(i).padStart(3, '0')}`;
        
        let prevAttendance = randomRange(80, 99);
        if (i === 7 || i === 15 || i === 23 || i === 31) {
          prevAttendance = randomRange(55, 74); // defaulters
        } else if (i === 3 || i === 12 || i === 27) {
          prevAttendance = 100;
        }

        studentDocs.push({
          name,
          rollNumber: i.toString(),
          registerNumber: regNo,
          department: cls.department,
          year: cls.year,
          section: cls.section,
          photo: getAvatarUrl(name),
          parentContact: `+91 9${randomRange(10000000, 99999999)}`,
          previousAttendance: prevAttendance
        });
      }
    });

    const seededStudents = await Student.insertMany(studentDocs);
    console.log(`Successfully seeded ${seededStudents.length} student records.`);

    // 3. Seed History Logs (14 days past attendance)
    const historyDocs = [];
    const today = new Date();

    for (let d = 14; d >= 0; d--) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - d);
      
      if (currentDate.getDay() === 0) continue; // Skip Sundays
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const isSaturdayHoliday = currentDate.getDay() === 6 && d % 7 === 0;
      if (isSaturdayHoliday) continue;

      for (let teacher of seededTeachers) {
        for (let cls of teacher.assignedClasses) {
          const classStudents = seededStudents.filter(s => 
            s.department === cls.department &&
            s.year === cls.year &&
            s.section === cls.section
          );

          if (classStudents.length === 0) continue;

          const records = classStudents.map(student => {
            let status = 'Present';
            const rand = Math.random();
            const prob = student.previousAttendance / 100;
            
            if (rand > prob) {
              const r = Math.random();
              if (r < 0.7) status = 'Absent';
              else if (r < 0.9) status = 'Late';
              else status = 'Leave';
            }

            return {
              studentId: student._id,
              registerNumber: student.registerNumber,
              status
            };
          });

          const hour = cls.subject === 'Python' || cls.subject === 'Java' ? '09' : cls.subject === 'DBMS' ? '11' : '14';
          const timeStr = `${hour}:30:00`;

          historyDocs.push({
            teacherId: teacher.teacherId,
            teacherName: teacher.name,
            department: cls.department,
            year: cls.year,
            section: cls.section,
            subject: cls.subject,
            date: dateStr,
            time: timeStr,
            records,
            auditLog: [{
              action: 'Created',
              timestamp: `${dateStr} ${timeStr}`,
              user: teacher.name
            }]
          });
        }
      }
    }

    const seededHistory = await Attendance.insertMany(historyDocs);
    console.log(`Successfully seeded ${seededHistory.length} historical attendance registers.`);

    console.log('Database Seeding Completed Successfully! Exiting...');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process error:', err.message);
    process.exit(1);
  }
}

seed();
