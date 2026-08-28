import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  title: 'Karir & Lowongan Kerja (Loker) | PT Askara Tekno Pangan',
  description:
    'Temukan peluang karir dan lowongan kerja terbaru di PT Askara Tekno Pangan. Bergabunglah bersama tim profesional kami sebagai Application Specialist, Service Engineer, dan Sales Consultant instrumen laboratorium pangan.',
  keywords: [
    'Loker PT Askara Tekno Pangan',
    'Lowongan Kerja Askara',
    'Karir PT Askara Tekno Pangan',
    'Loker Askara',
    'Loker Laboratorium Pangan',
    'Lowongan Application Specialist',
    'Loker Service Engineer Alat Lab',
    'Karir Industri Pangan Indonesia',
    'Loker PT Askara'
  ],
  alternates: {
    canonical: '/career',
  },
  openGraph: {
    title: 'Karir & Lowongan Kerja (Loker) | PT Askara Tekno Pangan',
    description:
      'Bergabunglah bersama PT Askara Tekno Pangan. Temukan posisi karir terbaik di bidang teknologi analisis pangan dan instrumen laboratorium.',
    url: `${SITE_URL}/career`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karir & Loker | PT Askara Tekno Pangan',
    description:
      'Peluang karir terbaik di bidang teknologi laboratorium dan analisis kualitas pangan.',
  },
};

const careerJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Karir & Peluang Kerja PT Askara Tekno Pangan',
  url: `${SITE_URL}/career`,
  description:
    'Informasi lowongan kerja resmi dan peluang karir di PT Askara Tekno Pangan.',
  publisher: {
    '@type': 'Organization',
    name: 'PT Askara Tekno Pangan',
    url: SITE_URL,
  },
};

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={careerJsonLd} />
      {children}
    </>
  );
}
