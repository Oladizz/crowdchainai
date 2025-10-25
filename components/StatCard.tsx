

import React from 'react';
import useAnimatedCounter from '../hooks/useAnimatedCounter';

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, prefix = '', suffix = '' }) => {
  const animatedValue = useAnimatedCounter(value, 2000);

  return (
    <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 rounded-xl text-center shadow-lg animate-fade-in">
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-blue break-words leading-tight overflow-hidden">
        {prefix}{animatedValue.toLocaleString()}{suffix}
      </p>
      <p className="mt-2 text-sm sm:text-base text-brand-muted">{label}</p>
    </div>
  );
};

export default StatCard;
