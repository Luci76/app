
import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="w-full bg-slate-200 rounded-full h-4 mb-2 overflow-hidden">
      <div 
        className="bg-emerald-400 h-full transition-all duration-700 ease-out shadow-sm"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
};

export default ProgressBar;
