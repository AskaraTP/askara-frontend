'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { Career } from '@/types';
import CTA from '@/components/layout/CTA';
import JsonLd from '@/components/seo/JsonLd';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Banknote,
  CheckCircle2,
  Gift,
  Building2,
  Share2,
  Check,
} from 'lucide-react';

import { useDynamicSlug } from '@/hooks/useDynamicRouteParams';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

interface CareerDetailClientProps {
  params?: Promise<{
    slug: string;
  }>;
}

export default function CareerDetailClient({ params }: CareerDetailClientProps) {
  const { slug: careerSlug } = useDynamicSlug(params);

  const { getLocalizedText, t, locale } = useLanguage();
  const { toast } = useUI();

  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCareer() {
      try {
        const data = await api.getCareerBySlug(careerSlug);
        setCareer(data);
      } catch (err) {
        console.error('Failed to load career position details', err);
        setCareer(null);
      } finally {
        setLoading(false);
      }
    }
    loadCareer();
  }, [careerSlug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast(t.career.linkCopied, 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parseList = (content?: string | null) => {
    if (!content) return [];
    return content
      .split(/\r\n|\r|\n/)
      .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter((line) => line.length > 0);
  };

  if (loading) {
    return (
      <div className="pt-24 lg:pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 animate-pulse space-y-8">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 rounded w-2/3" />
            <div className="flex gap-3">
              <div className="h-6 bg-slate-200 rounded w-28" />
              <div className="h-6 bg-slate-200 rounded w-24" />
              <div className="h-6 bg-slate-200 rounded w-32" />
            </div>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 pt-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-32 bg-slate-100 rounded-lg" />
              <div className="h-48 bg-slate-100 rounded-lg" />
              <div className="h-48 bg-slate-100 rounded-lg" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 bg-slate-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="pt-24 lg:pt-32 pb-24">
        <div className="max-w-xl mx-auto px-6 text-center space-y-5">
          <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.career.notFound}</h1>
            <p className="text-sm text-slate-600 mt-2">{t.career.notFoundDesc}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/career"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.career.backToCareers}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const jobTitle = getLocalizedText(career.job_title_en, career.job_title_id) || career.job_title_en || career.job_title_id;
  const department = getLocalizedText(career.department_en, career.department_id) || career.department_en || career.department_id || '';
  const location = getLocalizedText(career.location_en, career.location_id) || career.location_en || career.location_id || 'Jakarta, Indonesia';
  const employmentType = getLocalizedText(career.employment_type_en, career.employment_type_id) || career.employment_type_en || career.employment_type_id || 'Full Time';
  const experienceLevel = getLocalizedText(career.experience_level_en, career.experience_level_id) || career.experience_level_en || career.experience_level_id || '';

  const description = getLocalizedText(career.description_en, career.description_id);
  const responsibilities = parseList(getLocalizedText(career.responsibilities_en, career.responsibilities_id));
  const requirements = parseList(getLocalizedText(career.requirements_en, career.requirements_id));
  const benefits = parseList(getLocalizedText(career.benefits_en, career.benefits_id));

  const careerUrl = `${SITE_URL}/career/${careerSlug}`;

  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: jobTitle,
    description: description || `${jobTitle} di PT Askara Tekno Pangan`,
    identifier: {
      '@type': 'PropertyValue',
      name: 'PT Askara Tekno Pangan',
      value: `ASK-JOB-${career.id}`,
    },
    datePosted: (career as any).created_at || new Date().toISOString(),
    validThrough: (career as any).deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: employmentType.toUpperCase().includes('FULL') ? 'FULL_TIME' : 'PART_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'PT Askara Tekno Pangan',
      sameAs: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressCountry: 'ID',
      },
    },
    responsibilities: responsibilities.join('. '),
    skills: requirements.join('. '),
    url: careerUrl,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Career',
        item: `${SITE_URL}/career`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: jobTitle,
        item: careerUrl,
      },
    ],
  };

  return (
    <div className="pt-24 lg:pt-32">
      <JsonLd data={[jobPostingJsonLd, breadcrumbJsonLd]} />
      {/* Top Breadcrumb & Header */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 pb-10">
        <div className="mb-6">
          <Link
            href="/career"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            {t.career.backToCareers}
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-sm bg-brand-50 border border-brand-200/70 text-brand-700 text-xs font-semibold">
              {department}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold ${
                career.is_active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${career.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}
              />
              {career.is_active
                ? (locale === 'id' ? 'Sedang Dibuka' : 'Actively Hiring')
                : (locale === 'id' ? 'Posisi Ditutup' : 'Position Closed')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {jobTitle}
          </h1>

          {/* Quick Key-Attributes Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm text-slate-600">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-800 font-medium">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{location}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-800 font-medium">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span>{employmentType}</span>
            </div>

            {experienceLevel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-800 font-medium">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{experienceLevel}</span>
              </div>
            )}

            {career.salary_range && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-800 font-medium">
                <Banknote className="w-4 h-4 text-slate-500" />
                <span>{career.salary_range}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Job Details & Sidebar */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Role Overview */}
              {description && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-7 space-y-4 shadow-sm">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {t.career.aboutRole}
                  </h2>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line space-y-3">
                    {description}
                  </div>
                </div>
              )}

              {/* Key Responsibilities */}
              {responsibilities.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-7 space-y-4 shadow-sm">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {t.career.responsibilities}
                  </h2>
                  <ul className="space-y-3">
                    {responsibilities.map((resp, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
                      >
                        <div className="mt-1 w-4 h-4 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements & Qualifications */}
              {requirements.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-7 space-y-4 shadow-sm">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {t.career.requirements}
                  </h2>
                  <ul className="space-y-3">
                    {requirements.map((req, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
                      >
                        <div className="mt-1 w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        </div>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perks & Benefits */}
              {benefits.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-7 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                      <Gift className="w-4 h-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {t.career.benefits}
                    </h2>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-3 pt-1">
                    {benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium flex items-center gap-2.5"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Sticky Application Panel */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.career.applyNow}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Submit your application and upload your CV for{' '}
                    <strong className="text-slate-800">{jobTitle}</strong>.
                  </p>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/career/${careerSlug}/apply`}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold transition-colors shadow-sm"
                  >
                    <span>{t.career.applyButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t.career.sharePosition}</span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Company Info Box */}
              <div className="bg-white text-slate-900 rounded-lg p-6 space-y-3.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-white/10 text-brand-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      PT Askara Tekno Pangan
                    </h4>
                    <p className="text-[11px] text-slate-400">Analytical Laboratory Partner</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  PT Askara Tekno Pangan is an Indonesian laboratory solution provider specializing
                  in food quality analysis and analytical solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
