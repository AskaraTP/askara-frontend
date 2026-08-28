'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
      </div>

      {children}

      {error && (
        <p className="text-[11px] font-medium text-rose-600 animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
