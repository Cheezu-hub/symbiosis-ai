import React, { useState } from 'react';
import { Search, Bell, Settings, Menu } from 'lucide-react';

const Topbar = ({ user, onMenuClick }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      className="topbar glass-panel"
      style={{
        position: 'fixed',
        top: 0,
        left: '260px',
        right: 0,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        borderBottom: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
        background: 'var(--glass-bg, rgba(51, 53, 55, 0.4))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 999,
        transition: 'left 0.3s ease'
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary, #e2e2e5)',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              color: searchFocused ? 'var(--primary, #58e077)' : 'var(--text-muted, #64748b)'
            }}
          />
          <input
            type="text"
            placeholder="Search resources, matches..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              padding: '0.5rem 1rem',
              width: '300px',
              background: 'var(--bg-tertiary, #282a2c)',
              border: `1px solid ${searchFocused ? 'var(--primary, #58e077)' : 'var(--border, rgba(55, 57, 59, 0.5))'}`,
              borderRadius: 'var(--radius-lg, 12px)',
              color: 'var(--text-primary, #e2e2e5)',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary, #e2e2e5)',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={20} />
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--error, #ef4444)',
                animation: 'pulseDot 2s infinite'
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: '320px',
                background: 'var(--bg-secondary, #1a1c1e)',
                border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                borderRadius: 'var(--radius-lg, 12px)',
                boxShadow: 'var(--shadow-lg, 0 12px 40px rgba(12, 14, 16, 0.4))',
                padding: '1rem',
                marginTop: '0.5rem',
                zIndex: 1000
              }}
            >
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary, #a0a0a5)' }}>
                Notifications
              </h4>
              <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>
                No new notifications
              </p>
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary, #e2e2e5)',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Settings size={20} />
        </button>

        {/* User Profile */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'var(--bg-tertiary, #282a2c)',
              borderRadius: 'var(--radius-lg, 12px)',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary, #58e077), var(--secondary, #00daf3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--bg-primary, #121416)'
              }}
            >
              {user.companyName?.charAt(0) || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary, #e2e2e5)' }}>
                {user.companyName || 'User'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #a0a0a5)' }}>
                {user.industryType || 'Industry'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;