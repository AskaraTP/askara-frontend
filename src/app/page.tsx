'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { api, resolveImageUrl } from '@/lib/api';
import { Product, Partner, Article, HeroSlide, ShowcaseSlide, HomeSectionContent, Industry } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import CTA from '@/components/layout/CTA';
import JsonLd from '@/components/seo/JsonLd';
import {
  ArrowRight,
  FlaskConical,
  Wine,
  Droplets,
  TestTubes,
  Headphones,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Fish,
  Factory,
  Trees,
  Building,
  Microscope,
  Building2,
} from 'lucide-react';

const industryIconMap: Record<string, any> = {
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

function HomePartnerCard({ partner }: { partner: Partner }) {
  const logoUrl = resolveImageUrl(partner.logo);
  const card = (
    <div className="flex items-center justify-center h-20 sm:h-24 w-52 sm:w-60 px-6 py-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-brand-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group shrink-0 select-none cursor-pointer">
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
    </div>
  );

  if (partner.website_url) {
    return (
      <a
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        title={partner.name}
        className="block shrink-0 focus:outline-none"
      >
        {card}
      </a>
    );
  }

  return card;
}

export default function HomePage() {
  const { getLocalizedText, t, locale } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [homepageIndustries, setHomepageIndustries] = useState<Industry[]>([]);

  // Dynamic Hero Slides State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  // Dynamic Who We Are & Showcase State
  const [whoWeAreSection, setWhoWeAreSection] = useState<HomeSectionContent | null>(null);
  const [showcaseSlides, setShowcaseSlides] = useState<ShowcaseSlide[]>([]);
  const [currentShowcaseIdx, setCurrentShowcaseIdx] = useState(0);
  const [showcasePaused, setShowcasePaused] = useState(false);

  // Hero Drag & Swipe State
  const heroStartX = useRef<number | null>(null);
  const heroCurrentX = useRef<number | null>(null);
  const [isHeroDragging, setIsHeroDragging] = useState(false);

  // Showcase Drag & Swipe State
  const showcaseStartX = useRef<number | null>(null);
  const showcaseCurrentX = useRef<number | null>(null);
  const [isShowcaseDragging, setIsShowcaseDragging] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, parts, arts, heroData, showcaseData, industriesData] = await Promise.all([
          api.getFeaturedProducts(),
          api.getPartners(),
          api.getArticles(3),
          api.getHeroSlides(),
          api.getShowcaseData(),
          api.getHomepageIndustries(),
        ]);
        setFeaturedProducts(prods);
        setPartners(parts || []);
        setArticles(arts);
        setHeroSlides(heroData || []);
        if (showcaseData?.section) {
          setWhoWeAreSection(showcaseData.section);
        }
        setShowcaseSlides(showcaseData?.slides || []);
        setHomepageIndustries(industriesData || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      }
    }
    loadData();
  }, []);

  // Hero Slider Auto-Play (every 2,5 seconds)
  useEffect(() => {
    if (heroSlides.length <= 1 || heroPaused || isHeroDragging) return;
    const interval = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroSlides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [heroSlides.length, heroPaused, isHeroDragging]);

  // Showcase Slider Auto-Play (every 4.5 seconds)
  useEffect(() => {
    if (showcaseSlides.length <= 1 || showcasePaused || isShowcaseDragging) return;
    const interval = setInterval(() => {
      setCurrentShowcaseIdx((prev) => (prev + 1) % showcaseSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [showcaseSlides.length, showcasePaused, isShowcaseDragging]);

  const nextHeroSlide = () => {
    if (heroSlides.length <= 1) return;
    setCurrentHeroIdx((prev) => (prev + 1) % heroSlides.length);
  };

  const prevHeroSlide = () => {
    if (heroSlides.length <= 1) return;
    setCurrentHeroIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextShowcaseSlide = () => {
    if (showcaseSlides.length <= 1) return;
    setCurrentShowcaseIdx((prev) => (prev + 1) % showcaseSlides.length);
  };

  const prevShowcaseSlide = () => {
    if (showcaseSlides.length <= 1) return;
    setCurrentShowcaseIdx((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);
  };

  // Hero Mouse Drag & Touch Handlers
  const handleHeroMouseDown = (e: React.MouseEvent) => {
    if (heroSlides.length <= 1) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    heroStartX.current = e.clientX;
    heroCurrentX.current = e.clientX;
    setIsHeroDragging(true);
    setHeroPaused(true);
  };

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!isHeroDragging || heroStartX.current === null) return;
    heroCurrentX.current = e.clientX;
  };

  const handleHeroMouseUp = () => {
    if (isHeroDragging && heroStartX.current !== null && heroCurrentX.current !== null) {
      const diff = heroCurrentX.current - heroStartX.current;
      if (diff < -50) {
        nextHeroSlide();
      } else if (diff > 50) {
        prevHeroSlide();
      }
    }
    heroStartX.current = null;
    heroCurrentX.current = null;
    setIsHeroDragging(false);
    setHeroPaused(false);
  };

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    if (heroSlides.length <= 1) return;
    heroStartX.current = e.touches[0].clientX;
    heroCurrentX.current = e.touches[0].clientX;
    setHeroPaused(true);
  };

  const handleHeroTouchMove = (e: React.TouchEvent) => {
    heroCurrentX.current = e.touches[0].clientX;
  };

  const handleHeroTouchEnd = () => {
    if (heroStartX.current !== null && heroCurrentX.current !== null) {
      const diff = heroCurrentX.current - heroStartX.current;
      if (diff < -45) {
        nextHeroSlide();
      } else if (diff > 45) {
        prevHeroSlide();
      }
    }
    heroStartX.current = null;
    heroCurrentX.current = null;
    setHeroPaused(false);
  };

  // Showcase Mouse Drag & Touch Handlers
  const handleShowcaseMouseDown = (e: React.MouseEvent) => {
    if (showcaseSlides.length <= 1) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    showcaseStartX.current = e.clientX;
    showcaseCurrentX.current = e.clientX;
    setIsShowcaseDragging(true);
    setShowcasePaused(true);
  };

  const handleShowcaseMouseMove = (e: React.MouseEvent) => {
    if (!isShowcaseDragging || showcaseStartX.current === null) return;
    showcaseCurrentX.current = e.clientX;
  };

  const handleShowcaseMouseUp = () => {
    if (isShowcaseDragging && showcaseStartX.current !== null && showcaseCurrentX.current !== null) {
      const diff = showcaseCurrentX.current - showcaseStartX.current;
      if (diff < -35) {
        nextShowcaseSlide();
      } else if (diff > 35) {
        prevShowcaseSlide();
      }
    }
    showcaseStartX.current = null;
    showcaseCurrentX.current = null;
    setIsShowcaseDragging(false);
    setShowcasePaused(false);
  };

  const handleShowcaseTouchStart = (e: React.TouchEvent) => {
    if (showcaseSlides.length <= 1) return;
    showcaseStartX.current = e.touches[0].clientX;
    showcaseCurrentX.current = e.touches[0].clientX;
    setShowcasePaused(true);
  };

  const handleShowcaseTouchMove = (e: React.TouchEvent) => {
    showcaseCurrentX.current = e.touches[0].clientX;
  };

  const handleShowcaseTouchEnd = () => {
    if (showcaseStartX.current !== null && showcaseCurrentX.current !== null) {
      const diff = showcaseCurrentX.current - showcaseStartX.current;
      if (diff < -35) {
        nextShowcaseSlide();
      } else if (diff > 35) {
        prevShowcaseSlide();
      }
    }
    showcaseStartX.current = null;
    showcaseCurrentX.current = null;
    setShowcasePaused(false);
  };

  const solutionIcons = [FlaskConical, Wine, Droplets, TestTubes, Headphones];

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

  // Active Hero Slide Data
  const activeHero = heroSlides.length > 0 ? heroSlides[currentHeroIdx] : null;
  const heroTitle = activeHero
    ? getLocalizedText(activeHero.title_en, activeHero.title_id) || t.home.heroTitle
    : t.home.heroTitle;
  const heroSubtitle = activeHero
    ? getLocalizedText(activeHero.subtitle_en, activeHero.subtitle_id) || t.home.heroSubtitle
    : t.home.heroSubtitle;
  const heroPrimaryText = activeHero
    ? getLocalizedText(activeHero.primary_btn_text_en, activeHero.primary_btn_text_id) || t.home.exploreSolutions
    : t.home.exploreSolutions;
  const heroPrimaryUrl = activeHero?.primary_btn_url || '/products';
  const heroSecondaryText = activeHero
    ? getLocalizedText(activeHero.secondary_btn_text_en, activeHero.secondary_btn_text_id) || t.home.contactUs
    : t.home.contactUs;
  const heroSecondaryUrl = activeHero?.secondary_btn_url || '/contact';

  // Active Showcase Slide Data
  const activeShowcase = showcaseSlides.length > 0 ? showcaseSlides[currentShowcaseIdx] : null;
  const showcaseImage = activeShowcase ? resolveImageUrl(activeShowcase.image) : '/images/y15.png';
  const showcaseAlt = activeShowcase
    ? getLocalizedText(activeShowcase.title_en, activeShowcase.title_id) || 'Showcase'
    : 'BioSystems Y15 Analyzer';
  const showcaseCaption = activeShowcase
    ? getLocalizedText(activeShowcase.caption_en, activeShowcase.caption_id) || activeShowcase.title_en || t.home.y15Caption
    : t.home.y15Caption;

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PT Askara Tekno Pangan | Solusi Laboratorium & Kualitas Pangan',
    url: 'https://askara.co.id',
    description: 'Mitra penyedia instrumen laboratorium, reagen kimia, dan analisis kualitas pangan terkemuka di Indonesia. Distributor resmi BioSystems Y15.',
    about: {
      '@type': 'Organization',
      name: 'PT Askara Tekno Pangan',
    },
  };

  return (
    <div className="flex flex-col">
      <JsonLd data={homeJsonLd} />
      {/* Hero Banner Slider */}
      <section
        className={`relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center text-center px-6 lg:px-12 overflow-hidden select-none transition-all duration-300 ${
          heroSlides.length > 1 ? (isHeroDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => {
          setHeroPaused(false);
          handleHeroMouseUp();
        }}
        onMouseDown={handleHeroMouseDown}
        onMouseMove={handleHeroMouseMove}
        onMouseUp={handleHeroMouseUp}
        onTouchStart={handleHeroTouchStart}
        onTouchMove={handleHeroTouchMove}
        onTouchEnd={handleHeroTouchEnd}
      >
        {/* Background Images Layers (Cross-fade) */}
        {heroSlides.length > 0 ? (
          heroSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center bg-no-repeat ${
                idx === currentHeroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.78)), url('${resolveImageUrl(slide.image)}')`,
                transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1), transform 6000ms ease-out',
              }}
            />
          ))
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.78)), url('/images/header.png')`,
            }}
          />
        )}

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto py-16 sm:py-24 lg:py-28 flex flex-col items-center pointer-events-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.2] sm:leading-[1.15] max-w-3xl transition-all duration-700">
            {heroTitle}
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal transition-all duration-700">
            {heroSubtitle}
          </p>

          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
            <Link
              href={heroPrimaryUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm transition-colors duration-200 shadow-md"
            >
              {heroPrimaryText}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={heroSecondaryUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-md hover:bg-white/10 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-colors duration-200 backdrop-blur-xs"
            >
              {heroSecondaryText}
            </Link>
          </div>
        </div>

        {/* Minimalist Slide Indicator Pills */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 inset-x-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentHeroIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentHeroIdx
                    ? 'w-10 bg-brand-500 shadow-sm'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Who We Are & Showcase Section */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="col-span-1 lg:col-span-6 flex flex-col justify-center space-y-2 sm:space-y-3.5">
              <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
                {whoWeAreSection
                  ? getLocalizedText(whoWeAreSection.tag_en, whoWeAreSection.tag_id) || t.home.whoWeAre
                  : t.home.whoWeAre}
              </span>

              <h2 className="text-sm sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight">
                {whoWeAreSection
                  ? getLocalizedText(whoWeAreSection.title_en, whoWeAreSection.title_id) || t.home.whoWeAreTitle
                  : t.home.whoWeAreTitle}
              </h2>

              <p className="text-slate-600 leading-relaxed text-[11px] sm:text-sm lg:text-base whitespace-pre-line line-clamp-3 sm:line-clamp-none">
                {whoWeAreSection
                  ? getLocalizedText(whoWeAreSection.description_en, whoWeAreSection.description_id) || t.home.whoWeAreDesc
                  : t.home.whoWeAreDesc}
              </p>

              <div className="pt-1">
                <Link
                  href={whoWeAreSection?.button_url || '/about'}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[11px] sm:text-xs transition-colors duration-200 shadow-xs"
                >
                  {whoWeAreSection
                    ? getLocalizedText(whoWeAreSection.button_text_en, whoWeAreSection.button_text_id) || t.home.learnMore
                    : t.home.learnMore}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Showcase Frame (with Drag & Touch Swipe) */}
            <div
              className="col-span-1 lg:col-span-6"
              onMouseEnter={() => setShowcasePaused(true)}
              onMouseLeave={() => {
                setShowcasePaused(false);
                handleShowcaseMouseUp();
              }}
            >
              <div
                className={`relative bg-transparent select-none group w-full flex flex-col items-center ${
                  showcaseSlides.length > 1 ? (isShowcaseDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
                }`}
                onMouseDown={handleShowcaseMouseDown}
                onMouseMove={handleShowcaseMouseMove}
                onMouseUp={handleShowcaseMouseUp}
                onTouchStart={handleShowcaseTouchStart}
                onTouchMove={handleShowcaseTouchMove}
                onTouchEnd={handleShowcaseTouchEnd}
              >
                {/* Full-Bleed Showcase Image Container */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden bg-slate-100/70 border border-slate-200 shadow-xs">
                  <img
                    key={showcaseImage}
                    src={showcaseImage}
                    alt={showcaseAlt}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 pointer-events-none"
                  />
                </div>

                {/* Light / Transparent Synchronized Caption */}
                <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-700 uppercase mt-2.5 text-center max-w-md transition-all duration-300 line-clamp-1 sm:line-clamp-2">
                  {showcaseCaption}
                </span>

                {/* Indicator Dots for Showcase */}
                {showcaseSlides.length > 1 && (
                  <div className="flex items-center gap-1 sm:gap-1.5 mt-2 pointer-events-auto">
                    {showcaseSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentShowcaseIdx(idx)}
                        aria-label={`Go to showcase slide ${idx + 1}`}
                        className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentShowcaseIdx
                            ? 'w-5 sm:w-6 bg-brand-500'
                            : 'w-1 sm:w-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Solve */}
      <section className="py-12 sm:py-20 lg:py-24 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
            {t.home.whatWeSolve}
          </span>
          <h2 className="mt-2 sm:mt-3 text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.home.whatWeSolveTitle}
          </h2>

          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
            {t.home.solutions.map((item, idx) => {
              const IconComponent = solutionIcons[idx % solutionIcons.length];
              return (
                <div
                  key={idx}
                  className="group relative p-3.5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-300 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden cursor-default"
                >
                  <div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center mb-2.5 sm:mb-5 group-hover:bg-brand-50 group-hover:border-brand-200 group-hover:text-brand-600 group-hover:scale-105 transition-all duration-300 shadow-xs">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors duration-200 leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-slate-600 group-hover:text-slate-700 leading-relaxed transition-colors line-clamp-3 sm:line-clamp-none">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      {homepageIndustries.length > 0 && (
        <section className="py-12 sm:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
              <div>
                <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
                  {t.industries?.badge || (locale === 'id' ? 'Sektor Industri' : 'Industries We Serve')}
                </span>
                <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {t.industries?.title || (locale === 'id' ? 'Solusi Pengujian untuk Berbagai Industri' : 'Analytical Solutions for Industries')}
                </h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl">
                  {t.industries?.subtitle || (locale === 'id' ? 'Mulai dari penerimaan bahan baku hingga rilis produk akhir, Askara mendukung pengujian kualitas dan keamanan pangan di Indonesia.' : 'From raw ingredient intake to final product release, Askara supports testing precision.')}
                </p>
              </div>
              <Link
                href="/industries"
                className="inline-flex items-center gap-1.5 font-bold text-xs text-brand-600 hover:text-brand-700 transition-colors shrink-0"
              >
                <span>{locale === 'id' ? 'Lihat Semua Sektor' : 'View All Industries'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {homepageIndustries.map((ind) => {
                const iconKey = ind.icon_name || ind.icon || 'Factory';
                const IconComponent = industryIconMap[iconKey] || Factory;
                const nameEn = ind.name_en || ind.title_en || '';
                const nameId = ind.name_id || ind.title_id || '';
                const title = getLocalizedText(nameEn, nameId) || nameId || nameEn;
                const description = getLocalizedText(ind.description_en, ind.description_id);
                const rawTags = (locale === 'id' ? ind.tags_id : ind.tags_en) || ind.tags_id || ind.tags_en || [];
                const tagList = Array.isArray(rawTags) ? rawTags : (typeof rawTags === 'string' ? (rawTags as string).split(',').map((s: string) => s.trim()) : []);

                return (
                  <Link
                    key={ind.id}
                    href={`/products/${ind.target_category_slug || 'instrument'}`}
                    className="group p-3.5 sm:p-7 rounded-lg bg-slate-50/70 border border-slate-200/90 hover:border-brand-400 hover:bg-white hover:shadow-sm transition-all duration-200 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-white border border-slate-200 text-brand-600 group-hover:border-brand-300 group-hover:bg-brand-50 flex items-center justify-center mb-2.5 sm:mb-5 transition-colors">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="text-xs sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                        {title}
                      </h3>
                      <p className="mt-1.5 sm:mt-2.5 text-slate-600 leading-relaxed text-[11px] sm:text-sm line-clamp-2 sm:line-clamp-3">
                        {description}
                      </p>
                    </div>

                    <div className="mt-3 sm:mt-6 pt-2.5 sm:pt-5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {tagList.slice(0, 2).map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-1.5 sm:px-2.5 py-0.5 rounded-sm bg-white border border-slate-200/80 text-slate-700 text-[10px] sm:text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
                        <span>{t.industries?.viewRelevant || (locale === 'id' ? 'Lihat Produk' : 'View Products')}</span>
                        <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Showcase */}
      <section className="py-12 sm:py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
            <div>
              <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
                {t.home.featuredProducts}
              </span>
              <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t.home.featuredProductsTitle}
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 font-bold text-xs text-brand-600 hover:text-brand-700 transition-colors shrink-0"
            >
              {t.home.viewAllProducts}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Global Principals & Partners */}
      {partners.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-y border-slate-200/80 text-slate-900 overflow-hidden relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center mb-8 sm:mb-10 relative z-10">
            <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
              {t.home.partnersBadge}
            </span>
            <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.home.partnersTitle}
            </h2>
            <p className="mt-1.5 sm:mt-2 text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
              {t.home.partnersSubtitle}
            </p>
          </div>

          <div className="flex flex-col gap-4 relative w-full overflow-hidden">
            {/* Baris 1: Marquee Right */}
            <div className="flex w-full overflow-hidden py-1">
              <div className="animate-marquee-right flex gap-4 shrink-0">
                {row1Items.map((partner, index) => (
                  <HomePartnerCard key={`row1-${partner.id}-${index}`} partner={partner} />
                ))}
              </div>
            </div>

            {/* Baris 2: Marquee Left */}
            <div className="flex w-full overflow-hidden py-1">
              <div className="animate-marquee-left flex gap-4 shrink-0">
                {row2Items.map((partner, index) => (
                  <HomePartnerCard key={`row2-${partner.id}-${index}`} partner={partner} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles & Knowledge Hub */}
      {articles.length > 0 && (
        <section className="py-12 sm:py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
              <div>
                <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
                  {t.home.latestArticles}
                </span>
                <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t.home.latestArticlesTitle}
                </h2>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 font-bold text-xs text-brand-600 hover:text-brand-700 transition-colors shrink-0"
              >
                {t.home.viewAllArticles}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {articles.map((article) => {
                const title = getLocalizedText(article.title_en, article.title_id);
                const category = getLocalizedText(article.category_en, article.category_id);
                return (
                  <a
                    key={article.id}
                    href={article.linkedin_url || '/articles'}
                    target={article.linkedin_url ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="group rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-brand-400 transition-colors duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] sm:aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-brand-400" />
                        )}
                      </div>
                      <div className="p-3.5 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {category && (
                            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1 sm:mb-1.5 inline-block line-clamp-1">
                              {category}
                            </span>
                          )}
                          <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                            {title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 sm:p-6 sm:pt-0">
                      <div className="pt-2.5 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-medium">
                        <span className="line-clamp-1">{article.published_at}</span>
                        <span className="text-brand-600 font-semibold group-hover:underline flex items-center gap-1 shrink-0">
                          LinkedIn <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic CTA */}
      <CTA />
    </div>
  );
}
