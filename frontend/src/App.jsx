import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import AdminDashboard, {
  DashboardOverviewScreen,
  StudentsPageScreen,
  FeePlansPageScreen,
  AssignmentsPageScreen,
  PaymentsPageScreen,
} from './components/AdminDashboard';
import StudentDashboard, { StudentOverviewScreen, StudentFeesScreen, StudentPaymentsScreen } from './components/StudentDashboard';
import axios from 'axios';
import { API_BASE_URL } from './config';
import RoleLoginPage from './components/RoleLoginPage';

// Student Selection Component
function StudentSelection() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students`);
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else if (response.data.status === 404) {
        setStudents([]);
      } else {
        setStudents(response.data);
      }
    } catch (err) {
      setError('Failed to fetch students: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    navigate(`/student/${student.id}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="student-selection-page">
      <div className="student-selection-card">
        <div className="student-selection-header">
          <h2 className="student-selection-title">Select Student</h2>
          <p className="student-selection-subtitle">Choose a student to continue</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="student-list">
            {students.map(student => (
              <button
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className="student-item"
              >
                <div className="student-name">
                  {student.firstName} {student.lastName}
                </div>
                <div className="student-email">{student.email}</div>
                <div className="student-details">{student.course} - {student.academicYear}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="no-students">
            <p className="no-students-text">No students found. Please contact the administrator.</p>
          </div>
        )}
        
        <div className="back-button-container">
          <button
            onClick={handleLogout}
            className="back-button"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// Student Dashboard layout wrapper
function StudentLayoutWrapper() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/students/${studentId}`);
      setStudent(response.data);
    } catch (err) {
      setError('Failed to fetch student: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading student data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={handleLogout} className="back-button">
          Logout
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="error-container">
        <div className="error-message">Student not found</div>
        <button onClick={handleLogout} className="back-button">
          Logout
        </button>
      </div>
    );
  }

  return <StudentDashboard student={student} onBack={handleLogout} />;
}

// Admin Dashboard layout wrapper
function AdminLayoutWrapper() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return <AdminDashboard onBack={handleLogout} />;
}

function App() {
  return (
      <div className="App">
        {/* Live region for announcements */}
        <div 
          id="announcements" 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {/* Screen reader announcements will be inserted here */}
        </div>
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminLayoutWrapper />}>
            <Route index element={<DashboardOverviewScreen />} />
            <Route path="students" element={<StudentsPageScreen />} />
            <Route path="fee-plans" element={<FeePlansPageScreen />} />
            <Route path="due-payments" element={<AssignmentsPageScreen />} />
            <Route path="payments" element={<PaymentsPageScreen />} />
          </Route>
          <Route path="/student/:studentId" element={<StudentLayoutWrapper />}>
            <Route index element={<StudentOverviewScreen />} />
            <Route path="fees" element={<StudentFeesScreen />} />
            <Route path="payments" element={<StudentPaymentsScreen />} />
          </Route>
          <Route path="/login/:role" element={<RoleLoginPage />} />
          <Route path="/student-selection" element={<StudentSelection />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
  );
}

export default App;