const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, User, Attendance, Payment } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API: Dashboard Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'STUDENT' } });
    const activeTeachers = await User.count({ where: { role: 'TEACHER' } });
    
    // Evaluate true average attendance based on the database
    const totalAttendanceRecords = await Attendance.count();
    const presentRecords = await Attendance.count({ where: { status: 'PRESENT' } });
    const averageAttendance = totalAttendanceRecords > 0 
      ? ((presentRecords / totalAttendanceRecords) * 100).toFixed(1) 
      : 0;

    res.json({
      totalStudents,
      activeTeachers,
      averageAttendance: parseFloat(averageAttendance)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Users
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { where: { role } } : {};
    const users = await User.findAll(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Create User
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, grade, guardian, subject } = req.body;
    const user = await User.create({ name, email, role, grade, guardian, subject });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Attendance for a Date
app.get('/api/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const query = date ? { where: { date } } : {};
    const records = await Attendance.findAll(query);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Save/Update daily Attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { records, date } = req.body; // records = [{userId, status}]
    
    // Upsert logic
    for (const record of records) {
      const existing = await Attendance.findOne({ where: { userId: record.userId, date } });
      if (existing) {
        existing.status = record.status;
        await existing.save();
      } else {
        await Attendance.create({ userId: record.userId, date, status: record.status });
      }
    }
    res.status(200).json({ message: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('EduSync ERP Backend is Running with SQLite & Sequelize');
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
