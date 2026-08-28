import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  title: 'Hubungi Kami | Kontak & Layanan Konsultasi PT Askara Tekno Pangan',
  description:
    'Hubungi tim spesialis PT Askara Tekno Pangan untuk demo produk, penawaran harga instrumen laboratorium, reagen analitik, atau layanan service & kalibrasi di seluruh Indonesia.',
  keywords: [
    'Kontak PT Askara Tekno Pangan',
    'Hubungi Askara',
    'Alamat PT Askara Tekno Pangan',
    'Permintaan Penawaran BioSystems Y15',
    'Konsultasi Instrumen Laboratorium',
    'Customer Service Askara',
    'Layanan Service Alat Lab Pangan'
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Hubungi Kami | PT Askara Tekno Pangan',
    description:
      'Hubungi tim ahli kami untuk kebutuhan instrumen laboratorium, reagen kimia, dan konsultasi pengujian kualitas pangan Anda.',
    url: `${SITE_URL}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hubungi Kami | PT Askara Tekno Pangan',
    description:
      'Konsultasikan kebutuhan instrumen dan reagen laboratorium pangan Anda bersama tim kami.',
  },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Kontak PT Askara Tekno Pangan',
  url: `${SITE_URL}/contact`,
  description:
    'Halaman kontak dan layanan bantuan teknis untuk produk laboratorium dan instrumen analisis kualitas pangan.',
  mainEntity: {
    '@type': 'Organization',
    name: 'PT Askara Tekno Pangan',
    url: SITE_URL,
    telephone: '+62-21-2297-8899',
    email: 'info@askara.co.id',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+62-21-2297-8899',
      contactType: 'sales and technical support',
      areaServed: 'ID',
      availableLanguage: ['Indonesian', 'English'],
    },
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={contactJsonLd} />
      {children}
    </>
  );
}
