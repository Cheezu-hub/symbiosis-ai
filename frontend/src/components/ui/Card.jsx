import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  style = {}, 
  variant = 'default',
  hover = true, 
  onClick,
  padding = '1.5rem',
  shadow = 'md',
  border = true,
  ...props 
}) => {
  // 1. Define Variant Styles (Colors & Backgrounds)
  const variants = {
    default: {
      background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
      border: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
    },
    primary: {
      background: 'rgba(88, 224, 119, 0.1)',
      border: '1px solid var(--primary, #58e077)'
    },
    success: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid var(--success, #10b981)'
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid var(--warning, #f59e0b)'
    },
    error: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid var(--error, #ef4444)'
    },
    gradient: {
      background: 'linear-gradient(135deg, rgba(88, 224, 119, 0.1), rgba(0, 218, 243, 0.1))',
      border: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
    }
  };

  // 2. Define Shadow Styles
  const shadows = {
    none: 'none',
    sm: 'var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.3))',
    md: 'var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.4))',
    lg: 'var(--shadow-lg, 0 12px 40px rgba(12, 14, 16, 0.4))',
    glow: 'var(--glow-primary, 0 0 30px rgba(88, 224, 119, 0.15))'
  };

  return (
    <div
      className={`card card-${variant} ${className}`}
      onClick={onClick}
      style={{
        // Core Glass Effect
        background: variants[variant].background,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        
        // Border & Shape
        border: border ? variants[variant].border : 'none',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: padding,
        
        // Shadow & Interaction
        boxShadow: shadows[shadow],
        transition: hover ? 'transform 0.3s ease, box-shadow 0.3s ease' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        
        // Merge custom styles last so they override defaults
        ...style
      }}
      // Hover Effects (Inline JS for dynamic behavior)
      onMouseEnter={hover && onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = shadows.lg;
      } : undefined}
      onMouseLeave={hover && onClick ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = shadows[shadow];
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;