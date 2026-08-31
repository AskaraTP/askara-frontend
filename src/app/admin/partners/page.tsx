'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api, resolveImageUrl } from '@/lib/api';
import { Partner } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Building2,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Globe2,
  Image as ImageIcon,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function AdminPartnersPage() {
  const { toast, confirm } = useUI();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAdminPartners();
      setPartners(data || []);
    } catch (err: any) {
      toast(err.message || 'Failed to load partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMovePartner = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= filteredPartners.length) return;

    const copy = [...filteredPartners];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setPartners(copy);

    try {
      const orderedIds = copy.map((p) => p.id);
      const updated = await api.admin.reorderPartners(orderedIds);
      setPartners(updated);
      toast(`Principal position moved ${direction}`, 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to reorder partners', 'error');
      loadData();
    }
  };

  const handleDelete = async (partner: Partner) => {
    const ok = await confirm({
      title: 'Delete Partner / Principal',
      message: `Are you sure you want to delete principal "${partner.name}"?`,
      confirmText: 'Delete Principal',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deletePartner(partner.id);
        toast('Principal deleted successfully', 'success');
        loadData();
      } catch (err: any) {
        toast(err.message || 'Failed to delete partner', 'error');
      }
    }
  };

  const filteredPartners = partners.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.country?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description_en?.toLowerCase().includes(q) ||
      p.description_id?.toLowerCase().includes(q)
    );
  });

  const totalPhotos = partners.reduce(
    (acc, p) => acc + (p.documentation_gallery?.length || 0),
    0
  );

  return (
    <AdminLayout title="Partners & Principals">
      <div className="space-y-5">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Technology Principals & Global Partners</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {partners.length} Authorized Principals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage international technology principals, company profiles, websites, and field activity documentation galleries.
            </p>
          </div>

          <Link
            href="/admin/partners/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Principal / Partner
          </Link>
        </div>

        {/* Search & Quick Stats Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search principals by name, country, or category..."
              className="w-full pl-9 pr-4 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-brand-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 self-end sm:self-auto font-medium">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-brand-600" />
              <strong>{partners.filter((p) => p.is_active).length}</strong> Active
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <strong>{totalPhotos}</strong> Documentation Photos
            </span>
          </div>
        </div>

        {/* Partners Cards Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading principals & partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
            <Building2 className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Principals Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No partners matched your search query. Try adjusting your search term.'
                : 'Get started by creating your first global principal profile.'}
            </p>
            <Link
              href="/admin/partners/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              Add Principal Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPartners.map((partner, idx) => {
              const galleryCount = partner.documentation_gallery?.length || 0;
              return (
                <div
                  key={partner.id}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all duration-150 group"
                >
                  <div className="p-5 space-y-3">
                    {/* Header Logo & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-14 w-32 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center shrink-0 shadow-2xs">
                        {partner.logo ? (
                          <img
                            src={resolveImageUrl(partner.logo)}
                            alt={partner.name}
                            className="max-h-10 max-w-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            partner.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {partner.is_active ? 'Active' : 'Disabled'}
                        </span>
                        {partner.country && (
                          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                            <Globe2 className="w-3 h-3 text-slate-400" />
                            {partner.country}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name & Category */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {partner.name}
                      </h3>
                      {partner.category && (
                        <p className="text-[11px] font-semibold text-brand-600 line-clamp-1">
                          {partner.category}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {partner.description_id || partner.description_en || 'No description provided.'}
                    </p>

                    {/* Gallery photos count pill */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                      <span className="font-semibold text-slate-700">{galleryCount}</span>
                      <span>documentation photos</span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium text-[11px]">
                        Urutan: <strong className="text-slate-900 font-bold">#{partner.sort_order}</strong>
                      </span>
                      <div className="flex items-center gap-0.5 border border-slate-200 rounded-md p-0.5 bg-white">
                        <button
                          type="button"
                          onClick={() => handleMovePartner(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePartner(idx, 'down')}
                          disabled={idx === filteredPartners.length - 1}
                          className="p-1 hover:bg-slate-100 hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/partners/detail?id=${partner.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>

                      <Link
                        href={`/admin/partners/edit?id=${partner.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(partner)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
