/* AI Components - SymbiosisScoreBadge */
import React from 'react';

const SymbiosisScoreBadge = ({ score, size = 64 }) => {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  let color = 'var(--error)';
  if (score >= 70) color = 'var(--success)';
  else if (score >= 40) color = 'var(--warning)';

  return (
    <div className="flex items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span style={{ fontSize: `${size * 0.3}px`, fontWeight: 'bold', color: 'var(--text-primary)' }}>{score}</span>
        {size > 50 && <span style={{ fontSize: `${size * 0.15}px`, color: 'var(--text-secondary)' }}>Score</span>}
      </div>
    </div>
  );
};

export default SymbiosisScoreBadge;
