'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api, resolveImageUrl } from '@/lib/api';
import { ShowcaseSlide } from '@/types';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Layers,
} from 'lucide-react';

import { useDynamicId } from '@/hooks/useDynamicRouteParams';

interface ShowcaseSlideDetailPageProps {
  params?: Promise<{
    id: string;
  }>;
}

export default function ShowcaseDetailAdminClient({ params }: ShowcaseSlideDetailPageProps) {
  const slideIdStr = useDynamicId(params);
  const slideId = Number(slideIdStr);
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [slide, setSlide] = useState<ShowcaseSlide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlide() {
      if (!slideId) return;
      try {
        const data = await api.admin.getShowcaseSlideById(slideId);
        setSlide(data);
      } catch (err: any) {
        toast(err.message || 'Failed to load showcase slide details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSlide();
  }, [slideId]);

  const handleDelete = async () => {
    if (!slide) return;
    const ok = await confirm({
      title: 'Delete Showcase Slide',
      message: `Are you sure you want to delete showcase slide #${slide.sort_order} ("${slide.caption_id || slide.caption_en || slide.id}")?`,
      confirmText: 'Delete Slide',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteShowcaseSlide(slide.id);
        toast('Showcase slide deleted successfully', 'success');
        router.push('/admin/homepage');
      } catch (err: any) {
        toast(err.message || 'Error deleting showcase slide', 'error');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Showcase Slide Details">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading showcase slide details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!slide) {
    return (
      <AdminLayout title="Showcase Slide Not Found">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4">
          <Layers className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="text-sm font-bold text-slate-900">Showcase Slide Not Found</h2>
          <p className="text-xs text-slate-500">The showcase slide with ID #{slideId} does not exist or has been removed.</p>
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage Management
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Showcase Slide #${slide.sort_order} Details`}>
      <div className="space-y-5">
        {/* Navigation & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/homepage"
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Homepage Management"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  {slide.caption_id || slide.caption_en || slide.title_en || `Showcase Slide #${slide.id}`}
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
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active in Showcase
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Who We Are & Showcase sequence #{slide.sort_order} &bull; Internal ID: {slide.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href={`/admin/homepage/showcase/${slide.id}/edit`}
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

        {/* Visual Frame Image Preview */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Showcase Image Frame Preview</h2>
              <p className="text-xs text-slate-500">
                Mirrors the presentation style in the right-hand column of the homepage &quot;Who We Are&quot; section.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
              Sequence #{slide.sort_order}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="relative max-w-sm w-full bg-white rounded-xl shadow-md border border-slate-200/80 p-5 flex flex-col items-center">
              <div className="w-full h-52 flex items-center justify-center overflow-hidden">
                <img
                  src={resolveImageUrl(slide.image)}
                  alt={slide.caption_en || slide.caption_id || 'Showcase'}
                  className="max-h-48 max-w-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Caption Overlay under frame */}
              {(slide.caption_id || slide.caption_en) && (
                <div className="mt-4 pt-3 border-t border-slate-100 w-full text-center">
                  <p className="text-xs font-bold text-slate-900 line-clamp-2">
                    {slide.caption_id || slide.caption_en}
                  </p>
                  {slide.caption_en && slide.caption_id && (
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">
                      EN: {slide.caption_en}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bilingual Captions Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Indonesian Content */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-base">🇮🇩</span>
              <h3 className="text-sm font-bold text-slate-900">Indonesian Captions & Text</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Title / Name (ID)
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {slide.title_id || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Bottom Caption (ID)
                </label>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 leading-relaxed min-h-[52px]">
                  {slide.caption_id || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>
            </div>
          </div>

          {/* English Content */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-base">🇬🇧</span>
              <h3 className="text-sm font-bold text-slate-900">English Captions & Text</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Title / Name (EN)
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {slide.title_en || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Bottom Caption (EN)
                </label>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 leading-relaxed min-h-[52px]">
                  {slide.caption_en || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Media & System Information */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Slide Asset & System Details</h3>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Image Asset Path</span>
              <p className="font-mono text-slate-700 truncate">{slide.image || 'Default asset'}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Display Order</span>
              <p className="font-bold text-slate-900">Sequence #{slide.sort_order}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Showcase Status</span>
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
