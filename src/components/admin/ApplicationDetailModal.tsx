'use client';

import React, { useEffect, useCallback } from 'react';
import { CareerApplication } from '@/types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  FileText,
  Download,
  ExternalLink,
  Trash2,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: CareerApplication | null;
  applicationsList: CareerApplication[];
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, newStatus: CareerApplication['status']) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onSelectApplication: (app: CareerApplication) => void;
}

const STATUS_OPTIONS: { key: CareerApplication['status']; label: string; activeClass: string }[] = [
  {
    key: 'submitted',
    label: 'Submitted',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs',
  },
  {
    key: 'reviewing',
    label: 'In Review',
    activeClass: 'bg-amber-500 text-white border-amber-500 shadow-xs',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
  },
  {
    key: 'rejected',
    label: 'Not Selected',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs',
  },
];

export default function ApplicationDetailModal({
  application,
  applicationsList,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
  onSelectApplication,
}: ApplicationDetailModalProps) {
  const currentIndex = application
    ? applicationsList.findIndex((a) => a.id === application.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < applicationsList.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onSelectApplication(applicationsList[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, applicationsList, onSelectApplication]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onSelectApplication(applicationsList[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, applicationsList, onSelectApplication]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !application) return null;

  // Clean WhatsApp link
  const cleanPhone = application.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 1. Header: Candidate Info & Prev/Next */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 truncate">
                {application.full_name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{application.career_title || 'General Vacancy'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Prev / Next Buttons */}
            {applicationsList.length > 1 && (
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Previous candidate (Left arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-semibold text-slate-600 px-2 select-none">
                  {currentIndex + 1} of {applicationsList.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Next candidate (Right arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Selection Pills */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Recruitment Stage
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = application.status === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onStatusChange(application.id, opt.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      isActive
                        ? opt.activeClass
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Contact Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </span>
                <a
                  href={`mailto:${application.email}`}
                  className="font-bold text-slate-800 hover:text-brand-600 transition-colors truncate block"
                >
                  {application.email}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Phone / WhatsApp
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{application.phone}</span>
                  {waPhone && (
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200/80 transition-colors"
                    >
                      Chat WA
                    </a>
                  )}
                </div>
              </div>

              {application.linkedin_url && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 sm:col-span-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    LinkedIn
                  </span>
                  <a
                    href={application.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-600 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{application.linkedin_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              {application.portfolio_url && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5 sm:col-span-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Portfolio / Website
                  </span>
                  <a
                    href={application.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-600 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{application.portfolio_url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Attached CV / Resume File */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Curriculum Vitae (CV)
            </span>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {application.cv_filename || 'Candidate_Resume.pdf'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Uploaded on {application.created_at ? new Date(application.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={application.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preview</span>
                </a>

                <a
                  href={application.cv_url}
                  download={application.cv_filename || 'Candidate_CV.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>

          {/* Cover Letter (if submitted) */}
          {application.cover_letter && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Cover Note / Message
              </span>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {application.cover_letter}
              </div>
            </div>
          )}
        </div>

        {/* 3. Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onDelete(application.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-slate-400">
              Tip: Use &larr; / &rarr; keys to browse candidates
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
