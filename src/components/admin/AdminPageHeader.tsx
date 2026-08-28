'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface AdminPageHeaderProps {
  backHref: string;
  backTitle?: string;
  title: string;
  subtitle?: string;
  saving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  showSave?: boolean;
  onSave?: () => void;
  actions?: React.ReactNode;
}

export default function AdminPageHeader({
  backHref,
  backTitle = 'Back',
  title,
  subtitle,
  saving = false,
  saveLabel = 'Save Changes',
  savingLabel = 'Saving...',
  showSave = true,
  onSave,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title={backTitle}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href={backHref}
          className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          Cancel
        </Link>

        {actions}

        {showSave && (
          <button
            type={onSave ? 'button' : 'submit'}
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? savingLabel : saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}
