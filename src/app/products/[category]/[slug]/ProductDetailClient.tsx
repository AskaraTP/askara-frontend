'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { api, resolveImageUrl } from '@/lib/api';
import { Product } from '@/types';
import SpecTable from '@/components/products/SpecTable';
import CTA from '@/components/layout/CTA';
import JsonLd from '@/components/seo/JsonLd';
import {
  ChevronRight,
  Download,
  Phone,
  CheckCircle2,
  Building,
  ArrowLeft,
} from 'lucide-react';

import { useDynamicSlug } from '@/hooks/useDynamicRouteParams';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

interface ProductDetailClientProps {
  params?: Promise<{
    category: string;
    slug: string;
  }>;
}

export default function ProductDetailClient({ params }: ProductDetailClientProps) {
  const { category: categorySlug, slug: productSlug } = useDynamicSlug(params);

  const { getLocalizedText, t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await api.getProductBySlug(productSlug, categorySlug);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productSlug, categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm font-medium text-slate-500">{t.products.loadingDetails}</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">{t.products.productNotFound}</h2>
        <p className="mt-2 text-slate-500 text-sm">
          {t.products.productNotFoundDesc}
        </p>
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-brand-500 text-white font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.products.backToCatalog}
          </Link>
        </div>
      </div>
    );
  }

  const productName = getLocalizedText(product.name_en, product.name_id);
  const categoryName = product.product_category
    ? getLocalizedText(product.product_category.name_en, product.product_category.name_id)
    : categorySlug;
  const shortDesc = getLocalizedText(product.short_description_en, product.short_description_id);
  const fullDesc = getLocalizedText(product.description_en, product.description_id);
  const featuresText = getLocalizedText(product.features_en, product.features_id);
  const applicationsText = getLocalizedText(product.applications_en, product.applications_id);

  const featuresList = featuresText
    ? featuresText.split(/\r\n|\r|\n/).filter((f) => f.trim().length > 0)
    : [];

  const applicationsList = applicationsText
    ? applicationsText.split(/\r\n|\r|\n/).filter((a) => a.trim().length > 0)
    : [];

  const productUrl = `${SITE_URL}/products/${categorySlug}/${productSlug}`;
  const prodImageUrl = product.image ? resolveImageUrl(product.image) : `${SITE_URL}/images/logo.png`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: prodImageUrl,
    description: shortDesc || fullDesc || `${productName} - Solusi instrumen laboratorium dari PT Askara Tekno Pangan`,
    brand: {
      '@type': 'Brand',
      name: 'BioSystems / Askara',
    },
    category: categoryName,
    url: productUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'PT Askara Tekno Pangan',
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${SITE_URL}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${SITE_URL}/products/${categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: productName,
        item: productUrl,
      },
    ],
  };

  return (
    <div className="pt-24 lg:pt-32">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/products" className="hover:text-brand-500 transition-colors">
            {t.nav.products}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/products/${categorySlug}`} className="hover:text-brand-500 transition-colors">
            {categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{productName}</span>
        </div>

        {/* Hero Product Details */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">
          {/* Left: Product Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-lg bg-slate-50 border border-slate-200 p-8 lg:p-12 min-h-[360px] lg:min-h-[420px] flex items-center justify-center">
              {product.is_featured && (
                <div className="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 rounded-sm bg-brand-500 text-white text-[11px] font-bold uppercase tracking-wider">
                  {t.products.featured}
                </div>
              )}

              {product.image ? (
                <img
                  src={product.image}
                  alt={productName}
                  className="max-h-72 max-w-full object-contain transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="text-slate-400 font-semibold text-sm">
                  {t.products.defaultProductTitle}
                </div>
              )}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <span className="uppercase tracking-[0.3em] text-xs font-bold text-brand-600 block mb-2">
                {categoryName}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {productName}
              </h1>
              {product.principal && (
                <div className="mt-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
                  <Building className="w-4 h-4 text-brand-500" />
                  <span>{t.products.principal}:{' '}
                    <Link
                      href={`/principals/${product.principal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`}
                      className="text-slate-900 font-semibold hover:text-brand-600 hover:underline transition-colors"
                      title={`View ${product.principal} Profile`}
                    >
                      {product.principal}
                    </Link>
                  </span>
                </div>
              )}
            </div>

            {shortDesc && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {shortDesc}
              </p>
            )}

            {/* CTAs */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={`https://wa.me/62811712908?text=${encodeURIComponent(`Halo PT Askara Tekno Pangan, saya tertarik untuk menanyakan informasi produk: ${productName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>

              {product.brochure ? (
                <a
                  href={product.brochure}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors"
                >
                  <Download className="w-4 h-4 text-brand-600" />
                  {t.products.downloadBrochure}
                </a>
              ) : (
                <a
                  href={`https://wa.me/62811712908?text=${encodeURIComponent(`Halo PT Askara Tekno Pangan, saya ingin meminta brosur untuk produk: ${productName}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors"
                >
                  <Download className="w-4 h-4 text-brand-600" />
                  {t.products.downloadBrochure}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 pt-10 border-t border-slate-200">
          {/* Overview */}
          {fullDesc && (
            <section className="max-w-4xl">
              <span className="uppercase tracking-[0.25em] text-xs font-bold text-brand-600 mb-1.5 block">
                {t.products.overview}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {productName}
              </h2>
              <div className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {fullDesc}
              </div>
            </section>
          )}

          {/* Features */}
          {featuresList.length > 0 && (
            <section className="max-w-4xl">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">
                {t.products.features}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3.5">
                {featuresList.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3.5 rounded-md bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Applications */}
          {applicationsList.length > 0 && (
            <section className="max-w-4xl">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">
                {t.products.applications}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3.5">
                {applicationsList.map((app, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3.5 rounded-md bg-slate-50 border border-slate-200/80">
                    <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">{app}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Technical Specifications */}
          {product.specifications && (
            <section className="max-w-4xl">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">
                {t.products.specifications}
              </h2>
              <SpecTable specifications={product.specifications} />
            </section>
          )}
        </div>
      </div>

      <CTA />
    </div>
  );
}
