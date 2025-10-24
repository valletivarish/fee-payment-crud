import React, { useState } from 'react';
import './App.css';
import StudentInterface from './components/StudentInterface';
import AdminInterface from './components/AdminInterface';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderContent = () => {
    switch (currentView) {
      case 'student':
        return <StudentInterface />;
      case 'admin':
        return <AdminInterface />;
      default:
        return (
          <div className="home-container">
            <div className="home-content">
              <h1 className="home-title">Fee Management System</h1>
              <p className="home-subtitle">Choose your role to continue</p>
              <div className="button-container">
                <button 
                  className="role-button student-button"
                  onClick={() => setCurrentView('student')}
                >
                  Continue as Student
                </button>
                <button 
                  className="role-button admin-button"
                  onClick={() => setCurrentView('admin')}
                >
                  Continue as Admin
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {currentView !== 'home' && (
        <nav className="navbar">
          <div className="nav-content">
            <h2 className="nav-title">Fee Management System</h2>
            <button 
              className="back-button"
              onClick={() => setCurrentView('home')}
            >
              ← Back to Home
            </button>
          </div>
        </nav>
      )}
      {renderContent()}
    </div>
  );
}

export default App;