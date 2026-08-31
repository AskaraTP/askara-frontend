'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api, resolveImageUrl } from '@/lib/api';
import { HeroSlide } from '@/types';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Link as LinkIcon,
} from 'lucide-react';

import { useDynamicId } from '@/hooks/useDynamicRouteParams';

interface HeroSlideDetailPageProps {
  params?: Promise<{
    id: string;
  }>;
}

export default function HeroDetailAdminClient({ params }: HeroSlideDetailPageProps) {
  const slideIdStr = useDynamicId(params);
  const slideId = Number(slideIdStr);
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [slide, setSlide] = useState<HeroSlide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlide() {
      if (!slideId) return;
      try {
        const data = await api.admin.getHeroSlideById(slideId);
        setSlide(data);
      } catch (err: any) {
        toast(err.message || 'Failed to load hero slide details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSlide();
  }, [slideId]);

  const handleDelete = async () => {
    if (!slide) return;
    const ok = await confirm({
      title: 'Delete Hero Slide',
      message: `Are you sure you want to permanently delete slide #${slide.sort_order} ("${slide.title_id || slide.title_en || slide.id}")?`,
      confirmText: 'Delete Slide',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteHeroSlide(slide.id);
        toast('Hero slide deleted successfully', 'success');
        router.push('/admin/homepage');
      } catch (err: any) {
        toast(err.message || 'Error deleting hero slide', 'error');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Hero Slide Details">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading hero slide details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!slide) {
    return (
      <AdminLayout title="Hero Slide Not Found">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4">
          <SlidersHorizontal className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="text-sm font-bold text-slate-900">Slide Not Found</h2>
          <p className="text-xs text-slate-500">The hero slide with ID #{slideId} does not exist or has been removed.</p>
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage Banners
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Hero Slide #${slide.sort_order} Details`}>
      <div className="space-y-5">
        {/* Navigation & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/homepage"
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to List"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  {slide.title_id || slide.title_en || `Hero Slide #${slide.id}`}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    slide.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {slide.is_active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active on Live
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hero banner slider sequence #{slide.sort_order} &bull; Internal ID: {slide.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href={`/admin/homepage/hero/${slide.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Slide
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Visual Live Preview Box */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Visual Banner Preview</h2>
              <p className="text-xs text-slate-500">
                This shows exactly how the background image and text layers render together on the public homepage.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
              Sequence #{slide.sort_order}
            </span>
          </div>

          <div
            className="relative h-64 sm:h-72 w-full rounded-lg bg-slate-900 border border-slate-200 flex flex-col justify-between p-5 sm:p-6 text-white overflow-hidden shadow-inner"
            style={{
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.88)), url('${resolveImageUrl(slide.image)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center justify-between z-10">
              <span className="px-2.5 py-1 rounded text-[11px] font-extrabold uppercase bg-brand-500 text-white shadow-xs">
                Slide Preview #{slide.sort_order}
              </span>
              <span
                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                  slide.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {slide.is_active ? 'Visible on Homepage' : 'Draft / Hidden'}
              </span>
            </div>

            <div className="z-10 space-y-2.5 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white line-clamp-2">
                {slide.title_id || slide.title_en || 'Untitled Headline'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed">
                {slide.subtitle_id || slide.subtitle_en || 'No subtitle provided.'}
              </p>

              {/* Action Buttons in Preview */}
              <div className="flex flex-wrap gap-2.5 pt-1.5">
                {(slide.primary_btn_text_id || slide.primary_btn_text_en) && (
                  <span className="px-3.5 py-1.5 rounded-md bg-brand-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                    {slide.primary_btn_text_id || slide.primary_btn_text_en}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
                {(slide.secondary_btn_text_id || slide.secondary_btn_text_en) && (
                  <span className="px-3.5 py-1.5 rounded-md bg-white/15 backdrop-blur-xs border border-white/30 text-white text-xs font-bold inline-flex items-center gap-1.5">
                    {slide.secondary_btn_text_id || slide.secondary_btn_text_en}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bilingual Content Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Indonesian Content Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-base">🇮🇩</span>
              <h3 className="text-sm font-bold text-slate-900">Indonesian Content (Bahasa)</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Headline Title (ID)
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {slide.title_id || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subtitle Description (ID)
                </label>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 leading-relaxed min-h-[64px]">
                  {slide.subtitle_id || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary CTA Label</label>
                  <p className="font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-200/80">
                    {slide.primary_btn_text_id || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Secondary CTA Label</label>
                  <p className="font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-200/80">
                    {slide.secondary_btn_text_id || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* English Content Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-base">🇬🇧</span>
              <h3 className="text-sm font-bold text-slate-900">English Content</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Headline Title (EN)
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {slide.title_en || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subtitle Description (EN)
                </label>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 leading-relaxed min-h-[64px]">
                  {slide.subtitle_en || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary CTA Label</label>
                  <p className="font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-200/80">
                    {slide.primary_btn_text_en || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Secondary CTA Label</label>
                  <p className="font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-200/80">
                    {slide.secondary_btn_text_en || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Links Destination */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Destination Links & Action Buttons</h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Primary Button Target URL</span>
                <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-700 text-[10px] font-bold">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <code className="text-brand-600 font-mono font-semibold truncate">
                  {slide.primary_btn_url || '/'}
                </code>
              </div>
              <p className="text-[11px] text-slate-500">
                Label ID: &quot;{slide.primary_btn_text_id}&quot; &bull; EN: &quot;{slide.primary_btn_text_en}&quot;
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Secondary Button Target URL</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <code className="text-slate-700 font-mono font-semibold truncate">
                  {slide.secondary_btn_url || '/contact'}
                </code>
              </div>
              <p className="text-[11px] text-slate-500">
                Label ID: &quot;{slide.secondary_btn_text_id}&quot; &bull; EN: &quot;{slide.secondary_btn_text_en}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Media & System Information */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Banner Asset & System Metadata</h3>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Image Asset Source</span>
              <p className="font-mono text-slate-700 truncate">{slide.image || 'Default asset'}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Display Order</span>
              <p className="font-bold text-slate-900">Sequence #{slide.sort_order}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Slider Status</span>
              <p className={`font-bold ${slide.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                {slide.is_active ? 'Active & Published' : 'Draft / Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
