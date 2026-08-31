'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/context';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { validateCareerApplication, MAX_CV_SIZE_BYTES } from '@/lib/validation';
import { Career } from '@/types';
import FormField from '@/components/admin/FormField';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  ArrowRight,
} from 'lucide-react';

import { useDynamicSlug } from '@/hooks/useDynamicRouteParams';

interface CareerApplyClientProps {
  params?: Promise<{
    slug: string;
  }>;
}

export default function CareerApplyClient({ params }: CareerApplyClientProps) {
  const { slug: careerSlug } = useDynamicSlug(params);
  const router = useRouter();

  const { t, getLocalizedText, locale } = useLanguage();
  const { toast } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    portfolio_url: '',
    cover_letter: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [consentChecked, setConsentChecked] = useState(true);

  useEffect(() => {
    async function loadCareer() {
      try {
        const data = await api.getCareerBySlug(careerSlug);
        setCareer(data);
      } catch (err) {
        console.error('Failed to load career position for application', err);
        setCareer(null);
      } finally {
        setLoading(false);
      }
    }
    loadCareer();
  }, [careerSlug]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    // Check size limit (30MB)
    if (file.size > MAX_CV_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFormErrors((prev) => ({
        ...prev,
        cv: `${t.career.fileTooLarge || 'File size exceeds maximum limit of 30MB'} (${sizeMB} MB).`,
      }));
      toast(t.career.fileTooLarge || 'CV file exceeds the maximum 30MB size limit.', 'error');
      return;
    }

    // Check extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExts = ['.pdf', '.doc', '.docx'];
    if (!validExts.includes(ext)) {
      setFormErrors((prev) => ({
        ...prev,
        cv: 'Only PDF (.pdf), Word (.doc, .docx) documents are supported.',
      }));
      toast('Invalid file format. Please upload PDF or Word document.', 'error');
      return;
    }

    setCvFile(file);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.cv;
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCareerApplication(formData, cvFile);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast(firstError || 'Please complete all required fields.', 'error');
      return;
    }

    if (!consentChecked) {
      toast('Please agree to the privacy statement to proceed.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('career_id', career?.id ? String(career.id) : '');
      payload.append('career_slug', careerSlug);
      payload.append(
        'career_title',
        career ? getLocalizedText(career.job_title_en, career.job_title_id) : ''
      );
      payload.append('full_name', formData.full_name.trim());
      payload.append('email', formData.email.trim());
      payload.append('phone', formData.phone.trim());
      if (formData.linkedin_url) payload.append('linkedin_url', formData.linkedin_url.trim());
      if (formData.portfolio_url) payload.append('portfolio_url', formData.portfolio_url.trim());
      if (formData.cover_letter) payload.append('cover_letter', formData.cover_letter.trim());
      if (cvFile) payload.append('cv', cvFile);

      await api.applyForCareer(payload);
      setIsSubmitted(true);
      toast(t.career.applySuccessTitle || 'Application submitted successfully!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submit application error:', err);
      toast(formatErrorMessage(err, 'Failed to submit application. Please try again.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 max-w-4xl mx-auto px-6 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-10 bg-slate-200 rounded w-3/4" />
        <div className="h-96 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="pt-28 pb-24 max-w-lg mx-auto px-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Briefcase className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t.career.notFound}</h1>
        <p className="text-xs text-slate-600">{t.career.notFoundDesc}</p>
        <Link
          href="/career"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.career.backToCareers}
        </Link>
      </div>
    );
  }

  const jobTitle = getLocalizedText(career.job_title_en, career.job_title_id);
  const department =
    getLocalizedText(career.department_en, career.department_id) || 'Laboratory Support';
  const location = getLocalizedText(career.location_en, career.location_id) || 'Jakarta, Indonesia';
  const employmentType =
    getLocalizedText(career.employment_type_en, career.employment_type_id) || 'Full-time';

  // Success Confirmation View
  if (isSubmitted) {
    return (
      <div className="pt-28 pb-24 min-h-[75vh] flex items-center justify-center">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.career.applySuccessTitle || 'Application Submitted Successfully!'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              {(
                t.career.applySuccessMessage ||
                'Thank you for applying for the position of {position}. Our recruitment team has received your profile and CV document and will contact you via email or phone.'
              ).replace('{position}', jobTitle)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/career"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors shadow-sm"
            >
              <span>{t.career.exploreOtherCareers || 'Explore Other Openings'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-32 pb-24 bg-slate-50/60 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        {/* Top Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href={`/career/${careerSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{t.career.backToPosition || 'Back to Job Details'}</span>
          </Link>
        </div>

        {/* Position Summary Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                {department}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {jobTitle}
              </h1>
            </div>
            <span className="px-3 py-1 rounded-sm bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/80">
              {career.is_active
                ? locale === 'id'
                  ? 'Sedang Dibuka'
                  : 'Actively Hiring'
                : locale === 'id'
                  ? 'Posisi Ditutup'
                  : 'Closed'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-800 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{location}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-800 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>{employmentType}</span>
            </div>
          </div>
        </div>

        {/* Application Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">
              {t.career.applyPageTitle || 'Submit Application'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t.career.applyPageSubtitle || 'Complete the form below and attach your CV to apply.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Candidate Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. {t.career.applicantInfo || 'Applicant Information'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label={t.career.fullName || 'Full Name'}
                  required
                  error={formErrors.full_name}
                >
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder={t.career.fullNamePlaceholder || 'e.g. Budi Santoso'}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </FormField>

                <FormField
                  label={t.career.emailAddress || 'Email Address'}
                  required
                  error={formErrors.email}
                >
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t.career.emailPlaceholder || 'budi@example.com'}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label={t.career.phoneNumber || 'Phone / WhatsApp'}
                  required
                  error={formErrors.phone}
                >
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t.career.phonePlaceholder || '081234567890'}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </FormField>

                <FormField
                  label={t.career.linkedinUrl || 'LinkedIn Profile (Optional)'}
                  error={formErrors.linkedin_url}
                >
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder={t.career.linkedinPlaceholder || 'https://linkedin.com/in/username'}
                    className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </FormField>
              </div>

              <FormField
                label={t.career.portfolioUrl || 'Portfolio / Website / GitHub (Optional)'}
                error={formErrors.portfolio_url}
              >
                <input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  placeholder={t.career.portfolioPlaceholder || 'https://yourportfolio.com'}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                />
              </FormField>

              <FormField label={t.career.coverLetter || 'Cover Note / Introduction (Optional)'}>
                <textarea
                  rows={4}
                  value={formData.cover_letter}
                  onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                  placeholder={
                    t.career.coverLetterPlaceholder ||
                    'Briefly introduce yourself and why you would be a great addition to PT Askara Tekno Pangan...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 leading-relaxed"
                />
              </FormField>
            </div>

            {/* CV Document Upload Zone */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. {t.career.uploadCv || 'Upload CV / Resume Document'}{' '}
                <span className="text-rose-500">*</span>
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />

              {!cvFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
                      : formErrors.cv
                        ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
                        : 'border-slate-300 bg-slate-50/70 hover:border-brand-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center mx-auto shadow-xs mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {t.career.dragCvHere || 'Drag & drop your CV file here, or click to browse'}
                  </h4>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {cvFile.name}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {formatFileSize(cvFile.size)} &bull;{' '}
                        {t.career.cvSelected || 'Ready to upload'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      {t.career.changeCv || 'Change File'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {formErrors.cv && (
                <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{formErrors.cv}</span>
                </p>
              )}
            </div>

            {/* Privacy Consent Agreement */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  {t.career.privacyConsent ||
                    'I certify that all information provided is accurate and agree to PT Askara Tekno Pangan processing my data for recruitment purposes.'}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <Link
                href={`/career/${careerSlug}`}
                className="px-5 py-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {locale === 'id' ? 'Batal' : 'Cancel'}
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-md bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white text-xs sm:text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.career.submitting || 'Uploading & Submitting Application...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t.career.submitApplication || 'Submit Job Application'}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
