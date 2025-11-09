import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appInfoError, setAppInfoError] = useState('');
  const [environmentMode, setEnvironmentMode] = useState('');

  const { login } = useAuth();

  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/config/app-info`);
        const { environmentMode: mode, demoMode: isDemo } = response.data || {};
        const normalizedEnvironment = (mode || '').toString().toUpperCase();
        setEnvironmentMode(normalizedEnvironment);
      } catch (err) {
        setAppInfoError('Unable to load environment information.');
      }
    };

    fetchAppInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatModeLabel = (value) => {
    switch ((value || '').toUpperCase()) {
      case 'DEMO MODE':
        return 'Demo Mode';
      case 'PRODUCTION MODE':
        return 'Production Mode';
      default:
        return value;
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-card">
          <h1 className="login-title">Sign in to your account</h1>
          <p className="login-subtitle">Access the fee management dashboard</p>

          {error && <div className="login-alert error">{error}</div>}
          {appInfoError && <div className="login-alert error">{appInfoError}</div>}

        <div className="login-mode-row">
          <span className="login-mode-label">Environment:</span>
          <span className="login-badge">{formatModeLabel(environmentMode)}</span>
        </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-label">Username or Email</label>
              <input
                type="text"
                name="usernameOrEmail"
                className="login-input"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                required
                autoComplete="username"
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-label">Password</label>
              <input
                type="password"
                name="password"
                className="login-input"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
