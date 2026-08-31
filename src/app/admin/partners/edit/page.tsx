'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner';
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

function PartnerEditForm() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('id') || '';
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

  const [manualUrl, setManualUrl] = useState('');
  const [manualCaptionId, setManualCaptionId] = useState('');
  const [manualCaptionEn, setManualCaptionEn] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      if (!partnerId) {
        setLoading(false);
        return;
      }
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
  }, [partnerId, toast]);

  const handleDelete = async () => {
    if (!partnerId) return;
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
      router.push(`/admin/partners/detail?id=${updated.id}`);
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
    <AdminLayout title={`Edit Principal: ${formData.name || partnerId}`}>
      <form onSubmit={handleSubmit} className="space-y-5 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/partners/detail?id=${partnerId}`}
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
              href={`/admin/partners/detail?id=${partnerId}`}
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
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">1. Basic Principal Information</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Principal Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. BioSystems S.A."
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. biosystems"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-mono focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country / Origin *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. Barcelona, Spain"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Food & Beverage Diagnostics"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
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
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">2. Principal Logo & Visual Asset</h2>

          <div className="grid md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Logo Preview</span>
              <div className="h-28 rounded-md bg-white border border-slate-200 flex items-center justify-center p-3 relative overflow-hidden">
                {formData.logo ? (
                  <>
                    <img
                      src={resolveImageUrl(formData.logo)}
                      alt="Logo Preview"
                      className="max-h-20 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: '' })}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors"
                      title="Clear Logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <span className="text-[11px]">No logo configured</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logo Image URL or Local Path
                </label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="/images/logo.png or Supabase storage URL"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-mono focus:border-brand-500 outline-none"
                />
              </div>

              <div>
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
                  className="w-full py-2 px-3 rounded-md border border-slate-200 hover:border-brand-300 bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-brand-500" />
                  {uploadingLogo ? 'Uploading logo...' : 'Upload Logo from Computer'}
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Quick Logo Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {logoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: preset.path })}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                        formData.logo === preset.path
                          ? 'bg-brand-50 border-brand-300 text-brand-700'
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

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">3. Bilingual Partnership Description</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (Indonesian) *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description_id}
                onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                placeholder="Profil prinsipal dan peran kemitraan dalam bahasa Indonesia..."
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (English) *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Principal profile and partnership scope in English..."
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">4. Partnership Documentation & Activity Gallery</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload real photos of installations, training, workshops, and distributor events.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded">
              {galleryItems.length} Photo(s)
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
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
              className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-brand-300 hover:border-brand-500 bg-white text-brand-600 hover:bg-brand-50/50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <UploadCloud className="w-5 h-5 text-brand-500" />
              <span>
                {uploadingGallery ? 'Uploading gallery photos...' : '+ Upload Multiple Photos to Gallery from Device'}
              </span>
            </button>
          </div>

          {galleryItems.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {galleryItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col justify-between shadow-2xs"
                >
                  <div className="h-36 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={resolveImageUrl(item.url)}
                      alt={item.caption_en || 'Gallery photo'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3 space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Caption (ID)</label>
                      <input
                        type="text"
                        value={item.caption_id || ''}
                        onChange={(e) => updateGalleryItemField(idx, 'caption_id', e.target.value)}
                        placeholder="e.g. Instalasi Unit BioSystems Y15"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs bg-white focus:border-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Caption (EN)</label>
                      <input
                        type="text"
                        value={item.caption_en || ''}
                        onChange={(e) => updateGalleryItemField(idx, 'caption_en', e.target.value)}
                        placeholder="e.g. BioSystems Y15 Installation"
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs bg-white focus:border-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Event Date</label>
                      <input
                        type="date"
                        value={item.date || ''}
                        onChange={(e) => updateGalleryItemField(idx, 'date', e.target.value)}
                        className="w-full px-2 py-1 rounded border border-slate-200 text-xs bg-white focus:border-brand-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">5. Display & Sorting Sequence</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Order Sequence (1, 2, 3...)
              </label>
              <input
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs font-medium text-slate-700">Active & Published on Public Site</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/admin/partners/detail?id=${partnerId}`}
            className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default function PartnerEditPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout title="Edit Principal">
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" label="Loading..." />
          </div>
        </AdminLayout>
      }
    >
      <PartnerEditForm />
    </Suspense>
  );
}
