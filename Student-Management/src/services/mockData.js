// Client-side Mock Database Service
// Generates and stores data in localStorage for instant mock capability.

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

// Helper to generate random numbers
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate placeholder student photos with nice UI colors
const getAvatarUrl = (gender, name) => {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`;
};

// Generate 40 students for a given class config
function generateStudents(dept, year, section) {
  const students = [];
  const deptCode = dept.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  const yearNum = year === 'I Year' ? '1' : year === 'II Year' ? '2' : year === 'III Year' ? '3' : '4';
  
  for (let i = 1; i <= 40; i++) {
    const rollNo = i;
    const regNo = `202${5 - parseInt(yearNum)}${deptCode}${String(i).padStart(3, '0')}`;
    const name = `${FIRST_NAMES[(i * 3) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`;
    
    // Create random previous attendance statistics
    // Let some students have low attendance (<75%)
    let prevAttendance = randomRange(80, 99);
    if (i === 7 || i === 15 || i === 23 || i === 31) {
      prevAttendance = randomRange(55, 74); // Defaulters
    } else if (i === 3 || i === 12 || i === 27) {
      prevAttendance = 100; // Perfect attendance
    }

    const gender = i % 2 === 0 ? 'female' : 'male';
    const photo = getAvatarUrl(gender, name);

    students.push({
      id: `${deptCode}-${yearNum}-${section}-${rollNo}`,
      name,
      rollNumber: rollNo.toString(),
      registerNumber: regNo,
      department: dept,
      year,
      section,
      photo,
      parentContact: `+91 9${randomRange(10000000, 99999999)}`,
      previousAttendance: prevAttendance,
    });
  }
  return students;
}

// Teacher profiles
export const MOCK_TEACHERS = [
  {
    teacherId: 'T1001',
    email: 'john@college.edu',
    name: 'Mr. John',
    password: 'password123',
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
    password: 'password123',
    assignedDepartments: ['Computer Science Engineering', 'Information Technology'],
    assignedClasses: [
      { department: 'Computer Science Engineering', year: 'II Year', section: 'A', subject: 'Java' },
      { department: 'Computer Science Engineering', year: 'IV Year', section: 'C', subject: 'Operating Systems' },
      { department: 'Information Technology', year: 'III Year', section: 'B', subject: 'Web Technology' }
    ]
  }
];

// Initialize all students across assigned classes
export function initializeStudents() {
  const allStudents = [];
  
  // Collect all unique class parameters
  const classesToGenerate = [
    { department: 'Artificial Intelligence & Data Science', year: 'I Year', section: 'A' },
    { department: 'Artificial Intelligence & Data Science', year: 'II Year', section: 'B' },
    { department: 'Artificial Intelligence & Data Science', year: 'III Year', section: 'A' },
    { department: 'Computer Science Engineering', year: 'II Year', section: 'A' },
    { department: 'Computer Science Engineering', year: 'IV Year', section: 'C' },
    { department: 'Information Technology', year: 'III Year', section: 'B' }
  ];

  classesToGenerate.forEach(cls => {
    allStudents.push(...generateStudents(cls.department, cls.year, cls.section));
  });

  return allStudents;
}

// Generate pre-loaded attendance records for the past 14 days to make charts populated
export function generateHistory(students, teachers) {
  const history = [];
  const today = new Date();
  
  // We'll generate data for past 14 days, excluding Sundays (0)
  for (let d = 14; d >= 0; d--) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - d);
    
    if (currentDate.getDay() === 0) continue; // Skip Sundays (holidays)
    
    const formattedDate = currentDate.toISOString().split('T')[0];
    const isHoliday = currentDate.getDay() === 6 && d % 7 === 0; // Simulate an occasional Saturday holiday
    
    // For each teacher
    teachers.forEach(teacher => {
      // For each assigned class
      teacher.assignedClasses.forEach(cls => {
        // If it's a holiday, skip
        if (isHoliday) {
          return;
        }

        // Get students in this class
        const classStudents = students.filter(s => 
          s.department === cls.department && 
          s.year === cls.year && 
          s.section === cls.section
        );

        if (classStudents.length === 0) return;

        // Generate attendance records
        const records = classStudents.map(student => {
          let status = 'Present';
          const rand = Math.random();
          
          // Use student's previous attendance rate to determine status
          const attendanceProbability = student.previousAttendance / 100;
          
          if (rand > attendanceProbability) {
            const statusRand = Math.random();
            if (statusRand < 0.7) {
              status = 'Absent';
            } else if (statusRand < 0.9) {
              status = 'Late';
            } else {
              status = 'Leave';
            }
          }

          return {
            studentId: student.id,
            registerNumber: student.registerNumber,
            status
          };
        });

        // Calculate time
        const hour = cls.subject === 'Python' || cls.subject === 'Java' ? '09' : cls.subject === 'DBMS' ? '11' : '14';
        const formattedTime = `${hour}:30:00`;

        history.push({
          id: `hist-${teacher.teacherId}-${cls.subject}-${formattedDate}`,
          teacherId: teacher.teacherId,
          teacherName: teacher.name,
          department: cls.department,
          year: cls.year,
          section: cls.section,
          subject: cls.subject,
          date: formattedDate,
          time: formattedTime,
          records,
          auditLog: [
            {
              action: 'Created',
              timestamp: `${formattedDate} ${formattedTime}`,
              user: teacher.name
            }
          ]
        });
      });
    });
  }

  return history;
}

// Initial Local Storage setup
export function setupLocalStorage() {
  if (!localStorage.getItem('attendance_teachers')) {
    localStorage.setItem('attendance_teachers', JSON.stringify(MOCK_TEACHERS));
  }
  
  let students = [];
  if (!localStorage.getItem('attendance_students')) {
    students = initializeStudents();
    localStorage.setItem('attendance_students', JSON.stringify(students));
  } else {
    students = JSON.parse(localStorage.getItem('attendance_students'));
  }

  if (!localStorage.getItem('attendance_history')) {
    const history = generateHistory(students, MOCK_TEACHERS);
    localStorage.setItem('attendance_history', JSON.stringify(history));
  }

  if (!localStorage.getItem('attendance_audit_logs')) {
    localStorage.setItem('attendance_audit_logs', JSON.stringify([]));
  }
}
