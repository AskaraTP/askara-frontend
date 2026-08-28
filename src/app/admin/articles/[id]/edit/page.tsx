'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
import FormField from '@/components/admin/FormField';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { validateArticle } from '@/lib/validation';
import { formatErrorMessage } from '@/lib/errorHandler';
import { FileText, Calendar, Link2, Loader2 } from 'lucide-react';

const ARTICLE_CATEGORY_PRESETS = [
  { en: 'Food Safety', id: 'Keamanan Pangan' },
  { en: 'Technology', id: 'Teknologi & Instrumen' },
  { en: 'Environment', id: 'Lingkungan & IPAL' },
  { en: 'Company News', id: 'Berita Perusahaan' },
  { en: 'Industry Insights', id: 'Wawasan Industri' },
];

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useUI();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title_en: '',
    title_id: '',
    category_en: 'Food Safety',
    category_id: 'Keamanan Pangan',
    image: '',
    published_at: '',
    linkedin_url: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    async function loadArticle() {
      try {
        const art = await api.admin.getArticleById(articleId);
        if (art) {
          const matchedPreset = ARTICLE_CATEGORY_PRESETS.some((c) => c.en === art.category_en);
          setIsCustomCategory(!matchedPreset);

          setFormData({
            title_en: art.title_en || '',
            title_id: art.title_id || '',
            category_en: art.category_en || 'Food Safety',
            category_id: art.category_id || 'Keamanan Pangan',
            image: art.image || '',
            published_at: art.published_at || '',
            linkedin_url: art.linkedin_url || '',
            is_active: Boolean(art.is_active),
            sort_order: art.sort_order ?? 0,
          });
        }
      } catch (err: any) {
        toast(formatErrorMessage(err, 'Failed to load article details'), 'error');
        router.push('/admin/articles');
      } finally {
        setLoading(false);
      }
    }

    if (articleId) {
      loadArticle();
    }
  }, [articleId, router, toast]);

  const handleCategorySelectChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
      const preset = ARTICLE_CATEGORY_PRESETS.find((c) => c.en === val);
      if (preset) {
        setFormData((prev) => ({
          ...prev,
          category_en: preset.en,
          category_id: preset.id,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Centralized validation check
    const validation = validateArticle(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast('Please review the form errors before saving.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        sort_order: Number(formData.sort_order) || 0,
      };

      await api.admin.updateArticle(articleId, payload);
      toast('Article updated successfully', 'success');
      router.push('/admin/articles');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to update article'), 'error');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Article">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading article details...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Article">
      <form onSubmit={handleSubmit} className="space-y-6 pb-16">
        {/* Top Header Toolbar */}
        <AdminPageHeader
          backHref="/admin/articles"
          backTitle="Back to Articles"
          title={`Edit: ${formData.title_en || 'Article'}`}
          subtitle="Modify article headlines, classification, and publication data"
          saving={saving}
          saveLabel="Save Changes"
          savingLabel="Saving..."
        />

        {/* 1. Article Titles & Categories */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-brand-50 text-brand-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Article Details</h2>
              <p className="text-xs text-slate-500">Bilingual headlines and category classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField label="Article Title (English)" required error={errors.title_en}>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => {
                  setFormData({ ...formData, title_en: e.target.value });
                  if (errors.title_en) setErrors({ ...errors, title_en: '' });
                }}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              />
            </FormField>

            <FormField label="Article Title (Indonesian)" required error={errors.title_id}>
              <input
                type="text"
                value={formData.title_id}
                onChange={(e) => {
                  setFormData({ ...formData, title_id: e.target.value });
                  if (errors.title_id) setErrors({ ...errors, title_id: '' });
                }}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              />
            </FormField>
          </div>

          {/* Category Dropdown & Custom Category */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Category Classification *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <select
                  value={isCustomCategory ? 'CUSTOM' : formData.category_en}
                  onChange={(e) => handleCategorySelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs font-medium focus:border-brand-500 outline-none bg-white text-slate-800"
                >
                  {ARTICLE_CATEGORY_PRESETS.map((c, i) => (
                    <option key={i} value={c.en}>
                      {c.en} ({c.id})
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom Category (Tulis Kategori Sendiri)</option>
                </select>
              </div>

              {isCustomCategory && (
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={formData.category_en}
                    onChange={(e) => setFormData({ ...formData, category_en: e.target.value })}
                    placeholder="Category EN"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs bg-white focus:border-brand-500 outline-none"
                  />
                  <input
                    type="text"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    placeholder="Kategori ID"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs bg-white focus:border-brand-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Cover Image */}
        <AdminImageUpload
          label="Article Cover Image"
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
          recommendedRatio="16:9 (Landscape - e.g. 1200x675px)"
          recommendedFormat="JPG / PNG / WebP"
        />

        {/* 3. Publication Metadata & External Links */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Publication & External Links</h2>
              <p className="text-xs text-slate-500">Date, LinkedIn post link, and sort order</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField label="Published Date">
              <input
                type="date"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </FormField>

            <FormField label="LinkedIn / External URL" error={errors.linkedin_url} className="sm:col-span-2">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => {
                    setFormData({ ...formData, linkedin_url: e.target.value });
                    if (errors.linkedin_url) setErrors({ ...errors, linkedin_url: '' });
                  }}
                  placeholder="https://www.linkedin.com/posts/..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
                />
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <FormField label="Sort Order" error={errors.sort_order} helperText="Order priority in articles feed">
              <input
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-md border border-slate-200 text-xs sm:text-sm focus:border-brand-500 outline-none"
              />
            </FormField>

            <div className="flex items-center h-full pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 p-3 rounded-md bg-slate-50 border border-slate-200 w-full">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <span>Active & Published on Public Site</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
