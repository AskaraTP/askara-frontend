'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useUI } from '@/context/UIContext';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { Industry } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Factory,
  Utensils,
  Fish,
  FlaskConical,
  Trees,
  Droplets,
  Search,
  CheckCircle2,
  XCircle,
  Home,
  ArrowRight,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Utensils,
  Fish,
  Factory,
  FlaskConical,
  Trees,
  Droplets,
};

export default function AdminIndustriesPage() {
  const { toast, confirm } = useUI();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHome, setFilterHome] = useState<'all' | 'home_only' | 'hidden_home'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAdminIndustries();
      setIndustries(data || []);
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to load industries'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoveIndustry = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= filteredIndustries.length) return;

    const copy = [...filteredIndustries];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setIndustries(copy);

    try {
      const orderedIds = copy.map((i) => i.id);
      const updated = await api.admin.reorderIndustries(orderedIds);
      setIndustries(updated);
      toast(`Industry position moved ${direction}`, 'success');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to reorder industries'), 'error');
      loadData();
    }
  };

  const handleDelete = async (industry: Industry) => {
    const ok = await confirm({
      title: 'Delete Industry',
      message: `Are you sure you want to delete industry "${industry.title_id || industry.title_en || industry.id}"?`,
      confirmText: 'Delete',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteIndustry(industry.id);
        toast('Industry deleted successfully', 'success');
        loadData();
      } catch (err: any) {
        toast(formatErrorMessage(err, 'Failed to delete industry'), 'error');
      }
    }
  };

  const handleToggleActive = async (industry: Industry, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !industry.is_active;
    setIndustries((prev) =>
      prev.map((ind) => (ind.id === industry.id ? { ...ind, is_active: nextState } : ind))
    );

    try {
      await api.admin.updateIndustry(industry.id, { is_active: nextState });
      toast(nextState ? 'Industry activated' : 'Industry deactivated', 'info');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to update active status'), 'error');
      loadData();
    }
  };

  const handleToggleHomepage = async (industry: Industry, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !industry.show_on_homepage;
    setIndustries((prev) =>
      prev.map((ind) => (ind.id === industry.id ? { ...ind, show_on_homepage: nextState } : ind))
    );

    try {
      const updated = await api.admin.updateIndustry(industry.id, {
        show_on_homepage: nextState,
      });
      if (updated) {
        toast(
          `Industry ${updated.show_on_homepage ? 'will now appear on' : 'hidden from'} Homepage`,
          'success'
        );
      }
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to update homepage visibility'), 'error');
      loadData();
    }
  };

  const filteredIndustries = industries.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title_en?.toLowerCase().includes(q) ||
      item.title_id?.toLowerCase().includes(q) ||
      item.description_en?.toLowerCase().includes(q) ||
      item.description_id?.toLowerCase().includes(q) ||
      item.slug?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filterHome === 'home_only') return item.show_on_homepage;
    if (filterHome === 'hidden_home') return !item.show_on_homepage;
    return true;
  });

  const homepageCount = industries.filter((i) => i.show_on_homepage && i.is_active).length;

  return (
    <AdminLayout title="Industries We Serve">
      <div className="space-y-5">
        {/* Top Header & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Industry Sectors Management</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {homepageCount} Active on Homepage
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage industries served by Askara, custom bilingual descriptions, product tags, and control which cards appear on the homepage.
            </p>
          </div>

          <Link
            href="/admin/industries/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Industry Sector
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search industries by name or description..."
              className="w-full pl-9 pr-4 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-brand-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-500">Filter Homepage:</span>
            <select
              value={filterHome}
              onChange={(e: any) => setFilterHome(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium focus:bg-white focus:border-brand-500 outline-none"
            >
              <option value="all">All Sectors ({industries.length})</option>
              <option value="home_only">Featured on Home Only</option>
              <option value="hidden_home">Hidden from Home</option>
            </select>
          </div>
        </div>

        {/* Industries List Cards / Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading industry sectors...</p>
          </div>
        ) : filteredIndustries.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
            <Factory className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Industries Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No industries matched your search criteria. Try adjusting your filters.'
                : 'Get started by creating your first industry sector.'}
            </p>
            <Link
              href="/admin/industries/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              Add Industry Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIndustries.map((item, idx) => {
              const iconKey = item.icon_name || item.icon || 'Factory';
              const IconComponent = iconMap[iconKey] || Factory;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all duration-150 group"
                >
                  {/* Card Header & Badges */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleToggleHomepage(item, e)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-bold transition-colors cursor-pointer ${
                            item.show_on_homepage
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="Click to toggle Homepage display"
                        >
                          <Home className="w-3 h-3" />
                          <span>{item.show_on_homepage ? 'Shown on Home' : 'Hidden from Home'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleToggleActive(item, e)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-bold transition-colors cursor-pointer ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title="Click to toggle Active status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{item.is_active ? 'Active' : 'Disabled'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {item.title_id || item.title_en}
                      </h3>
                      {item.title_en && item.title_id && (
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                          EN: {item.title_en}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description_id || item.description_en || 'No description provided.'}
                    </p>

                    {/* Relevant Product Tags */}
                    {item.tags_id && item.tags_id.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags_id.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags_id.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px]">
                            +{item.tags_id.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions Toolbar */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium text-[11px]">
                        Urutan: <strong className="text-slate-900 font-bold">#{item.sort_order}</strong>
                      </span>
                      <div className="flex items-center gap-0.5 border border-slate-200 rounded-md p-0.5 bg-white">
                        <button
                          type="button"
                          onClick={() => handleMoveIndustry(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveIndustry(idx, 'down')}
                          disabled={idx === filteredIndustries.length - 1}
                          className="p-1 hover:bg-slate-100 hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/industries/detail?id=${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>

                      <Link
                        href={`/admin/industries/edit?id=${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Industry"
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
