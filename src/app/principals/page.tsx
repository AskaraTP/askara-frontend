'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { api, resolveImageUrl } from '@/lib/api';
import { Partner } from '@/types';
import CTA from '@/components/layout/CTA';
import {
  Building2,
  Globe2,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';

function getPartnerSlug(partner: Partner): string {
  if (partner.slug && partner.slug.trim()) return partner.slug.trim();
  if (partner.name && partner.name.trim()) {
    return partner.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  return partner.id.toString();
}

function PrincipalMarqueeCard({ partner }: { partner: Partner }) {
  const slug = getPartnerSlug(partner);
  const logoUrl = resolveImageUrl(partner.logo);
  return (
    <Link
      href={`/principals/${slug}`}
      className="flex items-center justify-center h-20 sm:h-24 w-52 sm:w-60 px-6 py-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-brand-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group shrink-0 select-none cursor-pointer"
      title={`View ${partner.name} Profile`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={partner.name}
          className="max-h-11 sm:max-h-12 max-w-[88%] object-contain group-hover:scale-105 transition-all duration-300 pointer-events-none"
        />
      ) : (
        <span className="text-xs font-bold text-slate-700 group-hover:text-brand-600 transition-colors tracking-tight text-center">
          {partner.name}
        </span>
      )}
    </Link>
  );
}

export default function PrincipalsPage() {
  const { t, locale, getLocalizedText } = useLanguage();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        const data = await api.getPartners();
        setPartners(data || []);
      } catch (err) {
        console.error('Failed to load partners', err);
      } finally {
        setLoading(false);
      }
    }
    loadPartners();
  }, []);

  const row1Base = partners.filter((_, idx) => idx % 2 === 0);
  const row2Base = partners.filter((_, idx) => idx % 2 !== 0);

  const row1List = row1Base.length > 0 ? row1Base : partners;
  const row2List = row2Base.length > 0 ? row2Base : [...partners].reverse();

  const getInfiniteList = (items: Partner[]) => {
    if (!items.length) return [];
    let base = [...items];
    while (base.length < 8) {
      base = [...base, ...items];
    }
    return [...base, ...base];
  };

  const row1Items = getInfiniteList(row1List);
  const row2Items = getInfiniteList(row2List);

  return (
    <div className="pt-24 lg:pt-32">
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 text-center pb-14">
        <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600 mb-2.5 inline-block">
          {t.principals.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.principals.title}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.principals.subtitle}
        </p>
      </section>

      {/* Principals Directory List */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
            <div>
              <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
                Official Principals Directory
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Authorized Global Technology Partners
              </h2>
              <p className="text-[11px] sm:text-sm text-slate-500 mt-1">
                Select any principal to view detailed company profile, distributed product lines, and field documentation gallery.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">{t.principals.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {partners.map((partner) => {
                const slug = getPartnerSlug(partner);
                const description = getLocalizedText(partner.description_en, partner.description_id);
                const galleryCount = partner.documentation_gallery?.length || 0;

                return (
                  <Link
                    key={partner.id}
                    href={`/principals/${slug}`}
                    className="group bg-white rounded-xl border border-slate-200 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-3.5 sm:p-6 space-y-2.5 sm:space-y-4">
                      {/* Logo & Header */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
                        <div className="h-12 sm:h-16 w-24 sm:w-32 bg-white border border-slate-200/90 rounded-lg sm:rounded-xl p-1.5 sm:p-2.5 flex items-center justify-center group-hover:border-brand-300 transition-colors shrink-0 shadow-2xs">
                          {partner.logo ? (
                            <img
                              src={resolveImageUrl(partner.logo)}
                              alt={partner.name}
                              className="max-h-8 sm:max-h-11 max-w-full object-contain group-hover:scale-105 transition-all duration-300"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-slate-400 group-hover:text-brand-500 transition-colors" />
                          )}
                        </div>

                        {partner.country && (
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                            <Globe2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
                            {partner.country}
                          </span>
                        )}
                      </div>

                      {/* Name & Specialization */}
                      <div>
                        <h3 className="text-xs sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-1">
                          {partner.name}
                        </h3>
                        {partner.category && (
                          <p className="text-[10px] sm:text-xs font-semibold text-brand-600 mt-0.5 line-clamp-1">
                            {partner.category}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {description || 'Official technology principal collaborating with PT Askara Tekno Pangan.'}
                      </p>
                    </div>

                    {/* Footer Info & Action */}
                    <div className="px-3.5 py-2.5 sm:px-6 sm:py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 font-medium">
                        <ImageIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-brand-500" />
                        <span className="line-clamp-1">
                          {galleryCount > 0
                            ? `${galleryCount} Photos`
                            : 'Profile'}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 font-bold text-brand-600 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all shrink-0">
                        <span>Explore</span>
                        <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Sliding Marquee Strip */}
      {partners.length > 0 && (
        <section className="py-16 bg-slate-50 border-b border-slate-200/80 overflow-hidden relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

          <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-8 text-center relative z-10">
            <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600">
              {t.principals.networkBadge}
            </span>
            <h2 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.principals.networkTitle}
            </h2>
          </div>

          <div className="flex flex-col gap-4 relative w-full overflow-hidden">
            {/* Baris 1: Marquee Right */}
            <div className="flex w-full overflow-hidden py-1">
              <div className="animate-marquee-right flex gap-4 shrink-0">
                {row1Items.map((partner, index) => (
                  <PrincipalMarqueeCard key={`row1-${partner.id}-${index}`} partner={partner} />
                ))}
              </div>
            </div>

            {/* Baris 2: Marquee Left */}
            <div className="flex w-full overflow-hidden py-1">
              <div className="animate-marquee-left flex gap-4 shrink-0">
                {row2Items.map((partner, index) => (
                  <PrincipalMarqueeCard key={`row2-${partner.id}-${index}`} partner={partner} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <CTA />
    </div>
  );
}
