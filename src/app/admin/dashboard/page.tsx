'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import { api } from '@/lib/api';
import { AdminStats } from '@/types';
import {
  Package,
  Layers,
  FileText,
  Briefcase,
  SlidersHorizontal,
  Factory,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.admin.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard Overview">
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Memuat statistik dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          subtitle={`${stats?.activeProducts ?? 0} active, ${stats?.featuredProducts ?? 0} featured`}
          icon={Package}
          color="brand"
        />
        <StatsCard
          title="Articles & Updates"
          value={stats?.totalArticles ?? 0}
          subtitle="Knowledge hub items"
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Active Careers"
          value={stats?.activeCareers ?? 0}
          subtitle={`Out of ${stats?.totalCareers ?? 0} total vacancies`}
          icon={Briefcase}
          color="indigo"
        />
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/homepage"
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-brand-400 transition-colors duration-150 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-50 text-amber-500">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Hero & Showcase</p>
              <p className="text-[11px] text-slate-500">Manage sliders & banners</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
        </Link>

        <Link
          href="/admin/about"
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-cyan-400 transition-colors duration-150 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-cyan-50 text-cyan-600">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">About Us Content</p>
              <p className="text-[11px] text-slate-500">Who We Are, slider & reasons</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
        </Link>

        <Link
          href="/admin/industries"
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 transition-colors duration-150 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Industries We Serve</p>
              <p className="text-[11px] text-slate-500">Manage sectors & homepage cards</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </Link>

        <Link
          href="/admin/products"
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-brand-400 transition-colors duration-150 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-brand-50 text-brand-500">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Manage Products</p>
              <p className="text-[11px] text-slate-500">Add, edit, change specs</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
        </Link>

        <Link
          href="/admin/categories"
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-400 transition-colors duration-150 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-50 text-blue-500">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Manage Categories</p>
              <p className="text-[11px] text-slate-500">Instruments, Reagents, RO</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link
          href="/admin/articles"
          className="p-4 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 transition-colors duration-150 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-50 text-indigo-500">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Articles & News</p>
              <p className="text-[11px] text-slate-500">Publish insights</p>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </Link>
      </div>


      {/* Catalog Section */}
      <div className="p-5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Products</h3>
            <Link href="/admin/products" className="text-xs font-bold text-brand-600 hover:underline">
              Manage All →
            </Link>
          </div>

          {stats?.recentProducts && stats.recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.recentProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name_en} className="max-h-8 max-w-full object-contain" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{prod.name_en}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {prod.principal || 'Askara'} • {prod.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/products/${prod.category_slug || 'all'}/${prod.slug}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-brand-600 rounded-md hover:bg-slate-200/50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No products in catalog
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
