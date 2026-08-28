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

interface EditHeroSlidePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditHeroSlidePage({ params }: EditHeroSlidePageProps) {
  const resolvedParams = use(params);
  const slideId = Number(resolvedParams.id);
  const router = useRouter();
  const { toast, confirm } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    subtitle_id: '',
    subtitle_en: '',
    image: '',
    primary_btn_text_id: 'Jelajahi Solusi',
    primary_btn_text_en: 'Explore Solutions',
    primary_btn_url: '/products',
    secondary_btn_text_id: 'Hubungi Kami',
    secondary_btn_text_en: 'Contact Us',
    secondary_btn_url: '/contact',
    sort_order: 1,
    is_active: true,
  });

  const imagePresets = [
    { label: 'Header Banner', path: '/images/header.png' },
    { label: 'BioSystems Y15', path: '/images/y15.png' },
    { label: 'Gluten Test Kit', path: '/images/gluten.png' },
    { label: 'Histamine Kit', path: '/images/histamine.png' },
    { label: 'Askara Logo', path: '/images/logo.png' },
  ];

  useEffect(() => {
    async function loadSlide() {
      if (!slideId) return;
      try {
        const slide = await api.admin.getHeroSlideById(slideId);
        if (slide) {
          setFormData({
            title_id: slide.title_id || '',
            title_en: slide.title_en || '',
            subtitle_id: slide.subtitle_id || '',
            subtitle_en: slide.subtitle_en || '',
            image: slide.image || '',
            primary_btn_text_id: slide.primary_btn_text_id || 'Jelajahi Solusi',
            primary_btn_text_en: slide.primary_btn_text_en || 'Explore Solutions',
            primary_btn_url: slide.primary_btn_url || '/products',
            secondary_btn_text_id: slide.secondary_btn_text_id || 'Hubungi Kami',
            secondary_btn_text_en: slide.secondary_btn_text_en || 'Contact Us',
            secondary_btn_url: slide.secondary_btn_url || '/contact',
            sort_order: slide.sort_order || 1,
            is_active: slide.is_active,
          });
        }
      } catch (err: any) {
        toast(err.message || 'Failed to load slide', 'error');
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
        toast('Banner image uploaded successfully', 'success');
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
      toast('Please upload or choose a banner background image', 'warning');
      return;
    }

    setSaving(true);
    try {
      await api.admin.updateHeroSlide(slideId, {
        ...formData,
        sort_order: Number(formData.sort_order),
      });
      toast('Hero banner slide updated successfully', 'success');
      router.push(`/admin/homepage/hero/${slideId}`);
    } catch (err: any) {
      toast(err.message || 'Failed to update hero slide', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Hero Slide',
      message: 'Are you sure you want to delete this hero banner slide?',
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteHeroSlide(slideId);
        toast('Hero slide deleted successfully', 'success');
        router.push('/admin/homepage');
      } catch (err: any) {
        toast(err.message || 'Error deleting hero slide', 'error');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Hero Slide">
        <div className="py-16 text-center text-xs text-slate-400">
          Loading slide data...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Hero Slide #${slideId}`}>
      <div className="space-y-5">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/homepage/hero/${slideId}`}
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Slide Details"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900">Edit Hero Slide #{slideId}</h1>
              <p className="text-xs text-slate-500">Update slide headlines, background image, and links</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Slide
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Background Image Upload & Preview */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">1. Hero Background Image</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Change or replace the background image for this slide.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded">
                <Info className="w-3.5 h-3.5 text-brand-600" />
                Rasio Ideal: 16:9 / Ultrawide (e.g. 1920x1080px)
              </span>
            </div>

            <div className="flex items-start gap-2 px-3 py-2 rounded bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Tips Hero Banner:</span> Gunakan gambar lanskap beresolusi tinggi (minimal <strong>1920x1080px</strong>) agar tajam di desktop dan mobile. Background otomatis diberi overlay gelap agar teks selalu terbaca.
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-5 items-center">
              {/* Visual Banner Preview */}
              <div className="md:col-span-6">
                <div
                  className="relative h-48 w-full rounded-lg bg-slate-900 border border-slate-200 flex flex-col justify-between p-4 text-white overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.85)), url('${resolveImageUrl(formData.image)}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-extrabold uppercase bg-brand-500 text-white">
                      Live Preview
                    </span>
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="z-10 space-y-1">
                    <h4 className="text-sm font-bold line-clamp-1 text-white">
                      {formData.title_id || formData.title_en || 'Your Title Here'}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {formData.subtitle_id || formData.subtitle_en || 'Your subtitle description here.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Controls & Presets */}
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
                  {uploading ? 'Uploading Image...' : 'Upload New Banner Image'}
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

          {/* Section 2: Bilingual Titles & Subtitles */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">2. Slide Headlines & Subtitles</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide bilingual headline titles and descriptions for visitors.
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
                    Headline Title (ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_id}
                    onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                    placeholder="Mewujudkan Kualitas dan Kepercayaan..."
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle Description (ID)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.subtitle_id}
                    onChange={(e) => setFormData({ ...formData, subtitle_id: e.target.value })}
                    placeholder="Mitra terpercaya Anda untuk solusi analisis kualitas pangan..."
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
                    Headline Title (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Delivering Quality and Trust in Every Test Result..."
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle Description (EN)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    placeholder="Your trusted partner for food quality analysis solutions..."
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: CTA Buttons */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">3. Call to Action Buttons</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure the primary and secondary action buttons on this slide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Primary Button */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900">Primary Button (Highlighted)</span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Label (ID)</label>
                  <input
                    type="text"
                    value={formData.primary_btn_text_id}
                    onChange={(e) => setFormData({ ...formData, primary_btn_text_id: e.target.value })}
                    placeholder="Jelajahi Solusi"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Label (EN)</label>
                  <input
                    type="text"
                    value={formData.primary_btn_text_en}
                    onChange={(e) => setFormData({ ...formData, primary_btn_text_en: e.target.value })}
                    placeholder="Explore Solutions"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target URL</label>
                  <input
                    type="text"
                    value={formData.primary_btn_url}
                    onChange={(e) => setFormData({ ...formData, primary_btn_url: e.target.value })}
                    placeholder="/products"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Secondary Button */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900">Secondary Button (Outlined)</span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Label (ID)</label>
                  <input
                    type="text"
                    value={formData.secondary_btn_text_id}
                    onChange={(e) => setFormData({ ...formData, secondary_btn_text_id: e.target.value })}
                    placeholder="Hubungi Kami"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Label (EN)</label>
                  <input
                    type="text"
                    value={formData.secondary_btn_text_en}
                    onChange={(e) => setFormData({ ...formData, secondary_btn_text_en: e.target.value })}
                    placeholder="Contact Us"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target URL</label>
                  <input
                    type="text"
                    value={formData.secondary_btn_url}
                    onChange={(e) => setFormData({ ...formData, secondary_btn_url: e.target.value })}
                    placeholder="/contact"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Ordering & Status */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-48">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sort Order (Sequence)
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
              <span>Active on Homepage Slider</span>
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
      </div>
    </AdminLayout>
  );
}
