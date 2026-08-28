'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { api } from '@/lib/api';
import { Industry } from '@/types';
import CTA from '@/components/layout/CTA';
import {
  Utensils,
  Fish,
  Factory,
  FlaskConical,
  Trees,
  Droplets,
  Building,
  Microscope,
  Building2,
  ArrowRight,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Utensils,
  Fish,
  Factory,
  FlaskConical,
  Trees,
  Droplets,
  Building,
  Microscope,
  Building2,
};

const defaultSectorIcons = [Utensils, Fish, Factory, FlaskConical, Trees];

const defaultCategoryMap: Record<number, string> = {
  0: 'instrument',    // Food & Beverage
  1: 'rapid-test',    // Seafood & Export
  2: 'instrument',    // Manufacturing
  3: 'reagent-kimia', // Lab & Quality Testing
  4: 'ipal',          // Environmental & Water
};

export default function IndustriesPage() {
  const { t, locale, getLocalizedText } = useLanguage();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIndustries() {
      try {
        const data = await api.getIndustries({ activeOnly: true });
        if (data && data.length > 0) {
          setIndustries(data);
        }
      } catch (err) {
        console.error('Failed to load dynamic industries', err);
      } finally {
        setLoading(false);
      }
    }
    loadIndustries();
  }, []);

  return (
    <div className="pt-24 lg:pt-32">
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 text-center pb-14">
        <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600 mb-2.5 inline-block">
          {t.industries.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.industries.title}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.industries.subtitle}
        </p>
      </section>

      {/* Industries Grid */}
      <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* If dynamic industries exist, render them */}
          {industries.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
              {industries.map((item, idx) => {
                const iconKey = item.icon_name || item.icon || 'Factory';
                const Icon = iconMap[iconKey] || defaultSectorIcons[idx % defaultSectorIcons.length] || Factory;
                const isFullWidth = idx === industries.length - 1 && industries.length % 2 !== 0;
                const targetCategory = item.target_category_slug || 'instrument';

                const nameEn = item.name_en || item.title_en || '';
                const nameId = item.name_id || item.title_id || '';
                const title = getLocalizedText(nameEn, nameId) || nameId || nameEn;
                const description = getLocalizedText(item.description_en, item.description_id);
                const rawTags = (locale === 'id' ? item.tags_id : item.tags_en) || item.tags_id || item.tags_en || [];
                const tagList = Array.isArray(rawTags) ? rawTags : (typeof rawTags === 'string' ? (rawTags as string).split(',').map((s: string) => s.trim()) : []);

                return (
                  <Link
                    key={item.id || idx}
                    href={`/products/${targetCategory}`}
                    className={`group p-3.5 sm:p-7 lg:p-8 rounded-lg bg-white border border-slate-200 hover:border-brand-400 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                      isFullWidth ? 'col-span-2' : ''
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-md bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-600 flex items-center justify-center mb-2.5 sm:mb-5 transition-colors">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="text-xs sm:text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                        {title}
                      </h3>
                      <p className="mt-1.5 sm:mt-2.5 text-slate-600 leading-relaxed text-[11px] sm:text-sm line-clamp-2 sm:line-clamp-3">
                        {description}
                      </p>
                    </div>

                    <div className="mt-3 sm:mt-6 pt-2.5 sm:pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {tagList.slice(0, 3).map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
                        <span>{t.industries.viewRelevant}</span>
                        <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Fallback to JSON dictionary if API is loading or offline */
            <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
              {t.industries.items.map((item, idx) => {
                const Icon = defaultSectorIcons[idx % defaultSectorIcons.length];
                const isFullWidth = idx === t.industries.items.length - 1 && t.industries.items.length % 2 !== 0;
                const targetCategory = defaultCategoryMap[idx] || 'instrument';

                return (
                  <Link
                    key={idx}
                    href={`/products/${targetCategory}`}
                    className={`group p-3.5 sm:p-7 lg:p-8 rounded-lg bg-white border border-slate-200 hover:border-brand-400 transition-colors duration-200 flex flex-col justify-between cursor-pointer ${
                      isFullWidth ? 'col-span-2' : ''
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 sm:mb-5">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                      </div>
                      <h3 className="text-xs sm:text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 sm:mt-2.5 text-slate-600 leading-relaxed text-[11px] sm:text-sm line-clamp-2 sm:line-clamp-3">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-3 sm:mt-6 pt-2.5 sm:pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {item.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
                        <span>{t.industries.viewRelevant}</span>
                        <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTA />
    </div>
  );
}
