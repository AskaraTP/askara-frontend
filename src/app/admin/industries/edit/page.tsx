'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { ProductCategory } from '@/types';
import {
  ArrowLeft,
  Save,
  Trash2,
  Factory,
  Utensils,
  Fish,
  FlaskConical,
  Trees,
  Droplets,
  Building,
} from 'lucide-react';

const availableIcons = [
  { name: 'Factory', label: 'Factory / Manufacturing', Icon: Factory },
  { name: 'Utensils', label: 'Food & Beverage', Icon: Utensils },
  { name: 'Fish', label: 'Fisheries / Seafood', Icon: Fish },
  { name: 'FlaskConical', label: 'Lab & Chemistry', Icon: FlaskConical },
  { name: 'Trees', label: 'Environmental', Icon: Trees },
  { name: 'Droplets', label: 'Water & IPAL', Icon: Droplets },
  { name: 'Building', label: 'Commercial / Corp', Icon: Building },
];

function IndustryEditForm() {
  const searchParams = useSearchParams();
  const industryId = searchParams.get('id') || '';
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_id: '',
    description_en: '',
    description_id: '',
    icon: 'Factory',
    tags_en: '',
    tags_id: '',
    target_category_slug: 'instrument',
    show_on_homepage: true,
    sort_order: 1,
    is_active: true,
  });

  const [hasIndustry, setHasIndustry] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!industryId) {
        setLoading(false);
        return;
      }
      try {
        const [industry, cats] = await Promise.all([
          api.admin.getIndustryById(industryId),
          api.getCategories().catch(() => []),
        ]);
        setCategories(cats || []);

        if (industry) {
          setHasIndustry(true);
          setFormData({
            slug: industry.slug || '',
            title_en: industry.title_en || '',
            title_id: industry.title_id || '',
            description_en: industry.description_en || '',
            description_id: industry.description_id || '',
            icon: industry.icon || 'Factory',
            tags_en: Array.isArray(industry.tags_en) ? industry.tags_en.join(', ') : '',
            tags_id: Array.isArray(industry.tags_id) ? industry.tags_id.join(', ') : '',
            target_category_slug: industry.target_category_slug || 'instrument',
            show_on_homepage: industry.show_on_homepage !== undefined ? industry.show_on_homepage : true,
            sort_order: industry.sort_order || 1,
            is_active: industry.is_active !== undefined ? industry.is_active : true,
          });
        } else {
          setHasIndustry(false);
        }
      } catch (err: any) {
        setHasIndustry(false);
        toast(err.message || 'Failed to load industry data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [industryId, toast]);

  const handleDelete = async () => {
    if (!industryId) return;
    const ok = await confirm({
      title: 'Delete Industry',
      message: `Are you sure you want to delete industry #${industryId}?`,
      confirmText: 'Delete Industry',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteIndustry(industryId);
        toast('Industry deleted successfully', 'success');
        router.push('/admin/industries');
      } catch (err: any) {
        toast(err.message || 'Failed to delete industry', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industryId) {
      toast('Invalid industry ID', 'error');
      return;
    }
    if (!formData.title_id && !formData.title_en) {
      toast('Please enter a sector title', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags_en: formData.tags_en.split(',').map((t) => t.trim()).filter(Boolean),
        tags_id: formData.tags_id.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const updated = await api.admin.updateIndustry(industryId, payload);
      toast('Industry sector updated successfully', 'success');
      router.push(`/admin/industries/detail?id=${updated.id}`);
    } catch (err: any) {
      toast(err.message || 'Failed to update industry sector', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Industry Sector">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading industry details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!hasIndustry) {
    return (
      <AdminLayout title="Industry Not Found">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-8">
          <Factory className="w-10 h-10 mx-auto text-slate-300" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Industry Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">
              The industry sector with ID &quot;{industryId || 'unknown'}&quot; was not found in the database.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/industries"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Industries
            </Link>
            <Link
              href="/admin/industries/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold"
            >
              Create New Industry
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Industry #${industryId}`}>
      <form onSubmit={handleSubmit} className="space-y-5 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/industries/detail?id=${industryId}`}
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Industry Details"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Edit Industry Sector #{industryId}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Update industry details, bilingual descriptions, and homepage settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <Link
              href={`/admin/industries/detail?id=${industryId}`}
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
              Delete Sector
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
          <div>
            <h2 className="text-sm font-bold text-slate-900">1. Sector Icon & Identification</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the visual icon that represents this industry.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Vector Icon *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {availableIcons.map((ic) => {
                const Icon = ic.Icon;
                const isSelected = formData.icon === ic.name;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: ic.name })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 text-brand-600 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-semibold truncate w-full">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug (Unique Identifier) *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. food-beverage"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs font-mono focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Linked Product Category *
              </label>
              <select
                value={formData.target_category_slug}
                onChange={(e) => setFormData({ ...formData, target_category_slug: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none bg-white"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id || cat.slug} value={cat.slug}>
                      {cat.name_en || cat.name_id || cat.slug} ({cat.slug})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="instrument">Analytical Instruments (instrument)</option>
                    <option value="rapid-test">Rapid Test Kits (rapid-test)</option>
                    <option value="microbiology">Microbiology (microbiology)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">2. Bilingual Content</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sector Title (Indonesian) *
              </label>
              <input
                type="text"
                required
                value={formData.title_id}
                onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                placeholder="e.g. Makanan & Minuman"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sector Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="e.g. Food & Beverage"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (Indonesian) *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description_id}
                onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                placeholder="Deskripsi sektor industri dan solusinya..."
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (English) *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Description of the industry sector and solutions..."
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Tags (Indonesian)
              </label>
              <input
                type="text"
                value={formData.tags_id}
                onChange={(e) => setFormData({ ...formData, tags_id: e.target.value })}
                placeholder="e.g. Mutu Pangan, Pengujian Minuman, Keamanan"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Tags (English)
              </label>
              <input
                type="text"
                value={formData.tags_en}
                onChange={(e) => setFormData({ ...formData, tags_en: e.target.value })}
                placeholder="e.g. Food Quality, Beverage Testing, Safety"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">3. Display & Visibility Settings</h2>

          <div className="grid sm:grid-cols-3 gap-4">
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
                  checked={formData.show_on_homepage}
                  onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs font-medium text-slate-700">Display on Homepage Section</span>
              </label>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs font-medium text-slate-700">Active (Visible in Public Directory)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/admin/industries/detail?id=${industryId}`}
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

export default function IndustryEditPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout title="Edit Industry Sector">
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" label="Loading..." />
          </div>
        </AdminLayout>
      }
    >
      <IndustryEditForm />
    </Suspense>
  );
}
