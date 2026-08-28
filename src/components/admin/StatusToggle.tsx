'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface StatusToggleProps {
  isActive: boolean;
  onToggle: () => void | Promise<void>;
  loading?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  disabled?: boolean;
}

export default function StatusToggle({
  isActive,
  onToggle,
  loading = false,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  disabled = false,
}: StatusToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || loading}
      title={`Click to switch to ${isActive ? inactiveLabel : activeLabel}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/80'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isActive ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'
          }`}
        />
      )}
      <span>{isActive ? activeLabel : inactiveLabel}</span>
    </button>
  );
}
