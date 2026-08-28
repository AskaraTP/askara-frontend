import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export default function Spinner({ size = 'sm', className = '', label }: SpinnerProps) {
  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-brand-500`} />
      {label && <span className="text-xs text-slate-500 font-medium">{label}</span>}
    </div>
  );
}
