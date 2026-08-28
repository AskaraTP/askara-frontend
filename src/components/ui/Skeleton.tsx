import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'rounded' | 'circle';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'rounded', width, height }: SkeletonProps) {
  const variantStyles = {
    text: 'h-3.5 w-full rounded-sm',
    rectangular: 'w-full rounded-none',
    rounded: 'w-full rounded-md',
    circle: 'rounded-full aspect-square',
  };

  const inlineStyles: React.CSSProperties = {};
  if (width) inlineStyles.width = typeof width === 'number' ? `${width}px` : width;
  if (height) inlineStyles.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      style={inlineStyles}
      className={`animate-pulse bg-slate-200/80 ${variantStyles[variant]} ${className}`}
    />
  );
}

export function TableSkeletonRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-slate-100 animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="py-3.5 px-4">
              <div className="h-3.5 bg-slate-200/70 rounded-sm w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-3.5 sm:p-5 rounded-lg border border-slate-200 bg-white space-y-3 sm:space-y-4 animate-pulse">
          <div className="h-28 sm:h-36 bg-slate-200/70 rounded-md w-full" />
          <div className="space-y-2">
            <div className="h-3 sm:h-4 bg-slate-200/80 rounded w-3/4" />
            <div className="h-2.5 sm:h-3 bg-slate-200/60 rounded w-1/2" />
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <div className="h-2.5 sm:h-3 bg-slate-200/60 rounded w-1/4" />
            <div className="h-4 sm:h-6 bg-slate-200/70 rounded w-14 sm:w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
