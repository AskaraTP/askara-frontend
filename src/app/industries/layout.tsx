import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  title: 'Industri yang Kami Layani | Solusi Pengujian Pangan & Minuman',
  description:
    'Solusi laboratorium terintegrasi dari PT Askara Tekno Pangan untuk berbagai sektor: Makanan & Minuman (F&B), Hasil Laut & Seafood (Uji Histamin), Industri Susu/Dairy, Pengolahan Daging, Tepung & Bakery, hingga Farmasi & Pengolahan Air.',
  keywords: [
    'Industri Dilayani Askara',
    'Laboratorium Industri Food Beverage',
    'Pengujian Histamin Ikan Seafood',
    'Laboratorium Pengolahan Susu Dairy',
    'Uji Keamanan Pangan Industri',
    'Sistem IPAL Industri Minuman',
    'Solusi Laboratorium Pangan Indonesia'
  ],
  alternates: {
    canonical: '/industries',
  },
  openGraph: {
    title: 'Industri yang Kami Layani | PT Askara Tekno Pangan',
    description:
      'Penyedia instrumen laboratorium dan kontrol kualitas terpercaya untuk aneka industri makanan, minuman, dan pengolahan pangan di Indonesia.',
    url: `${SITE_URL}/industries`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industri yang Kami Layani | PT Askara Tekno Pangan',
    description:
      'Solusi terintegrasi kontrol mutu pangan untuk industri makanan, minuman, perikanan, dan pengolahan air.',
  },
};

const industriesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Solusi Laboratorium Industri Pangan',
  serviceType: 'Food & Beverage Laboratory Instrumentation',
  provider: {
    '@type': 'Organization',
    name: 'PT Askara Tekno Pangan',
    url: SITE_URL,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Indonesia',
  },
  description:
    'Layanan penyediaan alat uji laboratorium, reagen otomatis, rapid test, dan sistem filtrasi air untuk berbagai sektor industri pangan di Indonesia.',
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={industriesJsonLd} />
      {children}
    </>
  );
}
