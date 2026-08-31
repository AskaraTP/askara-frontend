'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import Spinner from '@/components/ui/Spinner';
import { api, resolveImageUrl } from '@/lib/api';
import { Partner } from '@/types';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Building2,
  ExternalLink,
  Globe2,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';

function PartnerDetailContent() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('id') || '';
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!partnerId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.admin.getPartnerById(partnerId);
        setPartner(data);
      } catch (err: any) {
        toast(err.message || 'Failed to load partner details', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [partnerId, toast]);

  const handleDelete = async () => {
    if (!partner) return;
    const ok = await confirm({
      title: 'Delete Principal / Partner',
      message: `Are you sure you want to delete principal "${partner.name}"?`,
      confirmText: 'Delete Principal',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deletePartner(partner.id);
        toast('Principal deleted successfully', 'success');
        router.push('/admin/partners');
      } catch (err: any) {
        toast(err.message || 'Failed to delete partner', 'error');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Principal Details">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading principal details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!partner) {
    return (
      <AdminLayout title="Principal Not Found">
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-4 max-w-md mx-auto mt-8">
          <Building2 className="w-10 h-10 mx-auto text-slate-300" />
          <h2 className="text-sm font-bold text-slate-900">Principal Not Found</h2>
          <p className="text-xs text-slate-500">The principal with ID &quot;{partnerId}&quot; does not exist.</p>
          <Link
            href="/admin/partners"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const gallery = partner.documentation_gallery || [];
  const publicSlug =
    partner.slug ||
    (partner.name
      ? partner.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      : partner.id.toString());

  return (
    <AdminLayout title={`Principal: ${partner.name}`}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/partners"
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Partners List"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">{partner.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    partner.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {partner.is_active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Slug: <code className="font-mono text-brand-600">/principals/{publicSlug}</code> &bull; Sequence #{partner.sort_order} &bull; Internal ID: {partner.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href={`/principals/${publicSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View Public Page
            </Link>
            <Link
              href={`/admin/partners/edit?id=${partner.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Principal
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
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Principal Information & Profile
          </h2>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex justify-center">
              <div className="h-40 w-full max-w-xs rounded-xl bg-white border border-slate-200 shadow-xs p-5 flex items-center justify-center">
                {partner.logo ? (
                  <img
                    src={resolveImageUrl(partner.logo)}
                    alt={partner.name}
                    className="max-h-28 max-w-[90%] object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                    <span className="text-xs font-bold">{partner.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-8 space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Origin Country</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Globe2 className="w-3.5 h-3.5 text-brand-600" />
                    {partner.country || 'Not specified'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Category / Specialization</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {partner.category || 'Not specified'}
                  </span>
                </div>
              </div>

              {partner.website_url && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Official Website</span>
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {partner.website_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-base">🇮🇩</span>
              <h3 className="text-sm font-bold text-slate-900">Deskripsi Profil (Bahasa Indonesia)</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200/80 min-h-[90px] whitespace-pre-line">
              {partner.description_id || <span className="text-slate-400">Belum ada deskripsi bahasa Indonesia.</span>}
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-base">🇬🇧</span>
              <h3 className="text-sm font-bold text-slate-900">Company Profile Description (English)</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200/80 min-h-[90px] whitespace-pre-line">
              {partner.description_en || <span className="text-slate-400">No English description configured.</span>}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Documentation & Activities Gallery ({gallery.length} Photos)
              </h2>
              <p className="text-xs text-slate-500">
                Field photos, calibration sessions, and laboratory workshops with this principal.
              </p>
            </div>

            <Link
              href={`/admin/partners/edit?id=${partner.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <Edit2 className="w-3 h-3" />
              Manage Gallery Photos
            </Link>
          </div>

          {gallery.length === 0 ? (
            <div className="p-8 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No Documentation Photos Added</p>
              <p className="text-[11px] text-slate-400">
                Click &quot;Edit Principal&quot; to upload documentation photos for this partner.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="h-44 bg-white rounded-md border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={resolveImageUrl(item.url)}
                      alt={item.caption_en || 'Gallery photo'}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    {item.date && (
                      <span className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    )}
                    <p className="font-semibold text-slate-800 line-clamp-2">
                      {item.caption_id || item.caption_en || 'No caption'}
                    </p>
                    {item.caption_en && item.caption_id && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        EN: {item.caption_en}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function PartnerDetailPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout title="Principal Details">
          <div className="flex items-center justify-center py-20">
            <Spinner size="md" label="Loading..." />
          </div>
        </AdminLayout>
      }
    >
      <PartnerDetailContent />
    </Suspense>
  );
}
