'use client';

import React from 'react';
import { ProductCategory } from '@/types';
import { useLanguage } from '@/i18n/context';
import { Search, X } from 'lucide-react';

interface ProductFilterProps {
  categories: ProductCategory[];
  selectedCategory: string;
  searchQuery: string;
  onSelectCategory: (slug: string) => void;
  onSearchChange: (query: string) => void;
}

export default function ProductFilter({
  categories,
  selectedCategory,
  searchQuery,
  onSelectCategory,
  onSearchChange,
}: ProductFilterProps) {
  const { getLocalizedText, t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.products.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-md bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
            selectedCategory === 'all'
              ? 'bg-brand-500 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-brand-600'
          }`}
        >
          {t.products.allCategories}
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const name = getLocalizedText(cat.name_en, cat.name_id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
                isSelected
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-brand-600'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
