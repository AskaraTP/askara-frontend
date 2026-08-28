import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  title: 'Artikel & Wawasan Laboratorium Pengujian Pangan',
  description:
    'Kumpulan artikel edukatif, studi kasus, wawasan teknologi analisis makanan & minuman, metode uji allergen, efisiensi reagen, dan regulasi mutu laboratorium.',
  keywords: [
    'Artikel Laboratorium Pangan',
    'Wawasan Analisis Mutu Pangan',
    'Metode BioSystems Y15',
    'Panduan Uji Histamin Ikan',
    'Pengujian Allergen Makanan',
    'Efisiensi Reagen Kimia Lab',
    'PT Askara Tekno Pangan Blog'
  ],
  alternates: {
    canonical: '/articles',
  },
  openGraph: {
    title: 'Artikel & Wawasan Laboratorium Pengujian Pangan | PT Askara Tekno Pangan',
    description:
      'Artikel teknis, wawasan teknologi laboratorium pangan, panduan instrumen analitik, dan standar mutu pangan di Indonesia.',
    url: `${SITE_URL}/articles`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artikel & Wawasan Laboratorium | PT Askara Tekno Pangan',
    description:
      'Wawasan teknologi analisis pangan, panduan instrumen, dan kontrol mutu laboratorium.',
  },
};

const articlesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Wawasan & Artikel PT Askara Tekno Pangan',
  url: `${SITE_URL}/articles`,
  description:
    'Kumpulan wawasan teknologi analisis pangan dan solusi laboratorium terpercaya di Indonesia.',
  publisher: {
    '@type': 'Organization',
    name: 'PT Askara Tekno Pangan',
    url: SITE_URL,
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={articlesJsonLd} />
      {children}
    </>
  );
}
