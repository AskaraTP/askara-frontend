'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import StatusToggle from '@/components/admin/StatusToggle';
import { useUI } from '@/context/UIContext';
import { TableSkeletonRows } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { Article } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  ExternalLink,
  Search,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function AdminArticlesPage() {
  const { toast, confirm } = useUI();
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAdminArticles();
      setArticles(data);
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to load articles'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoveArticle = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= filteredArticles.length) return;

    const copy = [...filteredArticles];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setArticles(copy);

    try {
      const orderedIds = copy.map((a) => a.id);
      const updated = await api.admin.reorderArticles(orderedIds);
      setArticles(updated);
      toast(`Article position moved ${direction}`, 'success');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to reorder articles'), 'error');
      loadData();
    }
  };

  const handleToggleActive = async (article: Article) => {
    const nextState = !article.is_active;
    setTogglingId(article.id);

    // Optimistic state update
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, is_active: nextState } : a))
    );

    try {
      await api.admin.updateArticle(article.id, { is_active: nextState });
      toast(nextState ? 'Article published (Active)' : 'Article moved to Draft', 'info');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to update article status'), 'error');
      loadData();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (article: Article) => {
    const ok = await confirm({
      title: 'Delete Article',
      message: `Are you sure you want to delete article "${article.title_en}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteArticle(article.id);
        toast('Article deleted successfully', 'success');
        loadData();
      } catch (err: any) {
        toast(formatErrorMessage(err, 'Failed to delete article'), 'error');
      }
    }
  };

  const filteredArticles = articles.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.title_en && a.title_en.toLowerCase().includes(q)) ||
      (a.title_id && a.title_id.toLowerCase().includes(q)) ||
      (a.category_en && a.category_en.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout title="Articles & Insights">
      <div className="space-y-5">
        {/* Top Filter & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by title or category..."
              className="w-full pl-9 pr-3.5 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
            />
          </div>

          <Link
            href="/admin/articles/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Article
          </Link>
        </div>

        {/* Clean Articles Data Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3 px-3 w-28 text-center">Urutan</th>
                  <th className="py-3 px-4">Article Title</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Published Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <TableSkeletonRows rows={4} cols={6} />
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No articles found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((art, idx) => (
                    <tr key={art.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Sequence reorder */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 border border-slate-200 rounded-md p-1 bg-slate-50">
                          <span className="font-mono font-bold text-xs text-slate-700 w-5">#{art.sort_order}</span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveArticle(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveArticle(idx, 'down')}
                              disabled={idx === filteredArticles.length - 1}
                              className="p-0.5 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Thumbnail & Titles */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            {art.image ? (
                              <img
                                src={art.image}
                                alt={art.title_en}
                                className="h-full w-full object-cover rounded-sm"
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">
                              {art.title_en}
                            </p>
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                              {art.title_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-sm bg-brand-50 text-brand-700 text-[11px] font-semibold">
                          {art.category_en}
                        </span>
                      </td>

                      {/* Published Date */}
                      <td className="py-3 px-3 text-slate-600 text-xs font-medium">
                        {art.published_at || '-'}
                      </td>

                      {/* Interactive Status Toggle */}
                      <td className="py-3 px-3 text-center">
                        <StatusToggle
                          isActive={Boolean(art.is_active)}
                          onToggle={() => handleToggleActive(art)}
                          loading={togglingId === art.id}
                          activeLabel="Active"
                          inactiveLabel="Draft"
                        />
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {art.linkedin_url && (
                            <a
                              href={art.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="View External / LinkedIn Post"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="Edit Article Page"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(art)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
