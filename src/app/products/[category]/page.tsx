'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { api } from '@/lib/api';
import { ProductCategory, Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import CTA from '@/components/layout/CTA';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const categorySlug = resolvedParams.category;

  const { getLocalizedText, t } = useLanguage();
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        const catData = await api.getCategoryBySlug(categorySlug);
        setCategory(catData);
        setProducts(catData.products || []);
      } catch (err) {
        console.error('Failed to load category', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [categorySlug]);

  const categoryName = category
    ? getLocalizedText(category.name_en, category.name_id)
    : categorySlug;
  const categoryDesc = category
    ? getLocalizedText(category.description_en, category.description_id)
    : '';

  return (
    <div className="pt-24 lg:pt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
          <Link href="/products" className="hover:text-brand-500 transition-colors">
            {t.nav.products}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{categoryName}</span>
        </div>

        {/* Category Header */}
        <div className="mb-10 max-w-3xl">
          <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600">
            {t.products.categoryBadge}
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {categoryName}
          </h1>
          {categoryDesc && (
            <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              {categoryDesc}
            </p>
          )}
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {products.length} {t.products.productsAvailable}
          </p>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
            <p className="text-slate-500 text-sm font-medium">
              {t.products.noCategoryProducts}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.products.backToAllCategories}
            </Link>
          </div>
        )}
      </div>

      <CTA />
    </div>
  );
}
