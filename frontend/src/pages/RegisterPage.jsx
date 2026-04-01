import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building, MapPin, AlertCircle, Recycle } from 'lucide-react';
import { authAPI } from '../services/api';

const INDUSTRY_TYPES = [
  { value: 'steel', label: 'Steel Plant' },
  { value: 'cement', label: 'Cement Factory' },
  { value: 'chemical', label: 'Chemical Industry' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'energy', label: 'Energy Plant' },
  { value: 'textile', label: 'Textile Industry' },
  { value: 'construction', label: 'Construction' },
  { value: 'other', label: 'Other' }
];

const RegisterPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    industryType: '',
    location: ''
  });

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!formData.industryType) {
      setError('Please select an industry type.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      const { user, token } = res.data;
      localStorage.setItem('symbiotech_token', token);
      localStorage.setItem('symbiotech_user', JSON.stringify(user));
      onLogin(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--bg-tertiary, #282a2c)',
    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
    borderRadius: 'var(--radius, 8px)',
    color: 'var(--text-primary, #e2e2e5)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  };

  const inputWithIconStyle = {
    ...inputStyle,
    padding: '0.75rem 1rem 0.75rem 3rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: 'var(--text-primary, #e2e2e5)',
    fontSize: '0.9rem'
  };

  const iconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted, #64748b)',
    pointerEvents: 'none'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary, #121416)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
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
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)', fontSize: '0.9rem' }}>
            Join SymbioTech and start exchanging industrial resources
          </p>
        </div>

        {/* Error */}
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

        <form onSubmit={handleSubmit}>
          {/* Company Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Company Name</label>
            <div style={{ position: 'relative' }}>
              <Building size={20} style={iconStyle} />
              <input
                type="text"
                value={formData.companyName}
                onChange={handleChange('companyName')}
                placeholder="Acme Steel Ltd."
                style={inputWithIconStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #58e077)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border, rgba(55, 57, 59, 0.5))')}
                required
              />
            </div>
          </div>

          {/* Industry Type */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Industry Type</label>
            <select
              value={formData.industryType}
              onChange={handleChange('industryType')}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #58e077)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border, rgba(55, 57, 59, 0.5))')}
              required
            >
              <option value="">Select your industry...</option>
              {INDUSTRY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={iconStyle} />
              <input
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="you@company.com"
                style={inputWithIconStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #58e077)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border, rgba(55, 57, 59, 0.5))')}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Location <span style={{ color: 'var(--text-muted, #64748b)', fontWeight: 400 }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <MapPin size={20} style={iconStyle} />
              <input
                type="text"
                value={formData.location}
                onChange={handleChange('location')}
                placeholder="City, State"
                style={inputWithIconStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #58e077)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border, rgba(55, 57, 59, 0.5))')}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={iconStyle} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Min. 6 characters"
                style={{ ...inputWithIconStyle, paddingRight: '3rem' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #58e077)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border, rgba(55, 57, 59, 0.5))')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
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
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary, #a0a0a5)',
              fontSize: '0.9rem'
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--primary, #58e077)',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
