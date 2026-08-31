'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import StatusToggle from '@/components/admin/StatusToggle';
import { useUI } from '@/context/UIContext';
import { TableSkeletonRows } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { ProductCategory } from '@/types';
import { Plus, Edit2, Trash2, Layers, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { toast, confirm } = useUI();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getAdminCategories();
      setCategories(data);
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to load categories'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;

    const copy = [...categories];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setCategories(copy);

    try {
      const orderedIds = copy.map((c) => c.id);
      const updated = await api.admin.reorderCategories(orderedIds);
      setCategories(updated);
      toast(`Category position moved ${direction}`, 'success');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to reorder categories'), 'error');
      loadData();
    }
  };

  const handleToggleActive = async (category: ProductCategory) => {
    const nextState = !category.is_active;
    setTogglingId(category.id);

    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, is_active: nextState } : c))
    );

    try {
      await api.admin.updateCategory(category.id, { is_active: nextState });
      toast(nextState ? 'Category activated' : 'Category deactivated', 'info');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to update category status'), 'error');
      loadData();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (category: ProductCategory) => {
    const ok = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${category.name_en}"? Products associated with this category may be affected.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteCategory(category.id);
        toast('Category successfully deleted', 'success');
        loadData();
      } catch (err: any) {
        toast(formatErrorMessage(err, 'Failed to delete category'), 'error');
      }
    }
  };

  return (
    <AdminLayout title="Category Management">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">Product Categories & Taxonomies</h2>
          <p className="text-xs text-slate-500">Manage catalog sections and taxonomies for instruments and reagents</p>
        </div>
        <Link
          href="/admin/categories/create"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      {/* Categories Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-3 px-3 w-28 text-center">Urutan</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Description (EN)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableSkeletonRows rows={4} cols={6} />
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    No categories added yet. Click &quot;Add Category&quot; to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Sequence reorder */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 border border-slate-200 rounded-md p-1 bg-slate-50">
                        <span className="font-mono font-bold text-xs text-slate-700 w-5">#{cat.sort_order}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveCategory(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCategory(idx, 'down')}
                            disabled={idx === categories.length - 1}
                            className="p-0.5 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Name and Icon */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{cat.name_en}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{cat.name_id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">
                      {cat.slug}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3 text-slate-600 max-w-sm truncate text-xs">
                      {cat.description_en || '-'}
                    </td>

                    {/* Interactive Clickable Status Toggle */}
                    <td className="py-3 px-3 text-center">
                      <StatusToggle
                        isActive={Boolean(cat.is_active)}
                        onToggle={() => handleToggleActive(cat)}
                        loading={togglingId === cat.id}
                        activeLabel="Active"
                        inactiveLabel="Inactive"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/categories/edit?id=${cat.id}`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                          title="Edit Category Page"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Category"
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
    </AdminLayout>
  );
}
