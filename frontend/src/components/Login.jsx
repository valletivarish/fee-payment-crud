import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(formData);
        setSuccess('Login successful!');
      } else {
        await register(formData);
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
      }
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

  return (
    <div className="container">
      <div className="login-container">
        <h1 className="page-title">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label className="form-label">
              {isLogin ? 'Username or Email' : 'Username or Email'}
            </label>
            <input
              type="text"
              name="usernameOrEmail"
              className="form-input"
              value={formData.usernameOrEmail}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="btn-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
