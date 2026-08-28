'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { api, resolveImageUrl } from '@/lib/api';
import { Partner, PartnerGalleryItem, Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import CTA from '@/components/layout/CTA';
import {
  Building2,
  ExternalLink,
  Globe2,
  Calendar,
  Image as ImageIcon,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Package,
  X,
  ChevronLeft,
  ZoomIn,
} from 'lucide-react';

interface PrincipalDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PrincipalDetailPage({ params }: PrincipalDetailPageProps) {
  const resolvedParams = use(params);
  const partnerSlug = resolvedParams.slug;
  const { t, getLocalizedText, locale } = useLanguage();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox Modal State
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!partnerSlug) return;
      try {
        const [partnerData, allProducts] = await Promise.all([
          api.getPartnerBySlug(partnerSlug),
          api.getProducts().catch(() => []),
        ]);

        if (partnerData) {
          setPartner(partnerData);

          // If accessed via numeric ID (e.g. /principals/4), seamlessly rewrite address bar to clean SEO slug (e.g. /principals/merck)
          if (partnerData.slug && !isNaN(Number(partnerSlug)) && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/principals/${partnerData.slug}`);
          }

          // Filter products matching this principal
          const matchingProducts = allProducts.filter(
            (p) =>
              p.principal?.toLowerCase() === partnerData.name?.toLowerCase() ||
              p.name_en?.toLowerCase().includes(partnerData.name?.toLowerCase()) ||
              p.name_id?.toLowerCase().includes(partnerData.name?.toLowerCase())
          );
          setProducts(matchingProducts);
        }
      } catch (err) {
        console.error('Failed to load partner details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [partnerSlug]);

  const galleryItems = partner?.documentation_gallery || [];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (activePhotoIdx === null) return;
    if (e.key === 'Escape') setActivePhotoIdx(null);
    if (e.key === 'ArrowRight') {
      setActivePhotoIdx((prev) => (prev !== null ? (prev + 1) % galleryItems.length : null));
    }
    if (e.key === 'ArrowLeft') {
      setActivePhotoIdx((prev) =>
        prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null
      );
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIdx, galleryItems.length]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading principal profile & documentation...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-6 text-center space-y-4">
        <Building2 className="w-12 h-12 mx-auto text-slate-300" />
        <h1 className="text-xl font-bold text-slate-900">Principal Not Found</h1>
        <p className="text-xs text-slate-500">
          The requested technology principal &quot;{partnerSlug}&quot; could not be found or is currently unavailable.
        </p>
        <Link
          href="/principals"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Principals Directory
        </Link>
      </div>
    );
  }

  const description = getLocalizedText(partner.description_en, partner.description_id);

  return (
    <div className="pt-24 lg:pt-32">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/principals" className="hover:text-slate-900 transition-colors">
            Principals & Partners
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate">{partner.name}</span>
        </nav>
      </div>

      {/* Hero & Principal Profile */}
      <section className="py-10 lg:py-14 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Logo Box */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="h-44 sm:h-52 w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-sm p-8 flex items-center justify-center">
                {partner.logo ? (
                  <img
                    src={resolveImageUrl(partner.logo)}
                    alt={partner.name}
                    className="max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-2">
                    <Building2 className="w-12 h-12 mx-auto text-slate-300" />
                    <span className="text-sm font-bold text-slate-700 block">{partner.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  {t.principals.authorizedBadge}
                </span>

                {partner.country && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200">
                    <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                    {partner.country}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {partner.name}
              </h1>

              {partner.category && (
                <p className="text-sm sm:text-base font-bold text-brand-600">
                  {partner.category}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl whitespace-pre-line">
                {description ||
                  (locale === 'id'
                    ? 'PT Askara Tekno Pangan adalah distributor resmi dan mitra teknologi terpercaya yang menghadirkan solusi pengujian analitis dan dukungan aplikasi di Indonesia.'
                    : 'PT Askara Tekno Pangan is the authorized distributor and technology partner delivering solutions and application support in Indonesia.')}
              </p>

              {partner.website_url && (
                <div className="pt-2 flex justify-center lg:justify-start">
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>{t.principals.visitWebsite}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Gallery */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600">
                {t.principals.activitiesBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {t.principals.galleryTitle} {partner.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.principals.gallerySubtitle}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 shrink-0">
              <ImageIcon className="w-4 h-4 text-brand-500" />
              <span>{galleryItems.length} {t.principals.photosCount}</span>
            </div>
          </div>

          {galleryItems.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">{t.principals.noPhotos}</p>
              <p className="text-xs text-slate-500">
                {t.principals.noPhotosDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, idx) => {
                const caption = getLocalizedText(item.caption_en, item.caption_id);
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Photo Container */}
                    <div className="h-56 sm:h-64 bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                      <img
                        src={resolveImageUrl(item.url)}
                        alt={caption || `${partner.name} documentation ${idx + 1}`}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-3 rounded-full bg-white/90 text-slate-900 shadow-md">
                          <ZoomIn className="w-5 h-5 text-brand-600" />
                        </span>
                      </div>
                    </div>

                    {/* Caption & Date Footer */}
                    <div className="p-5 space-y-2 border-t border-slate-100 bg-white">
                      {item.date && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.date}
                        </span>
                      )}
                      <p className="text-xs font-semibold text-slate-800 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                        {caption || `${partner.name} ${t.principals.activityDoc} #${idx + 1}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Distributed Products Section */}
      {products.length > 0 && (
        <section className="py-16 lg:py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600">
                  {t.principals.productsBadge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {t.principals.productsTitle} {partner.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t.principals.productsSubtitle}
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 font-bold text-xs text-brand-600 hover:text-brand-700 transition-colors shrink-0"
              >
                <span>{t.principals.viewAllProducts}</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {activePhotoIdx !== null && galleryItems[activePhotoIdx] && (
        <div
          className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setActivePhotoIdx(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {activePhotoIdx + 1} / {galleryItems.length}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {partner.name} &bull; Activity Documentation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoIdx(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo View Box */}
            <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-4 sm:p-6 min-h-[350px] sm:min-h-[480px]">
              <img
                src={resolveImageUrl(galleryItems[activePhotoIdx].url)}
                alt={galleryItems[activePhotoIdx].caption_en || 'Documentation photo'}
                className="max-h-[60vh] max-w-full object-contain rounded-lg drop-shadow-sm transition-transform duration-300"
              />

              {/* Prev / Next Controls */}
              {galleryItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx(
                        (activePhotoIdx - 1 + galleryItems.length) % galleryItems.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-brand-600 transition-all shadow-md border border-slate-200/80 hover:scale-105"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((activePhotoIdx + 1) % galleryItems.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-brand-600 transition-all shadow-md border border-slate-200/80 hover:scale-105"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Caption & Metadata Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 space-y-1.5">
              {galleryItems[activePhotoIdx].date && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/60">
                  <Calendar className="w-3 h-3" />
                  {galleryItems[activePhotoIdx].date}
                </span>
              )}
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {getLocalizedText(
                  galleryItems[activePhotoIdx].caption_en,
                  galleryItems[activePhotoIdx].caption_id
                ) || `${partner.name} Documentation Photo #${activePhotoIdx + 1}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <CTA />
    </div>
  );
}
