'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { validateProduct } from '@/lib/validation';
import { formatErrorMessage } from '@/lib/errorHandler';
import { ProductCategory } from '@/types';
import {
  ArrowLeft,
  Save,
  UploadCloud,
  X,
  Image as ImageIcon,
  Plus,
  Trash2,
  Package,
  FileText,
  Sliders,
  Info,
} from 'lucide-react';

interface SpecRow {
  key: string;
  value: string;
}

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);
  const router = useRouter();
  const { toast } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name_en: '',
    name_id: '',
    slug: '',
    product_category_id: '',
    principal: '',
    short_description_en: '',
    short_description_id: '',
    description_en: '',
    description_id: '',
    image: '',
    brochure: '',
    is_active: true,
    is_featured: false,
    sort_order: 0,
  });

  const [specRows, setSpecRows] = useState<SpecRow[]>([]);
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [applicationsList, setApplicationsList] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prod] = await Promise.all([
          api.admin.getAdminCategories(),
          api.admin.getProductById(productId),
        ]);
        setCategories(cats);

        if (prod) {
          setFormData({
            name_en: prod.name_en || '',
            name_id: prod.name_id || '',
            slug: prod.slug || '',
            product_category_id: prod.product_category_id?.toString() || '',
            principal: prod.principal || '',
            short_description_en: prod.short_description_en || '',
            short_description_id: prod.short_description_id || '',
            description_en: prod.description_en || '',
            description_id: prod.description_id || '',
            image: prod.image || '',
            brochure: prod.brochure || '',
            is_active: prod.is_active,
            is_featured: prod.is_featured,
            sort_order: prod.sort_order || 0,
          });

          // Parse specifications
          if (prod.specifications) {
            const parsed = prod.specifications
              .split(/\r\n|\r|\n/)
              .filter((l) => l.trim().length > 0)
              .map((line) => {
                const parts = line.split('|');
                return {
                  key: parts[0]?.trim() || '',
                  value: parts.slice(1).join('|')?.trim() || '',
                };
              });
            setSpecRows(parsed);
          } else {
            setSpecRows([]);
          }

          // Parse features
          if (prod.features_en) {
            setFeaturesList(
              prod.features_en.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0)
            );
          } else {
            setFeaturesList([]);
          }

          // Parse applications
          if (prod.applications_en) {
            setApplicationsList(
              prod.applications_en.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0)
            );
          } else {
            setApplicationsList([]);
          }
        }
      } catch (err: any) {
        toast(err.message || 'Failed to load product data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId, toast]);

  const generateSlug = () => {
    const slugified = formData.name_en
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, slug: slugified }));
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await api.admin.uploadImage(file);
      if (result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        toast('Image updated successfully', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateProduct(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast(firstError || 'Please fill in all required product fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Serialize specs to Key | Value format
      const serializedSpecs = specRows
        .filter((r) => r.key.trim().length > 0)
        .map((r) => `${r.key.trim()} | ${r.value.trim()}`)
        .join('\n');

      const serializedFeatures = featuresList.filter((f) => f.trim().length > 0).join('\n');
      const serializedApps = applicationsList.filter((a) => a.trim().length > 0).join('\n');

      const payload = {
        ...formData,
        product_category_id: formData.product_category_id ? Number(formData.product_category_id) : null,
        name_id: formData.name_id || formData.name_en,
        slug: formData.slug || formData.name_en.toLowerCase().replace(/\s+/g, '-'),
        specifications: serializedSpecs,
        features_en: serializedFeatures,
        features_id: serializedFeatures,
        applications_en: serializedApps,
        applications_id: serializedApps,
        sort_order: Number(formData.sort_order),
      };

      await api.admin.updateProduct(productId, payload);
      toast('Product updated successfully', 'success');
      router.push('/admin/products');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Error updating product'), 'error');
      setSaving(false);
    }
  };

  const presetImages = [
    { label: 'BioSystems Y15', path: '/images/y15.png' },
    { label: 'Y15 New Series', path: '/images/Y15 New.png' },
    { label: 'Gluten Test Kit', path: '/images/gluten.png' },
    { label: 'Histamine Strip', path: '/images/histamine.png' },
    { label: 'RO Water Header', path: '/images/header.png' },
  ];

  if (loading) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex items-center justify-center py-20">
          <Spinner size="md" label="Loading product editor..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Product: ${formData.name_en || 'Product'}`}>
      <form onSubmit={handleSubmit} className="space-y-6 pb-16">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 sticky top-4 z-20">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Products"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {formData.name_en || 'Edit Product'}
              </h1>
              <p className="text-xs text-slate-500">ID #{productId} • Update product data</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* 1. Basic Product Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-brand-50 text-brand-600">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Basic Information</h2>
              <p className="text-xs text-slate-500">Names, category, principal brand, and status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name (Indonesian)
              </label>
              <input
                type="text"
                value={formData.name_id}
                onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL Slug *
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors"
                  title="Generate from EN title"
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                required
                value={formData.product_category_id}
                onChange={(e) => setFormData({ ...formData, product_category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none bg-white font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name_en} ({cat.name_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Principal / Manufacturer
              </label>
              <input
                type="text"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-5 p-3.5 rounded-md bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
              />
              <span>Active Product (Public)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-800">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Featured Product</span>
            </label>
          </div>
        </div>

        {/* 2. Product Descriptions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Descriptions & Highlights</h2>
              <p className="text-xs text-slate-500">Short summary and full detailed product overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Short Description (EN)
              </label>
              <textarea
                rows={3}
                value={formData.short_description_en}
                onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Short Description (ID)
              </label>
              <textarea
                rows={3}
                value={formData.short_description_id}
                onChange={(e) => setFormData({ ...formData, short_description_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Overview (EN)
              </label>
              <textarea
                rows={5}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Overview (ID)
              </label>
              <textarea
                rows={5}
                value={formData.description_id}
                onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Specifications & Features */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-indigo-50 text-indigo-600">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Technical Specifications</h2>
                <p className="text-xs text-slate-500">Key-value pair specs table for product detail page</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSpecRows([...specRows, { key: '', value: '' }])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Spec Row
            </button>
          </div>

          {/* Dynamic Spec Rows */}
          <div className="space-y-2.5">
            {specRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Specification Name"
                  value={row.key}
                  onChange={(e) => {
                    const next = [...specRows];
                    next[idx].key = e.target.value;
                    setSpecRows(next);
                  }}
                  className="w-1/3 px-3 py-2 rounded-md border border-slate-200 text-xs font-semibold focus:border-brand-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Specification Value"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...specRows];
                    next[idx].value = e.target.value;
                    setSpecRows(next);
                  }}
                  className="flex-1 px-3 py-2 rounded-md border border-slate-200 text-xs font-medium focus:border-brand-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSpecRows(specRows.filter((_, i) => i !== idx))}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                  title="Remove row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Product Media & Brochure */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Product Media & Brochure</h2>
              <p className="text-xs text-slate-500">Update product transparent image and brochure link</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Image Uploader & Preview */}
            <div className="lg:col-span-7 p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Product Image (Transparent Asset)
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  <Info className="w-3 h-3 text-brand-600" />
                  Rasio Ideal: 4:3 atau 16:10 (e.g. 800x600px atau 1200x750px)
                </span>
              </div>

              <div className="flex items-start gap-2 px-3 py-2 rounded bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tips Produk:</span> Gunakan format <strong>PNG transparan</strong> atau foto studio berasio <strong>4:3 atau 16:10 (e.g. 800x600px atau 1200x750px)</strong> agar gambar tampil pas & tajam di kartu katalog depan.
                </div>
              </div>

              <div className="h-36 rounded-md bg-white border-2 border-dashed border-slate-200 flex items-center justify-center p-3 relative overflow-hidden">
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt="Product Preview"
                      className="max-h-28 max-w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors shadow-sm"
                      title="Remove Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                    <p className="text-xs">No Product Image</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-md border border-slate-200 hover:border-brand-300 bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-brand-500" />
                  {uploadingImage ? 'Uploading image...' : 'Upload Image from Computer'}
                </button>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Preset Images:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {presetImages.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.path })}
                        className={`px-2 py-1 rounded-sm text-[11px] font-semibold border transition-colors ${
                          formData.image === preset.path
                            ? 'bg-brand-50 border-brand-400 text-brand-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brochure URL */}
            <div className="lg:col-span-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PDF Brochure Download URL
                </label>
                <input
                  type="text"
                  value={formData.brochure}
                  onChange={(e) => setFormData({ ...formData, brochure: e.target.value })}
                  placeholder="e.g. /brochures/y15-catalog.pdf"
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
