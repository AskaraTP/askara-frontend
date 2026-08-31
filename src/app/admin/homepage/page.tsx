'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api, resolveImageUrl } from '@/lib/api';
import { HeroSlide, ShowcaseSlide, HomeSectionContent } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Eye,
  Layers,
  Save,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function AdminHomepageManagementPage() {
  const { toast, confirm } = useUI();
  const [activeTab, setActiveTab] = useState<'hero' | 'showcase'>('hero');
  const [loading, setLoading] = useState(true);

  // Hero Slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  // Who We Are & Showcase
  const [showcaseSection, setShowcaseSection] = useState<HomeSectionContent>({
    tag_en: 'WHO WE ARE',
    tag_id: 'TENTANG KAMI',
    title_en: 'Dedicated to Advancing Food Quality & Lab Solutions',
    title_id: 'Berdedikasi Memajukan Kualitas Pangan & Solusi Laboratorium',
    description_en: 'PT Askara Tekno Pangan is an innovative provider of laboratory instruments, solutions, and services for food quality testing and research.',
    description_id: 'PT Askara Tekno Pangan adalah penyedia instrumen, solusi, dan layanan laboratorium inovatif untuk pengujian dan riset kualitas pangan.',
    button_text_en: 'Learn More',
    button_text_id: 'Pelajari Selengkapnya',
    button_url: '/about',
  });
  const [showcaseSlides, setShowcaseSlides] = useState<ShowcaseSlide[]>([]);
  const [sectionSaving, setSectionSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [heroData, showcaseData] = await Promise.all([
        api.admin.getAdminHeroSlides(),
        api.admin.getAdminShowcaseData(),
      ]);
      setHeroSlides(heroData || []);
      if (showcaseData?.section) {
        setShowcaseSection(showcaseData.section);
      }
      setShowcaseSlides(showcaseData?.slides || []);
    } catch (err: any) {
      toast(err.message || 'Failed to load homepage data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoveHero = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= heroSlides.length) return;

    const copy = [...heroSlides];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setHeroSlides(copy);

    try {
      const orderedIds = copy.map(s => s.id);
      const updated = await api.admin.reorderHeroSlides(orderedIds);
      setHeroSlides(updated);
      toast(`Hero slide moved ${direction}`, 'success');
    } catch (err: any) {
      toast(err.message || 'Error reordering hero slides', 'error');
      loadData();
    }
  };

  const handleMoveShowcase = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= showcaseSlides.length) return;

    const copy = [...showcaseSlides];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setShowcaseSlides(copy);

    try {
      const orderedIds = copy.map(s => s.id);
      const updated = await api.admin.reorderShowcaseSlides(orderedIds);
      setShowcaseSlides(updated);
      toast(`Showcase slide moved ${direction}`, 'success');
    } catch (err: any) {
      toast(err.message || 'Error reordering showcase slides', 'error');
      loadData();
    }
  };

  const handleDeleteHero = async (slide: HeroSlide) => {
    const ok = await confirm({
      title: 'Delete Hero Slide',
      message: `Are you sure you want to delete slide "${slide.title_id || slide.title_en || slide.id}"?`,
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteHeroSlide(slide.id);
        toast('Hero slide deleted successfully', 'success');
        loadData();
      } catch (err: any) {
        toast(err.message || 'Error deleting hero slide', 'error');
      }
    }
  };

  const handleSaveSectionTexts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSectionSaving(true);
    try {
      const payload = {
        ...showcaseSection,
        tag_en: showcaseSection.tag_en || 'WHO WE ARE',
        tag_id: showcaseSection.tag_id || 'TENTANG KAMI',
        badge_en: showcaseSection.tag_en || 'WHO WE ARE',
        badge_id: showcaseSection.tag_id || 'TENTANG KAMI',
        title_en: showcaseSection.title_en,
        title_id: showcaseSection.title_id,
        description_en: showcaseSection.description_en,
        description_id: showcaseSection.description_id,
        subtitle_en: showcaseSection.description_en,
        subtitle_id: showcaseSection.description_id,
        button_text_en: showcaseSection.button_text_en || 'Learn More',
        button_text_id: showcaseSection.button_text_id || 'Pelajari Selengkapnya',
        button_url: showcaseSection.button_url || '/about',
        cta_text_en: showcaseSection.button_text_en || 'Learn More',
        cta_text_id: showcaseSection.button_text_id || 'Pelajari Selengkapnya',
        cta_link: showcaseSection.button_url || '/about',
      };
      const updated = await api.admin.updateWhoWeAreSection(payload);
      if (updated) {
        setShowcaseSection(updated);
      }
      toast('Who We Are section content saved successfully', 'success');
    } catch (err: any) {
      toast(err.message || 'Error saving section texts', 'error');
    } finally {
      setSectionSaving(false);
    }
  };

  const handleDeleteShowcase = async (slide: ShowcaseSlide) => {
    const ok = await confirm({
      title: 'Delete Showcase Slide',
      message: 'Are you sure you want to delete this showcase slide image?',
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteShowcaseSlide(slide.id);
        toast('Showcase slide deleted successfully', 'success');
        loadData();
      } catch (err: any) {
        toast(err.message || 'Error deleting showcase slide', 'error');
      }
    }
  };

  return (
    <AdminLayout title="Homepage Banners & Sliders">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'hero'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Hero Banner Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'showcase'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Who We Are & Showcase Slider</span>
          </button>
        </div>

        {/* TAB 1: HERO BANNER SLIDES */}
        {activeTab === 'hero' && (
          <div className="space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Hero Banner Slides</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage the main hero banner on the homepage. If 2 or more slides are active, visitors can swipe / drag smoothly or let it transition automatically.
                </p>
              </div>

              <Link
                href="/admin/homepage/hero/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Hero Slide
              </Link>
            </div>

            {/* Slides Grid */}
            {loading ? (
              <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-xs text-slate-400">
                Loading hero slides...
              </div>
            ) : heroSlides.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
                <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No Hero Slides Yet</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click "Add Hero Slide" above to create your first homepage banner slide with custom titles and background image.
                </p>
                <Link
                  href="/admin/homepage/hero/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Add Slide Now
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
                  >
                    {/* Visual Banner Preview */}
                    <div
                      className="relative h-48 w-full bg-slate-900 flex flex-col justify-between p-4 text-white overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.85)), url('${resolveImageUrl(slide.image)}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-extrabold uppercase bg-brand-500 text-white">
                          Slide #{slide.sort_order || idx + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                            slide.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {slide.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="z-10 space-y-1">
                        <h4 className="text-sm sm:text-base font-bold line-clamp-1 text-white">
                          {slide.title_id || slide.title_en || 'Untitled Slide'}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {slide.subtitle_id || slide.subtitle_en || 'No subtitle provided'}
                        </p>
                      </div>
                    </div>

                    {/* Meta info & CTA details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500">ID (Bahasa)</span>
                          <p className="font-semibold text-slate-900 line-clamp-1">{slide.title_id || '—'}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{slide.subtitle_id || '—'}</p>
                        </div>
                        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-500">EN (English)</span>
                          <p className="font-semibold text-slate-900 line-clamp-1">{slide.title_en || '—'}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{slide.subtitle_en || '—'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500 font-medium">Primary CTA:</span>
                        <span className="font-semibold text-brand-600">
                          {slide.primary_btn_text_id || slide.primary_btn_text_en} ({slide.primary_btn_url})
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500 font-medium">
                            Urutan: <strong className="text-slate-900 font-bold">#{slide.sort_order}</strong>
                          </span>
                          <div className="flex items-center gap-0.5 border border-slate-200 rounded-md p-0.5 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => handleMoveHero(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              title="Move Up (Geser Naik)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHero(idx, 'down')}
                              disabled={idx === heroSlides.length - 1}
                              className="p-1 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                              title="Move Down (Geser Turun)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/homepage/hero/detail?id=${slide.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
                          <Link
                            href={`/admin/homepage/hero/edit?id=${slide.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteHero(slide)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                            title="Delete Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WHO WE ARE & SHOWCASE SLIDER */}
        {activeTab === 'showcase' && (
          <div className="space-y-8">
            {/* Section Texts Form */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Who We Are Section Content</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the left-hand text content (tag, heading, description, and link) on the homepage.
                </p>
              </div>

              <form onSubmit={handleSaveSectionTexts} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Section Tag (EN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={showcaseSection.tag_en}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, tag_en: e.target.value })}
                      placeholder="e.g. WHO WE ARE"
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Section Tag (ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={showcaseSection.tag_id}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, tag_id: e.target.value })}
                      placeholder="e.g. TENTANG KAMI"
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Main Heading (EN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={showcaseSection.title_en}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, title_en: e.target.value })}
                      placeholder="e.g. Dedicated to Advancing Food Quality..."
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Main Heading (ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={showcaseSection.title_id}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, title_id: e.target.value })}
                      placeholder="e.g. Berdedikasi Memajukan Kualitas Pangan..."
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description Paragraph (EN) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={showcaseSection.description_en}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, description_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description Paragraph (ID) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={showcaseSection.description_id}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, description_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Button Text (EN)
                    </label>
                    <input
                      type="text"
                      value={showcaseSection.button_text_en}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, button_text_en: e.target.value })}
                      placeholder="Learn More"
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Button Text (ID)
                    </label>
                    <input
                      type="text"
                      value={showcaseSection.button_text_id}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, button_text_id: e.target.value })}
                      placeholder="Pelajari Selengkapnya"
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Button URL
                    </label>
                    <input
                      type="text"
                      value={showcaseSection.button_url}
                      onChange={(e) => setShowcaseSection({ ...showcaseSection, button_url: e.target.value })}
                      placeholder="/about"
                      className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sectionSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    {sectionSaving ? 'Saving Content...' : 'Save Section Content'}
                  </button>
                </div>
              </form>
            </div>

            {/* Showcase Image Slider Manager */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Showcase Frame Images & Slider</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Images displayed in the showcase frame on the right. Visitors can drag/swipe or view smooth automated transitions.
                  </p>
                </div>

                <Link
                  href="/admin/homepage/showcase/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Showcase Slide
                </Link>
              </div>

              {/* Showcase slides list */}
              {loading ? (
                <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-xs text-slate-400">
                  Loading showcase slides...
                </div>
              ) : showcaseSlides.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
                  <p className="text-sm font-bold text-slate-700">No Showcase Slides Yet</p>
                  <p className="text-xs text-slate-500">
                    Add at least one product/instrument photo to display in the showcase box.
                  </p>
                  <Link
                    href="/admin/homepage/showcase/create"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Showcase Image
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {showcaseSlides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="relative h-48 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-4">
                        <img
                          src={resolveImageUrl(slide.image)}
                          alt={slide.title_en || 'Showcase'}
                          className="max-h-40 max-w-full object-contain"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                              slide.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {slide.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {slide.caption_id || slide.caption_en || slide.title_en || 'Showcase Image'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            EN: {slide.caption_en || '—'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">
                              Urutan: <strong className="text-slate-900 font-bold">#{slide.sort_order}</strong>
                            </span>
                            <div className="flex items-center gap-0.5 border border-slate-200 rounded-md p-0.5 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => handleMoveShowcase(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                title="Move Up (Geser Naik)"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveShowcase(idx, 'down')}
                                disabled={idx === showcaseSlides.length - 1}
                                className="p-1 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                title="Move Down (Geser Turun)"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/homepage/showcase/detail?id=${slide.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>
                            <Link
                              href={`/admin/homepage/showcase/edit?id=${slide.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteShowcase(slide)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete Slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
