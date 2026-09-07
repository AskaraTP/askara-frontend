import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  title: 'Partner & Mitra Teknologi Global | PT Askara Tekno Pangan',
  description:
    'PT Askara Tekno Pangan bermitra dengan partner teknologi instrumen analitik terkemuka di dunia, termasuk distributor resmi BioSystems (Spanyol) untuk solusi pengujian mutu pangan berkualitas tinggi di Indonesia.',
  keywords: [
    'Partner PT Askara Tekno Pangan',
    'BioSystems Spain Indonesia',
    'Distributor Resmi BioSystems',
    'Mitra Teknologi Laboratorium',
    'Partner Analisis Pangan Global',
    'Peralatan Laboratorium Biosystems'
  ],
  alternates: {
    canonical: '/partners',
  },
  openGraph: {
    title: 'Partner & Mitra Teknologi Global | PT Askara Tekno Pangan',
    description:
      'Kolaborasi strategis dengan partner teknologi analitik terkemuka dunia untuk memajukan laboratorium Indonesia.',
    url: `${SITE_URL}/partners`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Partner & Mitra Teknologi | PT Askara Tekno Pangan',
    description:
      'Kemitraan resmi dengan produsen instrumen laboratorium terkemuka dunia seperti BioSystems.',
  },
};

const partnersJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Partner & Mitra Resmi PT Askara Tekno Pangan',
  url: `${SITE_URL}/partners`,
  description:
    'Daftar partner dan produsen instrumen analitik global yang bermitra resmi dengan PT Askara Tekno Pangan.',
  provider: {
    '@type': 'Organization',
    name: 'PT Askara Tekno Pangan',
    url: SITE_URL,
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={partnersJsonLd} />
      {children}
    </>
  );
}
