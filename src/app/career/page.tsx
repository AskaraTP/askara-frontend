'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { api } from '@/lib/api';
import { Career } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import CTA from '@/components/layout/CTA';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';

export default function CareerPage() {
  const { getLocalizedText, t } = useLanguage();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCareers() {
      try {
        const data = await api.getCareers();
        setCareers(data);
      } catch (err) {
        console.error('Failed to load careers', err);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, []);

  return (
    <div className="pt-24 lg:pt-32">
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 text-center pb-14">
        <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600 mb-2.5 inline-block">
          {t.career.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.career.title}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.career.subtitle}
        </p>
      </section>

      {/* Opportunities List */}
      <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-8 sm:mb-10">
            <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
              {t.career.opportunitiesBadge}
            </span>
            <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">
              {t.career.openPositions}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="p-3.5 sm:p-7 rounded-lg bg-white border border-slate-200 space-y-3 sm:space-y-4 animate-pulse">
                  <div className="h-4 sm:h-5 bg-slate-200/80 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-3 sm:h-4 bg-slate-200/60 rounded w-16 sm:w-24" />
                    <div className="h-3 sm:h-4 bg-slate-200/60 rounded w-14 sm:w-20" />
                  </div>
                  <div className="h-8 sm:h-12 bg-slate-200/50 rounded w-full" />
                </div>
              ))}
            </div>
          ) : careers.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
              {careers.map((career) => {
                const jobTitle = getLocalizedText(career.job_title_en, career.job_title_id);
                const location = getLocalizedText(career.location_en, career.location_id);
                const empType = getLocalizedText(career.employment_type_en, career.employment_type_id);

                return (
                  <div
                    key={career.id}
                    className="p-3.5 sm:p-7 rounded-lg bg-white border border-slate-200 hover:border-brand-400 transition-colors duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <Link
                        href={`/career/${career.slug}`}
                        className="group"
                      >
                        <h3 className="text-xs sm:text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                          {jobTitle}
                        </h3>
                      </Link>

                      <div className="mt-2.5 sm:mt-3.5 flex flex-wrap gap-1.5 sm:gap-2">
                        {location && (
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-medium">
                            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-500" />
                            <span className="line-clamp-1">{location}</span>
                          </div>
                        )}

                        {empType && (
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-brand-50 text-brand-700 text-[10px] sm:text-xs font-semibold">
                            <Briefcase className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-brand-600" />
                            <span className="line-clamp-1">{empType}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/career/${career.slug}`}
                        className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-[10px] sm:text-xs font-bold transition-colors"
                      >
                        <span>{t.career.viewJob}</span>
                        <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-lg bg-white border border-dashed border-slate-200 text-center">
              <p className="text-slate-500 text-sm font-medium">{t.career.empty}</p>
            </div>
          )}
        </div>
      </section>

      <CTA />
    </div>
  );
}
