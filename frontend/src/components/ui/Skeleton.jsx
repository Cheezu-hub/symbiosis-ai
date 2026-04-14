import React from 'react';

/**
 * Skeleton component for showing loading placeholders
 * 
 * @param {string} variant - 'text', 'circular', 'rectangular', 'stat', 'card'
 * @param {string} width - Width of the skeleton
 * @param {string} height - Height of the skeleton
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
const Skeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  className = '', 
  style = {},
  ...props 
}) => {
  const getStyles = () => {
    const baseStyle = {
      width: width || '100%',
      height: height || (variant === 'text' ? '1rem' : 'auto'),
      ...style
    };

    if (variant === 'circular') {
      return { ...baseStyle, borderRadius: '50%' };
    }

    if (variant === 'stat') {
      return { ...baseStyle, height: '120px', borderRadius: '12px' };
    }

    if (variant === 'card') {
      return { ...baseStyle, height: '200px', borderRadius: '12px' };
    }

    return baseStyle;
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={getStyles()}
      {...props}
    />
  );
};

export default Skeleton;
