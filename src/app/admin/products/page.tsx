'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import StatusToggle from '@/components/admin/StatusToggle';
import { useUI } from '@/context/UIContext';
import { TableSkeletonRows } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatErrorMessage } from '@/lib/errorHandler';
import { Product, ProductCategory } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  Package,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function AdminProductsPage() {
  const { toast, confirm } = useUI();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.admin.getAdminProducts(),
        api.admin.getAdminCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to load products'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= filteredProducts.length) return;

    const copy = [...filteredProducts];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setProducts(copy);

    try {
      const orderedIds = copy.map((p) => p.id);
      const updated = await api.admin.reorderProducts(orderedIds);
      setProducts(updated);
      toast(`Product position moved ${direction}`, 'success');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Failed to reorder products'), 'error');
      loadData();
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const nextState = !product.is_featured;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextState } : p))
      );
      await api.admin.updateProduct(product.id, { is_featured: nextState });
      toast(nextState ? 'Product marked as Featured' : 'Product removed from Featured', 'success');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Error updating featured status'), 'error');
      loadData();
    }
  };

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id);
    const nextState = !product.is_active;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: nextState } : p))
    );

    try {
      await api.admin.updateProduct(product.id, { is_active: nextState });
      toast(nextState ? 'Product published (Active)' : 'Product moved to Draft', 'info');
    } catch (err: any) {
      toast(formatErrorMessage(err, 'Error updating active status'), 'error');
      loadData();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    const ok = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name_en}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (ok) {
      try {
        await api.admin.deleteProduct(product.id);
        toast('Product successfully deleted', 'success');
        loadData();
      } catch (err: any) {
        toast(formatErrorMessage(err, 'Error deleting product'), 'error');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name_en.toLowerCase().includes(q) ||
      p.name_id.toLowerCase().includes(q) ||
      (p.principal && p.principal.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'all' ||
      p.product_category_id?.toString() === categoryFilter ||
      p.category_slug === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout title="Product Management">
      <div className="space-y-5">
        {/* Top Action & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, model, principal..."
                className="w-full pl-9 pr-3.5 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:border-brand-500 outline-none"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name_en}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/admin/products/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Clean Production Data Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 w-28 text-center">Urutan</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Principal</th>
                  <th className="py-3 px-3 text-center">Featured Showcase</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <TableSkeletonRows rows={5} cols={7} />
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                      No products found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod, idx) => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Sequence reorder */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 border border-slate-200 rounded-md p-1 bg-slate-50">
                          <span className="font-mono font-bold text-xs text-slate-700 w-5">#{prod.sort_order}</span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveProduct(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveProduct(idx, 'down')}
                              disabled={idx === filteredProducts.length - 1}
                              className="p-0.5 hover:bg-white hover:text-brand-600 rounded text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Product Thumbnail & Names */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name_en}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">
                              {prod.name_en}
                            </p>
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                              {prod.name_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {prod.product_category?.name_en || prod.category_slug || '-'}
                        </span>
                      </td>

                      {/* Principal */}
                      <td className="py-3 px-3 text-xs font-semibold text-slate-800">
                        {prod.principal || 'Askara'}
                      </td>

                      {/* Featured Star/Badge Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(prod)}
                          title="Click to toggle Featured on Homepage"
                          className="inline-flex items-center"
                        >
                          {prod.is_featured ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              Featured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-50 border border-slate-200 text-slate-400 text-[11px] font-medium hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer">
                              <Star className="w-3 h-3 text-slate-300" />
                              Standard
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Active Status Badge Toggle */}
                      <td className="py-3 px-3 text-center">
                        <StatusToggle
                          isActive={Boolean(prod.is_active)}
                          onToggle={() => handleToggleActive(prod)}
                          loading={togglingId === prod.id}
                          activeLabel="Active"
                          inactiveLabel="Draft"
                        />
                      </td>

                      {/* Row Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/edit?id=${prod.id}`}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="Edit Product Page"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Product"
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
