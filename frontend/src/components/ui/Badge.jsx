import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  style = {}, 
  className = '',
  ...props 
}) => {
  // Define Variant Styles
  const variants = {
    default: { 
      background: 'var(--bg-tertiary, #282a2c)', 
      color: 'var(--text-primary, #e2e2e5)' 
    },
    success: { 
      background: 'rgba(16, 185, 129, 0.15)', 
      color: 'var(--success, #10b981)',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    },
    warning: { 
      background: 'rgba(245, 158, 11, 0.15)', 
      color: 'var(--warning, #f59e0b)',
      border: '1px solid rgba(245, 158, 11, 0.2)'
    },
    error: { 
      background: 'rgba(239, 68, 68, 0.15)', 
      color: 'var(--error, #ef4444)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    },
    primary: { 
      background: 'rgba(88, 224, 119, 0.15)', 
      color: 'var(--primary, #58e077)',
      border: '1px solid rgba(88, 224, 119, 0.2)'
    },
    secondary: { 
      background: 'rgba(0, 218, 243, 0.15)', 
      color: 'var(--secondary, #00daf3)',
      border: '1px solid rgba(0, 218, 243, 0.2)'
    },
    info: {
      background: 'rgba(59, 130, 246, 0.15)',
      color: 'var(--info, #3b82f6)',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    }
  };

  // Define Size Styles
  const sizes = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.35rem 0.75rem', fontSize: '0.85rem' },
    lg: { padding: '0.5rem 1rem', fontSize: '0.9rem' }
  };

  return (
    <span
      className={`badge badge-${variant} badge-${size} ${className}`}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: 'var(--radius, 8px)',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        transition: 'all 0.2s ease',
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;