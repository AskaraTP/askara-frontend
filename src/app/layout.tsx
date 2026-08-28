import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/context';
import { UIProvider } from '@/context/UIContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://askara.co.id';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PT Askara Tekno Pangan | Solusi Laboratorium & Kualitas Pangan',
    template: '%s | PT Askara Tekno Pangan',
  },
  description:
    'PT Askara Tekno Pangan adalah mitra terpercaya penyedia solusi laboratorium, instrumen otomatis analisis pangan, reagen kimia, rapid test allergen, sistem RO, dan IPAL industri di Indonesia. Distributor resmi BioSystems.',
  keywords: [
    'PT Askara Tekno Pangan',
    'Askara Tekno Pangan',
    'Askara',
    'BioSystems Y15',
    'BioSystems Indonesia',
    'Distributor BioSystems',
    'Laboratorium Pangan',
    'Food Quality Analysis',
    'Alat Uji Laboratorium',
    'Reagen Kimia Laboratorium',
    'Rapid Test Allergen',
    'Water RO System Laboratorium',
    'IPAL Food & Beverage',
    'Instrumen Analisis Pangan',
    'Loker Askara Tekno Pangan',
    'Karir PT Askara Tekno Pangan'
  ],
  authors: [{ name: 'PT Askara Tekno Pangan', url: SITE_URL }],
  creator: 'PT Askara Tekno Pangan',
  publisher: 'PT Askara Tekno Pangan',
  applicationName: 'PT Askara Tekno Pangan',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  verification: {
    google: 'google805b6f28bb5c1969',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    siteName: 'PT Askara Tekno Pangan',
    title: 'PT Askara Tekno Pangan | Solusi Laboratorium & Kualitas Pangan',
    description:
      'Mitra penyedia instrumen laboratorium, reagen kimia, dan analisis kualitas pangan terkemuka di Indonesia. Distributor resmi BioSystems Y15.',
    images: [
      {
        url: `${SITE_URL}/images/logo.png`,
        secureUrl: `${SITE_URL}/images/logo.png`,
        width: 800,
        height: 800,
        alt: 'PT Askara Tekno Pangan - Laboratory Solutions Partner',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PT Askara Tekno Pangan | Solusi Laboratorium & Kualitas Pangan',
    description:
      'Mitra penyedia instrumen laboratorium, reagen kimia, dan analisis kualitas pangan terkemuka di Indonesia. Distributor resmi BioSystems Y15.',
    images: [`${SITE_URL}/images/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const globalJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'PT Askara Tekno Pangan',
      alternateName: ['Askara Tekno Pangan', 'Askara Lab Solutions', 'PT Askara', 'Askara'],
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
        caption: 'PT Askara Tekno Pangan Logo',
      },
      image: `${SITE_URL}/images/logo.png`,
      description:
        'Mitra terpercaya penyedia solusi laboratorium, instrumen otomatis analisis pangan, reagen kimia, dan sistem filtrasi air di Indonesia.',
      telephone: '+62-21-2297-8899',
      email: 'info@askara.co.id',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ID',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+62-21-2297-8899',
          contactType: 'customer service',
          areaServed: 'ID',
          availableLanguage: ['Indonesian', 'English'],
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'PT Askara Tekno Pangan',
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'id-ID',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* WhatsApp & Social Media Fallback Image Meta */}
        <link rel="image_src" href={`${SITE_URL}/images/logo.png`} />
        <meta property="og:image:secure_url" content={`${SITE_URL}/images/logo.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalJsonLd),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-900">
        <AuthProvider>
          <LanguageProvider>
            <UIProvider>
              <Navbar />
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </UIProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
