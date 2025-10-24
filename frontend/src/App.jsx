import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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

  const handleBackToHome = () => {
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
                <div className="student-details">{student.course} • {student.academicYear}</div>
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
            onClick={handleBackToHome}
            className="back-button"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Student Dashboard with ID from URL
function StudentDashboardWithId() {
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

  const handleBackToHome = () => {
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
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="error-container">
        <div className="error-message">Student not found</div>
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
      </div>
    );
  }

  return <StudentDashboard student={student} onBack={handleBackToHome} />;
}

// Admin Dashboard with navigation
function AdminDashboardWithNavigation() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return <AdminDashboard onBack={handleBackToHome} />;
}

function App() {
  return (
    <Router>
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
          <Route path="/admin" element={<AdminDashboardWithNavigation />} />
          <Route path="/student-selection" element={<StudentSelection />} />
          <Route path="/student/:studentId" element={<StudentDashboardWithId />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;