'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/context';
import { api } from '@/lib/api';
import { ProductCategory, Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import CTA from '@/components/layout/CTA';
import { ArrowRight } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const { getLocalizedText, t } = useLanguage();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // If accessed via /products?category=instrument, redirect directly to /products/instrument
  useEffect(() => {
    if (categoryParam) {
      router.replace(`/products/${categoryParam}`);
    }
  }, [categoryParam, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
        ]);
        setCategories(cats);
        setAllProducts(prods);
      } catch (err) {
        console.error('Failed to load products data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredCat1 = categories[0];
  const featuredCat2 = categories[1];
  const otherCats = categories.slice(2);

  // Filter only featured (favorit) products
  const featuredProducts = allProducts.filter((prod) => prod.is_featured);

  return (
    <div className="pt-24 lg:pt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600">
              {t.products.headerBadge}
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              {t.products.headerTitle}
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl">
              {t.products.headerSubtitle}
            </p>
          </div>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : (
          /* Default Category Showcase View */
          <div className="space-y-8 sm:space-y-12">
            {/* Featured Categories Row */}
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-6">
              {/* Featured 1 */}
              {featuredCat1 && (
                <Link
                  href={`/products/${featuredCat1.slug}`}
                  className="group col-span-1 lg:col-span-7 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 hover:border-brand-400 transition-colors duration-200 flex flex-col justify-between"
                >
                  <div className="p-3.5 sm:p-6 lg:p-7 flex-1">
                    <span className="inline-block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1 sm:mb-2">
                      {t.products.featured}
                    </span>
                    <h3 className="text-sm sm:text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {getLocalizedText(featuredCat1.name_en, featuredCat1.name_id)}
                    </h3>
                    <p className="mt-1 sm:mt-2 text-slate-600 text-[11px] sm:text-xs leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-3">
                      {getLocalizedText(featuredCat1.description_en, featuredCat1.description_id)}
                    </p>
                    <div className="mt-2.5 sm:mt-4 inline-flex items-center gap-1 sm:gap-1.5 font-bold text-[11px] sm:text-xs text-brand-600 group-hover:text-brand-700">
                      <span>{t.products.exploreCategory}</span>
                      <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </div>
                  </div>

                  {featuredCat1.image && (
                    <div className="w-full aspect-[16/9] bg-slate-100 border-t border-slate-200 overflow-hidden">
                      <img
                        src={featuredCat1.image}
                        alt={featuredCat1.name_en}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                </Link>
              )}

              {/* Featured 2 */}
              {featuredCat2 && (
                <Link
                  href={`/products/${featuredCat2.slug}`}
                  className="group col-span-1 lg:col-span-5 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 hover:border-brand-400 transition-colors duration-200 flex flex-col justify-between"
                >
                  <div className="p-3.5 sm:p-6 lg:p-7 flex-1">
                    <span className="inline-block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1 sm:mb-2">
                      {t.products.featured}
                    </span>
                    <h3 className="text-xs sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {getLocalizedText(featuredCat2.name_en, featuredCat2.name_id)}
                    </h3>
                    <p className="mt-1 sm:mt-2 text-slate-600 text-[11px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {getLocalizedText(featuredCat2.description_en, featuredCat2.description_id)}
                    </p>
                    <div className="mt-2.5 sm:mt-4 inline-flex items-center gap-1 sm:gap-1.5 font-bold text-[11px] sm:text-xs text-brand-600 group-hover:text-brand-700">
                      <span>{t.products.exploreCategory}</span>
                      <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </div>
                  </div>

                  {featuredCat2.image && (
                    <div className="w-full aspect-[16/9] bg-slate-100 border-t border-slate-200 overflow-hidden">
                      <img
                        src={featuredCat2.image}
                        alt={featuredCat2.name_en}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                </Link>
              )}
            </div>

            {/* Other Categories Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {otherCats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products/${cat.slug}`}
                  className="group rounded-lg p-3.5 sm:p-5 bg-slate-50 border border-slate-200 hover:border-brand-400 transition-colors duration-200 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {getLocalizedText(cat.name_en, cat.name_id)}
                    </h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {getLocalizedText(cat.description_en, cat.description_id)}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] sm:text-xs font-bold text-brand-600">
                    <span>{t.products.explore}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Featured Products (Favorit) Grid */}
            <div className="pt-6 sm:pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                    {t.products.featuredSectionTitle}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                    Featured instruments, test kits & analytical solutions
                  </p>
                </div>
              </div>

              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                  {featuredProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                  {allProducts.slice(0, 6).map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CTA />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
