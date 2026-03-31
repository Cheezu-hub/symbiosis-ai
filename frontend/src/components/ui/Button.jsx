import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onClick, 
  type = 'button',
  style = {}, 
  className = '',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props 
}) => {
  // Define Variant Styles
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary, #58e077), var(--primary-dark, #2ebd59))',
      color: 'var(--bg-primary, #121416)',
      border: 'none'
    },
    secondary: {
      background: 'var(--bg-tertiary, #282a2c)',
      color: 'var(--text-primary, #e2e2e5)',
      border: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary, #58e077)',
      border: '1px solid var(--primary, #58e077)'
    },
    danger: {
      background: 'var(--error, #ef4444)',
      color: 'white',
      border: 'none'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary, #a0a0a5)',
      border: 'none'
    },
    success: {
      background: 'var(--success, #10b981)',
      color: 'white',
      border: 'none'
    }
  };

  // Define Size Styles
  const sizes = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.85rem', height: '36px' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.9rem', height: '44px' },
    lg: { padding: '1rem 2rem', fontSize: '1rem', height: '52px' }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${className}`}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: 'var(--radius, 8px)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = 'var(--glow-primary, 0 0 30px rgba(88, 224, 119, 0.3))';
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
      )}
      
      {/* Left Icon */}
      {leftIcon && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {leftIcon}
        </span>
      )}
      
      {/* Button Text */}
      <span>{children}</span>
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;