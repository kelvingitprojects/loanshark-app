
import React from 'react';

interface ProgressBarProps {
  value: number;
}

// FIX: Refactor from `React.FC` to a standard function component.
export const ProgressBar = ({ value }: ProgressBarProps) => {
  const progress = Math.min(100, Math.max(0, value));
  
  const getColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  }

  return (
    <div className="w-full bg-secondary rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${getColor()}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};