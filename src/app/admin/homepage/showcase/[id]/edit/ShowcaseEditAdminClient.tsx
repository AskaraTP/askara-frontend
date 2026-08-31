'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api, resolveImageUrl } from '@/lib/api';
import {
  ArrowLeft,
  UploadCloud,
  Save,
  X,
  Trash2,
  Info,
} from 'lucide-react';

import { useDynamicId } from '@/hooks/useDynamicRouteParams';

interface EditShowcaseSlideClientProps {
  params?: Promise<{
    id: string;
  }>;
}

export default function ShowcaseEditAdminClient({ params }: EditShowcaseSlideClientProps) {
  const slideIdStr = useDynamicId(params);
  const slideId = Number(slideIdStr);
  const router = useRouter();
  const { toast, confirm } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    image: '',
    title_id: '',
    title_en: '',
    caption_id: '',
    caption_en: '',
    sort_order: 1,
    is_active: true,
  });

  const imagePresets = [
    { label: 'BioSystems Y15', path: '/images/y15.png' },
    { label: 'Gluten Test Kit', path: '/images/gluten.png' },
    { label: 'Histamine Kit', path: '/images/histamine.png' },
    { label: 'Header Banner', path: '/images/header.png' },
    { label: 'Askara Logo', path: '/images/logo.png' },
  ];

  useEffect(() => {
    async function loadSlide() {
      if (!slideId) return;
      try {
        const slide = await api.admin.getShowcaseSlideById(slideId);
        if (slide) {
          setFormData({
            image: slide.image || '',
            title_id: slide.title_id || '',
            title_en: slide.title_en || '',
            caption_id: slide.caption_id || '',
            caption_en: slide.caption_en || '',
            sort_order: slide.sort_order || 1,
            is_active: slide.is_active,
          });
        }
      } catch (err: any) {
        toast(err.message || 'Failed to load showcase slide', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSlide();
  }, [slideId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.admin.uploadImage(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        toast('Showcase image uploaded successfully', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast('Please upload or choose a showcase image', 'warning');
      return;
    }

    setSaving(true);
    try {
      await api.admin.updateShowcaseSlide(slideId, {
        ...formData,
        sort_order: Number(formData.sort_order),
      });
      toast('Showcase slide updated successfully', 'success');
      router.push(`/admin/homepage/showcase/${slideId}`);
    } catch (err: any) {
      toast(err.message || 'Failed to update showcase slide', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Showcase Slide',
      message: 'Are you sure you want to delete this showcase slide image?',
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteShowcaseSlide(slideId);
        toast('Showcase slide deleted successfully', 'success');
        router.push('/admin/homepage');
      } catch (err: any) {
        toast(err.message || 'Error deleting showcase slide', 'error');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Showcase Slide">
        <div className="py-16 text-center text-xs text-slate-400">
          Loading showcase slide data...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Showcase Slide #${slideId}`}>
      <form onSubmit={handleSubmit} className="space-y-5 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/homepage/showcase/${slideId}`}
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Slide Details"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Edit Showcase Slide #{slideId}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Update showcase image asset and bilingual captions</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href="/admin/homepage"
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Slide
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating Slide...' : 'Save Changes'}
            </button>
          </div>
        </div>
        {/* Section 1: Showcase Image Upload */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">1. Showcase Visual Asset</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload or change the photo for this showcase item.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded">
              <Info className="w-3.5 h-3.5 text-brand-600" />
              Rasio Ideal: 4:3 atau 16:10 (PNG Transparan)
            </span>
          </div>

          <div className="flex items-start gap-2 px-3 py-2 rounded bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Tips Showcase:</span> Gunakan format <strong>PNG transparan</strong> dengan rasio <strong>4:3 atau 16:10</strong> agar alat pas mengisi frame pameran tanpa ruang kosong berlebih.
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-5 items-center">
            {/* Preview Box */}
            <div className="md:col-span-6">
              <div className="h-56 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
                {formData.image ? (
                  <>
                    <img
                      src={resolveImageUrl(formData.image)}
                      alt="Showcase preview"
                      className="max-h-48 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-slate-400">
                    <X className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <p className="text-xs">No image selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="md:col-span-6 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-md border border-slate-200 hover:border-brand-400 bg-slate-50 hover:bg-white text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-brand-500" />
                {uploading ? 'Uploading Image...' : 'Upload New Showcase Image'}
              </button>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Or select quick preset:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {imagePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.path })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        formData.image === preset.path
                          ? 'bg-brand-50 border-brand-400 text-brand-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Titles & Captions */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">2. Captions & Titles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The caption appears underneath the showcase frame during slider transitions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Indonesian Column */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                🇮🇩 Bahasa Indonesia
              </span>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instrument Name / Alt (ID)
                </label>
                <input
                  type="text"
                  value={formData.title_id}
                  onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                  placeholder="Penganalisis Otomatis BioSystems Y15"
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bottom Caption (ID) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.caption_id}
                  onChange={(e) => setFormData({ ...formData, caption_id: e.target.value })}
                  placeholder="Penganalisis Fotometris Otomatis BioSystems Y15"
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            {/* English Column */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                🇬🇧 English
              </span>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instrument Name / Alt (EN)
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="BioSystems Y15 Automatic Analyzer"
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bottom Caption (EN) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.caption_en}
                  onChange={(e) => setFormData({ ...formData, caption_en: e.target.value })}
                  placeholder="BioSystems Y15 Automatic Photometric Analyzer"
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Ordering & Status */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-slate-50 px-4 py-2.5 rounded-md border border-slate-200">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
            />
            <span>Active in Showcase Slider</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/homepage"
            className="px-5 py-2.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating Slide...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
