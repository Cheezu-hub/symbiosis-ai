import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Phone, MapPin, Shield, Bell, LogOut, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ProfilePage = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    companyName: '',
    industryType: '',
    email: '',
    phone: '',
    location: '',
    transportRadius: '',
    website: ''
  });
  const [notifications, setNotifications] = useState({
    emailMatches: true,
    newOpportunities: true,
    impactReports: false,
    systemUpdates: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getProfile();
      const u = res.data.user;
      setProfileData({
        companyName: u.companyName || '',
        industryType: u.industryType || '',
        email: u.email || '',
        phone: u.phone || '',
        location: u.location || '',
        transportRadius: u.transportRadius?.toString() || '',
        website: u.website || ''
      });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.updateProfile({
        companyName: profileData.companyName,
        industryType: profileData.industryType,
        phone: profileData.phone,
        location: profileData.location,
        transportRadius: profileData.transportRadius ? parseInt(profileData.transportRadius) : null,
        website: profileData.website
      });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--bg-primary, #121416)'
        }}
      >
        <div
          className="spinner"
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border, #37393b)',
            borderTopColor: 'var(--primary, #58e077)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container fade-in-up">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            color: 'var(--text-primary, #e2e2e5)'
          }}
        >
          Profile & Settings
        </h1>
        <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
          Manage your account and company information
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '2rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Sidebar */}
        <div>
          <Card style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary, #58e077), var(--accent, #00daf3))',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700
              }}
            >
              {(profileData.companyName || 'U').charAt(0).toUpperCase()}
            </div>
            <h3
              style={{
                marginBottom: '0.25rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              {profileData.companyName || '—'}
            </h3>
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                fontSize: '0.9rem',
                textTransform: 'capitalize'
              }}
            >
              {profileData.industryType} Industry
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Badge variant="success">Verified</Badge>
            </div>
          </Card>

          <Button
            variant="outline"
            style={{
              width: '100%',
              color: 'var(--error, #ef4444)',
              borderColor: 'var(--error, #ef4444)'
            }}
            onClick={onLogout}
          >
            <LogOut size={18} /> Logout
          </Button>
        </div>

        {/* Main Content */}
        <div>
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
                marginBottom: '1rem',
                color: 'var(--error, #ef4444)'
              }}
            >
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.9rem' }}>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--success, #10b981)',
                borderRadius: 'var(--radius, 8px)',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                color: 'var(--success, #10b981)'
              }}
            >
              <CheckCircle size={16} />
              <span style={{ fontSize: '0.9rem' }}>{success}</span>
            </div>
          )}

          {/* Company Info Card */}
          <Card style={{ marginBottom: '1.5rem' }}>
            <div
              className="card-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <h3
                className="card-title"
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              >
                Company Information
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={saving}
              >
                {isEditing ? <Save size={18} /> : <User size={18} />}
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.5rem'
              }}
            >
              {[
                { label: 'Company Name', field: 'companyName', icon: Building, type: 'text' },
                { label: 'Email Address', field: 'email', icon: Mail, type: 'email', readOnly: true },
                { label: 'Phone Number', field: 'phone', icon: Phone, type: 'tel' },
                { label: 'Location', field: 'location', icon: MapPin, type: 'text' },
                { label: 'Transport Radius (km)', field: 'transportRadius', type: 'number' },
                { label: 'Website', field: 'website', type: 'url' }
              ].map(({ label, field, icon: Icon, type, readOnly }) => (
                <div className="form-group" key={field}>
                  <label className="form-label">
                    {Icon && <Icon size={15} style={{ display: 'inline', marginRight: '0.4rem' }} />}
                    {label}
                  </label>
                  <input
                    type={type}
                    className="form-input"
                    value={profileData[field]}
                    onChange={(e) => setProfileData({ ...profileData, [field]: e.target.value })}
                    disabled={!isEditing || readOnly}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-tertiary, #282a2c)',
                      border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                      borderRadius: 'var(--radius, 8px)',
                      color: 'var(--text-primary, #e2e2e5)',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Industry Type</label>
                <select
                  className="form-select"
                  value={profileData.industryType}
                  onChange={(e) => setProfileData({ ...profileData, industryType: e.target.value })}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-tertiary, #282a2c)',
                    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                    borderRadius: 'var(--radius, 8px)',
                    color: 'var(--text-primary, #e2e2e5)',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Industry</option>
                  <option value="steel">Steel Plant</option>
                  <option value="cement">Cement Factory</option>
                  <option value="chemical">Chemical Industry</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="energy">Energy Plant</option>
                  <option value="textile">Textile Industry</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Notification Settings Card */}
          <Card style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
              <h3
                className="card-title"
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              >
                Notifications
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'emailMatches', label: 'AI Match Recommendations', desc: 'Get notified when new matches are found' },
                { key: 'newOpportunities', label: 'New Symbiosis Opportunities', desc: 'Alerts for potential collaborations' },
                { key: 'impactReports', label: 'Monthly Impact Reports', desc: 'Receive environmental impact summaries' },
                { key: 'systemUpdates', label: 'System Updates', desc: 'Platform updates and maintenance notices' }
              ].map(({ key, label, desc }) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: 'var(--text-primary, #e2e2e5)'
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary, #a0a0a5)'
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Account Actions Card */}
          <Card>
            <h3
              className="card-title"
              style={{
                marginBottom: '1rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Account Actions
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="outline">
                <Bell size={18} /> View All Notifications
              </Button>
              <Button
                variant="outline"
                style={{
                  color: 'var(--error, #ef4444)',
                  borderColor: 'var(--error, #ef4444)'
                }}
                onClick={onLogout}
              >
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;