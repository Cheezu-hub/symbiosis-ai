import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Recycle } from 'lucide-react';
import { authAPI } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(formData);
      const { user, token } = res.data;
      
      // Store both user AND token
      localStorage.setItem('symbiotech_token', token);
      localStorage.setItem('symbiotech_user', JSON.stringify(user));
      
      onLogin(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-container"
      style={{
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '0 2rem'
      }}
    >
      <div
        className="card"
        style={{
          background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '2.5rem'
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem',
              borderRadius: 'var(--radius-lg, 12px)',
              background: 'linear-gradient(135deg, var(--primary, #58e077), var(--secondary, #00daf3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Recycle size={32} color="var(--bg-primary, #121416)" />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              marginBottom: '0.5rem',
              color: 'var(--text-primary, #e2e2e5)'
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Sign in to your SymbioTech account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error, #ef4444)',
              borderRadius: 'var(--radius, 8px)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              color: 'var(--error, #ef4444)'
            }}
          >
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label
              className="form-label"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 500,
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)'
                }}
              />
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'var(--bg-tertiary, #282a2c)',
                  border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                  borderRadius: 'var(--radius, 8px)',
                  color: 'var(--text-primary, #e2e2e5)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #58e077)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border, rgba(55, 57, 59, 0.5))')}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label
              className="form-label"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 500,
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #64748b)'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'var(--bg-tertiary, #282a2c)',
                  border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                  borderRadius: 'var(--radius, 8px)',
                  color: 'var(--text-primary, #e2e2e5)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #58e077)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border, rgba(55, 57, 59, 0.5))')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #64748b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              background: 'linear-gradient(135deg, var(--primary, #58e077), var(--primary-dark, #2ebd59))',
              color: 'var(--bg-primary, #121416)',
              border: 'none',
              borderRadius: 'var(--radius, 8px)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary, #a0a0a5)',
              fontSize: '0.9rem'
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--primary, #58e077)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;