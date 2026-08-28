import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/context';
import { UIProvider } from '@/context/UIContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'PT Askara Tekno Pangan | Laboratory Solutions Partner',
  description:
    'Dedicated laboratory solutions for food quality analysis, analytical instruments, reagents, and official BioSystems distributor in Indonesia.',
  keywords: [
    'BioSystems Y15',
    'Food Quality Analysis',
    'Askara Tekno Pangan',
    'Laboratorium Pangan',
    'Chemical Reagents',
    'Rapid Test Allergen',
    'Water RO System',
    'IPAL Food Beverage'
  ],
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-900">
        <LanguageProvider>
          <UIProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </UIProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
