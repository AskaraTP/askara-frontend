'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { Industry } from '@/types';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Factory,
  Utensils,
  Fish,
  FlaskConical,
  Trees,
  Droplets,
  Building,
  Home,
  ArrowRight,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Utensils,
  Fish,
  Factory,
  FlaskConical,
  Trees,
  Droplets,
  Building,
};

function IndustryDetailContent() {
  const searchParams = useSearchParams();
  const industryId = searchParams.get('id') || '';
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!industryId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.admin.getIndustryById(industryId);
        setIndustry(data);
      } catch (err: any) {
        toast(formatErrorMessage(err, 'Failed to load industry details'), 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [industryId, toast]);

  const handleToggleActive = async () => {
    if (!industry) return;
    const nextState = !industry.is_active;
    setIndustry((prev) => (prev ? { ...prev, is_active: nextState } : prev));
    try {
      await api.admin.updateIndustry(industry.id, { is_active: nextState });
      toast(nextState ? 'Industry activated' : 'Industry deactivated', 'info');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to update status'), 'error');
      const data = await api.admin.getIndustryById(industryId);
      setIndustry(data);
    }
  };

  const handleToggleHomepage = async () => {
    if (!industry) return;
    const nextState = !industry.show_on_homepage;
    setIndustry((prev) => (prev ? { ...prev, show_on_homepage: nextState } : prev));
    try {
      await api.admin.updateIndustry(industry.id, { show_on_homepage: nextState });
      toast(
        `Industry ${nextState ? 'will now appear on' : 'hidden from'} Homepage`,
        'success'
      );
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to update homepage visibility'), 'error');
      const data = await api.admin.getIndustryById(industryId);
      setIndustry(data);
    }
  };

  const handleDelete = async () => {
    if (!industry) return;
    const ok = await confirm({
      title: 'Delete Industry',
      message: `Are you sure you want to delete industry "${industry.title_id || industry.title_en || industry.id}"?`,
      confirmText: 'Delete Industry',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteIndustry(industry.id);
        toast('Industry deleted successfully', 'success');
        router.push('/admin/industries');
      } catch (err: any) {
        toast(err.message || 'Failed to delete industry', 'error');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Industry Sector Details">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading industry details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!industry) {
    return (
      <AdminLayout title="Industry Not Found">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 max-w-md mx-auto mt-8">
          <Factory className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="text-sm font-bold text-slate-900">Industry Not Found</h2>
          <p className="text-xs text-slate-500">
            The industry sector with ID or slug &quot;{industryId}&quot; does not exist or has been removed.
          </p>
          <Link
            href="/admin/industries"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Industries
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const iconKey = industry.icon_name || industry.icon || 'Factory';
  const IconComponent = iconMap[iconKey] || Factory;

  return (
    <AdminLayout title={`Industry: ${industry.title_id || industry.title_en}`}>
      <div className="space-y-5">
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
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  {industry.title_id || industry.title_en}
                </h1>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  title="Click to toggle Active status"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer select-none ${
                    industry.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {industry.is_active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleToggleHomepage}
                  title="Click to toggle Homepage display"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer select-none ${
                    industry.show_on_homepage
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Home className="w-3 h-3" />
                  <span>{industry.show_on_homepage ? 'Displayed on Homepage' : 'Hidden from Homepage'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Slug: <code className="font-mono text-brand-600">{industry.slug}</code> &bull; Sequence #{industry.sort_order} &bull; Internal ID: {industry.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href={`/admin/industries/edit?id=${industry.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Sector
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

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Preview: How this Industry Card Renders</h2>
              <p className="text-xs text-slate-500">
                Shows the interactive presentation visitors see on both the public Homepage and the Industries page.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">
              Sequence #{industry.sort_order}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-4 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    🇮🇩 ID View
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {industry.title_id || industry.title_en}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {industry.description_id || industry.description_en || 'No description configured.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(industry.tags_id || []).map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                    Lihat Produk Terkait
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    category: {industry.target_category_slug}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    🇬🇧 EN View
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {industry.title_en || industry.title_id}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {industry.description_en || industry.description_id || 'No description configured.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {(industry.tags_en || []).map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                    View Relevant Products
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    category: {industry.target_category_slug}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-base">🇮🇩</span>
              <h3 className="text-sm font-bold text-slate-900">Indonesian Content (Bahasa)</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Sector Title (ID)
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {industry.title_id || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description Paragraph (ID)
                </label>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 leading-relaxed min-h-[70px]">
                  {industry.description_id || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Product Tags (ID)
                </label>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {(industry.tags_id || []).map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-700 text-xs border border-slate-200 font-medium">
                      {tag}
                    </span>
                  ))}
                  {(!industry.tags_id || industry.tags_id.length === 0) && (
                    <span className="text-slate-400 text-xs">No tags configured</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="text-base">🇬🇧</span>
              <h3 className="text-sm font-bold text-slate-900">English Content</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Sector Title (EN)
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {industry.title_en || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description Paragraph (EN)
                </label>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200/80 leading-relaxed min-h-[70px]">
                  {industry.description_en || <span className="text-slate-400 font-normal">Not configured</span>}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Product Tags (EN)
                </label>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2.5 rounded-md border border-slate-200/80">
                  {(industry.tags_en || []).map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-700 text-xs border border-slate-200 font-medium">
                      {tag}
                    </span>
                  ))}
                  {(!industry.tags_en || industry.tags_en.length === 0) && (
                    <span className="text-slate-400 text-xs">No tags configured</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Target Category Link & System Settings</h3>

          <div className="grid sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Target Product Category</span>
              <p className="font-bold text-brand-600">/products/{industry.target_category_slug}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Icon Component</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <IconComponent className="w-4 h-4 text-brand-500" />
                <span>{industry.icon || 'Factory'}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Homepage Visibility</span>
              <p className={`font-bold ${industry.show_on_homepage ? 'text-amber-700' : 'text-slate-500'}`}>
                {industry.show_on_homepage ? 'Shown on Homepage' : 'Hidden from Homepage'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Status & Sequence</span>
              <p className="font-bold text-slate-900">
                Sequence #{industry.sort_order} &bull; {industry.is_active ? 'Active' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function IndustryDetailPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout title="Industry Sector Details">
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" label="Loading..." />
          </div>
        </AdminLayout>
      }
    >
      <IndustryDetailContent />
    </Suspense>
  );
}
