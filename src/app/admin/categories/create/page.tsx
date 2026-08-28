'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import FormField from '@/components/admin/FormField';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { validateCategory, generateSlug } from '@/lib/validation';
import { formatErrorMessage } from '@/lib/errorHandler';
import { Layers } from 'lucide-react';

export default function CreateCategoryPage() {
  const router = useRouter();
  const { toast } = useUI();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name_en: '',
    name_id: '',
    slug: '',
    description_en: '',
    description_id: '',
    image: '/images/y15.png',
    is_active: true,
    sort_order: 1,
  });

  const handleAutoSlug = () => {
    if (formData.name_en) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name_en) }));
      if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Centralized validation check
    const validation = validateCategory(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast('Please review the form errors before submitting.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name_en),
        name_id: formData.name_id || formData.name_en,
        sort_order: Number(formData.sort_order) || 0,
      };

      await api.admin.createCategory(payload);
      toast('Category created successfully', 'success');
      router.push('/admin/categories');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to create category'), 'error');
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Create Category">
      <form onSubmit={handleSubmit} className="space-y-6 pb-16">
        {/* Top Header Toolbar */}
        <AdminPageHeader
          backHref="/admin/categories"
          backTitle="Back to Categories"
          title="Add New Category"
          subtitle="Create a catalog taxonomy category for instruments and diagnostic reagents"
          saving={saving}
          saveLabel="Create Category"
          savingLabel="Creating..."
        />

        {/* 1. Basic Taxonomy Information */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-brand-50 text-brand-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Category Information</h2>
              <p className="text-xs text-slate-500">Bilingual names, URL slug, and sorting sequence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField label="Category Name (English)" required error={errors.name_en}>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => {
                  setFormData({ ...formData, name_en: e.target.value });
                  if (errors.name_en) setErrors({ ...errors, name_en: '' });
                }}
                placeholder="e.g. Food Quality Analysis"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              />
            </FormField>

            <FormField label="Category Name (Indonesian)" error={errors.name_id}>
              <input
                type="text"
                value={formData.name_id}
                onChange={(e) => {
                  setFormData({ ...formData, name_id: e.target.value });
                  if (errors.name_id) setErrors({ ...errors, name_id: '' });
                }}
                placeholder="e.g. Analisis Kualitas Pangan"
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="URL Slug"
              error={errors.slug}
              helperText="Unique identifier for URLs"
            >
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    if (errors.slug) setErrors({ ...errors, slug: '' });
                  }}
                  placeholder="food-quality-analysis"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors"
                  title="Generate from English title"
                >
                  Auto
                </button>
              </div>
            </FormField>

            <FormField label="Sort Order" error={errors.sort_order} helperText="Position in lists">
              <input
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </FormField>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-2 p-3.5 rounded-md bg-slate-50 border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
              />
              <span>Active Category (Visible in catalog & filters)</span>
            </label>
          </div>
        </div>

        {/* 2. Bilingual Descriptions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Descriptions
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField label="Description (English)">
              <textarea
                rows={3}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Diagnostic instruments and testing kits dedicated for food safety..."
                className="w-full px-3.5 py-2 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </FormField>

            <FormField label="Description (Indonesian)">
              <textarea
                rows={3}
                value={formData.description_id}
                onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                placeholder="Instrumen diagnostik dan kit uji khusus keamanan pangan..."
                className="w-full px-3.5 py-2 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </FormField>
          </div>
        </div>

        {/* 3. Category Image Asset */}
        <AdminImageUpload
          label="Category Header / Icon Asset"
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
        />
      </form>
    </AdminLayout>
  );
}
