'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { ProductCategory } from '@/types';
import {
  ArrowLeft,
  Save,
  Factory,
  Utensils,
  Fish,
  FlaskConical,
  Trees,
  Droplets,
  Building,
  Layers,
  HelpCircle,
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

export default function CreateIndustryPage() {
  const router = useRouter();
  const { toast } = useUI();

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_id: '',
    description_en: '',
    description_id: '',
    icon: 'Factory',
    tags_en: 'Instruments, Chemical Reagents, Rapid Test',
    tags_id: 'Instrumen, Reagent Kimia, Rapid Test',
    target_category_slug: 'instrument',
    show_on_homepage: true,
    sort_order: 1,
    is_active: true,
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.getCategories();
        setCategories(cats || []);
      } catch {
        // fallback
      }
    }
    loadCategories();
  }, []);

  const handleTitleChange = (val: string, lang: 'id' | 'en') => {
    if (lang === 'en') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({
        ...prev,
        title_en: val,
        slug: prev.slug ? prev.slug : generatedSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, title_id: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const created = await api.admin.createIndustry(payload);
      toast('Industry sector created successfully', 'success');
      router.push(`/admin/industries/detail?id=${created.id}`);
    } catch (err: any) {
      toast(err.message || 'Failed to create industry sector', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add Industry Sector">
      <form onSubmit={handleSubmit} className="space-y-5 pb-12">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/industries"
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Industries List"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Add Industry Sector</h1>
              <p className="text-xs text-slate-500 mt-0.5">Configure new industry sector card with bilingual content and homepage placement</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/industries"
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Sector...' : 'Save & Publish Industry Sector'}
            </button>
          </div>
        </div>
          {/* Section 1: Icon & Slug */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">1. Sector Icon & Identification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the visual icon that represents this industry.
              </p>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Sector Icon</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {availableIcons.map(({ name, label, Icon }) => {
                  const isSelected = formData.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: name })}
                      className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 text-brand-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-brand-600' : 'text-slate-500'}`} />
                      <span className="text-[11px] font-semibold leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slug */}
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Identifier / Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. food-beverage"
                className="w-full px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:border-brand-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Unique slug used in links and API endpoints.</p>
            </div>
          </div>

          {/* Section 2: Bilingual Titles & Descriptions */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">2. Bilingual Content (Titles & Descriptions)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide Indonesian and English titles and descriptions for visitors.
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
                    Industry Title (ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_id}
                    onChange={(e) => handleTitleChange(e.target.value, 'id')}
                    placeholder="Makanan & Minuman (F&B)"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description (ID) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description_id}
                    onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                    placeholder="Analisis komposisi, pelabelan nutrisi, dan skrining kontaminan untuk produsen makanan dan minuman kemasan."
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Relevant Product Tags (ID)
                  </label>
                  <input
                    type="text"
                    value={formData.tags_id}
                    onChange={(e) => setFormData({ ...formData, tags_id: e.target.value })}
                    placeholder="Instrumen, Reagent Kimia, Rapid Test"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Separate tags with commas.</p>
                </div>
              </div>

              {/* English Column */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  🇬🇧 English
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry Title (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => handleTitleChange(e.target.value, 'en')}
                    placeholder="Food & Beverage (F&B)"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description (EN) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Composition analysis, nutritional labeling, and contaminant screening for packaged food and beverage manufacturers."
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Relevant Product Tags (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.tags_en}
                    onChange={(e) => setFormData({ ...formData, tags_en: e.target.value })}
                    placeholder="Instruments, Chemical Reagents, Rapid Test"
                    className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Separate tags with commas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Target Category Link & Homepage Display */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">3. Target Category Link & Homepage Visibility</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Link this industry card to a specific product catalog category and toggle its display on the homepage.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Product Category
                </label>
                <select
                  value={formData.target_category_slug}
                  onChange={(e) => setFormData({ ...formData, target_category_slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                >
                  <option value="instrument">Instrument (Instrumen)</option>
                  <option value="reagent-kimia">Chemical Reagents (Reagent Kimia)</option>
                  <option value="rapid-test">Rapid Test</option>
                  <option value="ipal">WWTP / IPAL</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name_id || c.name_en} ({c.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  When visitors click &quot;View Relevant Products&quot;, they will be filtered by this category.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sequence / Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Lower number displays first (e.g. 1, 2, 3).</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-amber-200 bg-amber-50/50 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={formData.show_on_homepage}
                  onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Show on Homepage</span>
                  <span className="text-[11px] text-slate-500">
                    Display this card in the &quot;Industries We Serve&quot; section on the public homepage.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Active Status</span>
                  <span className="text-[11px] text-slate-500">
                    Enable or disable this industry across the entire website.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/industries"
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
              {saving ? 'Saving Sector...' : 'Save & Publish Industry Sector'}
            </button>
          </div>
        </form>
    </AdminLayout>
  );
}
