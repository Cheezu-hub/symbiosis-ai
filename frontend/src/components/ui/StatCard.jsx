import React from 'react';

const StatCard = ({ icon: Icon, title, value, unit, trend, color = 'primary' }) => {
  const colorMap = {
    primary: 'var(--primary, #58e077)',
    success: 'var(--success, #10b981)',
    warning: 'var(--warning, #f59e0b)',
    error: 'var(--error, #ef4444)',
    accent: 'var(--accent, #00daf3)',
    secondary: 'var(--secondary, #00daf3)'
  };

  return (
    <div
      className="stat-card"
      style={{
        background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 12px 40px rgba(12, 14, 16, 0.4))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius, 8px)',
            background: `${colorMap[color]}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={24} color={colorMap[color]} />
        </div>
        {trend && (
          <span
            style={{
              fontSize: '0.85rem',
              color: trend > 0 ? 'var(--success, #10b981)' : 'var(--error, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600
            }}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary, #e2e2e5)',
            lineHeight: 1.2
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary, #a0a0a5)',
            marginTop: '0.25rem'
          }}
        >
          {title} {unit && <span style={{ marginLeft: '0.25rem', opacity: 0.8 }}>({unit})</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;