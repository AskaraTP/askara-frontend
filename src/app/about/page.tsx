'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/i18n/context';
import CTA from '@/components/layout/CTA';
import { api, resolveImageUrl } from '@/lib/api';
import { AboutContent } from '@/types';
import {
  ShieldCheck,
  Award,
  Wrench,
  Headphones,
  Zap,
  CheckCircle2,
  Microscope,
  Star,
  HeartHandshake,
  Truck,
  Building2,
  Users,
  Layers,
  Info,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  Award,
  Wrench,
  Headphones,
  Zap,
  CheckCircle2,
  Microscope,
  Star,
  HeartHandshake,
  Truck,
  Building2,
  Users,
  Layers,
  Info,
};

export default function AboutPage() {
  const { locale, getLocalizedText, t } = useLanguage();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Drag & Swipe State for Who We Are Carousel
  const slideStartX = useRef<number | null>(null);
  const slideCurrentX = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    async function loadAbout() {
      try {
        const data = await api.getAboutContent();
        if (data) {
          setContent(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic about content, using defaults:', err);
      }
    }
    loadAbout();
  }, []);

  const images = content?.who_we_are_images && content.who_we_are_images.length > 0
    ? content.who_we_are_images
    : [
        {
          image: '/images/y15.png',
          caption_en: 'BioSystems Y15 Automated Photometric Analyzer',
          caption_id: 'BioSystems Y15 Automated Photometric Analyzer',
          alt_text: 'BioSystems Y15 Analyzer',
        },
      ];

  const nextSlide = () => {
    if (images.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    if (images.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  // Mouse Drag & Touch Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (images.length <= 1) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    slideStartX.current = e.clientX;
    slideCurrentX.current = e.clientX;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || slideStartX.current === null) return;
    slideCurrentX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (isDragging && slideStartX.current !== null && slideCurrentX.current !== null) {
      const diff = slideCurrentX.current - slideStartX.current;
      if (diff < -40) {
        nextSlide();
      } else if (diff > 40) {
        prevSlide();
      }
    }
    slideStartX.current = null;
    slideCurrentX.current = null;
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    slideStartX.current = e.touches[0].clientX;
    slideCurrentX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    slideCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (slideStartX.current !== null && slideCurrentX.current !== null) {
      const diff = slideCurrentX.current - slideStartX.current;
      if (diff < -40) {
        nextSlide();
      } else if (diff > 40) {
        prevSlide();
      }
    }
    slideStartX.current = null;
    slideCurrentX.current = null;
    setIsPaused(false);
  };

  // Auto-slide effect for the Who We Are Carousel
  useEffect(() => {
    if (images.length <= 1 || isPaused || isDragging) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length, isPaused, isDragging]);

  const activeSlide = images[currentSlide] || images[0];

  const points = locale === 'id'
    ? (content?.who_we_are_points_id && content.who_we_are_points_id.length > 0 ? content.who_we_are_points_id : t.about.points)
    : (content?.who_we_are_points_en && content.who_we_are_points_en.length > 0 ? content.who_we_are_points_en : t.about.points);

  const reasons = content?.why_choose_reasons && content.why_choose_reasons.length > 0
    ? content.why_choose_reasons.map((r) => ({
        icon: r.icon,
        title: locale === 'id' ? (r.title_id || r.title_en) : (r.title_en || r.title_id),
        desc: locale === 'id' ? (r.desc_id || r.desc_en) : (r.desc_en || r.desc_id),
      }))
    : t.about.reasons.map((r, i) => {
        const defaultIcons = ['ShieldCheck', 'Award', 'Wrench', 'Headphones'];
        return {
          icon: defaultIcons[i % defaultIcons.length],
          title: r.title,
          desc: r.desc,
        };
      });

  return (
    <div className="pt-24 lg:pt-32">
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 text-center pb-14">
        <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600 mb-2.5 inline-block">
          {content
            ? getLocalizedText(content.hero_badge_en, content.hero_badge_id) || t.about.badge
            : t.about.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {content
            ? getLocalizedText(content.hero_title_en, content.hero_title_id) || t.about.title
            : t.about.title}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {content
            ? getLocalizedText(content.hero_subtitle_en, content.hero_subtitle_id) || t.about.subtitle
            : t.about.subtitle}
        </p>
      </section>

      {/* Who We Are Section */}
      <section className="py-16 lg:py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left text */}
            <div className="lg:col-span-6 space-y-5">
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600">
                {content
                  ? getLocalizedText(content.who_we_are_tag_en, content.who_we_are_tag_id) || t.about.whoWeAre
                  : t.about.whoWeAre}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {content
                  ? getLocalizedText(content.who_we_are_heading_en, content.who_we_are_heading_id) || t.about.whoWeAreHeading
                  : t.about.whoWeAreHeading}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {content
                  ? getLocalizedText(content.who_we_are_p1_en, content.who_we_are_p1_id) || t.about.p1
                  : t.about.p1}
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {content
                  ? getLocalizedText(content.who_we_are_p2_en, content.who_we_are_p2_id) || t.about.p2
                  : t.about.p2}
              </p>

              <div className="pt-3 space-y-2.5">
                {points.map((point: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-slate-800 font-medium text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Multi-Image Carousel Frame with Drag & Swipe */}
            <div className="lg:col-span-6">
              <div
                className="relative bg-transparent select-none group w-full flex flex-col items-center"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  if (isDragging) {
                    handleMouseUp();
                  } else {
                    setIsPaused(false);
                  }
                }}
              >
                {/* Slides Container in Clean/Transparent Box with Drag/Swipe */}
                <div
                  className={`relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden bg-slate-100/70 border border-slate-200 shadow-xs touch-pan-y ${
                    images.length > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
                  }`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {images.map((imgItem, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out select-none ${
                          isActive
                            ? 'opacity-100 scale-100 pointer-events-auto z-10'
                            : 'opacity-0 scale-105 pointer-events-none z-0'
                        }`}
                      >
                        <img
                          src={resolveImageUrl(imgItem.image)}
                          alt={imgItem.alt_text || 'Askara Solution'}
                          draggable={false}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Light / Transparent Caption */}
                <p className="mt-2.5 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider line-clamp-1 max-w-md">
                  {getLocalizedText(activeSlide?.caption_en, activeSlide?.caption_id) || t.about.y15Caption}
                </p>

                {/* Dot Pagination */}
                {images.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          currentSlide === i ? 'w-5 sm:w-6 bg-brand-500' : 'w-1 sm:w-1.5 bg-slate-300 hover:bg-slate-400'
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

      {/* Why Choose Askara */}
      <section className="py-12 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold text-brand-600">
              {content
                ? getLocalizedText(content.why_choose_badge_en, content.why_choose_badge_id) || t.about.whyChoose
                : t.about.whyChoose}
            </span>
            <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {content
                ? getLocalizedText(content.why_choose_heading_en, content.why_choose_heading_id) || t.about.whyChooseHeading
                : t.about.whyChooseHeading}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
            {reasons.map((reason, idx) => {
              const Icon = ICON_MAP[reason.icon] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="p-3.5 sm:p-7 lg:p-8 rounded-lg bg-white border border-slate-200 hover:border-brand-400 transition-colors duration-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5 sm:mb-5">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                    </div>
                    <h3 className="text-xs sm:text-lg font-bold text-slate-900 leading-snug">
                      {reason.title}
                    </h3>
                    <p className="mt-1.5 sm:mt-2.5 text-slate-600 leading-relaxed text-[11px] sm:text-sm">
                      {reason.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
