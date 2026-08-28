import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  title: 'Tentang Kami | Profil Perusahaan PT Askara Tekno Pangan',
  description:
    'Pelajari dedikasi, visi, misi, dan tim ahli PT Askara Tekno Pangan dalam memajukan teknologi laboratorium analisis kualitas pangan, reagen kimia, dan instrumen modern di Indonesia.',
  keywords: [
    'Tentang Askara Tekno Pangan',
    'Profil Perusahaan Askara',
    'PT Askara Tekno Pangan',
    'Distributor Alat Laboratorium Pangan',
    'Visi Misi Askara',
    'Mitra Analisis Mutu Pangan Indonesia'
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Tentang Kami | PT Askara Tekno Pangan',
    description:
      'Solusi terpercaya instrumen analisis pangan, kontrol kualitas makanan & minuman, dan teknologi laboratorium di Indonesia.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tentang Kami | PT Askara Tekno Pangan',
    description:
      'Solusi terpercaya instrumen analisis pangan, kontrol kualitas makanan & minuman, dan teknologi laboratorium di Indonesia.',
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Tentang PT Askara Tekno Pangan',
  url: `${SITE_URL}/about`,
  description:
    'Halaman profil perusahaan PT Askara Tekno Pangan, penyedia solusi instrumen pengujian mutu pangan dan laboratorium terkemuka.',
  mainEntity: {
    '@type': 'Organization',
    name: 'PT Askara Tekno Pangan',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    foundingDate: '2019',
    description:
      'Dedicated laboratory solutions partner for food quality analysis, analytical instruments, reagents, and official BioSystems distributor in Indonesia.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={aboutJsonLd} />
      {children}
    </>
  );
}
