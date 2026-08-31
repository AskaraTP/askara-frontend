'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api, resolveImageUrl } from '@/lib/api';
import { PartnerGalleryItem } from '@/types';
import {
  ArrowLeft,
  Save,
  Trash2,
  Building2,
  UploadCloud,
  X,
  Plus,
  Calendar,
  Image as ImageIcon,
  Info,
} from 'lucide-react';

const logoPresets = [
  { label: 'Askara Logo', path: '/images/logo.png' },
  { label: 'BioSystems (Y15)', path: '/images/y15.png' },
  { label: 'Gluten Test Kit', path: '/images/gluten.png' },
  { label: 'Histamine Kit', path: '/images/histamine.png' },
];

import { useDynamicId } from '@/hooks/useDynamicRouteParams';

interface EditPartnerClientProps {
  params?: Promise<{
    id: string;
  }>;
}

export default function PartnerEditAdminClient({ params }: EditPartnerClientProps) {
  const partnerId = useDynamicId(params);
  const router = useRouter();
  const { toast, confirm } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    country: '',
    category: '',
    website_url: '',
    description_en: '',
    description_id: '',
    sort_order: 1,
    is_active: true,
  });

  const [galleryItems, setGalleryItems] = useState<PartnerGalleryItem[]>([]);

  // Manual single photo URL addition state
  const [manualUrl, setManualUrl] = useState('');
  const [manualCaptionId, setManualCaptionId] = useState('');
  const [manualCaptionEn, setManualCaptionEn] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      if (!partnerId) return;
      try {
        const partner = await api.admin.getPartnerById(partnerId);
        if (partner) {
          setFormData({
            name: partner.name || '',
            slug: partner.slug || '',
            logo: partner.logo || '',
            country: partner.country || '',
            category: partner.category || '',
            website_url: partner.website_url || '',
            description_en: partner.description_en || '',
            description_id: partner.description_id || '',
            sort_order: partner.sort_order || 1,
            is_active: partner.is_active !== undefined ? partner.is_active : true,
          });
          setGalleryItems(partner.documentation_gallery || []);
        }
      } catch (err: any) {
        toast(err.message || 'Failed to load partner details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [partnerId]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Principal / Partner',
      message: `Are you sure you want to delete principal #${partnerId}?`,
      confirmText: 'Delete Principal',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deletePartner(partnerId);
        toast('Principal deleted successfully', 'success');
        router.push('/admin/partners');
      } catch (err: any) {
        toast(err.message || 'Failed to delete partner', 'error');
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await api.admin.uploadImage(file);
      if (res.url) {
        setFormData((prev) => ({ ...prev, logo: res.url }));
        toast('Logo uploaded successfully', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMultipleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploaded = await api.admin.uploadMultipleImages(files);
      if (uploaded && uploaded.length > 0) {
        const currentDate = new Date().toISOString().split('T')[0];
        const newItems: PartnerGalleryItem[] = uploaded.map((item, idx) => ({
          id: `gal-${Date.now()}-${idx}`,
          url: item.url,
          caption_en: '',
          caption_id: '',
          date: currentDate,
        }));

        setGalleryItems((prev) => [...prev, ...newItems]);
        toast(`Successfully uploaded ${uploaded.length} photo(s) to gallery!`, 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to upload gallery photos', 'error');
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const updateGalleryItemField = (idx: number, field: keyof PartnerGalleryItem, val: string) => {
    setGalleryItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleAddManualPhoto = () => {
    if (!manualUrl.trim()) {
      toast('Please enter a valid image URL or upload photos directly', 'warning');
      return;
    }
    const item: PartnerGalleryItem = {
      id: `gal-${Date.now()}`,
      url: manualUrl.trim(),
      caption_en: manualCaptionEn.trim(),
      caption_id: manualCaptionId.trim() || manualCaptionEn.trim(),
      date: manualDate,
    };
    setGalleryItems((prev) => [...prev, item]);
    setManualUrl('');
    setManualCaptionId('');
    setManualCaptionEn('');
    toast('Photo added to gallery', 'success');
  };

  const removeGalleryItem = (idx: number) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast('Please enter the principal / partner name', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        documentation_gallery: galleryItems,
      };

      const updated = await api.admin.updatePartner(partnerId, payload);
      toast('Principal updated successfully', 'success');
      router.push(`/admin/partners/${updated.id}`);
    } catch (err: any) {
      toast(err.message || 'Failed to update principal', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Principal">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading principal details...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Principal #${partnerId}`}>
      <form onSubmit={handleSubmit} className="space-y-5 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/partners/${partnerId}`}
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Principal Details"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Edit Principal: {formData.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Update principal details, bilingual descriptions, and documentation gallery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href={`/admin/partners/${partnerId}`}
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
              Delete Principal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save & Update Principal'}
            </button>
          </div>
        </div>
        {/* Section 1: Logo & General Information */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">1. Principal Identity & Logo</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload official company logo with original colors and configure company details.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded">
              <Info className="w-3.5 h-3.5 text-brand-600" />
              Rasio Ideal: Horizontal / 3:1 (PNG Transparan)
            </span>
          </div>

          <div className="flex items-start gap-2 px-3 py-2 rounded bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Tips Logo Partner:</span> Gunakan format <strong>PNG dengan latar transparan</strong> atau SVG. Logo horizontal (lebar) akan tampil paling optimal di marquee dan directory card.
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            {/* Logo Preview (Clean, true color, sharp box) */}
            <div className="md:col-span-4">
              <div className="h-44 rounded-xl bg-white border-2 border-slate-200 shadow-xs flex items-center justify-center p-5 relative overflow-hidden group">
                {formData.logo ? (
                  <>
                    <img
                      src={resolveImageUrl(formData.logo)}
                      alt="Logo preview"
                      className="max-h-28 max-w-[90%] object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: '' })}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white shadow-md transition-colors"
                      title="Remove logo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-1.5" />
                    <p className="text-xs font-medium">No logo uploaded</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-1.5 font-medium">
                PNG, SVG, or JPG with transparent/white background
              </p>
            </div>

            {/* Logo Upload & Presets */}
            <div className="md:col-span-8 space-y-3.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-brand-300 hover:border-brand-500 bg-brand-50/50 hover:bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-brand-600" />
                {uploadingLogo ? 'Uploading Logo...' : 'Upload Official Company Logo'}
              </button>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Or select quick preset logo:
                </span>
                <div className="flex flex-wrap gap-2">
                  {logoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: preset.path })}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        formData.logo === preset.path
                          ? 'bg-brand-50 border-brand-400 text-brand-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Name, Slug, Country, Category, Website URL */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Principal / Partner Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. BioSystems"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. biosystems"
                className="w-full px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Origin Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. Spain (Barcelona)"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category / Core Specialization
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Automated Photometric Chemistry & Rapid Test Kits"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://www.biosystems.es"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bilingual Descriptions */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">2. Company Profile & Overview (Bilingual)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provide comprehensive background on the principal and partnership scope.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                🇮🇩 Bahasa Indonesia
              </span>
              <textarea
                rows={4}
                value={formData.description_id}
                onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                placeholder="BioSystems S.A. adalah pengembang dan produsen solusi analitis klinis dan agro-pangan terkemuka..."
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                🇬🇧 English
              </span>
              <textarea
                rows={4}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="BioSystems S.A. is a world-renowned European developer and manufacturer of clinical and agri-food analytical solutions..."
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Multi-Photo Documentation Gallery Manager */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>3. Documentation & Activities Gallery</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {galleryItems.length} photos
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload multiple field photos simultaneously (installations, calibrations, training, workshops).
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span><strong>Rasio Ideal Foto:</strong> 16:9 atau 4:3 (Lanskap) agar foto dokumentasi rapi saat ditampilkan di galeri profil.</span>
              </div>
            </div>

            {/* Upload Multiple Button in Header */}
            <div>
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleGalleryUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingGallery}
                onClick={() => galleryFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                {uploadingGallery ? 'Uploading Photos...' : 'Upload Photos (Select Multiple)'}
              </button>
            </div>
          </div>

          {/* Existing Gallery Grid with Inline Metadata Editor */}
          {galleryItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-brand-300 transition-all space-y-3 relative group shadow-2xs"
                >
                  {/* Thumbnail View */}
                  <div className="h-40 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden">
                    <img
                      src={resolveImageUrl(item.url)}
                      alt={item.caption_en || 'Documentation photo'}
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors"
                      title="Delete photo from gallery"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Inline Captions & Date Editor */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                        Caption (Indonesian)
                      </label>
                      <input
                        type="text"
                        value={item.caption_id || ''}
                        onChange={(e) => updateGalleryItemField(idx, 'caption_id', e.target.value)}
                        placeholder="mis. Kalibrasi Y15 di Lab Klien..."
                        className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                        Caption (English)
                      </label>
                      <input
                        type="text"
                        value={item.caption_en || ''}
                        onChange={(e) => updateGalleryItemField(idx, 'caption_en', e.target.value)}
                        placeholder="e.g. Y15 unit calibration at client lab..."
                        className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span className="text-[10px] font-bold text-slate-500">Date:</span>
                      <input
                        type="date"
                        value={item.date || ''}
                        onChange={(e) => updateGalleryItemField(idx, 'date', e.target.value)}
                        className="px-2 py-1 rounded bg-white border border-slate-200 text-[11px] focus:border-brand-500 outline-none ml-auto"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-3">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
              <div>
                <p className="text-xs font-bold text-slate-700">No Documentation Photos Added Yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click &quot;Upload Photos (Select Multiple)&quot; above to select and upload multiple images at once.
                </p>
              </div>
            </div>
          )}

          {/* Secondary Option: Add photo from URL */}
          <div className="pt-3 border-t border-slate-100">
            <details className="text-xs group">
              <summary className="font-semibold text-slate-700 cursor-pointer hover:text-brand-600 transition-colors flex items-center gap-1.5 select-none">
                <Plus className="w-3.5 h-3.5 text-brand-500" />
                <span>Add photo manually via image URL / path</span>
              </summary>
              <div className="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="Image URL / path (e.g. /images/y15.png)"
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                  <input
                    type="text"
                    value={manualCaptionId}
                    onChange={(e) => setManualCaptionId(e.target.value)}
                    placeholder="Caption ID..."
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                  <input
                    type="text"
                    value={manualCaptionEn}
                    onChange={(e) => setManualCaptionEn(e.target.value)}
                    placeholder="Caption EN..."
                    className="w-full px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Date:</span>
                    <input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddManualPhoto}
                    className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
                  >
                    Add Photo
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Section 4: Sequence & Active Toggle */}
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
            <span>Active in Principals Directory & Website Marquee</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/admin/partners/${partnerId}`}
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
            {saving ? 'Saving Changes...' : 'Save & Update Principal'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
