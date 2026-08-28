'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useLanguage } from '@/i18n/context';
import { ArrowRight, FlaskConical } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { getLocalizedText, t } = useLanguage();

  const name = getLocalizedText(product.name_en, product.name_id);
  const shortDesc = getLocalizedText(product.short_description_en, product.short_description_id);
  const categorySlug = product.category_slug || product.product_category?.slug || 'all';

  return (
    <Link
      href={`/products/${categorySlug}/${product.slug}`}
      className="group flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-brand-400 transition-colors duration-200"
    >
      {/* Full Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-200">
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] sm:text-xs font-medium gap-1 sm:gap-2">
            <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-brand-300" />
            <span className="text-center line-clamp-1">{t.products.defaultProductTitle}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.product_category && (
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1 inline-block line-clamp-1">
              {getLocalizedText(product.product_category.name_en, product.product_category.name_id)}
            </span>
          )}

          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
            {name}
          </h3>

          {shortDesc && (
            <p className="mt-1 text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2">
              {shortDesc}
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-brand-600">
          <span>{t.products.explore}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
