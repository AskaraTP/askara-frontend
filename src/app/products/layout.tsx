import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  title: 'Katalog Produk & Solusi Instrumen Laboratorium',
  description:
    'Jelajahi lini produk lengkap PT Askara Tekno Pangan: BioSystems Y15 Auto-Analyzer, reagen kimia analisis pangan, test kit allergen & histamin, Water RO System, dan sistem IPAL.',
  keywords: [
    'Produk PT Askara Tekno Pangan',
    'BioSystems Y15 Indonesia',
    'Reagen Kimia Laboratorium',
    'Alat Analisis Mutu Pangan',
    'Rapid Test Allergen',
    'Alat Uji Histamin Ikan',
    'Sistem Pengolahan Air RO',
    'IPAL Industri Makanan Minuman',
    'Instrumen Pengujian Kimia Makanan'
  ],
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Katalog Produk & Solusi Instrumen Laboratorium | PT Askara Tekno Pangan',
    description:
      'Lini produk resmi alat analisis pangan, reagen kimia, rapid test kit, dan sistem pengolahan air untuk industri makanan & minuman.',
    url: `${SITE_URL}/products`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Katalog Produk Laboratorium | PT Askara Tekno Pangan',
    description:
      'Solusi instrumen analisis pangan, reagen kimia, dan sistem filtrasi air laboratorium.',
  },
};

const productsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Katalog Produk PT Askara Tekno Pangan',
  url: `${SITE_URL}/products`,
  description:
    'Daftar lengkap instrumen analisis otomatis, reagen kimia, test kit cepat allergen, dan solusi pengolahan air laboratorium.',
  provider: {
    '@type': 'Organization',
    name: 'PT Askara Tekno Pangan',
    url: SITE_URL,
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={productsJsonLd} />
      {children}
    </>
  );
}
