'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { api } from '@/lib/api';
import { Article } from '@/types';
import { CardSkeleton } from '@/components/ui/Skeleton';
import CTA from '@/components/layout/CTA';
import { FlaskConical, Calendar, ExternalLink } from 'lucide-react';

export default function ArticlesPage() {
  const { getLocalizedText, t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await api.getArticles();
        setArticles(data);
      } catch (err) {
        console.error('Failed to load articles', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  return (
    <div className="pt-24 lg:pt-32">
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-6 lg:px-12 text-center pb-14">
        <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600 mb-2.5 inline-block">
          {t.articles.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.articles.title}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.articles.subtitle}
        </p>
      </section>

      {/* Articles Grid */}
      <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {loading ? (
            <CardSkeleton count={6} />
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {articles.map((article) => {
                const title = getLocalizedText(article.title_en, article.title_id);
                const category = getLocalizedText(article.category_en, article.category_id);

                return (
                  <a
                    key={article.id}
                    href={article.linkedin_url || '#'}
                    target={article.linkedin_url ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="group rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-brand-400 transition-colors duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] sm:aspect-video w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <FlaskConical className="w-6 h-6 sm:w-10 sm:h-10 text-brand-400" />
                        )}
                      </div>

                      <div className="p-3.5 sm:p-6">
                        {category && (
                          <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1 sm:mb-1.5 inline-block line-clamp-1">
                            {category}
                          </span>
                        )}
                        <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                          {title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 sm:p-6 sm:pt-0">
                      <div className="pt-2.5 sm:pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                          <span className="line-clamp-1">{article.published_at}</span>
                        </div>
                        <span className="font-semibold text-brand-600 group-hover:underline inline-flex items-center gap-1 shrink-0">
                          {t.articles.readMore} <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-lg bg-white border border-dashed border-slate-200 text-center">
              <p className="text-slate-500 text-sm font-medium">{t.articles.empty}</p>
            </div>
          )}
        </div>
      </section>

      <CTA />
    </div>
  );
}
