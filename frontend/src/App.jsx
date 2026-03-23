import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Calendar,
  Settings, Bell, Search, UserPlus,
  BookOpen, CheckCircle, Save
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard Stats State
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    averageAttendance: 0
  });

  // Forms State
  const [formData, setFormData] = useState({ name: '', email: '', grade: '', guardian: '' });
  const [teacherData, setTeacherData] = useState({ name: '', email: '', subject: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsList, setStudentsList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Teachers State
  const [teachersList, setTeachersList] = useState([]);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      const data = await response.json();
      setStats({
        totalStudents: data.totalStudents || 0,
        activeTeachers: data.activeTeachers || 0,
        averageAttendance: data.averageAttendance || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const fetchAttendanceData = async (date) => {
    try {
      const [usersRes, attRes] = await Promise.all([
        fetch('http://localhost:5000/api/users?role=STUDENT'),
        fetch(`http://localhost:5000/api/attendance?date=${date}`)
      ]);
      const users = await usersRes.json();
      const attData = await attRes.json();
      
      setStudentsList(users);

      const newRecords = {};
      users.forEach(u => newRecords[u.id] = 'PRESENT'); // default
      attData.forEach(record => {
        if(newRecords[record.userId]) newRecords[record.userId] = record.status;
      });
      setAttendanceRecords(newRecords);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users?role=TEACHER');
      const data = await response.json();
      setTeachersList(data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboardStats();
    if (activeTab === 'attendance') fetchAttendanceData(attendanceDate);
    if (activeTab === 'academics') loadTeachers();
  }, [activeTab, attendanceDate]);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'STUDENT' })
      });

      if (response.ok) {
        setSuccessMessage('Student enrolled successfully!');
        setFormData({ name: '', email: '', grade: '', guardian: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to add student:', error);
    }
    setIsSubmitting(false);
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...teacherData, role: 'TEACHER' })
      });

      if (response.ok) {
        setSuccessMessage('Teacher assigned successfully!');
        setTeacherData({ name: '', email: '', subject: '' });
        loadTeachers(); // reload roster
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to add teacher:', error);
    }
    setIsSubmitting(false);
  };

  const handleSaveAttendance = async () => {
    setIsSubmitting(true);
    const recordsArray = Object.keys(attendanceRecords).map(userId => ({
      userId: parseInt(userId),
      status: attendanceRecords[userId]
    }));
    try {
      await fetch('http://localhost:5000/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: attendanceDate, records: recordsArray })
      });
      setSuccessMessage('Attendance recorded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch(error) {
      console.error('Failed to save attendance:', error);
    }
    setIsSubmitting(false);
  };

  const updateAttendanceStatus = (userId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [userId]: status }));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'academics', label: 'Academics', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="sidebar-logo">
          <div className="logo-icon">E</div>
          <span>EduSync ERP</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon strokeWidth={2.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="avatar" />
            <div className="user-info">
              <span className="user-name">Alex Johnson</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-search">
            <Search className="search-icon" size={20} strokeWidth={2.5} />
            <input type="text" placeholder="Search students, teachers..." className="search-input" />
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setActiveTab('students')}>
              <UserPlus size={18} strokeWidth={2.5} />
              <span>Add Student</span>
            </button>
            <button className="icon-btn">
              <Bell size={20} strokeWidth={2.5} />
              <div className="notification-badge"></div>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="page-header">
              <div className="page-title">
                <h1>Welcome back, Alex! 👋</h1>
                <p>Here's what's happening across the campus today.</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card glass-panel" style={{ '--accent-color': 'var(--primary)' }}>
                <div className="stat-header">
                  <span>Total Students</span>
                  <div className="stat-icon"><Users size={24} /></div>
                </div>
                <div className="stat-value">{stats.totalStudents}</div>
              </div>
              
              <div className="stat-card glass-panel" style={{ '--accent-color': 'var(--success)' }}>
                <div className="stat-header">
                  <span>Active Teachers</span>
                  <div className="stat-icon" style={{ color: 'var(--success)' }}><GraduationCap size={24} /></div>
                </div>
                <div className="stat-value">{stats.activeTeachers}</div>
              </div>

              <div className="stat-card glass-panel" style={{ '--accent-color': 'var(--warning)' }}>
                <div className="stat-header">
                  <span>Average Attendance</span>
                  <div className="stat-icon" style={{ color: 'var(--warning)' }}><Calendar size={24} /></div>
                </div>
                <div className="stat-value">{stats.averageAttendance}%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="dashboard">
            <div className="page-header">
              <div className="page-title">
                <h1>Student Management</h1>
                <p>Register new students and manage enrollments.</p>
              </div>
            </div>
            <div className="panel glass-panel" style={{ maxWidth: '600px' }}>
              <h3 className="section-title"><UserPlus size={20} className="text-muted" />Enroll New Student</h3>
              {successMessage && <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> {successMessage}</div>}
              <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Full Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Email Address</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Grade</label>
                    <input type="text" placeholder="e.g. 10th Grade" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Guardian Name</label>
                    <input type="text" value={formData.guardian} onChange={(e) => setFormData({...formData, guardian: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '10px', justifyContent: 'center' }}>
                  {isSubmitting ? 'Enrolling...' : 'Register Student'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="dashboard">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="page-title">
                <h1>Faculty & Subjects</h1>
                <p>Manage active teaching staff and their departmental subjects.</p>
              </div>
            </div>

            {successMessage && (
              <div style={{ padding: '14px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                <CheckCircle size={20} /> {successMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '30px' }}>
              <div className="panel glass-panel" style={{ flex: '1', height: 'fit-content' }}>
                <h3 className="section-title"><BookOpen size={20} className="text-muted" />Assign Teacher</h3>
                
                <form onSubmit={handleTeacherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>Name</label>
                    <input required type="text" value={teacherData.name} onChange={(e) => setTeacherData({...teacherData, name: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>Email Address</label>
                    <input required type="email" value={teacherData.email} onChange={(e) => setTeacherData({...teacherData, email: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>Department Subject</label>
                    <input type="text" required placeholder="e.g. Mathematics" value={teacherData.subject} onChange={(e) => setTeacherData({...teacherData, subject: e.target.value})} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white' }} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '10px', justifyContent: 'center' }}>
                    {isSubmitting ? 'Saving...' : 'Add Teacher'}
                  </button>
                </form>
              </div>

              <div className="panel glass-panel" style={{ flex: '2', padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Instructor</th>
                      <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Contact</th>
                      <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Assigned Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachersList.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No teachers registered yet.
                        </td>
                      </tr>
                    ) : (
                      teachersList.map((teacher) => (
                        <tr key={teacher.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                              {teacher.name.charAt(0)}
                            </div>
                            {teacher.name}
                          </td>
                          <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>{teacher.email}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ padding: '6px 12px', background: 'rgba(236, 72, 153, 0.15)', color: 'var(--secondary)', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                              {teacher.subject}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Attendance View */}
        {activeTab === 'attendance' && (
          <div className="dashboard">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="page-title">
                <h1>Daily Attendance</h1>
                <p>Record and update student attendance for specific dates.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input 
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)', fontFamily: 'var(--font-base)', fontWeight: '500' }}
                  className="glass-panel"
                />
                <button className="btn-primary" onClick={handleSaveAttendance} disabled={isSubmitting}>
                  <Save size={18} strokeWidth={2.5} />
                  <span>{isSubmitting ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>

            {successMessage && <div style={{ padding: '14px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}><CheckCircle size={20} /> {successMessage}</div>}

            <div className="panel glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Student Name</th>
                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>Grade</th>
                    <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', width: '300px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled yet. Register a student first.</td></tr>
                  ) : (
                    studentsList.map((student) => {
                      const status = attendanceRecords[student.id] || 'PRESENT';
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '500' }}>{student.name}</td>
                          <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{student.grade || 'N/A'}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => updateAttendanceStatus(student.id, 'PRESENT')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: status === 'PRESENT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: status === 'PRESENT' ? 'var(--success)' : 'var(--text-muted)', border: `1px solid ${status === 'PRESENT' ? 'rgba(16, 185, 129, 0.5)' : 'transparent'}` }}>Present</button>
                              <button onClick={() => updateAttendanceStatus(student.id, 'ABSENT')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: status === 'ABSENT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: status === 'ABSENT' ? 'var(--error)' : 'var(--text-muted)', border: `1px solid ${status === 'ABSENT' ? 'rgba(239, 68, 68, 0.5)' : 'transparent'}` }}>Absent</button>
                              <button onClick={() => updateAttendanceStatus(student.id, 'LATE')} style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: status === 'LATE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)', color: status === 'LATE' ? 'var(--warning)' : 'var(--text-muted)', border: `1px solid ${status === 'LATE' ? 'rgba(245, 158, 11, 0.5)' : 'transparent'}` }}>Late</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
