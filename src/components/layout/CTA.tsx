'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { PhoneCall, ArrowRight } from 'lucide-react';

export default function CTA() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-16">
          <div className="max-w-2xl space-y-3.5 text-center lg:text-left">
            <span className="inline-block uppercase tracking-[0.3em] text-xs font-bold text-brand-600 px-3 py-1 rounded-sm bg-brand-50 border border-brand-100">
              {t.cta.companyBadge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t.cta.title}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t.cta.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto shrink-0">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors duration-200"
            >
              <PhoneCall className="w-4 h-4 text-white/90" />
              <span>{t.cta.consultButton}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
